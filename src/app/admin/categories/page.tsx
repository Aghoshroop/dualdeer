"use client";
import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import styles from './CategoriesPage.module.css';
import { getCategories, addCategory, updateCategory, deleteCategory, Category } from '@/lib/firebaseUtils';
import { uploadImageToImgBB } from '@/lib/uploadUtils';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  
  const [formData, setFormData] = useState<{
    name: string;
    image: string;
    subcategories: string;
    status: 'active' | 'inactive';
  }>({
    name: '',
    image: '',
    subcategories: '',
    status: 'active'
  });

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    setLoading(true);
    try {
      const data = await getCategories();
      setCategories(data);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const openAddModal = () => {
    setFormData({ name: '', image: '', subcategories: '', status: 'active' });
    setEditingId(null);
    setShowModal(true);
  };

  const openEditModal = (category: Category) => {
    setFormData({
      name: category.name,
      image: category.image || '',
      subcategories: category.subcategories?.join(', ') || '',
      status: category.status
    });
    setEditingId(category.id!);
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...formData,
      subcategories: formData.subcategories 
        ? formData.subcategories.split(',').map(s => s.trim()).filter(Boolean) 
        : []
    };
    if (editingId) {
      await updateCategory(editingId, payload);
    } else {
      await addCategory(payload);
    }
    setShowModal(false);
    loadCategories();
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    setUploadingImage(true);
    const url = await uploadImageToImgBB(e.target.files[0]);
    if (url) {
      setFormData(prev => ({ ...prev, image: url }));
    } else {
      alert("Image upload failed");
    }
    setUploadingImage(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this category?")) {
      await deleteCategory(id);
      loadCategories();
    }
  };

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Categories Management</h1>
        <button className={styles.addBtn} onClick={openAddModal}>
          <Plus size={20} /> Add Category
        </button>
      </header>

      <div className={styles.tableContainer}>
        {loading ? (
          <p>Loading categories...</p>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Image</th>
                <th>Category Name</th>
                <th>Sub-Categories</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((category) => (
                <tr key={category.id}>
                  <td>
                    {category.image ? <img src={category.image} alt={category.name} style={{ width: '40px', height: '40px', borderRadius: '6px', objectFit: 'cover' }} /> : <div style={{ width: '40px', height: '40px', borderRadius: '6px', background: 'rgba(255,255,255,0.05)' }} />}
                  </td>
                  <td><span className={styles.nameBadge}>{category.name}</span></td>
                  <td>
                    {category.subcategories && category.subcategories.length > 0 
                      ? <span style={{ fontSize: '0.8rem', opacity: 0.8, background: 'rgba(255,255,255,0.05)', padding: '0.2rem 0.6rem', borderRadius: '4px' }}>{category.subcategories.join(', ')}</span> 
                      : <span style={{ fontSize: '0.8rem', opacity: 0.4 }}>None</span>}
                  </td>
                  <td>
                    <span className={`${styles.statusBadge} ${category.status === 'active' ? styles.active : styles.inactive}`}>
                      {category.status === 'active' ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <div className={styles.actions}>
                      <button className={styles.editBtn} onClick={() => openEditModal(category)} aria-label="Edit">
                        <Edit2 size={16} />
                      </button>
                      <button className={styles.deleteBtn} onClick={() => handleDelete(category.id!)} aria-label="Delete">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {categories.length === 0 && (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center' }}>No categories found.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <div className={styles.modalOverlay}>
          <form className={styles.modalContent} onSubmit={handleSave}>
            <h2>{editingId ? 'Edit Category' : 'New Category'}</h2>
            
            <div className={styles.formGroup}>
              <label>Category Image</label>
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
                placeholder="Or paste image URL..."
                style={{ marginTop: '0.5rem' }}
              />
              {formData.image && (
                <img src={formData.image} alt="Preview" style={{ height: '80px', width: '80px', borderRadius: '8px', objectFit: 'cover', marginTop: '1rem' }} />
              )}
            </div>

            <div className={styles.formGroup}>
              <label>Category Name</label>
              <input 
                type="text" 
                value={formData.name} 
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label>Sub-Categories (Comma Separated)</label>
              <input 
                type="text" 
                value={formData.subcategories} 
                onChange={(e) => setFormData({...formData, subcategories: e.target.value})}
                placeholder="e.g. T-Shirts, Pants, Outerwear"
              />
              <small style={{ fontSize: '0.75rem', opacity: 0.6, marginTop: '-0.3rem' }}>
                These will appear as nested filters in the shop sidebar under this category.
              </small>
            </div>

            <div className={styles.formGroup}>
              <label>Status</label>
              <select 
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value as any})}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            <div className={styles.modalActions}>
              <button type="button" className={styles.cancelBtn} onClick={() => setShowModal(false)}>Cancel</button>
              <button type="submit" className={styles.saveBtn}>Save Category</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
