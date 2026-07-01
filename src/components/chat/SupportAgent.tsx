"use client";
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { MessageSquare, X, Send, Sparkles } from 'lucide-react';
import styles from './SupportAgent.module.css';
import { getAIMemory, updateAIMemory } from '@/lib/firebaseUtils';

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
  const [isScrolling, setIsScrolling] = useState(false);
  const [snapSide, setSnapSide] = useState<'left' | 'right'>('right');
  const wrapperControls = useAnimation();

  // ------------------------
  // 📜 INITIAL ENTRY & SCROLL LOGIC
  // ------------------------
  useEffect(() => {
    // Initial entry animation
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
          content: "Welcome to DualDeer. What are you looking for today?"
        }]);
      }

      if (mem?.context) {
        localStorage.setItem('dualdeer_cloud_context', mem.context);
      }
    });
  }, []);

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
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // ------------------------
  // 🚀 SEND MESSAGE
  // ------------------------
  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const cleanedInput = input.trim().toLowerCase();

    if (!cleanedInput || isLoading) return;

    // ❌ Prevent duplicate spam
    const lastMsg = messages[messages.length - 1];
    if (lastMsg?.role === 'user' && lastMsg.content === cleanedInput) return;

    const userMessage: Message = { role: 'user', content: cleanedInput };
    const newHistory = [...messages, userMessage];

    setMessages(newHistory);
    setInput('');
    setIsLoading(true);

    try {
      const userName = localStorage.getItem('dualdeer_active_user') || 'Guest';
      const deviceId = localStorage.getItem('dualdeer_device_id') || 'guest';
      const userId = userName !== 'Guest' ? userName : deviceId;

      // 🧠 Load session memory safely
      const sessionMemoryStr = localStorage.getItem('dualdeer_session_memory');
      const sessionMemory = sessionMemoryStr ? JSON.parse(sessionMemoryStr) : {};

      // 🌐 Upload user intent
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

        // 🧠 SAFE MEMORY MERGE (CRITICAL)
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
  };

  return (
    <>
      {/* FAB WRAPPER */}
      <motion.div
        className={styles.fabWrapper}
        drag
        dragMomentum={false}
        animate={wrapperControls}
        initial={{ y: 100, opacity: 0 }}
        onDragEnd={(e, info) => {
          if (typeof window !== 'undefined') {
            const isLeft = info.point.x < window.innerWidth / 2;
            setSnapSide(isLeft ? 'left' : 'right');
            // Element is right: 10px. 
            // Target X for left edge snap (10px gap on left)
            wrapperControls.start({
              x: isLeft ? 64 - window.innerWidth : 0,
              transition: { type: 'spring', stiffness: 300, damping: 25 }
            });
          }
        }}
      >
        <motion.button
          className={styles.fab}
          onClick={() => setIsOpen(true)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          animate={{ 
            opacity: isScrolling ? 0.5 : 1,
            x: isScrolling ? (snapSide === 'right' ? 80 : -80) : 0
          }}
          transition={{ duration: 0.4, type: "spring", bounce: 0.2 }}
        >
          <MessageSquare size={20} />
        </motion.button>
      </motion.div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className={styles.chatWindow}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          >

            {/* HEADER */}
            <div className={styles.header}>
              <div className={styles.headerInfo}>
                <div className={styles.avatar}><Sparkles size={16} /></div>
                <div>
                  <h3 className={styles.headerTitle}>DualDeer Concierge</h3>
                  <span className={styles.status}>AI Assistant</span>
                </div>
              </div>
              <button className={styles.closeBtn} onClick={() => setIsOpen(false)}>
                <X size={20} />
              </button>
            </div>

             {/* MESSAGES */}
            <div className={styles.messagesContainer}>
               <AnimatePresence>
                 {messages.map((msg, i) => (
                   <motion.div 
                     key={i} 
                     className={`${styles.messageWrapper} ${msg.role === 'user' ? styles.userWrapper : styles.assistantWrapper}`}
                     initial={{ opacity: 0, y: 10, scale: 0.95 }}
                     animate={{ opacity: 1, y: 0, scale: 1 }}
                     exit={{ opacity: 0, scale: 0.95 }}
                     transition={{ duration: 0.2 }}
                   >
                     {msg.role === 'assistant' && (
                       <div className={styles.assistantSidebar}>
                         <div className={styles.msgAvatar}>🦌</div>
                         <span className={styles.avatarLabel}>DEER</span>
                       </div>
                     )}
                     <div className={styles.messageContentBlock}>
                       <div className={`${styles.messageBubble} ${msg.role === 'user' ? styles.userBubble : styles.assistantBubble}`}>
                         {msg.content}
                       </div>
                       
                       {msg.products && msg.products.length > 0 && (
                         <motion.div 
                           className={styles.productCarousel}
                           initial={{ opacity: 0, y: 20 }}
                           animate={{ opacity: 1, y: 0 }}
                           transition={{ delay: 0.3, duration: 0.4 }}
                         >
                           {msg.products.map(p => (
                              <div key={p.id} className={styles.productCard}>
                                <div className={styles.productImageWrapper}>
                                    <img src={p.images?.[0] || p.image || '/placeholder-product.png'} alt={p.name} className={styles.productImage} />
                                </div>
                                <div className={styles.productInfo}>
                                  <h4 className={styles.productTitle}>{p.name}</h4>
                                  <p className={styles.productPrice}>₹{p.price}</p>
                                  <button className={styles.viewBtn}>View</button>
                                </div>
                              </div>
                           ))}
                         </motion.div>
                       )}
                     </div>
                   </motion.div>
                 ))}
               </AnimatePresence>

              {isLoading && (
                <motion.div 
                  className={`${styles.messageWrapper} ${styles.assistantWrapper}`}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <div className={styles.assistantSidebar}>
                    <div className={styles.msgAvatar}>🦌</div>
                    <span className={styles.avatarLabel}>DEER</span>
                  </div>
                  <div className={styles.messageContentBlock}>
                    <div className={`${styles.messageBubble} ${styles.assistantBubble} ${styles.typingBubble}`}>
                      <span className={styles.dot}></span>
                      <span className={styles.dot}></span>
                      <span className={styles.dot}></span>
                    </div>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* INPUT */}
            <form onSubmit={handleSend} className={styles.inputForm}>
              <input
                className={styles.inputField}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask anything..."
                // Removed disabled={isLoading} so users can type while AI thinks!
              />
              <button 
                className={styles.sendBtn} 
                type="submit" 
                disabled={!input.trim() || isLoading}
                onMouseDown={(e) => e.preventDefault()} // Prevents the button from stealing focus from the input!
              >
                <Send size={18} />
              </button>
            </form>

          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}