import { NextResponse } from 'next/server';
import { getProducts, getGlobalKnowledgeV2, getUserMemoryV2 } from '@/lib/firebaseUtils';
import { DeerOSCoordinator, isGreeting, isNameQuery, ProductEngine } from '@/lib/deerOs';

// 1. ADVANCED NORMALIZATION (UPGRADE)
function normalize(text: string): string {
  let t = text.toLowerCase();
  
  // fix common typos
  t = t.replace(/yor|yoiur|ur/g, "your");
  t = t.replace(/reight|rightt|rigt/g, "right");
  t = t.replace(/intel+igence/g, "intelligence");
  
  // remove symbols
  t = t.replace(/[^a-z0-9 ]/g, " ");
  
  // clean spaces
  t = t.replace(/\s+/g, " ").trim();
  
  return t;
}

// 2. FUZZY KEYWORD MATCHING
function includesFuzzy(msg: string, keyword: string): boolean {
  return msg.includes(keyword) ||
         msg.includes(keyword.slice(0, -1)); // partial match
}

// 3. PRODUCT INTENT DETECTION (CRITICAL)
const productKeywords = [
  "shirt",
  "tshirt",
  "vest",
  "hoodie",
  "jacket",
  "tracksuit",
  "shorts"
];

function isProductQuery(msg: string): boolean {
  return productKeywords.some(k => includesFuzzy(msg, k));
}

function getMatchedProductKeyword(msg: string): string {
  return productKeywords.find(k => includesFuzzy(msg, k)) || "vest";
}

// 6. IMPROVE QUESTION UNDERSTANDING
function isQuestion(msg: string, originalMsg: string): boolean {
  return originalMsg.includes("?") ||
         msg.startsWith("what") ||
         msg.startsWith("who") ||
         msg.startsWith("are") ||
         msg.startsWith("do");
}

// 10. REMOVE DEAD RESPONSES (No repeated fallbacks that don't push forward)
const fallbackReplies = [
  "What performance gear are you hunting for today?",
  "Tell me what you need—I can pull up our best gear instantly.",
  "Are you looking for training gear, speedsuits, or something else?"
];

export async function POST(req: Request) {
  try {
    const { messages, context } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ reply: fallbackReplies[0] });
    }

    const userId = context?.userName || "anonymous_user";
    
    // Multi-threading data fetching for high performance (<300ms target)
    const [catalog, structuredGraph, userMemoryData] = await Promise.all([
      getProducts(),
      getGlobalKnowledgeV2(),
      getUserMemoryV2(userId)
    ]);

    const deerOS = new DeerOSCoordinator(
       structuredGraph,
       catalog,
       userMemoryData,
       userId
    );

    const latestUserMessageOriginal = messages[messages.length - 1].content;
    const lastSystemMessage = messages.length > 1 && messages[messages.length - 2].role === 'assistant' 
       ? messages[messages.length - 2].content 
       : "";

    // 1. CONVERSATION FLOW SYSTEM (STATE)
    const sessionMemory = context?.memory || {};
    let currentState = sessionMemory.state || { intent: null, category: null, lastQuery: null };

    // FINAL PIPELINE (STRICT ORDER)

    // 1. normalize input
    const normMsg = normalize(latestUserMessageOriginal);
    const wordCount = normMsg.split(' ').filter(Boolean).length;

    // 2. greeting check
    if (isGreeting(normMsg)) {
        return NextResponse.json({ reply: "Hey. What are you looking for today?", memory: context?.memory || {} });
    }

    // 3. name query / intelligence check
    // 7. HANDLE BROKEN SENTENCES "you are intelligence right"
    if (normMsg.includes("intelligence")) {
        return NextResponse.json({ reply: "Yeah—I’m built to help you with performance gear and smart recommendations.", memory: context?.memory || {} });
    }
    if (isNameQuery(normMsg)) {
        return NextResponse.json({ reply: "I’m Deer — your DualDeer performance assistant.", memory: context?.memory || {} });
    }

    // 4. product detection & AUTO TRIGGER & CONTEXT MEMORY
    const isSingleWordProduct = wordCount <= 2 && isProductQuery(normMsg);
    const isFollowUp = normMsg.includes("show me") || normMsg.includes("show more") || normMsg.includes("cheaper") || normMsg.includes("black");
    const hasProductIntent = isProductQuery(normMsg) || isSingleWordProduct || normMsg.match(/\b(buy|shop|looking for|recommend|price|cost|gear)\b/) || isFollowUp;

    if (hasProductIntent) {
        let keyword = getMatchedProductKeyword(normMsg);
        
        // 3. AUTO PRODUCT TRIGGER (If says "show me", use last category)
        if (isFollowUp && currentState.category && keyword === "vest" && !isProductQuery(normMsg)) {
            keyword = currentState.category;
        }

        currentState.category = keyword;
        currentState.intent = "product_search";
        currentState.lastQuery = normMsg;

        const prefs = userMemoryData?.preferences || [];
        if (normMsg.includes("black")) prefs.push("black");
        
        // 2. PRODUCT ENGINE (REAL-TIME fetching & ranking)
        let topMatches = ProductEngine.getTopMatches(keyword + " " + normMsg, catalog, prefs);
        
        if (normMsg.includes("cheaper")) {
            topMatches = topMatches.sort((a,b) => (a.price || 0) - (b.price || 0));
        }

        // 8. SMART FOLLOW-UP
        let replyStr = `Here are some performance ${keyword}s you’ll like. Want something more lightweight or compression-focused?`;
        if (normMsg.includes("cheaper")) {
            replyStr = `Here are our more affordable ${keyword}s. Do these match your budget?`;
        } else if (normMsg.includes("black")) {
            replyStr = `Here are our top black ${keyword}s. Performance meets stealth.`;
        }

        // 4. RESPONSE + PRODUCT OUTPUT
        return NextResponse.json({
            reply: replyStr,
            products: topMatches,
            memory: { ...sessionMemory, state: currentState }
        });
    }

    // Update state for non-product queries
    currentState.lastQuery = normMsg;

    // 5. question detection
    if (isQuestion(normMsg, latestUserMessageOriginal)) {
        const replyText = await deerOS.execute(latestUserMessageOriginal, lastSystemMessage);
        return NextResponse.json({ reply: replyText, memory: context?.memory || {} });
    }

    // 6. learning input
    if (normMsg.match(/\b(is|are|means|causes|makes|improves|reduces)\b/)) {
        const replyText = await deerOS.execute(latestUserMessageOriginal, lastSystemMessage);
        return NextResponse.json({ reply: replyText, memory: context?.memory || {} });
    }

    // 7. fallback
    const randomFallback = fallbackReplies[Math.floor(Math.random() * fallbackReplies.length)];
    return NextResponse.json({
      reply: randomFallback,
      memory: { ...sessionMemory, state: currentState }
    });

  } catch (error) {
    console.error("Chat Error:", error);
    return NextResponse.json({
      reply: fallbackReplies[0],
      memory: {} 
    });
  }
}