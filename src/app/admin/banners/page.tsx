"use client";
import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { uploadImageToImgBB } from '@/lib/uploadUtils';
import styles from '../categories/CategoriesPage.module.css'; // Reusing categories styles
import { getBanners, addBanner, updateBanner, deleteBanner, Banner } from '@/lib/firebaseUtils';
import { Timestamp } from 'firebase/firestore';

export default function AdminBannersPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [currentTab, setCurrentTab] = useState<'active' | 'bin'>('active');
  
  
  const [formData, setFormData] = useState({
    title: '',
    image: '',
    mobileImage: '',
    link: '',
    ctaLink: '',
    showCta: true,
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
    setFormData({ title: '', image: '', mobileImage: '', link: '', ctaLink: '', showCta: true, active: true });
    setEditingId(null);
    setShowModal(true);
  };

  const openEditModal = (banner: Banner) => {
    setFormData({
      title: banner.title,
      image: banner.image,
      mobileImage: banner.mobileImage || '',
      link: banner.link || '',
      ctaLink: banner.ctaLink || banner.link || '',
      showCta: banner.showCta !== false, // Default to true if undefined
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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, isMobile: boolean = false) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    
    setUploadingImage(true);
    const url = await uploadImageToImgBB(file);
    if (url) {
      if (isMobile) {
        setFormData({ ...formData, mobileImage: url });
      } else {
        setFormData({ ...formData, image: url });
      }
    } else {
      alert("Image upload failed. Please try again.");
    }
    setUploadingImage(false);
  };

  const handleDelete = async (id: string) => {
    if (currentTab === 'active') {
      if (confirm("Move this banner to the Recycle Bin?")) {
        await updateBanner(id, { deleted: true, deletedAt: Timestamp.now() });
        loadBanners();
      }
    } else {
      if (confirm("Are you sure you want to PERMANENTLY delete this banner? This cannot be undone.")) {
        await deleteBanner(id);
        loadBanners();
      }
    }
  };

  const handleRestore = async (id: string) => {
    await updateBanner(id, { deleted: false });
    loadBanners();
  };

  const filteredBanners = banners.filter(b => 
    currentTab === 'active' ? !b.deleted : b.deleted
  );

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Banners Management</h1>
        <button className={styles.addBtn} onClick={openAddModal}>
          <Plus size={20} /> Add Banner
        </button>
      </header>

      <div className={styles.tableContainer}>
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem' }}>
          <button 
            onClick={() => setCurrentTab('active')}
            style={{ 
              background: 'none', 
              border: 'none', 
              color: currentTab === 'active' ? 'var(--color-primary)' : 'var(--text-muted)',
              fontWeight: currentTab === 'active' ? 'bold' : 'normal',
              cursor: 'pointer',
              fontSize: '1rem'
            }}
          >
            Active Banners
          </button>
          <button 
            onClick={() => setCurrentTab('bin')}
            style={{ 
              background: 'none', 
              border: 'none', 
              color: currentTab === 'bin' ? 'var(--color-primary)' : 'var(--text-muted)',
              fontWeight: currentTab === 'bin' ? 'bold' : 'normal',
              cursor: 'pointer',
              fontSize: '1rem'
            }}
          >
            Recycle Bin
          </button>
        </div>

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
              {filteredBanners.map((banner) => (
                <tr key={banner.id}>
                  <td><span className={styles.nameBadge}>{banner.title}</span></td>
                  <td style={{ color: 'var(--color-primary)' }}>{banner.link || '-'}</td>
                  <td>
                    {banner.deleted ? (
                      <span className={`${styles.statusBadge} ${styles.inactive}`}>Deleted</span>
                    ) : (
                      <span className={`${styles.statusBadge} ${banner.active ? styles.active : styles.inactive}`}>
                        {banner.active ? 'Active' : 'Inactive'}
                      </span>
                    )}
                  </td>
                  <td>
                    <div className={styles.actions}>
                      {currentTab === 'active' ? (
                        <>
                          <button className={styles.editBtn} onClick={() => openEditModal(banner)} aria-label="Edit">
                            <Edit2 size={16} />
                          </button>
                          <button className={styles.deleteBtn} onClick={() => handleDelete(banner.id!)} aria-label="Move to Bin" title="Move to Bin">
                            <Trash2 size={16} />
                          </button>
                        </>
                      ) : (
                        <>
                          <button 
                            className={styles.editBtn} 
                            onClick={() => handleRestore(banner.id!)} 
                            style={{ background: 'var(--color-primary)', color: '#fff', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }}
                          >
                            Restore
                          </button>
                          <button className={styles.deleteBtn} onClick={() => handleDelete(banner.id!)} aria-label="Permanently Delete" title="Permanently Delete" style={{ color: 'red' }}>
                            <Trash2 size={16} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filteredBanners.length === 0 && (
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
              <label>Desktop Image (Upload or Paste URL)</label>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e, false)}
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
                <img src={formData.image} alt="Desktop Preview" style={{ marginTop: '1rem', height: '80px', borderRadius: '4px', objectFit: 'cover' }} />
              )}
            </div>

            <div className={styles.formGroup}>
              <label>Mobile Image (Upload or Paste URL)</label>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e, true)}
                  disabled={uploadingImage}
                  style={{ flex: 1 }}
                />
              </div>
              <input 
                type="url" 
                value={formData.mobileImage} 
                onChange={(e) => setFormData({...formData, mobileImage: e.target.value})}
                placeholder="Optional mobile specific image URL"
                style={{ marginTop: '0.5rem' }}
              />
              {formData.mobileImage && (
                <img src={formData.mobileImage} alt="Mobile Preview" style={{ marginTop: '1rem', height: '120px', width: 'auto', borderRadius: '4px', objectFit: 'cover' }} />
              )}
            </div>

            <div className={`${styles.formGroup} ${styles.checkboxGroup}`} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: '1.5rem', background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '8px' }}>
              <label style={{ margin: 0, fontWeight: 'bold' }}>Show CTA Button</label>
              <input 
                type="checkbox" 
                checked={formData.showCta} 
                onChange={(e) => setFormData({...formData, showCta: e.target.checked})}
                style={{ width: '20px', height: '20px', marginLeft: 'auto' }}
              />
            </div>

            {formData.showCta && (
              <div className={styles.formGroup}>
                <label>Target Link for CTA (e.g. /shop or /speedsuits-india)</label>
                <input 
                  type="text" 
                  value={formData.ctaLink} 
                  onChange={(e) => setFormData({...formData, ctaLink: e.target.value, link: e.target.value})}
                  placeholder="Defaults to /shop"
                />
              </div>
            )}

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
