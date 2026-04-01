import { Product, KnowledgeNode, addGlobalKnowledgeV2, updateKnowledgeConfidence, updateUserMemoryV2, UserMemoryV2 } from './firebaseUtils';

// -------------------------------------------------------------
// 0. SANITIZATION LAYER
// -------------------------------------------------------------
export function sanitizeResponse(reply: string): string {
  const blocked = [
    "intent unresolved",
    "assert explicit",
    "structural learning",
    "internal database",
    "neural",
    "confidence score",
    "parameter acquired",
    "system routing",
    "matrix",
    "graph",
    "void regarding subject factor",
    "fallback"
  ];

  const lower = reply.toLowerCase();

  for (const b of blocked) {
    if (lower.includes(b)) {
      return "Hey. What can I help you with?";
    }
  }

  return reply;
}

export function isGreeting(msg: string): boolean {
  return /^(hi|hello|hey|yo|hii)$/i.test(msg.trim());
}

// -------------------------------------------------------------
// 1. PRIVACY ENGINE
// -------------------------------------------------------------
export class PrivacyEngine {
  static sanitize(message: string): string {
    let clean = message.replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g, "");
    clean = clean.replace(/\b\d{10,15}\b/g, "");
    clean = clean.replace(/(my name is|i am known as|call me) [A-Za-z]+/gi, "$1 [REDACTED]");
    clean = clean.replace(/(live in|living in|from|address is) [A-Za-z\s0-9,]+/gi, "$1 [REDACTED]");
    clean = clean.replace(/(password|secret|pin) (is|:) [^\s]+/gi, "$1 $2 [REDACTED]");
    return clean.trim();
  }
}

// -------------------------------------------------------------
// 2. INTENT ENGINE
// -------------------------------------------------------------
export type Intent = "question" | "product_search" | "learning_input" | "feedback" | "unknown";

export class IntentEngine {
  static detect(message: string): Intent {
    const raw = message.toLowerCase();
    
    if (raw.match(/\b(buy|shop|looking for|recommend|price|cost|gear|shirt|tshirt|suit|speedsuit|pants|shorts)\b/)) {
        return "product_search";
    }

    if (raw.match(/\b(is|are|means|causes|makes|improves|reduces)\b/) && !raw.includes("what") && !raw.includes("who") && !raw.includes("?")) {
        return "learning_input";
    }
    
    if (raw.match(/^(what|who|why|how|where)\b/) || raw.includes("?")) {
        return "question";
    }

    if (raw.match(/\b(bad|good|sucks|great|terrible|amazing|hate|love)\b/)) {
        return "feedback";
    }
    
    return "unknown";
  }
}

// -------------------------------------------------------------
// 3. KNOWLEDGE ENGINE
// -------------------------------------------------------------
export class KnowledgeEngine {
  static normalize(entity: string): string {
    return entity.toLowerCase().replace(/speed suit/g, "speedsuit").trim();
  }
  
  static extractStructuredFact(text: string) {
    const verbMatch = text.match(/^(.*?)\s+(is|are|means|causes|makes|improves|reduces)\s+(.*)$/i);
    if (!verbMatch) return null;
    
    let subject = this.normalize(verbMatch[1]);
    let relation = verbMatch[2].toLowerCase();
    let object = this.normalize(verbMatch[3]);
    
    if (subject.length < 2 || object.length < 2) return null;
    
    const pronouns = ['i','you','he','she','it','they','we','this','that'];
    if (pronouns.includes(subject.split(' ')[0])) return null;

    if (subject.includes('think') || subject.includes('believe') || object.includes('best') || object.includes('worst')) {
        return null;
    }
    
    return { subject, relation, object };
  }

  static async ingestFact(fact: {subject: string, relation: string, object: string}, existingKnowledge: KnowledgeNode[]) {
     const exactMatch = existingKnowledge.find(k => k.subject === fact.subject && k.relation === fact.relation && k.object === fact.object);
     
     if (exactMatch && exactMatch.id) {
        await updateKnowledgeConfidence(exactMatch.id, exactMatch.confidence + 0.1, true);
        return { action: 'merged', confidence: exactMatch.confidence + 0.1 };
     }

     const contradictionMatch = existingKnowledge.find(k => k.subject === fact.subject && k.relation === fact.relation && k.object !== fact.object);
     
     if (contradictionMatch && contradictionMatch.id) {
        const contradictoryNode: KnowledgeNode = {
           subject: fact.subject,
           relation: fact.relation,
           object: fact.object,
           confidence: 0.1,
           sources: 1,
           contradictions: [contradictionMatch.id]
        };
        await addGlobalKnowledgeV2(contradictoryNode);
        await updateKnowledgeConfidence(contradictionMatch.id, contradictionMatch.confidence - 0.2, false);
        return { action: 'contradiction', node: contradictoryNode };
     }

     const newNode: KnowledgeNode = {
        subject: fact.subject,
        relation: fact.relation,
        object: fact.object,
        confidence: 0.5,
        sources: 1
     };
     await addGlobalKnowledgeV2(newNode);
     return { action: 'added', node: newNode };
  }
}

// -------------------------------------------------------------
// 4. REASONING ENGINE 
// -------------------------------------------------------------
export class ReasoningEngine {
  static infer(targetSubject: string, graph: KnowledgeNode[], maxDepth = 2): KnowledgeNode[] {
     let inferred: KnowledgeNode[] = [];
     const transitivityRules = [['is', 'is', 'is'], ['means', 'means', 'means'], ['causes','causes','causes']];
     
     const direct = graph.filter(n => n.subject === targetSubject);
     inferred.push(...direct);
     
     if (maxDepth >= 1) {
         graph.forEach(nodeA => {
             if (nodeA.subject === targetSubject) {
                 graph.forEach(nodeB => {
                     if (nodeB.subject === nodeA.object) {
                         const validRule = transitivityRules.find(r => r[0]===nodeA.relation && r[1]===nodeB.relation);
                         if (validRule) {
                             inferred.push({
                                 subject: targetSubject,
                                 relation: validRule[2],
                                 object: nodeB.object,
                                 confidence: nodeA.confidence * nodeB.confidence,
                                 sources: 0
                             });
                         }
                     }
                 });
             }
         });
     }
     
     const unique = new Map<string, KnowledgeNode>();
     inferred.forEach(node => {
        const key = `${node.subject}-${node.relation}-${node.object}`;
        if (!unique.has(key) || (unique.get(key)!.confidence < node.confidence)) {
            unique.set(key, node);
        }
     });

     return Array.from(unique.values()).sort((a,b) => b.confidence - a.confidence);
  }
}

// -------------------------------------------------------------
// 5. PRODUCT ENGINE
// -------------------------------------------------------------
export interface ScoredProduct extends Product {
  score: number;
}

export class ProductEngine {
  static getTopMatches(query: string, products: Product[], userPrefs: string[] = []): ScoredProduct[] {
     const q = query.toLowerCase();
     const results = products.map(p => {
         let score = 0;

         if (q.includes(p.category.toLowerCase())) score += 4;
         if (p.colors?.some(c => q.includes(c.toLowerCase()))) score += 2;
         
         const words = q.split(' ');
         const nameLower = p.name.toLowerCase();
         if (words.some(w => w.length > 3 && nameLower.includes(w))) score += 8;
         
         userPrefs.forEach(pref => {
            if (`${p.description} ${p.category}`.toLowerCase().includes(pref)) score += 2;
         });
         
         score += (p.rating || 0) * 0.5;
         
         return { ...p, score };
     });
     
     return results.filter(r => r.score > 1).sort((a,b) => b.score - a.score).slice(0,3);
  }
}

// -------------------------------------------------------------
// 6. MEMORY ENGINE
// -------------------------------------------------------------
export class MemoryEngine {
  static extractPreferences(message: string): string[] {
      const prefs: string[] = [];
      const msg = message.toLowerCase();
      const categories = ['speedsuit', 'shirt', 'pants', 'shorts', 'gym', 'training', 'marathon'];
      const colors = ['black', 'logic', 'red', 'blue', 'white', 'stealth'];
      
      categories.forEach(c => { if (msg.includes(c)) prefs.push(c); });
      colors.forEach(c => { if (msg.includes(c)) prefs.push(c); });
      
      return prefs;
  }
  
  static async updateUser(userId: string, currentQuery: string) {
      const prefs = this.extractPreferences(currentQuery);
      await updateUserMemoryV2(userId, prefs, currentQuery);
  }
}

// -------------------------------------------------------------
// 7. RESPONSE ENGINE
// -------------------------------------------------------------
export class ResponseEngine {
  static formatTopFact(nodes: KnowledgeNode[]): string {
     if (nodes.length === 0) return "";
     const top = nodes[0];
     
     let res = `From what I gather, ${top.subject} ${top.relation} ${top.object}.`;
     
     if (nodes.length > 1 && nodes[1].relation === 'causes') {
        res += ` It also ${nodes[1].relation} ${nodes[1].object}.`;
     }
     
     return res;
  }

  static constructProductResponse(products: ScoredProduct[]): string {
     if (products.length === 0) return "I couldn't find an exact match for that right now.";
     
     let res = "Here are my top hardware picks for you:\n";
     products.forEach(p => {
        res += `\n- ${p.name} (₹${p.price})`;
     });
     return res;
  }
  
  static finalResponse(directAnswer: string, products: ScoredProduct[] = []): string {
     let output = directAnswer;
     if (products.length > 0) {
        output += "\n\n" + this.constructProductResponse(products);
     }
     return output.trim();
  }
}

// -------------------------------------------------------------
// DEER OS V3 COORDINATOR
// -------------------------------------------------------------
export class DeerOSCoordinator {
   graph: KnowledgeNode[];
   catalog: Product[];
   userMemory: UserMemoryV2 | null;
   userId: string;
   
   constructor(graph: KnowledgeNode[], catalog: Product[], userMemory: UserMemoryV2 | null, userId: string) {
      this.graph = graph;
      this.catalog = catalog;
      this.userMemory = userMemory;
      this.userId = userId;
   }
   
   async executeRaw(rawInput: string, lastSystemMessage: string): Promise<string> {
       if (isGreeting(rawInput)) {
           return "Hey. What are you looking for today?";
       }

       const cleanInput = PrivacyEngine.sanitize(rawInput);
       const intent = IntentEngine.detect(cleanInput);
       
       MemoryEngine.updateUser(this.userId, cleanInput).catch(()=>null);
       const prefs = this.userMemory?.preferences || [];

       if (intent === "learning_input") {
           const fact = KnowledgeEngine.extractStructuredFact(cleanInput);
           if (!fact) return "Got it. Tell me more about what you're looking for.";
           
           const res = await KnowledgeEngine.ingestFact(fact, this.graph);
           if (res.action === 'contradiction') {
               return `I've heard slightly different things before, but I'll keep this in mind.`;
           }
           if (res.action === 'merged') {
               return `Thanks for confirming that.`;
           }
           return `Got it. I'll remember this.`;
       }
       
       if (intent === "question") {
           const match = cleanInput.match(/(what|who|why) (is|are) (.*?)\??$/i);
           if (match) {
               const subject = KnowledgeEngine.normalize(match[3].replace(/[?]/g,''));
               const inferences = ReasoningEngine.infer(subject, this.graph);
               
               if (inferences.length > 0) {
                   return ResponseEngine.finalResponse(ResponseEngine.formatTopFact(inferences));
               } else {
                   return `I'm not exactly sure about "${subject}". How would you describe it?`;
               }
           }
       }
       
       if (intent === "product_search") {
           const scored = ProductEngine.getTopMatches(cleanInput, this.catalog, prefs);
           if (scored.length > 0) {
               return ResponseEngine.finalResponse("I've pulled up some gear that matches your request.", scored);
           }
           return "I scanned our gear, but didn't find a perfect match for those details. Want to try a slightly different search?";
       }
       
       if (intent === "feedback") {
           return "Thanks for the feedback. I'm always looking to improve.";
       }
       
       if (lastSystemMessage.includes("describe it")) {
           const fact = KnowledgeEngine.extractStructuredFact(cleanInput);
           if (fact) {
               await KnowledgeEngine.ingestFact(fact, this.graph);
               return `Got it. I'll remember this now.`;
           }
       }
       
       return "I didn’t quite get that—what are you looking for?";
   }

   async execute(rawInput: string, lastSystemMessage: string): Promise<string> {
       const rawReply = await this.executeRaw(rawInput, lastSystemMessage);
       return sanitizeResponse(rawReply);
   }
}
