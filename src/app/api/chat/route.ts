import { NextResponse } from 'next/server';
import { getProducts } from '@/lib/firebaseUtils';

// ------------------------
// 🧠 TYPES
// ------------------------
type UserMemory = {
  use?: string;
  color?: string;
  budget?: number;
  category?: string;
};

// ------------------------
// 💎 PREMIUM TONE ENGINE
// ------------------------
function premiumTone(type: string) {
  const tones: any = {
    greeting: [
      "Good to have you here. What are you in the mood for today?",
      "Welcome back. Let's find something exceptional for you.",
      "Glad you're here. What kind of performance are we aiming for today?"
    ],
    ask_use: [
      "Are you looking for something for the gym, or more everyday wear?",
      "Tell me — is this for training, or something more casual?",
      "What’s the setting — gym, running, or relaxed wear?"
    ],
    ask_color: [
      "Any color direction in mind?",
      "What tone are you leaning towards — something bold or minimal?",
      "Do you have a preferred color palette?"
    ],
    ask_budget: [
      "What range would you like me to stay within?",
      "Give me a budget range — I’ll optimize the picks.",
      "How much are you planning to invest in this piece?"
    ],
    recommend_intro: [
      "These stand out based on your preferences:",
      "Here’s what fits your style and requirements best:",
      "I’ve selected a few strong matches for you:"
    ],
    no_results: [
      "Nothing precise matched yet — but we can refine it further.",
      "We’re close, just need a slight adjustment to get the perfect piece.",
      "Let’s tweak one parameter — we’ll land on the right fit."
    ],
    disengaged: [
      "All good. I’ll stay right here if you need anything.",
      "No rush. Explore at your pace — I can step in anytime.",
      "Take your time. I’m here whenever you’re ready."
    ]
  };

  const set = tones[type];
  return set ? set[Math.floor(Math.random() * set.length)] : "";
}

// ------------------------
// 🧼 CLEAN INPUT
// ------------------------
function clean(value?: string) {
  return value?.replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
}

// ------------------------
// 🧠 EXTRACT PREFERENCES
// ------------------------
function extractPreferences(message: string) {
  return {
    color: clean(message.match(/black|white|grey|blue|red/i)?.[0]),
    use: clean(message.match(/gym|running|casual|training/i)?.[0]),
    category: clean(message.match(/tshirt|tee|shirt|pants|shorts|jacket/i)?.[0]),
    budget: parseInt(message.match(/\d+/)?.[0] || "")
  };
}

// ------------------------
// 🧠 UPDATE MEMORY
// ------------------------
function updateMemory(prev: UserMemory, prefs: any): UserMemory {
  return {
    ...prev,
    ...Object.fromEntries(
      Object.entries(prefs).filter(([_, v]) => v !== undefined && v !== null && v !== "")
    )
  };
}

// ------------------------
// 🧠 WHAT'S MISSING
// ------------------------
function getMissingFields(memory: UserMemory) {
  const missing = [];

  if (!memory.use || memory.use.length < 2) missing.push("use");
  if (!memory.color || memory.color.length < 2) missing.push("color");
  if (!memory.budget) missing.push("budget");

  return missing;
}

// ------------------------
// 🧠 ASK NEXT QUESTION
// ------------------------
function askNextQuestion(missing: string[]) {
  if (missing.includes("use")) return premiumTone("ask_use");
  if (missing.includes("color")) return premiumTone("ask_color");
  if (missing.includes("budget")) return premiumTone("ask_budget");

  return null;
}

// ------------------------
// 🧠 NORMALIZE ARRAY
// ------------------------
function normalizeArray(arr: string[]) {
  return arr?.map(i => i.toLowerCase());
}

// ------------------------
// 🧠 FILTER PRODUCTS
// ------------------------
function findBestProducts(products: any[], memory: UserMemory) {
  return products.filter(p => {
    return (
      p.stock > 0 &&
      (!memory.color || normalizeArray(p.colors || []).includes(memory.color)) &&
      (!memory.use || normalizeArray(p.use || []).includes(memory.use)) &&
      (!memory.budget || p.price <= memory.budget)
    );
  }).slice(0, 3);
}

// ------------------------
// 🚀 MAIN API
// ------------------------
export async function POST(req: Request) {
  try {
    const { messages, context } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Invalid message format' }, { status: 400 });
    }

    const latestMessageRaw = messages[messages.length - 1].content;
    const latestMessage = latestMessageRaw.toLowerCase();

    await new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 300));

    // 🧠 LOAD MEMORY
    let sessionMemory: UserMemory = context?.memory || {};

    // 🧠 EXTRACT + UPDATE
    const prefs = extractPreferences(latestMessage);
    sessionMemory = updateMemory(sessionMemory, prefs);

    // ------------------------
    // 👋 GREETING (SMART)
    // ------------------------
    const isGreeting = /hi|hello|hey|good morning|good afternoon|good evening/i.test(latestMessage);

    if (isGreeting) {
      return NextResponse.json({
        reply: premiumTone("greeting"),
        memory: sessionMemory
      });
    }

    // ------------------------
    // 🧊 DISENGAGED
    // ------------------------
    if (/nothing|no|just looking|just browsing/i.test(latestMessage)) {
      return NextResponse.json({
        reply: premiumTone("disengaged"),
        memory: sessionMemory
      });
    }

    // ------------------------
    // 🤔 UNCERTAIN
    // ------------------------
    if (/idk|don't know|maybe/i.test(latestMessage)) {
      return NextResponse.json({
        reply: "No worries — just tell me gym or casual, I’ll take it from there.",
        memory: sessionMemory
      });
    }

    // ------------------------
    // 😐 PASSIVE
    // ------------------------
    if (/ok|hmm|fine/i.test(latestMessage)) {
      return NextResponse.json({
        reply: "Got it. I can show you top picks or something within your budget.",
        memory: sessionMemory
      });
    }

    // ------------------------
    // 🧠 ASK MISSING INFO
    // ------------------------
    const missing = getMissingFields(sessionMemory);

    if (missing.length > 0) {
      return NextResponse.json({
        reply: askNextQuestion(missing),
        memory: sessionMemory
      });
    }

    // ------------------------
    // 🛒 RECOMMEND PRODUCTS
    // ------------------------
    const products = await getProducts();
    const results = findBestProducts(products, sessionMemory);

    if (results.length === 0) {
      return NextResponse.json({
        reply: premiumTone("no_results"),
        memory: sessionMemory
      });
    }

    let reply = `${premiumTone("recommend_intro")}\n\n`;

    results.forEach(p => {
      reply += `• ${p.name} — ₹${p.price}
${p.description || 'Built for performance'}\n\n`;
    });

    reply += `Want me to refine further or show alternatives?`;

    return NextResponse.json({
      reply,
      memory: sessionMemory
    });

  } catch (error) {
    console.error("AI Chat Error:", error);

    return NextResponse.json(
      { error: 'Server error.' },
      { status: 500 }
    );
  }
}