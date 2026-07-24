"use client";
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { MessageSquare, X, Send, Sparkles, Mic, Paperclip, Shirt, TestTube, TrendingUp, Package, Info, ArrowUp, RotateCcw } from 'lucide-react';
import styles from './SupportAgent.module.css';
import { getAIMemory, updateAIMemory } from '@/lib/firebaseUtils';
import Link from 'next/link';
import { AiDeerIcon } from './AiDeerIcon';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  products?: any[];
}

export default function SupportAgent() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isScrolling, setIsScrolling] = useState(false);
  const [snapSide, setSnapSide] = useState<'left' | 'right'>('right');
  const wrapperControls = useAnimation();

  // ------------------------
  // 📜 INITIAL ENTRY & SCROLL LOGIC
  // ------------------------
  useEffect(() => {
    wrapperControls.start({ y: 0, opacity: 1, transition: { duration: 0.5 } });

    let scrollTimeout: NodeJS.Timeout;
    const handleScroll = () => {
      setIsScrolling(true);
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        setIsScrolling(false);
      }, 800);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(scrollTimeout);
    };
  }, [wrapperControls]);

  // ------------------------
  // 🧠 INIT MEMORY
  // ------------------------
  useEffect(() => {
    let deviceId = localStorage.getItem('dualdeer_device_id');
    if (!deviceId) {
      deviceId = 'device_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('dualdeer_device_id', deviceId);
    }

    const userId = localStorage.getItem('dualdeer_active_user') || deviceId;

    getAIMemory(userId).then(mem => {
      const saved = localStorage.getItem('dualdeer_agent_memory');

      if (saved) {
        setMessages(JSON.parse(saved));
      } else {
        setMessages([{
          role: 'assistant',
          content: "Welcome to the DualDeer Concierge. I am your personal AI assistant. How can I elevate your experience today?"
        }]);
      }

      if (mem?.context) {
        localStorage.setItem('dualdeer_cloud_context', mem.context);
      }
    });
  }, []);

  const clearChat = () => {
    localStorage.removeItem('dualdeer_agent_memory');
    localStorage.removeItem('dualdeer_session_memory');
    localStorage.removeItem('dualdeer_cloud_context');
    setMessages([{
      role: 'assistant',
      content: "Memory wiped. Let's start fresh. What can I help you with?"
    }]);
  };

  // ------------------------
  // 💾 SAVE CHAT MEMORY
  // ------------------------
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('dualdeer_agent_memory', JSON.stringify(messages));
    }
    scrollToBottom();
  }, [messages, isLoading]);

  // ------------------------
  // 🛑 PREVENT BACKGROUND SCROLL
  // ------------------------
  useEffect(() => {
    // FREEZE THE ENTIRE LANDING PAGE
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 100);
    } else {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    }
    return () => { 
      document.body.style.overflow = ''; 
      document.documentElement.style.overflow = '';
    };
  }, [isOpen]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // ------------------------
  // 💡 SUGGESTED QUESTIONS
  // ------------------------
  const handleSuggestion = (question: string) => {
    setInput(question);
    setTimeout(() => {
        handleSend(undefined, question);
    }, 50);
  };

  // ------------------------
  // ✏️ AUTO RESIZE TEXTAREA
  // ------------------------
  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // ------------------------
  // 🚀 SEND MESSAGE
  // ------------------------
  const handleSend = async (e?: React.FormEvent, directInput?: string) => {
    if (e) e.preventDefault();

    const textToSend = directInput !== undefined ? directInput : input;
    const cleanedInput = textToSend.trim();

    if (!cleanedInput || isLoading) return;

    const lastMsg = messages[messages.length - 1];
    if (lastMsg?.role === 'user' && lastMsg.content.toLowerCase() === cleanedInput.toLowerCase()) {
       setInput(''); 
       if (textareaRef.current) textareaRef.current.style.height = 'auto';
       return; 
    }

    const userMessage: Message = { role: 'user', content: textToSend };
    const newHistory = [...messages, userMessage];

    setMessages(newHistory);
    setInput('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
    setIsLoading(true);

    try {
      const userName = localStorage.getItem('dualdeer_active_user') || 'Guest';
      const deviceId = localStorage.getItem('dualdeer_device_id') || 'guest';
      const userId = userName !== 'Guest' ? userName : deviceId;

      const sessionMemoryStr = localStorage.getItem('dualdeer_session_memory');
      const sessionMemory = sessionMemoryStr ? JSON.parse(sessionMemoryStr) : {};

      updateAIMemory(userId, userName, `User intent: ${cleanedInput}`);

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newHistory,
          context: {
            memory: sessionMemory,
            userName,
            lastUserMessage: cleanedInput
          }
        })
      });

      const data = await response.json();

      if (response.ok) {
        setMessages(prev => [...prev, { role: 'assistant', content: data.reply, products: data.products }]);

        if (data.memory) {
          const existing = localStorage.getItem('dualdeer_session_memory');
          const prevMemory = existing ? JSON.parse(existing) : {};

          const merged = {
            ...prevMemory,
            ...data.memory
          };

          localStorage.setItem('dualdeer_session_memory', JSON.stringify(merged));
        }

        updateAIMemory(userId, userName, `Agent response: ${data.reply}`);
      } else {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: data.error || 'Connection issue.'
        }]);
      }

    } catch (error) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'System temporarily unavailable.'
      }]);
    }

    setIsLoading(false);
    setTimeout(() => textareaRef.current?.focus(), 100);
  };

  const suggestions = [
    "Explore SpeedSuit",
    "Track my order",
    "What makes DualDeer premium?"
  ];

  return (
    <>
      {/* FAB WRAPPER */}
      <motion.div
        className={styles.fabWrapper}
        animate={wrapperControls}
        initial={{ y: 100, opacity: 0 }}
      >
        <motion.button
          className={styles.fab}
          onClick={() => setIsOpen(!isOpen)}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
          animate={{ 
            opacity: isScrolling ? 0 : 1,
            x: isScrolling ? (snapSide === 'right' ? 150 : -150) : 0,
            scale: isScrolling ? 0.8 : 1
          }}
          transition={{ duration: 0.4, type: "spring", bounce: 0.2 }}
        >
          <div className={styles.fabGlow}></div>
          <span className={styles.deerEmoji}>🦌</span>
        </motion.button>
      </motion.div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className={styles.chatWindowOverlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            data-lenis-prevent="true"
          >
            {/* GLOW BACKGROUND EFFECT */}
            <div className={styles.glowBackground}></div>

            <motion.div
              className={styles.layoutWrapper}
              initial={{ opacity: 0, scale: 0.98, filter: 'blur(5px)' }}
              animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
              exit={{ opacity: 0, scale: 0.98, filter: 'blur(5px)' }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            >
              
              {/* LEFT SIDEBAR */}
              <div className={styles.sidebar}>
                <div className={styles.sidebarHeader}>
                  <div className={styles.logoArea}>
                    <div className={styles.logoText}>DEER</div>
                  </div>
                  <div className={styles.statusPill}>
                    <div className={styles.statusDot}></div>
                    AI ACTIVE
                  </div>
                </div>

                <div className={styles.navContainer}>
                  <a href="#" onClick={(e)=>{ e.preventDefault(); textareaRef.current?.focus(); }} className={styles.navCard}><MessageSquare className={styles.navCardIcon} size={20}/> Chat with Deer</a>
                  <Link href="/learn/size-guide" onClick={() => setIsOpen(false)} className={styles.navCard}><Shirt className={styles.navCardIcon} size={20}/> Fit Guide</Link>
                  <Link href="/learn" onClick={() => setIsOpen(false)} className={styles.navCard}><TestTube className={styles.navCardIcon} size={20}/> Fabric Lab</Link>
                  <Link href="/reaction-test" onClick={() => setIsOpen(false)} className={styles.navCard}><TrendingUp className={styles.navCardIcon} size={20}/> Performance Hub</Link>
                  <Link href="/contact" onClick={() => setIsOpen(false)} className={styles.navCard}><Package className={styles.navCardIcon} size={20}/> Order Support</Link>
                  <Link href="/about" onClick={() => setIsOpen(false)} className={styles.navCard}><Info className={styles.navCardIcon} size={20}/> About Deer</Link>
                </div>

                <div className={styles.featureCard}>
                  <h4 className={styles.featureCardTitle}><Sparkles size={16} color="#7B2EFF" /> DEER AI</h4>
                  <p className={styles.featureCardDesc}>Luxury activewear intelligence.<br/>Built for athletes.</p>
                  <div className={styles.avatarsRow}>
                    <div className={styles.miniAvatar}></div>
                    <div className={styles.miniAvatar}></div>
                    <div className={styles.miniAvatar}></div>
                  </div>
                  <div className={styles.slogan}>MOVE WITHOUT LIMITS.<br/>PERFORM.<br/>FOCUS.<br/>EVOLVE.</div>
                </div>
              </div>

              {/* MAIN CHAT */}
              <div className={styles.mainChat}>
                <div className={styles.mainHeader}>
                  <button className={styles.wipeBtn} onClick={clearChat} title="Wipe Memory">
                    <RotateCcw size={16} /> WIPE MEMORY
                  </button>
                  <button className={styles.closeBtn} onClick={() => setIsOpen(false)}>
                    <X size={24} />
                  </button>
                </div>

                <div className={styles.messagesContainer}>
                  
                  {messages.length <= 1 && (
                    <motion.div 
                      className={styles.heroSection}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                    >
                      <div className={styles.heroWelcome}>WELCOME,</div>
                      <h1 className={styles.heroTitle}>I'M DEER.</h1>
                      <p className={styles.heroSubtitle}>I know activewear.<br/>I know performance.<br/>I'm here to help.</p>
                    </motion.div>
                  )}

                  <AnimatePresence>
                    {messages.map((msg, i) => {
                      if (i === 0 && msg.role === 'assistant' && msg.content.includes("Welcome to the DualDeer Concierge")) return null;
                      
                      return (
                        <motion.div 
                          key={i} 
                          className={`${styles.messageWrapper} ${msg.role === 'user' ? styles.userWrapper : styles.assistantWrapper}`}
                          initial={{ opacity: 0, y: 15 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                        >
                          <div className={styles.messageContentBlock}>
                            <div className={`${styles.messageBubble} ${msg.role === 'user' ? styles.userBubble : styles.assistantBubble}`}>
                              {msg.content}
                            </div>
                            
                            {msg.products && msg.products.length > 0 && (
                              <motion.div 
                                className={styles.productCarousel}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.2, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                              >
                                {msg.products.map(p => (
                                  <a href={`/product/${p.slug}`} key={p.id} className={styles.productCard}>
                                    <img src={p.images?.[0] || p.image || '/placeholder-product.png'} alt={p.name} className={styles.productImage} />
                                    <div className={styles.productInfo}>
                                      <h4 className={styles.productTitle}>{p.name}</h4>
                                      <p className={styles.productPrice}>₹{p.price}</p>
                                    </div>
                                  </a>
                                ))}
                              </motion.div>
                            )}

                            <div className={styles.msgFooter}>
                              {msg.role === 'assistant' && <AiDeerIcon size={12} className={styles.deerTinyIcon} />}
                              {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>

                  {isLoading && (
                    <motion.div 
                      className={`${styles.messageWrapper} ${styles.assistantWrapper}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <div className={styles.messageContentBlock}>
                        <div className={styles.typingIndicator}>
                          <AiDeerIcon size={16} className={styles.typingIcon} />
                        </div>
                      </div>
                    </motion.div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* INPUT AREA */}
                <div className={styles.inputContainer}>
                  <form onSubmit={handleSend} style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                    <div className={styles.inputWrapper}>
                      <button type="button" className={styles.sparkBtn}>
                        <Sparkles size={20} />
                      </button>

                      <input
                        className={styles.inputField}
                        value={input}
                        onChange={(e: any) => setInput(e.target.value)}
                        placeholder="Ask Deer anything..."
                      />

                      <button 
                        className={styles.sendBtn} 
                        type="submit" 
                        disabled={isLoading || !input.trim()}
                      >
                        <ArrowUp size={20} />
                      </button>
                    </div>
                  </form>
                </div>

              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}