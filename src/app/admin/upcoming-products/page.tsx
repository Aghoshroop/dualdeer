"use client";
import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, Rocket, Users } from 'lucide-react';
import styles from './UpcomingProductsPage.module.css';
import { getUpcomingProducts, addUpcomingProduct, updateUpcomingProduct, deleteUpcomingProduct, launchUpcomingProduct, markNotificationsAsSent, UpcomingProduct, getCategories, ProductNotification } from '@/lib/firebaseUtils';
import { uploadImageToImgBB } from '@/lib/uploadUtils';

export default function AdminUpcomingProductsPage() {
  const [products, setProducts] = useState<UpcomingProduct[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [categoriesList, setCategoriesList] = useState<any[]>([]);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    category: '',
    image: '',
    images: [] as string[],
    launchDate: '',
    comingSoon: true as true
  });
  const [uploadingImage, setUploadingImage] = useState(false);
  
  // Launching state
  const [launchingId, setLaunchingId] = useState<string | null>(null);
  
  // Subscribers modal state
  const [showSubscribersModal, setShowSubscribersModal] = useState(false);
  const [currentSubscribers, setCurrentSubscribers] = useState<ProductNotification[]>([]);
  const [loadingSubscribers, setLoadingSubscribers] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [data, catsRes] = await Promise.all([
        getUpcomingProducts(),
        getCategories()
      ]);
      setProducts(data);
      setCategoriesList(catsRes.filter(c => c.status === 'active'));
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const openAddModal = () => {
    setFormData({ name: '', slug: '', description: '', category: '', image: '', images: [], launchDate: '', comingSoon: true });
    setEditingId(null);
    setShowModal(true);
  };

  const openEditModal = (product: UpcomingProduct) => {
    setFormData({
      name: product.name || '',
      slug: product.slug || '',
      description: product.description || '',
      category: product.category || '',
      image: product.image || '',
      images: product.images || [],
      launchDate: product.launchDate || '',
      comingSoon: product.comingSoon || true
    });
    setEditingId(product.id!);
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this upcoming product?')) return;
    try {
      await deleteUpcomingProduct(id);
      loadData();
    } catch (e) {
      console.error(e);
      alert('Failed to delete product');
    }
  };

  const handleLaunch = async (id: string, name: string, image: string) => {
    if (!confirm(`Are you sure you want to LAUNCH "${name}"? This will move it to the live shop and email all subscribers.`)) return;
    
    setLaunchingId(id);
    try {
      // 1. Move to products & get subscribers
      const res = await launchUpcomingProduct(id);
      
      if (!res.success) {
        throw new Error(res.message);
      }

      // 2. Send emails via API
      if (res.subscribers && res.subscribers.length > 0) {
        const emailRes = await fetch('/api/send-launch-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            productId: id,
            productName: name,
            productImage: image,
            subscribers: res.subscribers
          })
        });
        
        const emailData = await emailRes.json();
        
        if (emailData.successfulIds && emailData.successfulIds.length > 0) {
           await markNotificationsAsSent(emailData.successfulIds);
        }

        alert(emailData.message || 'Launched and emails sent!');
      } else {
        alert('Launched successfully. No subscribers to email.');
      }
      
      loadData();
    } catch (e) {
      console.error(e);
      alert('Failed to launch product completely.');
    }
    setLaunchingId(null);
  };

  const handleViewSubscribers = async (productId: string) => {
    setLoadingSubscribers(true);
    setShowSubscribersModal(true);
    setCurrentSubscribers([]);
    try {
      const { getProductSubscribers } = await import('@/lib/firebaseUtils');
      const subs = await getProductSubscribers(productId);
      setCurrentSubscribers(subs);
    } catch (e) {
      console.error(e);
      alert('Failed to load subscribers');
    }
    setLoadingSubscribers(false);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, isGallery = false) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploadingImage(true);
    try {
      if (isGallery) {
        const newUrls: string[] = [];
        for (let i = 0; i < files.length; i++) {
          const url = await uploadImageToImgBB(files[i]);
          if (url) newUrls.push(url);
        }
        setFormData(prev => ({ ...prev, images: [...(prev.images || []), ...newUrls] }));
      } else {
        const url = await uploadImageToImgBB(files[0]);
        if (url) setFormData(prev => ({ ...prev, image: url }));
      }
    } catch (err) {
      console.error(err);
      alert('Image upload failed');
    }
    setUploadingImage(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateUpcomingProduct(editingId, formData as Partial<UpcomingProduct>);
      } else {
        await addUpcomingProduct(formData as any);
      }
      setShowModal(false);
      loadData();
    } catch (err) {
      console.error(err);
      alert('Error saving product');
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Upcoming Products</h1>
        <div className={styles.controls}>
          <div className={styles.searchBar}>
            <Search className={styles.searchIcon} size={18} />
            <input 
              type="text" 
              placeholder="Search upcoming products..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className={styles.addBtn} onClick={openAddModal}>
            <Plus size={20} /> Add Upcoming
          </button>
        </div>
      </div>

      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Image</th>
                <th>Name</th>
                <th>Category</th>
                <th>Waitlist</th>
                <th>Expected Launch</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map(product => (
                <tr key={product.id}>
                  <td>
                    <img src={product.image} alt={product.name} style={{ width: 50, height: 50, objectFit: 'cover', borderRadius: 4 }} />
                  </td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{product.name}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{product.slug}</div>
                  </td>
                  <td>{product.category}</td>
                  <td>
                    <button 
                      onClick={() => handleViewSubscribers(product.id!)}
                      style={{ background: 'transparent', border: '1px solid var(--color-border)', borderRadius: 20, padding: '4px 12px', fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, color: 'var(--color-text)' }}
                    >
                      <Users size={14} />
                      {product.notifyCount || 0} Waiting
                    </button>
                  </td>
                  <td>{product.launchDate || 'TBD'}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button onClick={() => openEditModal(product)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text)' }}>
                        <Edit2 size={18} />
                      </button>
                      <button onClick={() => handleDelete(product.id!)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-error)' }}>
                        <Trash2 size={18} />
                      </button>
                      <button 
                        onClick={() => handleLaunch(product.id!, product.name, product.image)} 
                        disabled={launchingId === product.id}
                        style={{ background: launchingId === product.id ? 'grey' : 'var(--color-primary)', color: '#000', border: 'none', borderRadius: 4, padding: '4px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontWeight: 'bold' }}
                      >
                        <Rocket size={14} />
                        {launchingId === product.id ? 'Launching...' : 'Launch'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredProducts.length === 0 && <div style={{ padding: '2rem', textAlign: 'center' }}>No upcoming products found.</div>}
        </div>
      )}

      {/* ADD/EDIT MODAL */}
      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ background: 'var(--color-background)', padding: '2rem', borderRadius: 12, width: '90%', maxWidth: 600, maxHeight: '90vh', overflowY: 'auto' }}>
            <h2 style={{ marginBottom: '1.5rem' }}>{editingId ? 'Edit' : 'Add'} Upcoming Product</h2>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <label>Name</label>
                  <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} style={{ width: '100%', padding: '0.8rem', borderRadius: 8, border: '1px solid var(--color-border)', background: 'transparent', color: 'var(--color-text)' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <label>Slug</label>
                  <input type="text" required value={formData.slug} onChange={e => setFormData({...formData, slug: e.target.value})} style={{ width: '100%', padding: '0.8rem', borderRadius: 8, border: '1px solid var(--color-border)', background: 'transparent', color: 'var(--color-text)' }} />
                </div>
              </div>

              <div>
                <label>Category</label>
                <select required value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} style={{ width: '100%', padding: '0.8rem', borderRadius: 8, border: '1px solid var(--color-border)', background: 'var(--color-background)', color: 'var(--color-text)' }}>
                  <option value="">Select Category</option>
                  {categoriesList.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                </select>
              </div>

              <div>
                <label>Short Description</label>
                <textarea required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} rows={3} style={{ width: '100%', padding: '0.8rem', borderRadius: 8, border: '1px solid var(--color-border)', background: 'transparent', color: 'var(--color-text)' }} />
              </div>
              
              <div>
                <label>Expected Launch Date (Optional)</label>
                <input type="text" placeholder="e.g. November 2026" value={formData.launchDate} onChange={e => setFormData({...formData, launchDate: e.target.value})} style={{ width: '100%', padding: '0.8rem', borderRadius: 8, border: '1px solid var(--color-border)', background: 'transparent', color: 'var(--color-text)' }} />
              </div>

              <div>
                <label>Main Image</label>
                <input type="file" accept="image/*" onChange={e => handleImageUpload(e, false)} style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--color-text)' }} />
                {uploadingImage && <div style={{ fontSize: '0.8rem', color: 'var(--color-primary)' }}>Uploading...</div>}
                {formData.image && <img src={formData.image} alt="Preview" style={{ width: 100, borderRadius: 8, marginTop: '0.5rem' }} />}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ padding: '0.8rem 1.5rem', borderRadius: 8, border: '1px solid var(--color-border)', background: 'transparent', color: 'var(--color-text)', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" disabled={uploadingImage} style={{ padding: '0.8rem 1.5rem', borderRadius: 8, border: 'none', background: 'var(--color-primary)', color: '#000', fontWeight: 'bold', cursor: 'pointer' }}>
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SUBSCRIBERS MODAL */}
      {showSubscribersModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ background: 'var(--color-background)', padding: '2rem', borderRadius: 12, width: '90%', maxWidth: 600, maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2>Waitlist Subscribers</h2>
              <button onClick={() => setShowSubscribersModal(false)} style={{ background: 'none', border: 'none', color: 'var(--color-text)', fontSize: '1.5rem', cursor: 'pointer' }}>&times;</button>
            </div>
            
            {loadingSubscribers ? (
              <p>Loading subscribers...</p>
            ) : (
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Email</th>
                    <th>Date Joined</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {currentSubscribers.map(sub => (
                    <tr key={sub.id}>
                      <td>{sub.email}</td>
                      <td>{sub.createdAt?.toDate().toLocaleDateString() || 'N/A'}</td>
                      <td>
                        <span style={{ 
                          padding: '2px 8px', 
                          borderRadius: 12, 
                          fontSize: '0.75rem', 
                          background: sub.status === 'sent' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                          color: sub.status === 'sent' ? '#10b981' : '#f59e0b'
                        }}>
                          {sub.status.toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {currentSubscribers.length === 0 && (
                    <tr>
                      <td colSpan={3} style={{ textAlign: 'center', padding: '1rem' }}>No subscribers yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
