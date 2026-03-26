"use client";
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Sparkles } from 'lucide-react';
import styles from './SupportAgent.module.css';
import { getAIMemory, updateAIMemory } from '@/lib/firebaseUtils';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function SupportAgent() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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
  // 📱 MOBILE FIX
  // ------------------------
  useEffect(() => {
    if (isOpen && window.innerWidth <= 768) {
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
        setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);

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
      {/* FAB */}
      <motion.button
        className={styles.fab}
        onClick={() => setIsOpen(true)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        <MessageSquare size={24} />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className={styles.chatWindow}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
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
                       <div className={styles.msgAvatar}><Sparkles size={12} /></div>
                     )}
                     <div className={`${styles.messageBubble} ${msg.role === 'user' ? styles.userBubble : styles.assistantBubble}`}>
                       {msg.content}
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
                  <div className={styles.msgAvatar}><Sparkles size={12} /></div>
                  <div className={`${styles.messageBubble} ${styles.assistantBubble} ${styles.typingBubble}`}>
                    <span className={styles.dot}></span>
                    <span className={styles.dot}></span>
                    <span className={styles.dot}></span>
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
                disabled={isLoading}
              />
              <button className={styles.sendBtn} type="submit" disabled={!input.trim() || isLoading}>
                <Send size={18} />
              </button>
            </form>

          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}