import { NextResponse } from 'next/server';
import { getProducts, getGlobalKnowledgeV2, getUserMemoryV2 } from '@/lib/firebaseUtils';
import { DeerOSCoordinator } from '@/lib/deerOs';

export async function POST(req: Request) {
  try {
    const { messages, context } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ reply: 'Hey—tell me what you’re looking for and I’ll help you out.' });
    }

    // 1. Boot up DEER OS V3 core prerequisites
    const userId = context?.userName || "anonymous_user";
    
    // Multi-threading data fetching for high performance (<300ms target)
    const [catalog, structuredGraph, userMemoryData] = await Promise.all([
      getProducts(),
      getGlobalKnowledgeV2(),
      getUserMemoryV2(userId)
    ]);

    // 2. Initialize the V3 Intelligence Engine
    const deerOS = new DeerOSCoordinator(
       structuredGraph,
       catalog,
       userMemoryData,
       userId
    );

    // Context tracing
    const latestUserMessage = messages[messages.length - 1].content;
    const lastSystemMessage = messages.length > 1 && messages[messages.length - 2].role === 'assistant' 
       ? messages[messages.length - 2].content 
       : "";

    // 3. Execute Neural Pathways
    const replyText = await deerOS.execute(latestUserMessage, lastSystemMessage);

    return NextResponse.json({
      reply: replyText,
      // Pass back memory context structurally if needed by frontend
      memory: context?.memory || {} 
    });

  } catch (error) {
    console.error("Chat Error:", error);
    return NextResponse.json({
      reply: 'Hey—tell me what you’re looking for and I’ll help you out.',
      memory: {} 
    });
  }
}