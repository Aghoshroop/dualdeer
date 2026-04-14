"use client";
import React, { useState, useEffect } from 'react';
import { getReactionTestSetting, updateReactionTestSetting, getReactionScoresForCycle, deleteReactionScoreV2, ReactionScoreV2 } from '@/lib/firebaseUtils';
import { Zap, Trash2, Power, RefreshCw, XCircle } from 'lucide-react';
import styles from '../AdminPage.module.css';

export default function AdminReactionTest() {
  const [activeCycleId, setActiveCycleId] = useState<string>('cycle_1');
  const [gameActive, setGameActive] = useState<boolean>(true);
  const [scores, setScores] = useState<ReactionScoreV2[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSettings = async () => {
    setLoading(true);
    const settings = await getReactionTestSetting();
    if (settings) {
      setActiveCycleId(settings.activeCycleId);
      setGameActive(settings.gameActive);
      fetchScores(settings.activeCycleId);
    } else {
      await updateReactionTestSetting({ activeCycleId: 'cycle_1', gameActive: true });
      fetchScores('cycle_1');
    }
  };

  const fetchScores = async (cycle: string) => {
    const data = await getReactionScoresForCycle(cycle);
    setScores(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleToggleGame = async () => {
    const newState = !gameActive;
    await updateReactionTestSetting({ gameActive: newState });
    setGameActive(newState);
  };

  const handleNewCycle = async () => {
    const newCycle = `cycle_${Date.now()}`;
    if (confirm(`Start a new cycle (${newCycle})? This will reset the leaderboard.`)) {
      await updateReactionTestSetting({ activeCycleId: newCycle });
      setActiveCycleId(newCycle);
      fetchScores(newCycle);
    }
  };

  const handleDeleteScore = async (id: string) => {
    if (confirm("Delete this user's score entry?")) {
      await deleteReactionScoreV2(id);
      fetchScores(activeCycleId);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}><Zap size={28} /> Reaction Test Management</h1>
      </div>

      <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '2rem' }}>
        <div style={{ background: 'var(--color-surface)', padding: '1.5rem', borderRadius: '12px', flex: 1, border: '1px solid var(--color-border)' }}>
          <h3 style={{ marginBottom: '1rem', color: 'var(--color-text-muted)' }}>Game Status</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ fontSize: '1.5rem', fontWeight: 800, color: gameActive ? '#10b981' : 'var(--red-500)' }}>
              {gameActive ? 'LIVE' : 'STOPPED'}
            </span>
            <button 
              onClick={handleToggleGame}
              style={{ background: gameActive ? 'var(--red-500)' : '#10b981', color: '#fff', border: 'none', padding: '0.6rem 1.2rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              {gameActive ? <XCircle size={18} /> : <Power size={18} />} {gameActive ? 'Stop Game' : 'Start Game'}
            </button>
          </div>
          <p style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Stopping the game hides gameplay but keeps the leaderboard visible.</p>
        </div>

        <div style={{ background: 'var(--color-surface)', padding: '1.5rem', borderRadius: '12px', flex: 1, border: '1px solid var(--color-border)' }}>
          <h3 style={{ marginBottom: '1rem', color: 'var(--color-text-muted)' }}>Active Cycle</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ fontSize: '1.2rem', fontWeight: 700, fontFamily: 'monospace' }}>
              {activeCycleId}
            </span>
            <button 
              onClick={handleNewCycle}
              style={{ background: 'var(--color-primary)', color: '#fff', border: 'none', padding: '0.6rem 1.2rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <RefreshCw size={18} /> Start New Cycle
            </button>
          </div>
          <p style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Starts a fresh leaderboard. Old scores remain in database.</p>
        </div>
      </div>

      <div style={{ background: 'var(--color-surface)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--color-border)' }}>
        <h2 style={{ marginBottom: '1.5rem' }}>Performances for {activeCycleId}</h2>
        {loading ? <p>Loading...</p> : scores.length === 0 ? <p style={{ color: 'var(--color-text-muted)' }}>No scores for this cycle yet.</p> : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                  <th style={{ padding: '1rem 0' }}>Rank</th>
                  <th style={{ padding: '1rem 0' }}>Athlete Name</th>
                  <th style={{ padding: '1rem 0' }}>Att 1</th>
                  <th style={{ padding: '1rem 0' }}>Att 2</th>
                  <th style={{ padding: '1rem 0' }}>Att 3</th>
                  <th style={{ padding: '1rem 0', color: 'var(--color-primary)' }}>BEST TIME</th>
                  <th style={{ padding: '1rem 0' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {scores.map((s, index) => (
                  <tr key={s.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '1rem 0', fontWeight: 800, color: 'var(--color-text-muted)' }}>#{index + 1}</td>
                    <td style={{ padding: '1rem 0', fontWeight: 600 }}>{s.name}</td>
                    <td style={{ padding: '1rem 0' }}>{s.attempt1 ? s.attempt1 + 'ms' : '-'}</td>
                    <td style={{ padding: '1rem 0' }}>{s.attempt2 ? s.attempt2 + 'ms' : '-'}</td>
                    <td style={{ padding: '1rem 0' }}>{s.attempt3 ? s.attempt3 + 'ms' : '-'}</td>
                    <td style={{ padding: '1rem 0', fontWeight: 800, color: 'var(--color-text)' }}>{s.bestTime}ms</td>
                    <td style={{ padding: '1rem 0' }}>
                      <button onClick={() => handleDeleteScore(s.id!)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--red-500)' }}><Trash2 size={18} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
