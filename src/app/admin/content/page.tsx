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
  const [uploadingVideo, setUploadingVideo] = useState<number | null>(null);
  
  const [formData, setFormData] = useState<Partial<ContentBlock>>({
    title: '', body: '', mediaType: 'image', imageUrl: '', videoUrl: '', ctaText: '', ctaLink: ''
  });

  const loadBlock = async (id: string) => {
    setLoading(true);
    const block = await getContentBlock(id);
    if (block) {
      setFormData({ ...block, mediaType: block.mediaType || 'image' });
    } else {
      setFormData({ title: '', body: '', mediaType: 'image', imageUrl: '', videoUrl: '', ctaText: '', ctaLink: '' });
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

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    
    setUploadingVideo(0);
    
    try {
      const signRes = await fetch('/api/cloudinary/sign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paramsToSign: { folder: 'dualdeer_videos' } })
      });
      
      if (!signRes.ok) throw new Error("Failed to get upload signature");
      const { timestamp, signature } = await signRes.json();
      
      const uploadData = new FormData();
      uploadData.append('file', file);
      uploadData.append('api_key', process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY!);
      uploadData.append('timestamp', timestamp.toString());
      uploadData.append('signature', signature);
      uploadData.append('folder', 'dualdeer_videos');
      
      const xhr = new XMLHttpRequest();
      xhr.open('POST', `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/video/upload`);
      
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 100);
          setUploadingVideo(progress);
        }
      };
      
      xhr.onload = () => {
        if (xhr.status === 200) {
          const response = JSON.parse(xhr.responseText);
          setFormData(prev => ({ ...prev, videoUrl: response.secure_url }));
        } else {
          console.error("Cloudinary Error:", xhr.responseText);
          alert("Video upload failed");
        }
        setUploadingVideo(null);
      };
      
      xhr.onerror = () => {
        alert("Video upload failed");
        setUploadingVideo(null);
      };
      
      xhr.send(uploadData);
    } catch (error) {
      console.error(error);
      alert("Error uploading video");
      setUploadingVideo(null);
    }
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
                background: activeTab === section.id ? 'var(--color-primary)' : 'rgba(var(--foreground-rgb), 0.05)',
                color: activeTab === section.id ? '#fff' : 'var(--color-text)',
                border: '1px solid var(--color-border)',
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
              <h2 style={{ fontSize: '1.2rem', paddingBottom: '1rem', borderBottom: '1px solid var(--color-border)' }}>
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
                <label>Media Type</label>
                <select
                  value={formData.mediaType || 'image'}
                  onChange={(e) => setFormData({...formData, mediaType: e.target.value as 'image' | 'video'})}
                >
                  <option value="image">Image</option>
                  <option value="video">Video</option>
                </select>
              </div>

              {formData.mediaType === 'image' ? (
                <div className={styles.formGroup} style={{ marginBottom: 0 }}>
                  <label>Image Element</label>
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
              ) : (
                <div className={styles.formGroup} style={{ marginBottom: 0 }}>
                  <label>Video Element</label>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <input 
                      type="file" 
                      accept="video/*"
                      onChange={handleVideoUpload}
                      disabled={uploadingVideo !== null}
                      style={{ flex: 1 }}
                    />
                    {uploadingVideo !== null && <span style={{ fontSize: '0.9rem', color: 'var(--color-primary)' }}>Uploading... {uploadingVideo}%</span>}
                  </div>
                  <input 
                    type="url" 
                    value={formData.videoUrl || ''} 
                    onChange={(e) => setFormData({...formData, videoUrl: e.target.value})} 
                    placeholder="Or paste video URL here..."
                    style={{ marginTop: '0.5rem' }}
                  />
                  {formData.videoUrl && (
                    <video src={formData.videoUrl} controls style={{ marginTop: '1rem', height: '100px', borderRadius: '8px', objectFit: 'cover' }} />
                  )}
                </div>
              )}

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
