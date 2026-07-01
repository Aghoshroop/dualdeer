"use client";
import { useState, useEffect, useRef } from 'react';
import styles from './Users.module.css';
import { User, Shield, Mail, MessageSquare, X, Send } from 'lucide-react';
import { getUsers, getSubscribers, getAllOrders, sendChatMessage, markMessagesAsRead, ChatMessage } from '@/lib/firebaseUtils';
import { db } from '@/lib/firebase';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { useCurrency } from '@/context/CurrencyContext';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [subscribers, setSubscribers] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { formatPrice, renderPrice } = useCurrency();

  // Chat State
  const [chatUser, setChatUser] = useState<any | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatUser) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, [messages, chatUser]);


  useEffect(() => {
    const fetchData = async () => {
      try {
        const [liveUsers, liveSubs, liveOrders] = await Promise.all([getUsers(), getSubscribers(), getAllOrders()]);
        setUsers(liveUsers);
        setSubscribers(liveSubs);
        setOrders(liveOrders);
      } catch (e) {
        console.error("Failed to sync live data", e);

      }
      setLoading(false);
    };
    fetchData();
  }, []);

  // Real-time Chat Listener
  useEffect(() => {
    if (!chatUser) return;
    
    // Mark messages as read when opening chat
    markMessagesAsRead(chatUser.id, 'admin');

    const q = query(collection(db, 'chats'), where('userId', '==', chatUser.id));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ChatMessage));
      msgs.sort((a, b) => {
        const timeA = (a.createdAt as any)?.toMillis ? (a.createdAt as any).toMillis() : a.createdAt;
        const timeB = (b.createdAt as any)?.toMillis ? (b.createdAt as any).toMillis() : b.createdAt;
        return Number(timeA) - Number(timeB); // asc
      });
      setMessages(msgs);
      // If new messages come while open, mark as read
      if (msgs.some(m => !m.readByAdmin)) {
         markMessagesAsRead(chatUser.id, 'admin');
      }
    });

    return () => unsubscribe();
  }, [chatUser]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !chatUser) return;
    await sendChatMessage(chatUser.id, newMessage, 'admin');
    setNewMessage('');
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Identity Vault</h1>
        <p>Live, intercepted data feed of magical customer signups</p>
      </div>

      <div className={styles.cardContainer}>
        {loading ? (
          <div className={styles.emptyState}>
            <h3>Decrypting real-time identity stream...</h3>
          </div>
        ) : users.length === 0 ? (
          <div className={styles.emptyState}>
            <Shield size={40} className={styles.icon} />
            <h3>Data stream empty</h3>
            <p>Go to the Magical Auth Portal (/auth) and "Create ID". New users will stream directly here.</p>
          </div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>ID Fingerprint</th>
                <th>Identity Name</th>
                <th>Secure Comm Node</th>
                <th>Purchases</th>
                <th>Clearance</th>
                <th>Timestamp</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>

              {users.map((u, i) => {
                // Handle different date formats (statically injected vs Firestore Timestamps)
                let dateStr = "Unknown";
                if (u.createdAt) dateStr = new Date((u.createdAt as any).toMillis ? (u.createdAt as any).toMillis() : typeof u.createdAt === 'number' ? u.createdAt : (u.createdAt as any).toDate ? (u.createdAt as any).toDate().getTime() : Date.now()).toLocaleString();
                else if (u.createdAt) dateStr = new Date(u.createdAt).toLocaleString();
                else if (u.joinDate) dateStr = new Date(u.joinDate).toLocaleString();

                const userOrders = orders.filter(o => o.userId === u.id);
                const totalSpent = userOrders.reduce((sum, o) => sum + (o.total || 0), 0);

                return (

                  <tr key={u.id || i} className={styles.row}>
                    <td className={styles.idCell}>#{(u.id || '').toUpperCase().slice(-8)}</td>
                    <td className={styles.userCell}>
                      <div className={styles.avatar}><User size={16} /></div>
                      {u.name || 'Anonymous User'}
                    </td>
                    <td>{u.email}</td>
                    <td>
                      <div className={styles.purchaseStats}>
                        <span className={styles.orderCount}>{userOrders.length} Orders</span>
                        <span className={styles.orderTotal}>{renderPrice(totalSpent)}</span>
                      </div>
                    </td>
                    <td>
                      <span className={styles.badge} style={{ backgroundColor: u.elitePoints > 0 ? '#fbbf24' : ''}}>
                        {u.elitePoints > 0 ? `${u.elitePoints} Points` : 'Elite Client'}
                      </span>
                    </td>
                    <td className={styles.subCell}>{dateStr}</td>
                    <td>
                      <button className={styles.chatBtn} onClick={() => setChatUser(u)}>
                        <MessageSquare size={18} /> Chat
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* CHAT DRAWER */}
      {chatUser && (
        <div className={styles.chatDrawerOverlay} onClick={() => setChatUser(null)}>
          <div className={styles.chatDrawer} onClick={e => e.stopPropagation()}>
            <div className={styles.chatDrawerHeader}>
              <div className={styles.chatDrawerTitle}>
                <MessageSquare size={20} />
                <h3>Chat with {chatUser.name || 'User'}</h3>
              </div>
              <button className={styles.iconBtn} onClick={() => setChatUser(null)}><X size={20} /></button>
            </div>
            
            <div className={styles.chatDrawerBody}>
              {messages.length === 0 ? (
                <div className={styles.emptyChat}>No messages yet. Start the conversation!</div>
              ) : (
                messages.map(msg => (
                  <div key={msg.id} className={`${styles.chatBubbleWrapper} ${msg.sender === 'admin' ? styles.chatAdmin : styles.chatUser}`}>
                    <div className={styles.chatBubble}>
                      {msg.text}
                    </div>
                    <div className={styles.chatTime}>
                      {msg.createdAt && new Date((msg.createdAt as any).toMillis ? (msg.createdAt as any).toMillis() : msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            <form className={styles.chatDrawerFooter} onSubmit={handleSendMessage}>
              <textarea 
                className={styles.chatInputArea}
                placeholder="Type a message..." 
                value={newMessage}
                rows={1}
                onChange={e => {
                  setNewMessage(e.target.value);
                  e.target.style.height = 'auto';
                  e.target.style.height = `${Math.min(e.target.scrollHeight, 150)}px`;
                }}
                onKeyDown={e => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    if (newMessage.trim()) {
                      handleSendMessage(e as any);
                      e.currentTarget.style.height = 'auto'; // Reset height
                    }
                  }
                }}
              />
              <button type="submit" disabled={!newMessage.trim()} className={styles.sendBtn}>
                <Send size={18} />
              </button>
            </form>
          </div>
        </div>
      )}

      <div className={styles.header} style={{ marginTop: '4rem' }}>
        <h1>Newsletter Arsenal</h1>
        <p>VIP Leads Captured via 15% Off Acquisition Terminal</p>
      </div>

      <div className={styles.cardContainer}>
        {loading ? (
          <div className={styles.emptyState}>
            <h3>Decrypting email stream...</h3>
          </div>
        ) : subscribers.length === 0 ? (
          <div className={styles.emptyState}>
            <Mail size={40} className={styles.icon} />
            <h3>No Mailing Targets Extracted</h3>
            <p>Wait for inbound network traffic to interact with the Newsletter drop.</p>
          </div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Trace Fingerprint</th>
                <th>Global Electronic Coordinate</th>
                <th>Capture Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {subscribers.map((s, i) => {
                let dateStr = "Unknown";
                if (s.createdAt) dateStr = new Date((s.createdAt as any).toMillis ? (s.createdAt as any).toMillis() : typeof s.createdAt === 'number' ? s.createdAt : (s.createdAt as any).toDate ? (s.createdAt as any).toDate().getTime() : Date.now()).toLocaleString();
                else if (s.createdAt) dateStr = new Date(s.createdAt).toLocaleString();
                else dateStr = "N/A - Direct Injection";
                return (
                  <tr key={s.id || i} className={styles.row}>
                    <td className={styles.idCell}>#{(s.id || '').toUpperCase().slice(-8)}</td>
                    <td style={{ color: 'var(--color-primary)', fontWeight: 600 }}>{s.email}</td>
                    <td className={styles.subCell}>{dateStr}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
