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

export function normalizeInput(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, "")
    .replace(/\s+/g, " ")
    .replace(/\byor\b/g, "your")
    .replace(/\byoiur\b/g, "your")
    .replace(/\bur\b/g, "your")
    .trim();
}

export function isNameQuery(msg: string): boolean {
  const m = normalizeInput(msg);
  return (
    m.includes("your name") ||
    m.includes("who are you") ||
    m.includes("ur name") ||
    m.includes("name ") ||
    m.endsWith("name")
  );
}

export function isIdentityLearning(msg: string): boolean {
  const m = normalizeInput(msg);
  return m.includes("your name is") || m.includes("remember your name");
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
export type Intent = "question" | "product_search" | "learning_input" | "feedback" | "unknown" | "site_knowledge";

export class IntentEngine {
  static detect(message: string): Intent {
    const raw = message.toLowerCase();
    
    // Abstract concepts that map to product search
    if (raw.match(/\b(fast|cool|summer|winter|heavy|light|aerodynamic|breathable|sweat|warm|cold|stealth|ninja)\b/)) {
        return "product_search";
    }

    if (raw.match(/\b(buy|shop|looking for|recommend|price|cost|gear|shirt|tshirt|suit|speedsuit|pants|shorts)\b/)) {
        return "product_search";
    }

    if (FAQEngine.check(raw) !== null) {
        return "site_knowledge";
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
// 2.5 SITE KNOWLEDGE & FAQ ENGINE
// -------------------------------------------------------------
export const SITE_KNOWLEDGE = [
  {
    keywords: ["shipping", "delivery", "track", "arrive", "ship", "deliver", "how long"],
    answer: "We offer complimentary express shipping on all orders across India. Your performance gear is processed immediately and typically arrives within 2-4 business days."
  },
  {
    keywords: ["return", "refund", "exchange", "back", "didn't fit"],
    answer: "We offer hassle-free complimentary returns and exchanges within 14 days. If your gear doesn't fit perfectly, we've got you covered."
  },
  {
    keywords: ["what is dualdeer", "about dualdeer", "brand", "who are you guys", "story", "dual deer"],
    answer: "DualDeer is India's premier luxury athleisure and high-performance activewear brand. We engineer gear for elite training, marathon running, gym, and street-ready aesthetics."
  },
  {
    keywords: ["speedsuit", "speed suit", "what is a speedsuit", "running suit", "sprint"],
    answer: "The SpeedSuit is our signature high-performance compression wear. It's engineered for aerodynamics, reducing drag by 14%, muscle support, and ultimate comfort during intense training or races."
  },
  {
    keywords: ["contact", "support", "help", "email", "talk to human", "customer service"],
    answer: "You can reach our support team right here in this chat, or email us at support@dualdeer.com. We're always monitoring and ready to assist you."
  },
  {
    keywords: ["men", "mens", "male", "guy", "boy"],
    answer: "We have a dedicated Men's collection featuring premium compression shirts, tracksuits, and gym wear. Type 'show me mens gear' to see our top picks."
  },
  {
    keywords: ["women", "womens", "female", "ladies", "girl"],
    answer: "Our Women's collection features luxury activewear and performance gear designed for perfection. Type 'show me womens gear' to explore."
  },
  {
    keywords: ["size", "sizing", "fit", "chart", "measure", "too big", "too small"],
    answer: "Our gear is designed with an athletic, tailored fit. If you prefer a looser fit, we recommend sizing up. All our SpeedSuits offer high-stretch compression (they will feel tight at first, which is intended)."
  },
  {
    keywords: ["material", "fabric", "quality", "made of", "wash", "care", "washing"],
    answer: "We use proprietary premium, moisture-wicking, high-stretch fabrics (Nylon-Elastane blends) designed for luxury feel and elite performance. Always machine wash cold inside out, and hang dry."
  },
  {
    keywords: ["where", "location", "based", "india", "country", "store", "offline"],
    answer: "DualDeer provides premium SpeedSuits and activewear exclusively online across India. We deliver luxury performance gear directly from our warehouse to your doorstep."
  },
  {
    keywords: ["discount", "coupon", "sale", "promo", "code", "offer"],
    answer: "We occasionally run exclusive drops and promotions. Keep an eye on our homepage or sign up for our newsletter to get early access to our luxury sales and 10% off!"
  },
  {
    keywords: ["payment", "pay", "cod", "cash on delivery", "card", "upi"],
    answer: "We accept all major secure payment methods including UPI, Credit/Debit cards, Net Banking, and Wallet apps. Cash on Delivery is available for eligible pin codes."
  },
  {
    keywords: ["owner", "founder", "ceo", "who made", "creator"],
    answer: "DualDeer is crafted with a passion for luxury performance and elite aesthetics, driven by a vision to redefine activewear in India."
  },
  {
    keywords: ["cart", "bag", "basket", "checkout", "buy now"],
    answer: "You can view your selected gear by clicking the shopping bag icon at the top right of your screen. Ready to checkout?"
  },
  {
    keywords: ["account", "login", "register", "profile", "sign in", "sign up"],
    answer: "You can manage your orders, wishlist, and preferences in your account. Just tap the User icon in the navigation bar to log in."
  },
  {
    keywords: ["compression", "tight", "muscle support", "aerodynamic"],
    answer: "Our compression wear (including the signature SpeedSuit) is engineered for muscle support, improved blood flow, aerodynamics, and sweat wicking. It's built for high-intensity training and recovery."
  },
  {
    keywords: ["newsletter", "subscribe", "10%", "discount", "welcome"],
    answer: "You can sign up for our newsletter at the bottom of the page to receive 10% off your first order and get early access to our exclusive luxury drops!"
  },
  {
    keywords: ["who are you", "what are you", "ai", "bot"],
    answer: "I'm Deer, your DualDeer Concierge AI. I'm a highly advanced, locally trained system engineered to know everything about our luxury activewear, help you find the perfect fit, and assist with any questions."
  },
  {
    keywords: ["how to navigate", "menu", "find things", "where is"],
    answer: "You can explore our collections via the top navigation bar (or the bottom dock on mobile). The User icon takes you to your account, and the Bag icon opens your cart."
  },
  {
    keywords: ["sweat", "breathable", "hot", "summer", "heat"],
    answer: "All our activewear features advanced moisture-wicking technology. For intense heat, I highly recommend our Logic Vests and SpeedSuits—they pull sweat away from the skin and dry instantly."
  },
  {
    keywords: ["cold", "winter", "warm", "heavy", "layer"],
    answer: "For colder climates, our heavy-weight tracksuits and thermal compression layers provide incredible insulation without sacrificing mobility."
  },
  {
    keywords: ["warranty", "guarantee", "broken", "tear"],
    answer: "We stand by our quality. If your gear arrives with a manufacturing defect, let us know within 7 days and we will replace it immediately, no questions asked."
  },
  {
    keywords: ["gift", "card", "present"],
    answer: "DualDeer gear makes the perfect gift for high performers. While we don't have digital gift cards yet, you can order directly to their address!"
  },
  {
    keywords: ["color", "fade", "black", "white"],
    answer: "Our fabrics are treated to retain their deep colors, especially our Stealth Blacks. Follow the care instructions (wash cold, no bleach) and they will never fade."
  }
];

export class FAQEngine {
  static check(message: string): string | null {
    const raw = message.toLowerCase();
    
    let bestMatch = null;
    let maxMatches = 0;

    for (const item of SITE_KNOWLEDGE) {
      let matches = 0;
      for (const kw of item.keywords) {
        if (raw.includes(kw)) {
          matches++;
        }
      }
      if (matches > maxMatches) {
        maxMatches = matches;
        bestMatch = item.answer;
      }
    }

    if (maxMatches > 0) return bestMatch;
    return null;
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
     
     // 1. Abstract Reasoning / Intent Mapping
     let mappedQuery = q;
     if (q.includes("fast") || q.includes("aerodynamic") || q.includes("speed")) mappedQuery += " speedsuit";
     if (q.includes("cool") || q.includes("summer") || q.includes("sweat") || q.includes("breathable")) mappedQuery += " shirt shorts vest";
     if (q.includes("winter") || q.includes("warm") || q.includes("heavy") || q.includes("cold")) mappedQuery += " hoodie jacket tracksuit";
     if (q.includes("stealth") || q.includes("ninja") || q.includes("dark")) mappedQuery += " black";
     if (q.includes("gym") || q.includes("train") || q.includes("lift")) mappedQuery += " shirt short compression";
     
     // 2. Scoring Logic
     const results = products.map(p => {
         let score = 0;

         // Category match (boosted)
         if (mappedQuery.includes(p.category.toLowerCase())) score += 8;
         
         // Color match
         if (p.colors?.some(c => mappedQuery.includes(c.toLowerCase()))) score += 4;
         
         // Name matching
         const words = mappedQuery.split(' ');
         const nameLower = p.name.toLowerCase();
         if (words.some(w => w.length > 3 && nameLower.includes(w))) score += 10;
         
         // User preferences (long-term memory)
         userPrefs.forEach(pref => {
            if (`${p.description} ${p.category}`.toLowerCase().includes(pref)) score += 3;
         });
         
         // Quality heuristic
         score += (p.rating || 0) * 0.5;
         
         return { ...p, score };
     });
     
     // 3. Return top matches above a threshold
     return results.filter(r => r.score > 2).sort((a,b) => b.score - a.score).slice(0,3);
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
     if (products.length === 0) return "I couldn't find an exact match for that right now in our current lineup.";
     
     const intros = [
       "Here is the premium gear I selected for you based on those specs:",
       "I scanned our entire vault. This is exactly what you need:",
       "These are our top-tier performance pieces matching your request:",
       "I found exactly what you're looking for. Check these out:"
     ];
     
     let res = intros[Math.floor(Math.random() * intros.length)] + "\n";
     
     products.forEach(p => {
        res += `\n- **${p.name}** (₹${p.price})`;
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
       const normalized = normalizeInput(rawInput);

       if (isGreeting(normalized)) {
           return "Hey. What are you looking for today?";
       }

       if (isIdentityLearning(rawInput)) {
           return "I’m already Deer.";
       }

       if (isNameQuery(rawInput)) {
           return "I’m Deer — your DualDeer performance assistant.";
       }

       const cleanInput = PrivacyEngine.sanitize(rawInput);
       const intent = IntentEngine.detect(cleanInput);
       
       MemoryEngine.updateUser(this.userId, cleanInput).catch(()=>null);
       const prefs = this.userMemory?.preferences || [];

       if (intent === "site_knowledge") {
           const answer = FAQEngine.check(cleanInput);
           if (answer) {
               return answer;
           }
       }

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
       
       return "I’m here to help with performance gear or anything you need—what are you looking for?";
   }

   async execute(rawInput: string, lastSystemMessage: string): Promise<string> {
       const rawReply = await this.executeRaw(rawInput, lastSystemMessage);
       return sanitizeResponse(rawReply);
   }
}
