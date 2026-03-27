"use client";
import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, Save } from 'lucide-react';
import styles from '../products/ProductsPage.module.css'; // Reuse product page styles to maintain perfect visual consistency
import { getProducts, addProduct, updateProduct, deleteProduct, Product, getContentBlock, updateContentBlock } from '@/lib/firebaseUtils';
import { uploadImageToImgBB } from '@/lib/uploadUtils';

export default function AdminSeasonalPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Home Season Settings State
  const [seasonTitle, setSeasonTitle] = useState('The Spring Collection');
  const [savingTitle, setSavingTitle] = useState(false);
  
  // Section 4 (Brand Story) Override
  const [section4Image, setSection4Image] = useState('');
  const [section4Title, setSection4Title] = useState('The Pursuit of Absolute Perfection');
  const [section4Text, setSection4Text] = useState('DualDeer was founded on a singular philosophy...');
  const [section4Cta, setSection4Cta] = useState('DISCOVER THE HERITAGE');
  const [savingSection4, setSavingSection4] = useState(false);
  const [uploadingSection4, setUploadingSection4] = useState(false);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    subcategory: '',
    sizes: '',
    colors: '',
    price: '',
    mrp: '',
    rating: '',
    stock: '',
    image: '',
    images: [] as string[]
  });
  const [isUploading, setIsUploading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [data, titleRes, storyRes] = await Promise.all([
        getProducts(),
        getContentBlock('home-season-title'),
        getContentBlock('brand-story')
      ]);
      // Only display seasonal products on this page
      setProducts(data.filter(p => p.isSeasonal === true));
      if (titleRes && titleRes.title) setSeasonTitle(titleRes.title);
      if (storyRes) {
        if (storyRes.imageUrl) setSection4Image(storyRes.imageUrl);
        if (storyRes.title) setSection4Title(storyRes.title);
        if (storyRes.body) setSection4Text(storyRes.body);
        if (storyRes.ctaText) setSection4Cta(storyRes.ctaText);
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const saveSeasonTitle = async () => {
    setSavingTitle(true);
    try {
      await updateContentBlock('home-season-title', { title: seasonTitle, body: '', imageUrl: '' });
      alert("Home Page title updated safely!");
    } catch(e) {
      alert("Error saving title");
    }
    setSavingTitle(false);
  };

  const saveSection4Text = async () => {
    setSavingSection4(true);
    try {
      await updateContentBlock('brand-story', { 
        title: section4Title, 
        body: section4Text,
        ctaText: section4Cta 
      });
      alert("Section 4 Text updated!");
    } catch(e) {
      alert("Error saving Section 4");
    }
    setSavingSection4(false);
  };

  const openAddModal = () => {
    setEditingId(null);
    setFormData({ name: '', description: '', sizes: '', colors: '', category: 'SEASONAL', subcategory: '', price: '', mrp: '', rating: '5', stock: '', image: '', images: [] });
    setShowModal(true);
  };

  const openEditModal = (product: Product) => {
    setEditingId(product.id!);
    setFormData({
      name: product.name,
      description: product.description || '',
      category: product.category,
      subcategory: product.subcategory || '',
      sizes: product.sizes ? product.sizes.join(', ') : '',
      colors: product.colors ? product.colors.join(', ') : '',
      price: product.price.toString(),
      mrp: product.mrp?.toString() || '',
      rating: product.rating?.toString() || '5',
      stock: product.stock.toString(),
      image: product.image,
      images: product.images || []
    });
    setShowModal(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const files = Array.from(e.target.files);
    const currentCount = formData.images?.length || 0;
    if (currentCount + files.length > 5) {
      alert(`Capacity reached: You can only upload a maximum of 5 images per product.`);
      return;
    }
    setUploadingImage(true);
    const urls = await Promise.all(files.map(file => uploadImageToImgBB(file)));
    const validUrls = urls.filter(Boolean) as string[];
    if (validUrls.length > 0) {
      setFormData(prev => ({ 
        ...prev, 
        image: prev.image || validUrls[0],
        images: [...(prev.images || []), ...validUrls]
      }));
    } else {
      alert("Image upload failed.");
    }
    setUploadingImage(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Remove this product permanently?')) {
      await deleteProduct(id);
      loadData();
    }
  };

  const handleRemoveFromSeason = async (id: string, product: Product) => {
    if (confirm('Remove this product from the Home Page Seasonal grid? (It will stay in your main Products list)')) {
      await updateProduct(id, { isSeasonal: false });
      loadData();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);
    try {
      if (!formData.image && formData.images.length === 0) {
        alert("Please provide an image or upload one.");
        setIsUploading(false);
        return;
      }

      const productData = {
        name: formData.name,
        description: formData.description,
        category: formData.category,
        subcategory: formData.subcategory,
        sizes: formData.sizes ? formData.sizes.split(',').map(s => s.trim()).filter(Boolean) : [],
        colors: formData.colors ? formData.colors.split(',').map(c => c.trim()).filter(Boolean) : [],
        price: parseFloat(formData.price),
        mrp: formData.mrp ? parseFloat(formData.mrp) : undefined,
        rating: formData.rating ? parseFloat(formData.rating) : 5,
        stock: parseInt(formData.stock),
        image: formData.image || formData.images[0],
        images: formData.images,
        isSeasonal: true,
      };

      if (editingId) {
        await updateProduct(editingId, productData);
      } else {
        await addProduct(productData);
      }

      setShowModal(false);
      loadData();
    } catch (e) {
      console.error(e);
      alert("Error saving seasonal product.");
    }
    setIsUploading(false);
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Seasonal Collection CMS</h1>
        <button className={styles.addBtn} onClick={openAddModal}>
          <Plus size={20} /> Add Seasonal Product
        </button>
      </header>

      {/* Global Season Title Settings */}
      <div className={styles.controls} style={{ marginBottom: '1.5rem', background: 'rgba(255,255,255,0.02)', padding: '1rem 1.5rem', borderRadius: '12px', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '0.8rem' }}>
        <h3 style={{ fontSize: '1rem', margin: 0 }}>Front Page Season Title</h3>
        <p style={{ fontSize: '0.8rem', opacity: 0.6, margin: 0 }}>Modify the title of the grid displayed natively on the home page.</p>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', width: '100%', maxWidth: '400px' }}>
          <input 
            type="text" 
            value={seasonTitle}
            onChange={(e) => setSeasonTitle(e.target.value)}
            className={styles.input}
            placeholder="e.g. The Spring Collection"
          />
          <button onClick={saveSeasonTitle} disabled={savingTitle} style={{
              background: 'var(--color-primary)', border: 'none', color: '#fff', borderRadius: '8px', padding: '0.6rem 1rem', cursor: 'pointer', display: 'flex', gap: '0.5rem', alignItems: 'center'
          }}>
            <Save size={16} /> {savingTitle ? "Saving..." : "Save Title"}
          </button>
        </div>
      </div>

      {/* Global Section 4 (Brand Story) Settings */}
      <div className={styles.controls} style={{ marginBottom: '1.5rem', background: 'rgba(255,255,255,0.02)', padding: '1.5rem', borderRadius: '12px', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '0.8rem' }}>
        <h3 style={{ fontSize: '1.1rem', margin: 0 }}>Section 4 (Brand Story) Dynamic Content</h3>
        <p style={{ fontSize: '0.85rem', opacity: 0.6, margin: 0, marginBottom: '1rem' }}>Fully control the text, titles, and backdrop image for the 4th section of the Home Page.</p>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%', maxWidth: '600px' }}>
          <div>
            <label style={{ fontSize: '0.8rem', opacity: 0.8 }}>Backdrop Image Uploadation</label>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginTop: '0.4rem' }}>
              <input 
                type="file" 
                accept="image/*"
                onChange={async (e) => {
                  if (!e.target.files?.length) return;
                  setUploadingSection4(true);
                  const url = await uploadImageToImgBB(e.target.files[0]);
                  if (url) {
                    await updateContentBlock('brand-story', { imageUrl: url });
                    setSection4Image(url);
                  }
                  setUploadingSection4(false);
                }}
                disabled={uploadingSection4}
              />
              {uploadingSection4 && <span style={{ color: 'var(--color-primary)', fontSize: '0.9rem' }}>Uploading Image...</span>}
              {section4Image && <img src={section4Image} alt="Section 4 Backdrop" style={{ height: '40px', borderRadius: '4px', objectFit: 'cover' }} />}
            </div>
          </div>

          <div>
            <label style={{ fontSize: '0.8rem', opacity: 0.8 }}>Headline Title</label>
            <input 
              type="text" 
              value={section4Title}
              onChange={(e) => setSection4Title(e.target.value)}
              className={styles.input}
              style={{ width: '100%', marginTop: '0.4rem' }}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.8rem', opacity: 0.8 }}>Paragraph Text</label>
            <textarea 
              value={section4Text}
              onChange={(e) => setSection4Text(e.target.value)}
              className={styles.input}
              style={{ width: '100%', height: '80px', padding: '0.8rem', marginTop: '0.4rem', fontFamily: 'inherit' }}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.8rem', opacity: 0.8 }}>Button Text</label>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <input 
                type="text" 
                value={section4Cta}
                onChange={(e) => setSection4Cta(e.target.value)}
                className={styles.input}
                style={{ flex: 1, marginTop: '0.4rem' }}
              />
              <button onClick={saveSection4Text} disabled={savingSection4} style={{
                  background: 'var(--color-primary)', border: 'none', color: '#fff', borderRadius: '8px', padding: '0 1.5rem', cursor: 'pointer', marginTop: '0.4rem'
              }}>
                {savingSection4 ? "Saving..." : "Save Text"}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.controls}>
        <div className={styles.searchBar}>
          <Search size={20} className={styles.searchIcon} />
          <input 
            type="text" 
            placeholder="Search explicitly seasonal products..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div style={{ color: "var(--color-text)", padding: "2rem" }}>Loading seasonal pipeline...</div>
      ) : (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Image</th>
                <th>Name</th>
                <th>Offer Price</th>
                <th>Stock</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map(product => (
                <tr key={product.id}>
                  <td>
                    <img src={product.image} alt={product.name} className={styles.productThumbnail} />
                  </td>
                  <td>{product.name}</td>
                  <td>${product.price.toFixed(2)}</td>
                  <td>{product.stock}</td>
                  <td>
                    <div className={styles.actions}>
                      <button className={styles.editBtn} onClick={() => openEditModal(product)} title="Edit Configuration">
                        <Edit2 size={16} />
                      </button>
                      <button className={styles.deleteBtn} onClick={() => handleRemoveFromSeason(product.id!, product)} title="Remove from Home Season">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ textAlign: "center", padding: "2rem", opacity: 0.5 }}>
                    No seasonal products uploaded right now.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Reusable Product Modal */}
      {showModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h2>{editingId ? 'Edit Seasonal Product' : 'Add New Seasonal Product'}</h2>
              <button className={styles.closeBtn} onClick={() => setShowModal(false)}>×</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1rem', maxHeight: '70vh', overflowY: 'auto' }}>
            <form onSubmit={handleSubmit} className={styles.form} style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem', padding: 0 }}>
              
              <div className={styles.formGroup}>
                <label>Product Name</label>
                <input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
              </div>

              <div className={styles.formGroup}>
                <label>Description</label>
                <textarea 
                  value={formData.description} 
                  onChange={e => setFormData({ ...formData, description: e.target.value })} 
                  required 
                  style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--color-border)', background: 'rgba(0,0,0,0.4)', color: 'var(--color-text)', minHeight: '80px', fontFamily: 'inherit' }}
                />
              </div>

              <div className={styles.formRow} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className={styles.formGroup}>
                  <label>Sizes (Comma separated)</label>
                  <input type="text" value={formData.sizes} onChange={e => setFormData({ ...formData, sizes: e.target.value })} required placeholder="S, M, L" />
                </div>
                <div className={styles.formGroup}>
                  <label>Colors (Comma separated HEX/Names)</label>
                  <input type="text" value={formData.colors} onChange={e => setFormData({ ...formData, colors: e.target.value })} placeholder="#fff, red" />
                </div>
              </div>

              <div className={styles.formRow} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className={styles.formGroup}>
                  <label>Offer Price ($)</label>
                  <input type="number" step="0.01" value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} required />
                </div>
                <div className={styles.formGroup}>
                  <label>MRP ($) <small>(Optional)</small></label>
                  <input type="number" step="0.01" value={formData.mrp} onChange={e => setFormData({ ...formData, mrp: e.target.value })} />
                </div>
              </div>

              <div className={styles.formRow} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className={styles.formGroup}>
                  <label>Stock</label>
                  <input type="number" value={formData.stock} onChange={e => setFormData({ ...formData, stock: e.target.value })} required min="0" />
                </div>
                <div className={styles.formGroup}>
                  <label>Category Tag</label>
                  <input type="text" value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} placeholder="e.g. SEASONAL" />
                </div>
                <div className={styles.formGroup}>
                  <label>Sub Category</label>
                  <input type="text" value={formData.subcategory} onChange={e => setFormData({ ...formData, subcategory: e.target.value })} placeholder="e.g. Hoodies, Tops" />
                </div>
              </div>

              <div className={styles.formGroup} style={{ marginTop: '1rem' }}>
                <label>Product Gallery (Max 5 Images) {uploadingImage && <span style={{color: 'var(--color-primary)'}}>Uploading...</span>}</label>
                <input 
                  type="file" multiple accept="image/*" 
                  onChange={handleImageUpload} 
                  disabled={uploadingImage || formData.images.length >= 5}
                  style={{ marginBottom: '10px' }}
                />
                <input 
                  type="url" value={formData.image} 
                  onChange={e => setFormData({ ...formData, image: e.target.value })} 
                  placeholder="Primary thumbnail URL..." 
                  required
                />
                <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap', marginTop: '1rem' }}>
                  {formData.images.map((img, i) => (
                    <div key={i} style={{ position: 'relative' }}>
                      <img src={img} alt="Gallery item" style={{ height: '80px', width: '80px', borderRadius: '8px', objectFit: 'cover' }} />
                      <button 
                         type="button"
                         onClick={() => setFormData(prev => ({ ...prev, images: prev.images.filter((_, idx) => idx !== i) }))}
                         style={{ position: 'absolute', top: '-6px', right: '-6px', background: '#ff3333', color: 'white', border: 'none', borderRadius: '50%', width: '22px', height: '22px', cursor: 'pointer' }}
                      >×</button>
                    </div>
                  ))}
                  {formData.image && formData.images.length === 0 && (
                     <img src={formData.image} alt="Preview" style={{ height: '80px', width: '80px', borderRadius: '8px', objectFit: 'cover' }} />
                  )}
                </div>
              </div>

              <div className={styles.formActions} style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button type="button" className={styles.cancelBtn} onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className={styles.saveBtn} disabled={isUploading || uploadingImage} style={{ flex: 1, background: 'var(--color-primary)', border: 'none', color: '#fff', borderRadius: '8px', padding: '0.8rem' }}>
                  {isUploading ? 'Saving...' : 'Save Product'}
                </button>
              </div>
            </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
