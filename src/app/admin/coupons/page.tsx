"use client";
import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import styles from './CouponsPage.module.css';
import { getCoupons, addCoupon, updateCoupon, deleteCoupon, Coupon } from '@/lib/firebaseUtils';

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    code: '',
    discountType: 'percentage' as 'percentage' | 'fixed',
    discountValue: 0,
    active: true,
    usageLimitType: 'unlimited' as 'single_use' | 'once_per_user' | 'unlimited',
  });

  useEffect(() => {
    loadCoupons();
  }, []);

  const loadCoupons = async () => {
    setLoading(true);
    try {
      const data = await getCoupons();
      setCoupons(data);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const openAddModal = () => {
    setFormData({ code: '', discountType: 'percentage', discountValue: 0, active: true, usageLimitType: 'unlimited' });
    setEditingId(null);
    setShowModal(true);
  };

  const openEditModal = (coupon: Coupon) => {
    setFormData({
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      active: coupon.active,
      usageLimitType: coupon.usageLimitType || 'unlimited'
    });
    setEditingId(coupon.id!);
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      await updateCoupon(editingId, formData);
    } else {
      await addCoupon(formData);
    }
    setShowModal(false);
    loadCoupons();
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this coupon?")) {
      await deleteCoupon(id);
      loadCoupons();
    }
  };

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Coupons Management</h1>
        <button className={styles.addBtn} onClick={openAddModal}>
          <Plus size={20} /> Add Coupon
        </button>
      </header>

      <div className={styles.tableContainer}>
        {loading ? (
          <p>Loading coupons...</p>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Code</th>
                <th>Discount</th>
                <th>Status</th>
                <th>Usage Limit</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {coupons.map((coupon) => (
                <tr key={coupon.id}>
                  <td><span className={styles.codeBadge}>{coupon.code}</span></td>
                  <td className={styles.discount}>
                    {coupon.discountType === 'percentage' ? `${coupon.discountValue}% OFF` : `$${coupon.discountValue} OFF`}
                  </td>
                  <td>
                    <span className={`${styles.statusBadge} ${coupon.active ? styles.active : styles.inactive}`}>
                      {coupon.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <span className={styles.usageBadge}>
                      {coupon.usageLimitType === 'single_use' ? 'Single Use' : 
                       coupon.usageLimitType === 'once_per_user' ? 'Once/User' : 'Unlimited'}
                    </span>
                  </td>
                  <td>
                    <div className={styles.actions}>
                      <button className={styles.editBtn} onClick={() => openEditModal(coupon)} aria-label="Edit">
                        <Edit2 size={16} />
                      </button>
                      <button className={styles.deleteBtn} onClick={() => handleDelete(coupon.id!)} aria-label="Delete">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {coupons.length === 0 && (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center' }}>No coupons found.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <div className={styles.modalOverlay}>
          <form className={styles.modalContent} onSubmit={handleSave}>
            <h2>{editingId ? 'Edit Coupon' : 'New Coupon'}</h2>
            
            <div className={styles.formGroup}>
              <label>Coupon Code</label>
              <input 
                type="text" 
                value={formData.code} 
                onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})}
                required
              />
            </div>
            
            <div className={styles.formGroup}>
              <label>Discount Type</label>
              <select 
                value={formData.discountType}
                onChange={(e) => setFormData({...formData, discountType: e.target.value as any})}
              >
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed Amount ($)</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label>Usage Limit</label>
              <select 
                value={formData.usageLimitType}
                onChange={(e) => setFormData({...formData, usageLimitType: e.target.value as any})}
              >
                <option value="unlimited">Unlimited (All Users)</option>
                <option value="single_use">Single Use (Burned once used by anyone)</option>
                <option value="once_per_user">Once Per User (Each user gets 1 use)</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label>Discount Value</label>
              <input 
                type="number" 
                value={formData.discountValue} 
                onChange={(e) => setFormData({...formData, discountValue: Number(e.target.value)})}
                required
                min="0"
              />
            </div>

            <div className={`${styles.formGroup} ${styles.checkboxGroup}`}>
              <label>Active</label>
              <input 
                type="checkbox" 
                checked={formData.active} 
                onChange={(e) => setFormData({...formData, active: e.target.checked})}
              />
            </div>

            <div className={styles.modalActions}>
              <button type="button" className={styles.cancelBtn} onClick={() => setShowModal(false)}>Cancel</button>
              <button type="submit" className={styles.saveBtn}>Save Coupon</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
