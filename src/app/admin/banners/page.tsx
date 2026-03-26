"use client";
import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { uploadImageToImgBB } from '@/lib/uploadUtils';
import styles from '../categories/CategoriesPage.module.css'; // Reusing categories styles
import { getBanners, addBanner, updateBanner, deleteBanner, Banner } from '@/lib/firebaseUtils';

export default function AdminBannersPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    image: '',
    link: '',
    active: true
  });

  useEffect(() => {
    loadBanners();
  }, []);

  const loadBanners = async () => {
    setLoading(true);
    try {
      const data = await getBanners();
      setBanners(data);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const openAddModal = () => {
    setFormData({ title: '', image: '', link: '', active: true });
    setEditingId(null);
    setShowModal(true);
  };

  const openEditModal = (banner: Banner) => {
    setFormData({
      title: banner.title,
      image: banner.image,
      link: banner.link || '',
      active: banner.active
    });
    setEditingId(banner.id!);
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      await updateBanner(editingId, formData);
    } else {
      await addBanner(formData);
    }
    setShowModal(false);
    loadBanners();
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    
    setUploadingImage(true);
    const url = await uploadImageToImgBB(file);
    if (url) {
      setFormData({ ...formData, image: url });
    } else {
      alert("Image upload failed. Please try again.");
    }
    setUploadingImage(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this banner?")) {
      await deleteBanner(id);
      loadBanners();
    }
  };

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Banners Management</h1>
        <button className={styles.addBtn} onClick={openAddModal}>
          <Plus size={20} /> Add Banner
        </button>
      </header>

      <div className={styles.tableContainer}>
        {loading ? (
          <p>Loading banners...</p>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Title</th>
                <th>Link</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {banners.map((banner) => (
                <tr key={banner.id}>
                  <td><span className={styles.nameBadge}>{banner.title}</span></td>
                  <td style={{ color: 'var(--color-primary)' }}>{banner.link || '-'}</td>
                  <td>
                    <span className={`${styles.statusBadge} ${banner.active ? styles.active : styles.inactive}`}>
                      {banner.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <div className={styles.actions}>
                      <button className={styles.editBtn} onClick={() => openEditModal(banner)} aria-label="Edit">
                        <Edit2 size={16} />
                      </button>
                      <button className={styles.deleteBtn} onClick={() => handleDelete(banner.id!)} aria-label="Delete">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {banners.length === 0 && (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center' }}>No banners found.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <div className={styles.modalOverlay}>
          <form className={styles.modalContent} onSubmit={handleSave}>
            <h2>{editingId ? 'Edit Banner' : 'New Banner'}</h2>
            
            <div className={styles.formGroup}>
              <label>Banner Title</label>
              <input 
                type="text" 
                value={formData.title} 
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label>Banner Image (Upload or Paste URL)</label>
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
                value={formData.image} 
                onChange={(e) => setFormData({...formData, image: e.target.value})}
                placeholder="Or paste URL here"
                style={{ marginTop: '0.5rem' }}
                required
              />
              {formData.image && (
                <img src={formData.image} alt="Preview" style={{ marginTop: '1rem', height: '80px', borderRadius: '4px', objectFit: 'cover' }} />
              )}
            </div>

            <div className={styles.formGroup}>
              <label>Target Link (e.g. /shop)</label>
              <input 
                type="text" 
                value={formData.link} 
                onChange={(e) => setFormData({...formData, link: e.target.value})}
              />
            </div>

            <div className={`${styles.formGroup} ${styles.checkboxGroup}`} style={{ flexDirection: 'row', alignItems: 'center' }}>
              <label>Active</label>
              <input 
                type="checkbox" 
                checked={formData.active} 
                onChange={(e) => setFormData({...formData, active: e.target.checked})}
              />
            </div>

            <div className={styles.modalActions}>
              <button type="button" className={styles.cancelBtn} onClick={() => setShowModal(false)}>Cancel</button>
              <button type="submit" className={styles.saveBtn}>Save Banner</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
