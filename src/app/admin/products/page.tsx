"use client";
import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, RotateCcw, AlertTriangle, ArchiveRestore } from 'lucide-react';
import styles from './ProductsPage.module.css';
import { getProducts, getDeletedProducts, addProduct, updateProduct, deleteProduct, restoreProduct, hardDeleteProduct, Product, getContentBlock, updateContentBlock, getCategories, generateSlug, getUniqueSlug } from '@/lib/firebaseUtils';
import { uploadImageToImgBB } from '@/lib/uploadUtils';

function CustomDropdown({ options, value, onChange, placeholder, disabled = false }: { options: string[], value: string, onChange: (val: string) => void, placeholder: string, disabled?: boolean }) {
  const [isOpen, setIsOpen] = useState(false);
  
  useEffect(() => {
    const handleClick = () => setIsOpen(false);
    if (isOpen) {
      setTimeout(() => document.addEventListener('click', handleClick), 0);
    }
    return () => document.removeEventListener('click', handleClick);
  }, [isOpen]);

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <div 
        onClick={() => !disabled && setIsOpen(!isOpen)}
        style={{ 
          width: '100%', padding: '0.8rem', borderRadius: '8px', 
          border: '1px solid var(--color-border)', 
          background: 'rgba(var(--background-rgb), 0.4)', 
          color: 'var(--color-text)', 
          cursor: disabled ? 'not-allowed' : 'pointer', 
          opacity: disabled ? 0.5 : 1,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          fontFamily: 'var(--font-inter), sans-serif',
          fontSize: '0.95rem'
        }}
      >
        <span>{value || placeholder}</span>
        <span style={{ fontSize: '0.8rem', opacity: 0.5 }}>▼</span>
      </div>
      {isOpen && !disabled && (
        <div style={{ 
          position: 'absolute', top: '100%', left: 0, width: '100%', 
          maxHeight: '220px', overflowY: 'auto', 
          background: 'var(--color-background)', 
          border: '1px solid var(--color-border)', 
          borderRadius: '8px', zIndex: 100, marginTop: '4px', 
          boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
          fontFamily: 'var(--font-inter), sans-serif',
          fontSize: '0.95rem'
        }}>
          {options.length === 0 && <div style={{ padding: '0.8rem', opacity: 0.5, color: 'var(--color-text)' }}>No options</div>}
          {options.map(opt => (
            <div 
              key={opt}
              onClick={() => { onChange(opt); setIsOpen(false); }}
              style={{ 
                padding: '0.8rem', cursor: 'pointer', 
                borderBottom: '1px solid rgba(var(--foreground-rgb), 0.05)', 
                color: 'var(--color-text)',
                background: value === opt ? 'rgba(212, 175, 55, 0.1)' : 'transparent',
                transition: 'background 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(var(--foreground-rgb), 0.1)'}
              onMouseLeave={(e) => {
                if (value !== opt) e.currentTarget.style.background = 'transparent';
                else e.currentTarget.style.background = 'rgba(212, 175, 55, 0.1)';
              }}
            >
              {opt}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [categoriesList, setCategoriesList] = useState<any[]>([]);
  const [lastDeleted, setLastDeleted] = useState<{ id: string, product: Product } | null>(null);
  const [hasOfferPrice, setHasOfferPrice] = useState(true);
  
  // Trash State
  const [viewingTrash, setViewingTrash] = useState(false);
  const [deletedProducts, setDeletedProducts] = useState<Product[]>([]);

  // Shop Backdrop & Hero State
  const [backdropImage, setBackdropImage] = useState('');
  const [uploadingBackdrop, setUploadingBackdrop] = useState(false);
  const [heroImage, setHeroImage] = useState('');
  const [heroText, setHeroText] = useState('');
  const [uploadingHero, setUploadingHero] = useState(false);
  const [migratingSlugs, setMigratingSlugs] = useState(false);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    sizes: '',
    sizeUnits: {} as Record<string, number>,
    category: '',
    subcategory: '',
    price: 0,
    mrp: 0,
    priceUSD: 0,
    mrpUSD: 0,
    rating: 5,
    image: '',
    images: [] as string[],
    stock: 0,
    colors: '',
    isSoldOut: false,
    isPremium: false,
    videoUrl: ''
  });
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState<number | null>(null);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const [data, trashData, backdropRes, heroRes, catsRes] = await Promise.all([
        getProducts(),
        getDeletedProducts(),
        getContentBlock('shop-backdrop'),
        getContentBlock('shop-hero'),
        getCategories()
      ]);
      setProducts(data);
      setDeletedProducts(trashData);
      if (backdropRes) setBackdropImage(backdropRes.imageUrl || '');
      if (heroRes) {
        setHeroImage(heroRes.imageUrl || '');
        setHeroText(heroRes.title || '');
      }
      setCategoriesList(catsRes.filter(c => c.status === 'active'));
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const openAddModal = () => {
    setFormData({ name: '', slug: '', description: '', sizes: '', sizeUnits: {}, category: '', subcategory: '', price: 0, mrp: 0, priceUSD: 0, mrpUSD: 0, rating: 5, image: '', images: [], stock: 0, colors: '', isSoldOut: false, isPremium: false, videoUrl: '' });
    setEditingId(null);
    setHasOfferPrice(true);
    setShowModal(true);
  };

  const openEditModal = (product: Product) => {
    setFormData({
      name: product.name,
      slug: (product.slug === product.id ? '' : product.slug) || '',
      description: product.description || '',
      sizes: product.sizes ? product.sizes.join(', ') : '',
      sizeUnits: product.sizeUnits || {},
      category: product.category,
      subcategory: product.subcategory || '',
      price: product.price,
      mrp: product.mrp || 0,
      priceUSD: product.priceUSD || 0,
      mrpUSD: product.mrpUSD || 0,
      rating: product.rating || 5,
      image: product.image,
      images: product.images || [],
      stock: product.stock,
      colors: product.colors ? product.colors.join(', ') : '',
      isSoldOut: product.isSoldOut || false,
      isPremium: product.isPremium || false,
      videoUrl: product.videoUrl || ''
    });
    setEditingId(product.id!);
    // If price equals MRP or price is 0, then there is no real offer price
    setHasOfferPrice(!(product.price === product.mrp || product.price === 0));
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsedSizes = formData.sizes ? formData.sizes.split(',').map(s => s.trim()).filter(Boolean) : [];
    
    let calculatedStock = formData.stock;
    if (parsedSizes.length > 0) {
      calculatedStock = 0;
      parsedSizes.forEach(size => {
        calculatedStock += formData.sizeUnits?.[size] || 0;
      });
    }

    const payload = {
      ...formData,
      sizes: parsedSizes,
      sizeUnits: formData.sizeUnits,
      stock: calculatedStock,
      colors: formData.colors ? formData.colors.split(',').map(c => c.trim()).filter(Boolean) : []
    };
    
    if (!hasOfferPrice) {
      payload.price = payload.mrp || 0;
      payload.priceUSD = payload.mrpUSD || 0;
    }
    
    // Convert 'sizes' string into string array
    // removing 'sizes' string from saving directly if it was meant to be an array but it's fine as the payload overwrites it
    if (editingId) {
      await updateProduct(editingId, payload);
    } else {
      await addProduct(payload);
    }
    setShowModal(false);
    loadProducts();
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const files = Array.from(e.target.files);
    const currentCount = formData.images?.length || 0;
    
    if (currentCount + files.length > 9) {
      alert(`Capacity reached: You can only upload a maximum of 9 images per product. You are trying to add ${currentCount + files.length}.`);
      return;
    }

    setUploadingImage(true);
    
    // Upload all files in parallel to ImgBB
    const urls = await Promise.all(files.map(file => uploadImageToImgBB(file)));
    const validUrls = urls.filter(Boolean) as string[];
    
    if (validUrls.length > 0) {
      setFormData(prev => ({ 
        ...prev, 
        image: prev.image || validUrls[0], // primary fallback
        images: [...(prev.images || []), ...validUrls]
      }));
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
          const secure_url = response.secure_url;
          setFormData(prev => ({ ...prev, videoUrl: secure_url }));
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

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this product?")) {
      const productToDelete = products.find(p => p.id === id);
      if (productToDelete) {
        setLastDeleted({ id, product: productToDelete });
      }
      await deleteProduct(id);
      loadProducts();

      // Clear the undo state after 15 seconds
      setTimeout(() => {
        setLastDeleted(prev => prev?.id === id ? null : prev);
      }, 15000);
    }
  };

  const handleUndoDelete = async () => {
    if (lastDeleted) {
      await restoreProduct(lastDeleted.id, lastDeleted.product);
      setLastDeleted(null);
      loadProducts();
    }
  };

  const handleRestoreFromTrash = async (id: string) => {
    await restoreProduct(id);
    loadProducts();
  };

  const handleHardDelete = async (id: string) => {
    if (confirm("WARNING: This will permanently vaporize this product from the database. This action cannot be undone. Proceed?")) {
      await hardDeleteProduct(id);
      loadProducts();
    }
  };

  const handleMigrateSlugs = async () => {
    if (!confirm("This will generate and save SEO slugs for all products that don't have one. Proceed?")) return;
    setMigratingSlugs(true);
    let updated = 0;
    try {
      for (const p of products) {
        if (!p.slug || p.slug === p.id) {
          const baseSlug = generateSlug(p.name);
          const finalSlug = await getUniqueSlug(baseSlug, p.id);
          console.log(`Migrating product ${p.name} (ID: ${p.id}) to slug: ${finalSlug}`);
          await updateProduct(p.id!, { slug: finalSlug });
          updated++;
        }
      }
      console.log(`Migrated ${updated} products.`);
      alert(`Migration complete! Updated ${updated} products.`);
      loadProducts();
    } catch (err) {
      console.error(err);
      alert("Error migrating slugs. See console.");
    }
    setMigratingSlugs(false);
  };

  const baseList = viewingTrash ? deletedProducts : products;
  const filteredProducts = baseList.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || p.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  // Get unique categories for dropdown
  const categories = Array.from(new Set(products.map(p => p.category)));

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <h1 className={styles.title}>{viewingTrash ? 'Recycle Bin' : 'Products Management'}</h1>
          
          <button 
             onClick={() => setViewingTrash(!viewingTrash)}
             style={{ background: viewingTrash ? '#333' : 'rgba(255,50,50,0.1)', color: viewingTrash ? '#fff' : '#ff3333', border: '1px solid ' + (viewingTrash ? '#444' : 'rgba(255,50,50,0.2)'), padding: '0.5rem 1rem', borderRadius: '50px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}
          >
             {viewingTrash ? <><Search size={16} /> Back to Products</> : <><Trash2 size={16} /> View Trash ({deletedProducts.length})</>}
          </button>

          {!viewingTrash && lastDeleted && (
            <button 
              onClick={handleUndoDelete}
              style={{ background: '#ffcc00', color: 'var(--color-background)', border: 'none', padding: '0.5rem 1rem', borderRadius: '50px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', animation: 'fadeIn 0.3s ease' }}
            >
              <RotateCcw size={16} /> Undo Delete
            </button>
          )}
        </div>
        {!viewingTrash && (
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button className={styles.addBtn} onClick={handleMigrateSlugs} disabled={migratingSlugs} style={{ background: '#333', color: 'var(--color-text)', border: '1px solid #555' }}>
              {migratingSlugs ? 'Migrating...' : 'Migrate SEO Slugs'}
            </button>
            <button className={styles.addBtn} onClick={openAddModal}>
              <Plus size={20} /> Add Product
            </button>
          </div>
        )}
      </header>

      {/* Shop Image Overrides */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
        {/* Backdrop Override */}
        <div className={styles.controls} style={{ background: 'rgba(var(--foreground-rgb), 0.02)', padding: '1rem 1.5rem', borderRadius: '12px', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '0.8rem' }}>
          <h3 style={{ fontSize: '1rem', margin: 0 }}>Store Backdrop Override</h3>
          <p style={{ fontSize: '0.8rem', opacity: 0.6, margin: 0 }}>Upload a dynamic image to override the dark cinematic backdrop on the Collections page.</p>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', width: '100%' }}>
            <input 
              type="file" 
              accept="image/*"
              onChange={async (e) => {
                if (!e.target.files?.length) return;
                setUploadingBackdrop(true);
                const url = await uploadImageToImgBB(e.target.files[0]);
                if (url) {
                  await updateContentBlock('shop-backdrop', { imageUrl: url, title: '', body: '' });
                  setBackdropImage(url);
                }
                setUploadingBackdrop(false);
              }}
              disabled={uploadingBackdrop}
            />
            {uploadingBackdrop && <span style={{ color: 'var(--color-primary)', fontSize: '0.9rem' }}>Uploading...</span>}
            {backdropImage && <img src={backdropImage} alt="Backdrop" style={{ height: '40px', borderRadius: '4px', objectFit: 'cover' }} />}
          </div>
        </div>

        {/* Hero Override */}
        <div className={styles.controls} style={{ background: 'rgba(var(--foreground-rgb), 0.02)', padding: '1rem 1.5rem', borderRadius: '12px', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '0.8rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
            <h3 style={{ fontSize: '1rem', margin: 0 }}>Shop Half-Screen Banner</h3>
            <button 
              onClick={() => updateContentBlock('shop-hero', { imageUrl: heroImage, title: heroText, body: '' })}
              style={{ background: 'var(--color-primary)', color: 'var(--color-text)', border: 'none', padding: '0.3rem 0.8rem', borderRadius: '4px', fontSize: '0.8rem', cursor: 'pointer' }}
            >
              Save Text
            </button>
          </div>
          <p style={{ fontSize: '0.8rem', opacity: 0.6, margin: 0 }}>Top 50vh banner above categories with motivational text.</p>
          
          <input 
            type="text" 
            value={heroText}
            onChange={(e) => setHeroText(e.target.value)}
            placeholder="Motivational Overlay Text..."
            style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', background: 'rgba(var(--background-rgb), 0.2)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
          />

          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', width: '100%', marginTop: '0.4rem' }}>
            <input 
              type="file" 
              accept="image/*"
              onChange={async (e) => {
                if (!e.target.files?.length) return;
                setUploadingHero(true);
                const url = await uploadImageToImgBB(e.target.files[0]);
                if (url) {
                  await updateContentBlock('shop-hero', { imageUrl: url, title: heroText, body: '' });
                  setHeroImage(url);
                }
                setUploadingHero(false);
              }}
              disabled={uploadingHero}
            />
            {uploadingHero && <span style={{ color: 'var(--color-primary)', fontSize: '0.9rem' }}>Uploading...</span>}
            {heroImage && <img src={heroImage} alt="Hero" style={{ height: '40px', borderRadius: '4px', objectFit: 'cover' }} />}
          </div>
        </div>
      </div>

      <div className={styles.controls}>
        <div className={styles.searchBar}>
          <Search size={20} className={styles.searchIcon} />
          <input 
            type="text" 
            placeholder="Search products..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select 
          className={styles.filter} 
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
        >
          <option value="all">All Categories</option>
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      <div className={styles.tableContainer}>
        {loading ? (
          <p>Loading products...</p>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Image</th>
                <th>Product Name</th>
                <th>Category</th>
                <th>Price (Offer)</th>
                <th>MRP</th>
                <th>Rating</th>
                <th>Stock</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map(product => (
                <tr key={product.id}>
                  <td>
                    <div className={styles.imgBox}>
                      <img src={product.image || 'https://via.placeholder.com/150'} alt={product.name} className={styles.img} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  </td>
                  <td className={styles.productName}>{product.name}</td>
                  <td><span className={styles.categoryBadge}>{product.category}{product.subcategory ? ` > ${product.subcategory}` : ''}</span></td>
                  <td className={styles.price}>${product.price != null ? Number(product.price).toFixed(2) : '0.00'}</td>
                  <td className={styles.mrp}>{product.mrp ? <del>${Number(product.mrp).toFixed(2)}</del> : '-'}</td>
                  <td>★ {product.rating || 5}</td>
                  <td>
                    <span className={`${styles.stockBadge} ${product.isSoldOut ? styles.outOfStock : product.stock > 10 ? styles.inStock : product.stock > 0 ? styles.lowStock : styles.outOfStock}`}>
                      {product.isSoldOut ? 'Sold Out' : `${product.stock} in stock`}
                    </span>
                  </td>
                  <td>
                    <div className={styles.actions}>
                      {viewingTrash ? (
                         <>
                           <button className={styles.editBtn} aria-label="Restore" onClick={() => handleRestoreFromTrash(product.id!)} style={{ background: '#22c55e', color: 'var(--color-background)' }}><ArchiveRestore size={16} /></button>
                           <button className={styles.deleteBtn} aria-label="Permanent Delete" onClick={() => handleHardDelete(product.id!)}><AlertTriangle size={16} /></button>
                         </>
                      ) : (
                         <>
                           <button className={styles.editBtn} aria-label="Edit" onClick={() => openEditModal(product)}><Edit2 size={16} /></button>
                           <button className={styles.deleteBtn} aria-label="Delete" onClick={() => handleDelete(product.id!)}><Trash2 size={16} /></button>
                         </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center' }}>No products found.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Add / Edit Modal */}
      {showModal && (
        <div className={styles.modalOverlay}>
          <form className={styles.modalContent} onSubmit={handleSave}>
            <h2>{editingId ? 'Edit Product' : 'New Product'}</h2>
            
            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label>Product Name</label>
                <input 
                  type="text" 
                  value={formData.name} 
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label>URL Slug (Optional)</label>
                <input 
                  type="text" 
                  value={formData.slug} 
                  onChange={(e) => setFormData({...formData, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]+/g, '-')})}
                  placeholder={formData.name ? generateSlug(formData.name) : "e.g. titan-weave"}
                />
                <span style={{ fontSize: '0.75rem', opacity: 0.6, marginTop: '4px', display: 'block' }}>
                  Preview: https://www.dualdeer.com/product/{formData.slug || (formData.name ? generateSlug(formData.name) : '...')}
                </span>
              </div>

              <div className={styles.formGroup}>
                <label>Category</label>
                <CustomDropdown
                  options={["Men", "Women", "Kids", "Unisex", ...categoriesList.filter((c: any) => !["Men", "Women", "Kids", "Unisex"].includes(c.name)).map((cat: any) => cat.name)]}
                  value={formData.category}
                  onChange={(val) => setFormData({...formData, category: val, subcategory: ''})}
                  placeholder="Select Category"
                />
              </div>

              <div className={styles.formGroup}>
                <label>Sub Category</label>
                <CustomDropdown
                  disabled={!formData.category}
                  options={
                    formData.category === "Men" ? [
                      "T-Shirts", "Muscle Fit", "Shirts", "Jeans", "Trousers", "Shorts", 
                      "Jackets", "Hoodies", "Sweatshirts", "Sweaters", "Suits", 
                      "Activewear", "Innerwear", "Accessories", "Footwear", "Ethnic Wear", "Loungewear"
                    ] :
                    formData.category === "Women" ? [
                      "Dresses", "Tops", "T-Shirts", "Muscle Fit", "Shirts", "Jeans", 
                      "Trousers", "Skirts", "Shorts", "Jackets", "Coats", 
                      "Hoodies", "Sweatshirts", "Sweaters", "Activewear", 
                      "Lingerie", "Accessories", "Footwear", "Ethnic Wear", 
                      "Jumpsuits", "Rompers", "Loungewear"
                    ] :
                    formData.category === "Kids" ? [
                      "T-Shirts", "Shirts", "Jeans", "Shorts", "Dresses", 
                      "Skirts", "Jackets", "Activewear", "Sleepwear", "Footwear", 
                      "Toys", "Accessories"
                    ] :
                    formData.category === "Unisex" ? [
                      "T-Shirts", "Muscle Fit", "Hoodies", "Sweatshirts", "Jackets", "Accessories", "Headwear"
                    ] :
                    categoriesList.find((c: any) => c.name === formData.category)?.subcategories || []
                  }
                  value={formData.subcategory}
                  onChange={(val) => setFormData({...formData, subcategory: val})}
                  placeholder="Select Sub Category"
                />
              </div>

              <div className={styles.formGroup} style={{ gridColumn: '1 / -1' }}>
                <label>Description</label>
                <textarea 
                  value={formData.description} 
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  required
                  placeholder="Product description and details..."
                  style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--color-border)', background: 'rgba(var(--background-rgb), 0.4)', color: 'var(--color-text)', minHeight: '80px', fontFamily: 'inherit' }}
                />
              </div>

              <div className={styles.formGroup}>
                <label>Sizes (Comma separated)</label>
                <input 
                  type="text" 
                  value={formData.sizes} 
                  onChange={(e) => setFormData({...formData, sizes: e.target.value})}
                  placeholder="e.g. S, M, L, XL, OSFA"
                />
              </div>

              {formData.sizes && formData.sizes.split(',').filter(s => s.trim()).length > 0 && (
                <div className={styles.formGroup} style={{ gridColumn: '1 / -1', background: 'rgba(var(--foreground-rgb), 0.02)', padding: '1rem', borderRadius: '8px' }}>
                  <label>Stock per Size</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginTop: '0.5rem' }}>
                    {formData.sizes.split(',').map(s => s.trim()).filter(Boolean).map(size => (
                      <div key={size} style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', flex: '1 1 100px' }}>
                        <label style={{ fontSize: '0.8rem', opacity: 0.8 }}>Size: {size}</label>
                        <input 
                          type="number" 
                          value={formData.sizeUnits?.[size] || 0}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            const updatedUnits = { ...formData.sizeUnits, [size]: val };
                            setFormData({...formData, sizeUnits: updatedUnits});
                          }}
                          min="0"
                          style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--color-border)', background: 'rgba(var(--background-rgb), 0.4)', color: 'var(--color-text)' }}
                        />
                      </div>
                    ))}
                  </div>
                  <p style={{marginTop: '0.5rem', fontSize: '0.8rem', opacity: 0.6}}>Total stock will be auto-calculated from these values.</p>
                </div>
              )}

              <div className={styles.formGroup}>
                <label>Colors (Comma separated HEX/Names)</label>
                <input 
                  type="text" 
                  value={formData.colors} 
                  onChange={(e) => setFormData({...formData, colors: e.target.value})}
                  placeholder="e.g. #000000, white, #ff0000"
                />
              </div>

              <div className={styles.formGroup}>
                <label>Total Stock Quantity</label>
                <input 
                  type="number" 
                  value={formData.sizes && formData.sizes.split(',').filter(s=>s.trim()).length > 0 ? formData.sizes.split(',').map(s=>s.trim()).filter(Boolean).reduce((acc, curr) => acc + (formData.sizeUnits?.[curr] || 0), 0) : formData.stock} 
                  onChange={(e) => setFormData({...formData, stock: Number(e.target.value)})}
                  required
                  min="0"
                  disabled={!!(formData.sizes && formData.sizes.split(',').filter(s=>s.trim()).length > 0)}
                  style={formData.sizes && formData.sizes.split(',').filter(s=>s.trim()).length > 0 ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
                />
              </div>

              <div className={styles.formGroup} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input 
                  type="checkbox" 
                  id="isSoldOut"
                  checked={formData.isSoldOut} 
                  onChange={(e) => setFormData({...formData, isSoldOut: e.target.checked})}
                  style={{ width: 'auto' }}
                />
                <label htmlFor="isSoldOut" style={{ margin: 0, cursor: 'pointer' }}>Mark as Sold Out Manually</label>
              </div>

              <div className={styles.formGroup} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input 
                  type="checkbox" 
                  id="isPremium"
                  checked={formData.isPremium} 
                  onChange={(e) => setFormData({...formData, isPremium: e.target.checked})}
                  style={{ width: 'auto' }}
                />
                <label htmlFor="isPremium" style={{ margin: 0, cursor: 'pointer', color: '#ffb347', fontWeight: 'bold' }}>Mark as Premium (Luxurious Styling)</label>
              </div>

              <div className={styles.formGroup} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input 
                  type="checkbox" 
                  id="hasOfferPrice"
                  checked={hasOfferPrice} 
                  onChange={(e) => setHasOfferPrice(e.target.checked)}
                  style={{ width: 'auto' }}
                />
                <label htmlFor="hasOfferPrice" style={{ margin: 0, cursor: 'pointer', fontWeight: 'bold' }}>Enable Offer Price / Discount</label>
              </div>

              {hasOfferPrice && (
                <div className={styles.formGroup}>
                  <label>Offer Price (Selling Price)</label>
                  <div style={{ display: 'flex', gap: '1rem' }}>
                  <input 
                    type="number" 
                    value={formData.price} 
                    onChange={(e) => setFormData({...formData, price: Number(e.target.value)})}
                    required
                    step="0.01"
                    min="0"
                    placeholder="INR (₹)"
                  />
                  <input 
                    type="number" 
                    value={formData.priceUSD} 
                    onChange={(e) => setFormData({...formData, priceUSD: Number(e.target.value)})}
                    step="0.01"
                    min="0"
                    placeholder="USD ($) Optional"
                  />
                </div>
              </div>
              )}

              <div className={styles.formGroup}>
                <label>MRP (Original Price {hasOfferPrice ? '' : '- This will be the Selling Price'})</label>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <input 
                    type="number" 
                    value={formData.mrp} 
                    onChange={(e) => setFormData({...formData, mrp: Number(e.target.value)})}
                    step="0.01"
                    min="0"
                    placeholder="INR (₹)"
                  />
                  <input 
                    type="number" 
                    value={formData.mrpUSD} 
                    onChange={(e) => setFormData({...formData, mrpUSD: Number(e.target.value)})}
                    step="0.01"
                    min="0"
                    placeholder="USD ($) Optional"
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label>Rating (1-5)</label>
                <input 
                  type="number" 
                  value={formData.rating} 
                  onChange={(e) => setFormData({...formData, rating: Number(e.target.value)})}
                  step="0.1"
                  min="1"
                  max="5"
                />
              </div>
            </div>

            <div className={styles.formGroup} style={{ marginTop: '1rem' }}>
              <label>Product Gallery (Max 9 Images)</label>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <input 
                  type="file" 
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploadingImage || (formData.images && formData.images.length >= 9)}
                  style={{ flex: 1 }}
                />
                {uploadingImage && <span style={{ fontSize: '0.9rem', color: 'var(--color-primary)' }}>Uploading...</span>}
                {(formData.images && formData.images.length >= 9) && <span style={{ fontSize: '0.8rem', color: '#ff3333' }}>Limit Reached (9/9)</span>}
              </div>
              <input 
                type="url" 
                value={formData.image} 
                onChange={(e) => setFormData({...formData, image: e.target.value})}
                required
                placeholder="Primary thumbnail URL..."
                style={{ marginTop: '0.5rem' }}
              />
              <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap', marginTop: '1rem' }}>
                {formData.images && formData.images.map((img, i) => (
                  <div key={i} style={{ position: 'relative' }}>
                    <img src={img} alt="Gallery item" style={{ height: '80px', width: '80px', borderRadius: '8px', objectFit: 'cover' }} />
                    <button 
                       type="button"
                       onClick={() => setFormData(prev => ({ ...prev, images: prev.images.filter((_, idx) => idx !== i) }))}
                       style={{ position: 'absolute', top: '-6px', right: '-6px', background: '#ff3333', color: 'var(--color-text)', border: 'none', borderRadius: '50%', width: '22px', height: '22px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px' }}
                    >
                      ×
                    </button>
                  </div>
                ))}
                {formData.image && (!formData.images || formData.images.length === 0) && (
                   <img src={formData.image} alt="Preview" style={{ height: '80px', width: '80px', borderRadius: '8px', objectFit: 'cover' }} />
                )}
              </div>
            </div>

            <div className={styles.formGroup} style={{ marginTop: '1rem', background: 'rgba(var(--foreground-rgb), 0.02)', padding: '1rem', borderRadius: '8px' }}>
              <label>Product Video (Max 1 Video)</label>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginTop: '0.5rem' }}>
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
                placeholder="Cloudinary secure_url..."
                style={{ marginTop: '0.5rem' }}
              />
              {formData.videoUrl && (
                <div style={{ marginTop: '1rem', position: 'relative', width: 'fit-content' }}>
                  <video src={formData.videoUrl} autoPlay loop muted playsInline style={{ height: '120px', borderRadius: '8px', border: '1px solid var(--color-border)' }} />
                  <button 
                     type="button"
                     onClick={() => setFormData(prev => ({ ...prev, videoUrl: '' }))}
                     style={{ position: 'absolute', top: '-6px', right: '-6px', background: '#ff3333', color: 'var(--color-text)', border: 'none', borderRadius: '50%', width: '22px', height: '22px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px' }}
                  >
                    ×
                  </button>
                </div>
              )}
            </div>

            <div className={styles.modalActions}>
              <button type="button" className={styles.cancelBtn} onClick={() => setShowModal(false)}>Cancel</button>
              <button type="submit" className={styles.saveBtn}>Save Product</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
