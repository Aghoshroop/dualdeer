"use client";
import { useState, useEffect, useRef } from 'react';
import { getVideos, addVideo, deleteVideo, Video as VideoType } from '@/lib/firebaseUtils';
import { Timestamp } from 'firebase/firestore';
import { Plus, Trash2, Edit2, Play, X, UploadCloud, Video } from 'lucide-react';
import styles from '../categories/CategoriesPage.module.css';

export default function AdminVideosPage() {
  const [videos, setVideos] = useState<VideoType[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'speedsuits',
    productId: ''
  });
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadVideos();
  }, []);

  const loadVideos = async () => {
    setLoading(true);
    try {
      const data = await getVideos();
      // Sort by newest first
      data.sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis());
      setVideos(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (!file.type.startsWith('video/')) {
        alert("Please select a valid video file.");
        return;
      }
      setSelectedFile(file);
    }
  };

  const uploadToCloudinary = (file: File): Promise<{ secure_url: string, public_id: string }> => {
    return new Promise(async (resolve, reject) => {
      try {
        // 1. Get Signature
        const signRes = await fetch('/api/cloudinary/sign', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ paramsToSign: { folder: 'dualdeer_videos' } })
        });
        
        if (!signRes.ok) throw new Error("Failed to get upload signature");
        
        const { timestamp, signature } = await signRes.json();
        
        // 2. Prepare FormData
        const formData = new FormData();
        formData.append('file', file);
        formData.append('api_key', process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY!);
        formData.append('timestamp', timestamp.toString());
        formData.append('signature', signature);
        formData.append('folder', 'dualdeer_videos');
        
        // 3. Upload via XMLHttpRequest to get progress
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
            resolve({ secure_url: response.secure_url, public_id: response.public_id });
          } else {
            console.error("Cloudinary Error:", xhr.responseText);
            reject(new Error("Upload failed"));
          }
        };
        
        xhr.onerror = () => reject(new Error("Upload failed"));
        xhr.send(formData);
      } catch (error) {
        reject(error);
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      alert("Please select a video file to upload.");
      return;
    }
    
    setUploadProgress(0);
    
    try {
      const { secure_url, public_id } = await uploadToCloudinary(selectedFile);
      
      await addVideo({
        title: formData.title,
        description: formData.description,
        category: formData.category,
        productId: formData.productId || undefined,
        videoUrl: secure_url,
        publicId: public_id,
        createdAt: Timestamp.now()
      });
      
      setShowModal(false);
      setSelectedFile(null);
      setFormData({ title: '', description: '', category: 'speedsuits', productId: '' });
      setUploadProgress(null);
      loadVideos();
    } catch (error) {
      console.error(error);
      alert("Error uploading video. Please try again.");
      setUploadProgress(null);
    }
  };

  const handleDelete = async (video: VideoType) => {
    if (confirm("Are you sure you want to delete this video?")) {
      try {
        await deleteVideo(video.id!);
        // Note: For full cleanup, we should also call a secure API route to delete from Cloudinary using the publicId.
        // For now, we remove it from the DB.
        loadVideos();
      } catch (err) {
        console.error(err);
        alert("Failed to delete video");
      }
    }
  };

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1>Video Management</h1>
        <button className={styles.addBtn} onClick={() => setShowModal(true)}>
          <Plus size={20} /> Upload Video
        </button>
      </header>

      <div className={styles.tableContainer}>
        {loading ? (
          <p>Loading videos...</p>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Video</th>
                <th>Title</th>
                <th>Category</th>
                <th>Date Added</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {videos.map((video) => (
                <tr key={video.id}>
                  <td>
                    <video src={video.videoUrl} width={120} height={70} style={{ objectFit: 'cover', borderRadius: '4px', background: '#000' }} controls />
                  </td>
                  <td>
                    <span className={styles.nameBadge}>{video.title}</span>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{video.description}</div>
                  </td>
                  <td>
                    <span className={styles.statusBadge} style={{ background: 'var(--color-border)', color: 'var(--color-primary)' }}>
                      {video.category}
                    </span>
                  </td>
                  <td>{new Date(video.createdAt.toMillis()).toLocaleDateString()}</td>
                  <td>
                    <div className={styles.actions}>
                      <button className={styles.deleteBtn} onClick={() => handleDelete(video)} aria-label="Delete">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {videos.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center' }}>No videos found.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h2>Upload Video</h2>
              <button className={styles.closeBtn} onClick={() => !uploadProgress && setShowModal(false)}>
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.formGroup}>
                <label>Title</label>
                <input 
                  required
                  type="text" 
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  disabled={uploadProgress !== null}
                />
              </div>
              
              <div className={styles.formGroup}>
                <label>Description</label>
                <textarea 
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows={3}
                  disabled={uploadProgress !== null}
                />
              </div>
              
              <div className={styles.formGroup}>
                <label>Category</label>
                <select 
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  disabled={uploadProgress !== null}
                >
                  <option value="speedsuits">SpeedSuits</option>
                  <option value="campaigns">Campaigns</option>
                  <option value="products">Products</option>
                </select>
              </div>

              {formData.category === 'products' && (
                <div className={styles.formGroup}>
                  <label>Product ID (Optional)</label>
                  <input 
                    type="text" 
                    placeholder="Enter associated Product ID"
                    value={formData.productId}
                    onChange={(e) => setFormData({...formData, productId: e.target.value})}
                    disabled={uploadProgress !== null}
                  />
                </div>
              )}

              <div className={styles.formGroup}>
                <label>Video File</label>
                <div 
                  style={{
                    border: '2px dashed var(--color-border)',
                    padding: '2rem',
                    textAlign: 'center',
                    borderRadius: '8px',
                    cursor: uploadProgress !== null ? 'not-allowed' : 'pointer',
                    background: selectedFile ? 'rgba(var(--color-primary-rgb), 0.1)' : 'transparent'
                  }}
                  onClick={() => uploadProgress === null && fileInputRef.current?.click()}
                >
                  {selectedFile ? (
                    <div>
                      <Video size={32} style={{ margin: '0 auto 1rem', color: 'var(--color-primary)' }} />
                      <p>{selectedFile.name}</p>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                      </p>
                    </div>
                  ) : (
                    <div>
                      <UploadCloud size={32} style={{ margin: '0 auto 1rem', color: 'var(--text-muted)' }} />
                      <p>Click or drag to upload video</p>
                    </div>
                  )}
                  <input 
                    type="file" 
                    accept="video/*" 
                    style={{ display: 'none' }} 
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    disabled={uploadProgress !== null}
                  />
                </div>
              </div>

              {uploadProgress !== null && (
                <div style={{ marginTop: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                    <span>Uploading...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div style={{ width: '100%', height: '8px', background: 'var(--color-border)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${uploadProgress}%`, background: 'var(--color-primary)', transition: 'width 0.3s' }} />
                  </div>
                </div>
              )}

              <div className={styles.modalActions}>
                <button type="button" className={styles.cancelBtn} onClick={() => setShowModal(false)} disabled={uploadProgress !== null}>
                  Cancel
                </button>
                <button type="submit" className={styles.saveBtn} disabled={uploadProgress !== null || !selectedFile}>
                  {uploadProgress !== null ? 'Uploading...' : 'Save Video'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
