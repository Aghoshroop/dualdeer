"use client";
import React, { useEffect, useState } from 'react';
import { getAffiliates, getWithdrawalRequests, approveWithdrawalRequest, Affiliate, WithdrawalRequest } from '@/lib/firebaseUtils';
import { Handshake, RefreshCw, HandCoins, User, CheckCircle } from 'lucide-react';
import styles from './Affiliates.module.css';

export default function AdminAffiliatesPage() {
  const [affiliates, setAffiliates] = useState<Affiliate[]>([]);
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'affiliates' | 'withdrawals'>('withdrawals');
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const [affs, reqs] = await Promise.all([getAffiliates(), getWithdrawalRequests()]);
    setAffiliates(affs);
    setWithdrawals(reqs);
    setLoading(false);
  };

  const handleApprove = async (req: WithdrawalRequest) => {
    if (!req.id) return;
    if (confirm(`Approve ₹${req.amount} for ${req.paymentMethodDetails}? Ensure you have transferred the amount.`)) {
      setProcessingId(req.id);
      try {
        await approveWithdrawalRequest(req.id, req.affiliateId, req.amount);
        // Optimistic update
        setWithdrawals(prev => prev.map(w => w.id === req.id ? { ...w, status: 'paid' } : w));
        setAffiliates(prev => prev.map(a => a.userId === req.affiliateId ? { ...a, totalWithdrawn: (a.totalWithdrawn || 0) + req.amount } : a));
      } catch (e) {
        console.error(e);
        alert("Failed to approve withdrawal.");
      }
      setProcessingId(null);
    }
  };

  if (loading) return <div className={styles.loading}>Decrypting Affiliate Matrix...</div>;

  const pendingWithdrawals = withdrawals.filter(w => w.status === 'pending');

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}><Handshake size={24} style={{ marginRight: '10px' }} /> Affiliates & Payouts</h1>
          <p className={styles.subtitle}>Manage your marketing partners and approve commission withdrawals.</p>
        </div>
        <button onClick={fetchData} className={styles.refreshBtn}>
          <RefreshCw size={16} /> Sync Data
        </button>
      </header>

      <div className={styles.filterBar}>
        <div className={styles.filterGroup}>
          <button 
            className={`${styles.filterBtn} ${activeTab === 'withdrawals' ? styles.activeF : ''}`}
            onClick={() => setActiveTab('withdrawals')}
          >
            Pending Payouts ({pendingWithdrawals.length})
          </button>
          <div className={styles.filterDivider} />
          <button 
            className={`${styles.filterBtn} ${activeTab === 'affiliates' ? styles.activeF : ''}`}
            onClick={() => setActiveTab('affiliates')}
          >
            All Affiliates ({affiliates.length})
          </button>
        </div>
      </div>

      {activeTab === 'withdrawals' && (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Affiliate</th>
                <th>Amount</th>
                <th>Payment Info (UPI)</th>
                <th>Date Requested</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {withdrawals.length === 0 ? (
                <tr>
                  <td colSpan={6} className={styles.emptyState}>
                     <HandCoins size={48} className={styles.emptyIcon} />
                     <h2>No Withdrawals</h2>
                     <p>There are no withdrawal requests at the moment.</p>
                  </td>
                </tr>
              ) : withdrawals.map(w => {
                const affiliate = affiliates.find(a => a.userId === w.affiliateId);
                return (
                  <tr key={w.id}>
                    <td>
                      <div className={styles.clientInfo}>
                        <span className={styles.clientName}>{affiliate ? affiliate.name : 'Unknown User'}</span>
                        <span className={styles.clientContact}>Code: {affiliate ? affiliate.code : 'N/A'}</span>
                      </div>
                    </td>
                    <td>
                      <span className={styles.revenueCol}>₹{w.amount}</span>
                    </td>
                    <td>
                      <span style={{ fontFamily: 'monospace', color: 'var(--color-primary)', fontSize: '0.9rem' }}>{w.paymentMethodDetails}</span>
                    </td>
                    <td>
                      <span className={styles.timeLabel}>{w.createdAt?.toDate ? w.createdAt.toDate().toLocaleString() : 'N/A'}</span>
                    </td>
                    <td>
                      <div className={`${styles.statusBadge} ${w.status === 'paid' ? styles.delivered : w.status === 'pending' ? styles.processing : ''}`}>
                         {w.status.toUpperCase()}
                      </div>
                    </td>
                    <td>
                      {w.status === 'pending' && (
                        <button 
                          className={styles.refreshBtn}
                          style={{ borderColor: '#00ffcc', color: '#00ffcc' }}
                          onClick={() => handleApprove(w)}
                          disabled={processingId === w.id}
                        >
                          {processingId === w.id ? 'Approving...' : <><CheckCircle size={14} /> Mark Paid</>}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'affiliates' && (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Partner Name</th>
                <th>Coupon Code</th>
                <th>Available Balance</th>
                <th>Total Paid Out</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {affiliates.length === 0 ? (
                <tr>
                  <td colSpan={5} className={styles.emptyState}>
                     <User size={48} className={styles.emptyIcon} />
                     <h2>No Affiliates Yet</h2>
                     <p>When users join the program, they will appear here.</p>
                  </td>
                </tr>
              ) : affiliates.map(a => (
                <tr key={a.id}>
                  <td>
                    <span className={styles.clientName}>{a.name}</span>
                  </td>
                  <td>
                    <span className={styles.traceCode}>{a.code}</span>
                  </td>
                  <td>
                    <span className={styles.revenueCol} style={{ color: '#00ffcc' }}>₹{a.earnings || 0}</span>
                  </td>
                  <td>
                    <span className={styles.revenueCol} style={{ color: '#94a3b8' }}>₹{a.totalWithdrawn || 0}</span>
                  </td>
                  <td>
                    <div className={`${styles.statusBadge} ${styles.delivered}`}>
                       ACTIVE
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
