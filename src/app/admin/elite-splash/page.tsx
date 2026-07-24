"use client";
import { useState, useEffect } from 'react';
import styles from '../categories/CategoriesPage.module.css'; // Reusing existing styles
import { getEliteSplashSettings, updateEliteSplashSettings, EliteSplashSettings } from '@/lib/firebaseUtils';
import { uploadImageToImgBB } from '@/lib/uploadUtils';

export default function EliteSplashAdminPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);

  const [formData, setFormData] = useState<EliteSplashSettings>({
    isActive: true,
    mediaType: 'image',
    mediaUrl: '',
    text: 'L\'ÉLITE',
    duration: 3000,
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const data = await getEliteSplashSettings();
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
      await updateEliteSplashSettings(formData);
      alert("Splash settings saved successfully!");
    } catch (e) {
      console.error(e);
      alert("Failed to save settings.");
    }
    setSaving(false);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    
    setUploadingMedia(true);
    const url = await uploadImageToImgBB(file);
    if (url) {
      setFormData({ ...formData, mediaUrl: url });
    } else {
      alert("Image upload failed. Please try again.");
    }
    setUploadingMedia(false);
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    
    setUploadingMedia(true);
    setUploadProgress(0);
    
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
          setUploadProgress(progress);
        }
      };
      
      xhr.onload = () => {
        if (xhr.status === 200) {
          const response = JSON.parse(xhr.responseText);
          const secure_url = response.secure_url;
          setFormData(prev => ({ ...prev, mediaUrl: secure_url }));
        } else {
          console.error("Cloudinary Error:", xhr.responseText);
          alert("Video upload failed");
        }
        setUploadProgress(null);
        setUploadingMedia(false);
      };
      
      xhr.onerror = () => {
        alert("Video upload failed");
        setUploadProgress(null);
        setUploadingMedia(false);
      };
      
      xhr.send(uploadData);
    } catch (error) {
      console.error(error);
      alert("Error uploading video");
      setUploadProgress(null);
      setUploadingMedia(false);
    }
  };

  if (loading) {
    return <div className={styles.page}><p>Loading settings...</p></div>;
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Elite Splash Screen Settings</h1>
      </header>

      <div className={styles.tableContainer} style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '12px' }}>
        <form onSubmit={handleSave}>
          
          <div className={styles.formGroup} style={{ flexDirection: 'row', alignItems: 'center', gap: '1rem', paddingBottom: '1rem' }}>
            <label style={{ margin: 0 }}>Enable Splash Screen?</label>
            <input 
              type="checkbox" 
              checked={formData.isActive} 
              onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
              style={{ width: '20px', height: '20px' }}
            />
          </div>

          <div className={styles.formGroup}>
            <label>Splash Text</label>
            <input 
              type="text" 
              value={formData.text} 
              onChange={(e) => setFormData({...formData, text: e.target.value})}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label>Duration (milliseconds, e.g. 3000 = 3 seconds)</label>
            <input 
              type="number" 
              value={formData.duration} 
              onChange={(e) => setFormData({...formData, duration: Number(e.target.value)})}
              required
              min={1000}
              max={10000}
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
            <label>{formData.mediaType === 'image' ? 'Image' : 'Video'} (Upload or Paste URL)</label>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <input 
                type="file" 
                accept={formData.mediaType === 'image' ? 'image/*' : 'video/*'}
                onChange={(e) => formData.mediaType === 'image' ? handleImageUpload(e) : handleVideoUpload(e)}
                disabled={uploadingMedia}
                style={{ flex: 1 }}
              />
              {uploadingMedia && <span style={{ fontSize: '0.9rem', color: 'var(--color-primary)' }}>Uploading... {uploadProgress !== null ? `${uploadProgress}%` : ''}</span>}
            </div>
            <input 
              type="url" 
              value={formData.mediaUrl} 
              onChange={(e) => setFormData({...formData, mediaUrl: e.target.value})}
              placeholder="Or paste URL here"
              style={{ marginTop: '0.5rem' }}
            />
            {formData.mediaUrl && formData.mediaType === 'image' && (
              <img src={formData.mediaUrl} alt="Preview" style={{ marginTop: '1rem', height: '120px', borderRadius: '4px', objectFit: 'cover' }} />
            )}
            {formData.mediaUrl && formData.mediaType === 'video' && (
              <video src={formData.mediaUrl} style={{ marginTop: '1rem', height: '120px', borderRadius: '4px', objectFit: 'cover', background: '#000' }} controls autoPlay muted loop />
            )}
          </div>

          <button type="submit" className={styles.saveBtn} disabled={saving || uploadingMedia} style={{ width: '100%', marginTop: '2rem', padding: '1rem', fontSize: '1.1rem' }}>
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </form>
      </div>
    </div>
  );
}
