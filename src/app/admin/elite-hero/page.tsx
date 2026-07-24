"use client";
import { useState, useEffect } from 'react';
import styles from '../categories/CategoriesPage.module.css'; // Reusing existing styles
import { getEliteHeroSettings, updateEliteHeroSettings, EliteHeroSettings } from '@/lib/firebaseUtils';
import { uploadImageToImgBB } from '@/lib/uploadUtils';

export default function EliteHeroAdminPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingMedia, setUploadingMedia] = useState<{ desktop: boolean, mobile: boolean }>({ desktop: false, mobile: false });
  const [uploadProgress, setUploadProgress] = useState<{ desktop: number | null, mobile: number | null }>({ desktop: null, mobile: null });

  const [formData, setFormData] = useState<EliteHeroSettings>({
    mediaType: 'image',
    desktopMediaUrl: '',
    mobileMediaUrl: '',
    title: "L'ÉLITE",
    subtitle: 'THE PRIVATE CLIENT COLLECTION',
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const data = await getEliteHeroSettings();
      if (data) {
        setFormData(data);
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateEliteHeroSettings(formData);
      alert("Settings saved successfully!");
    } catch (e) {
      console.error(e);
      alert("Failed to save settings.");
    }
    setSaving(false);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, isMobile: boolean = false) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    const key = isMobile ? 'mobile' : 'desktop';
    
    setUploadingMedia(prev => ({ ...prev, [key]: true }));
    const url = await uploadImageToImgBB(file);
    if (url) {
      if (isMobile) {
        setFormData({ ...formData, mobileMediaUrl: url });
      } else {
        setFormData({ ...formData, desktopMediaUrl: url });
      }
    } else {
      alert("Image upload failed. Please try again.");
    }
    setUploadingMedia(prev => ({ ...prev, [key]: false }));
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>, isMobile: boolean = false) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    const key = isMobile ? 'mobile' : 'desktop';
    
    setUploadingMedia(prev => ({ ...prev, [key]: true }));
    setUploadProgress(prev => ({ ...prev, [key]: 0 }));
    
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
          setUploadProgress(prev => ({ ...prev, [key]: progress }));
        }
      };
      
      xhr.onload = () => {
        if (xhr.status === 200) {
          const response = JSON.parse(xhr.responseText);
          const secure_url = response.secure_url;
          if (isMobile) {
            setFormData(prev => ({ ...prev, mobileMediaUrl: secure_url }));
          } else {
            setFormData(prev => ({ ...prev, desktopMediaUrl: secure_url }));
          }
        } else {
          console.error("Cloudinary Error:", xhr.responseText);
          alert("Video upload failed");
        }
        setUploadProgress(prev => ({ ...prev, [key]: null }));
        setUploadingMedia(prev => ({ ...prev, [key]: false }));
      };
      
      xhr.onerror = () => {
        alert("Video upload failed");
        setUploadProgress(prev => ({ ...prev, [key]: null }));
        setUploadingMedia(prev => ({ ...prev, [key]: false }));
      };
      
      xhr.send(uploadData);
    } catch (error) {
      console.error(error);
      alert("Error uploading video");
      setUploadProgress(prev => ({ ...prev, [key]: null }));
      setUploadingMedia(prev => ({ ...prev, [key]: false }));
    }
  };

  if (loading) {
    return <div className={styles.page}><p>Loading settings...</p></div>;
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Elite Hero Settings</h1>
      </header>

      <div className={styles.tableContainer} style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '12px' }}>
        <form onSubmit={handleSave}>
          
          <div className={styles.formGroup}>
            <label>Title</label>
            <input 
              type="text" 
              value={formData.title} 
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label>Subtitle</label>
            <input 
              type="text" 
              value={formData.subtitle} 
              onChange={(e) => setFormData({...formData, subtitle: e.target.value})}
            />
          </div>

          <div className={styles.formGroup}>
            <label>Media Type</label>
            <select 
              value={formData.mediaType} 
              onChange={(e) => setFormData({...formData, mediaType: e.target.value as 'image' | 'video'})}
            >
              <option value="image">Image Background</option>
              <option value="video">Video Background</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label>Desktop {formData.mediaType === 'image' ? 'Image' : 'Video'} (Upload or Paste URL)</label>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <input 
                type="file" 
                accept={formData.mediaType === 'image' ? 'image/*' : 'video/*'}
                onChange={(e) => formData.mediaType === 'image' ? handleImageUpload(e, false) : handleVideoUpload(e, false)}
                disabled={uploadingMedia.desktop}
                style={{ flex: 1 }}
              />
              {uploadingMedia.desktop && <span style={{ fontSize: '0.9rem', color: 'var(--color-primary)' }}>Uploading... {uploadProgress.desktop !== null ? `${uploadProgress.desktop}%` : ''}</span>}
            </div>
            <input 
              type="url" 
              value={formData.desktopMediaUrl} 
              onChange={(e) => setFormData({...formData, desktopMediaUrl: e.target.value})}
              placeholder="Or paste URL here"
              style={{ marginTop: '0.5rem' }}
              required
            />
            {formData.desktopMediaUrl && formData.mediaType === 'image' && (
              <img src={formData.desktopMediaUrl} alt="Desktop Preview" style={{ marginTop: '1rem', height: '120px', borderRadius: '4px', objectFit: 'cover' }} />
            )}
            {formData.desktopMediaUrl && formData.mediaType === 'video' && (
              <video src={formData.desktopMediaUrl} style={{ marginTop: '1rem', height: '120px', borderRadius: '4px', objectFit: 'cover', background: '#000' }} controls />
            )}
          </div>

          <div className={styles.formGroup}>
            <label>Mobile {formData.mediaType === 'image' ? 'Image' : 'Video'} (Upload or Paste URL)</label>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <input 
                type="file" 
                accept={formData.mediaType === 'image' ? 'image/*' : 'video/*'}
                onChange={(e) => formData.mediaType === 'image' ? handleImageUpload(e, true) : handleVideoUpload(e, true)}
                disabled={uploadingMedia.mobile}
                style={{ flex: 1 }}
              />
              {uploadingMedia.mobile && <span style={{ fontSize: '0.9rem', color: 'var(--color-primary)' }}>Uploading... {uploadProgress.mobile !== null ? `${uploadProgress.mobile}%` : ''}</span>}
            </div>
            <input 
              type="url" 
              value={formData.mobileMediaUrl} 
              onChange={(e) => setFormData({...formData, mobileMediaUrl: e.target.value})}
              placeholder="Optional mobile specific URL"
              style={{ marginTop: '0.5rem' }}
            />
            {formData.mobileMediaUrl && formData.mediaType === 'image' && (
              <img src={formData.mobileMediaUrl} alt="Mobile Preview" style={{ marginTop: '1rem', height: '160px', width: 'auto', borderRadius: '4px', objectFit: 'cover' }} />
            )}
            {formData.mobileMediaUrl && formData.mediaType === 'video' && (
              <video src={formData.mobileMediaUrl} style={{ marginTop: '1rem', height: '160px', width: 'auto', borderRadius: '4px', objectFit: 'cover', background: '#000' }} controls />
            )}
          </div>

          <button type="submit" className={styles.saveBtn} disabled={saving || uploadingMedia.desktop || uploadingMedia.mobile} style={{ width: '100%', marginTop: '2rem', padding: '1rem', fontSize: '1.1rem' }}>
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </form>
      </div>
    </div>
  );
}
