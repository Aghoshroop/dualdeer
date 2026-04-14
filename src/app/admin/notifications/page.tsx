"use client";
import React, { useState, useEffect } from 'react';
import { getAllNotifications, addNotification, deleteNotification, updateNotification, AppNotification } from '@/lib/firebaseUtils';
import { Bell, Trash2, Plus, Edit } from 'lucide-react';
import styles from '../AdminPage.module.css';

export default function AdminNotifications() {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ title: '', message: '', url: '', active: true });
  const [editingId, setEditingId] = useState<string | null>(null);

  const fetchNotifs = async () => {
    setLoading(true);
    const data = await getAllNotifications();
    setNotifications(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchNotifs();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      await updateNotification(editingId, formData);
    } else {
      await addNotification(formData);
    }
    setShowForm(false);
    setFormData({ title: '', message: '', url: '', active: true });
    setEditingId(null);
    fetchNotifs();
  };

  const handleEdit = (n: AppNotification) => {
    setFormData({ title: n.title, message: n.message, url: n.url || '', active: n.active });
    setEditingId(n.id || null);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this notification?")) {
      await deleteNotification(id);
      fetchNotifs();
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}><Bell size={28} /> Global Notifications</h1>
        <button className={styles.addBtn} onClick={() => setShowForm(!showForm)}>
          <Plus size={20} /> {showForm ? 'Cancel' : 'New Notification'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className={styles.formContainer} style={{ background: 'var(--color-surface)', padding: '2rem', borderRadius: '12px', marginBottom: '2rem' }}>
          <div className={styles.formGroup}>
            <label>Title</label>
            <input required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className={styles.input} />
          </div>
          <div className={styles.formGroup}>
            <label>Message</label>
            <textarea required value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})} className={styles.input} rows={3} />
          </div>
          <div className={styles.formGroup}>
            <label>URL / Link (Optional)</label>
            <input type="text" value={formData.url} onChange={e => setFormData({...formData, url: e.target.value})} className={styles.input} placeholder="/shop or https://..." />
          </div>
          <div className={styles.formGroup} style={{ flexDirection: 'row', alignItems: 'center', gap: '1rem' }}>
            <input type="checkbox" checked={formData.active} onChange={e => setFormData({...formData, active: e.target.checked})} style={{ width: '20px', height: '20px' }} />
            <label style={{ margin: 0 }}>Active</label>
          </div>
          <button type="submit" className={styles.submitBtn}>{editingId ? 'Update Notification' : 'Create Notification'}</button>
        </form>
      )}

      {loading ? <p>Loading...</p> : (
        <div className={styles.grid}>
          {notifications.map(n => (
            <div key={n.id} className={styles.card} style={{ opacity: n.active ? 1 : 0.6 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>{n.title}</h3>
                <div>
                  <button onClick={() => handleEdit(n)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-primary)', marginRight: '1rem' }}><Edit size={18} /></button>
                  <button onClick={() => handleDelete(n.id!)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--red-500)' }}><Trash2 size={18} /></button>
                </div>
              </div>
              <p style={{ color: 'var(--color-text-muted)', marginBottom: '1rem' }}>{n.message}</p>
              {n.url && <p style={{ fontSize: '0.8rem', color: 'var(--color-primary)' }}>Link: {n.url}</p>}
              <div style={{ marginTop: '1rem', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                Status: {n.active ? <span style={{ color: '#10b981' }}>Active</span> : 'Inactive'} | Created: {n.createdAt?.toDate().toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
