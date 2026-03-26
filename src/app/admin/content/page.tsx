"use client";
import { useState, useEffect } from 'react';
import { getContentBlock, updateContentBlock, ContentBlock } from '@/lib/firebaseUtils';
import { uploadImageToImgBB } from '@/lib/uploadUtils';
import styles from '../categories/CategoriesPage.module.css'; // Reusing global admin table layout

const SECTION_KEYS = [
  { id: 'brand-story', name: 'Brand Story Section (Home)' },
  { id: 'editorial-left', name: 'Editorial Split Left Pane (Home)' },
  { id: 'editorial-right', name: 'Editorial Split Right Pane (Home)' },
  { id: 'footer-brand', name: 'Footer Brand Description (Global)' },
  { id: 'men-hero', name: 'Menswear Hero Section' },
  { id: 'men-promo', name: 'Menswear Promo Banner Section' }
];

export default function AdminContentPage() {
  const [activeTab, setActiveTab] = useState(SECTION_KEYS[0].id);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  
  const [formData, setFormData] = useState<Partial<ContentBlock>>({
    title: '', body: '', imageUrl: '', ctaText: '', ctaLink: ''
  });

  const loadBlock = async (id: string) => {
    setLoading(true);
    const block = await getContentBlock(id);
    if (block) {
      setFormData(block);
    } else {
      setFormData({ title: '', body: '', imageUrl: '', ctaText: '', ctaLink: '' });
    }
    setLoading(false);
  };

  useEffect(() => {
    loadBlock(activeTab);
  }, [activeTab]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateContentBlock(activeTab, formData);
      alert('Content Section Updated Successfully!');
    } catch (e) {
      alert('Failed to save content block.');
    }
    setSaving(false);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    
    setUploadingImage(true);
    const url = await uploadImageToImgBB(file);
    if (url) {
      setFormData({ ...formData, imageUrl: url });
    } else {
      alert("Image upload failed. Please try again.");
    }
    setUploadingImage(false);
  };

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Site Content Manager</h1>
      </header>

      <div style={{ display: 'flex', gap: '2rem' }}>
        {/* Navigation / Selection List */}
        <div style={{ width: '300px', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {SECTION_KEYS.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveTab(section.id)}
              style={{
                background: activeTab === section.id ? 'var(--color-primary)' : 'rgba(255,255,255,0.05)',
                color: activeTab === section.id ? '#fff' : 'var(--color-text)',
                border: '1px solid rgba(255,255,255,0.1)',
                padding: '1rem',
                borderRadius: '8px',
                textAlign: 'left',
                cursor: 'pointer',
                fontWeight: activeTab === section.id ? '700' : '500',
                transition: 'all 0.2s'
              }}
            >
              {section.name}
            </button>
          ))}
        </div>

        {/* Editor Form */}
        <div className={styles.tableContainer} style={{ flex: 1, margin: 0 }}>
          {loading ? (
            <p>Loading Content Block Data...</p>
          ) : (
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <h2 style={{ fontSize: '1.2rem', paddingBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                Editing: {SECTION_KEYS.find(s => s.id === activeTab)?.name}
              </h2>

              <div className={styles.formGroup} style={{ marginBottom: 0 }}>
                <label>Main Headline</label>
                <input 
                  type="text" 
                  value={formData.title || ''} 
                  onChange={(e) => setFormData({...formData, title: e.target.value})} 
                  placeholder="Leave empty to use hardcoded default"
                />
              </div>

              <div className={styles.formGroup} style={{ marginBottom: 0 }}>
                <label>Body Content / Paragraph</label>
                <textarea 
                  rows={4}
                  value={formData.body || ''} 
                  onChange={(e) => setFormData({...formData, body: e.target.value})} 
                  placeholder="Enter the marketing copy here..."
                />
              </div>

              <div className={styles.formGroup} style={{ marginBottom: 0 }}>
                <label>Media / Image Element</label>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploadingImage}
                    style={{ flex: 1 }}
                  />
                  {uploadingImage && <span style={{ fontSize: '0.9rem', color: 'var(--color-primary)' }}>Uploading...</span>}
                </div>
                <input 
                  type="url" 
                  value={formData.imageUrl || ''} 
                  onChange={(e) => setFormData({...formData, imageUrl: e.target.value})} 
                  placeholder="Or paste image URL here..."
                  style={{ marginTop: '0.5rem' }}
                />
                {formData.imageUrl && (
                  <img src={formData.imageUrl} alt="Preview" style={{ marginTop: '1rem', height: '100px', borderRadius: '8px', objectFit: 'cover' }} />
                )}
              </div>

              <div style={{ display: 'flex', gap: '1.5rem' }}>
                <div className={styles.formGroup} style={{ flex: 1, marginBottom: 0 }}>
                  <label>CTA Button Text</label>
                  <input 
                    type="text" 
                    value={formData.ctaText || ''} 
                    onChange={(e) => setFormData({...formData, ctaText: e.target.value})} 
                    placeholder="e.g. SHOP NOW"
                  />
                </div>
                <div className={styles.formGroup} style={{ flex: 1, marginBottom: 0 }}>
                  <label>CTA Button Link</label>
                  <input 
                    type="text" 
                    value={formData.ctaLink || ''} 
                    onChange={(e) => setFormData({...formData, ctaLink: e.target.value})} 
                    placeholder="e.g. /shop"
                  />
                </div>
              </div>

              <button type="submit" className={styles.saveBtn} disabled={saving} style={{ alignSelf: 'flex-end', marginTop: '1rem' }}>
                {saving ? 'Syncing to Storefront...' : 'OVERWRITE LIVE CONTENT'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
