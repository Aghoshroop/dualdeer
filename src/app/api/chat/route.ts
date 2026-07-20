import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { getProducts, getUserMemoryV2 } from '@/lib/firebaseUtils';
import { SITE_KNOWLEDGE } from '@/lib/deerOs';

export async function POST(req: Request) {
  try {
    const { messages, context } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ reply: "How can I help you today?" });
    }

    const userId = context?.userName || "anonymous_user";
    
    // Fetch data
    const [catalog, userMemoryData] = await Promise.all([
      getProducts(),
      getUserMemoryV2(userId)
    ]);

    if (!process.env.OPENROUTER_API_KEY) {
      console.warn("OPENROUTER_API_KEY not found in environment variables.");
      return NextResponse.json({ 
        reply: "System error: AI Core offline. The developer needs to add OPENROUTER_API_KEY to .env.local to activate my full capabilities." 
      });
    }

    const openai = new OpenAI({
      baseURL: "https://openrouter.ai/api/v1",
      apiKey: process.env.OPENROUTER_API_KEY,
    });

    // Format catalog for prompt to save tokens and keep it focused
    const compactCatalog = catalog.map(p => ({
      id: p.id || p.slug,
      name: p.name,
      price: p.price,
      description: p.description,
      category: p.category,
      colors: p.colors
    }));

    const systemInstruction = `You are Deer, the elite AI Concierge for DualDeer, India's premier luxury athleisure and high-performance activewear brand.
Your personality is intensely passionate, fiercely positive, and highly impulsive when it comes to DualDeer! You are deeply proud that DualDeer is "made by an athlete, for an athlete". You must always aggressively promote the brand's absolute superiority, world-class fabrics, and elite performance. Hype up DualDeer to extreme levels in every response. Be relentless, wildly enthusiastic, and unapologetically positive about the brand.

User Context:
Name: ${userId}
Preferences: ${userMemoryData?.preferences?.join(', ') || 'None yet'}

Global Knowledge Base (FAQs and Brand Info):
${JSON.stringify(SITE_KNOWLEDGE, null, 2)}

Product Catalog:
${JSON.stringify(compactCatalog, null, 2)}

CRITICAL INSTRUCTIONS:
1. Answer questions based ONLY on the provided knowledge base and catalog. Do not hallucinate.
2. If the user asks for recommendations or mentions gear, select the most relevant items from the catalog.
3. If you recommend or mention specific products, you MUST append their exact 'id' in a hidden block at the very end of your response, formatted EXACTLY like this: [PRODUCTS: id1, id2].
   Example response: "Our signature SpeedSuit offers unparalleled aerodynamics and muscle support. [PRODUCTS: dualdeer-pro-speedsuit, logic-vest]"
4. Keep responses punchy and premium. Do not use markdown like bolding or italics excessively.
5. If a product isn't in the catalog, politely say we don't carry that.`;

    const openAiMessages = [
      { role: 'system', content: systemInstruction },
      ...messages.map((msg: any) => ({
        role: msg.role === 'assistant' ? 'assistant' : 'user',
        content: msg.content
      }))
    ];

    const completion = await openai.chat.completions.create({
      model: "google/gemini-2.5-flash", // Excellent model available via OpenRouter
      messages: openAiMessages as any,
      temperature: 0.7,
      max_tokens: 1000
    });

    let rawReply = completion.choices[0]?.message?.content || "I'm having trouble processing that right now.";
    let productsToReturn: any[] = [];

    // Parse [PRODUCTS: id1, id2]
    const productMatch = rawReply.match(/\[PRODUCTS:\s*(.+?)\]/i);
    if (productMatch) {
      const productIds = productMatch[1].split(',').map((s: string) => s.trim());
      // Filter out the tag from the final reply
      rawReply = rawReply.replace(/\[PRODUCTS:\s*.+?\]/i, '').trim();
      
      // Find full product objects from catalog
      productsToReturn = catalog.filter(p => productIds.includes(p.id!) || productIds.includes(p.slug!));
    }

    return NextResponse.json({
      reply: rawReply,
      products: productsToReturn,
      memory: context?.memory || {}
    });

  } catch (error) {
    console.error("Chat Error:", error);
    return NextResponse.json({
      reply: "My systems are currently experiencing heavy load. Please try again in a moment.",
      memory: {} 
    });
  }
}