"use client";

import React, { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { checkInWishlist, addToWishlist, removeFromWishlist } from '@/lib/firebaseUtils';
import { useAuthToast } from '@/context/AuthToastContext';

interface WishlistButtonProps {
  productId: string;
  className?: string;
  size?: number;
}

// Optional sound effect function
const playInteractionSound = () => {
  if (typeof window === 'undefined') return;
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(200, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.15);
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.15);
  } catch(e) {}
};

export default function WishlistButton({ productId, className = "", size = 18 }: WishlistButtonProps) {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [wishlistRecordId, setWishlistRecordId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { showAuthToast } = useAuthToast();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user && productId) {
        try {
          const wid = await checkInWishlist(user.uid, productId);
          if (wid) {
            setIsInWishlist(true);
            setWishlistRecordId(wid);
          } else {
            setIsInWishlist(false);
            setWishlistRecordId(null);
          }
        } catch (e) {
          console.error("Error checking wishlist", e);
        }
      } else {
        setIsInWishlist(false);
        setWishlistRecordId(null);
      }
    });

    return () => unsubscribe();
  }, [productId]);

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!currentUser) {
      showAuthToast("Please log in to add items to your wishlist.");
      return;
    }

    if (isLoading) return;
    setIsLoading(true);
    playInteractionSound();

    try {
      if (isInWishlist && wishlistRecordId) {
        // Optimistic UI update
        setIsInWishlist(false);
        await removeFromWishlist(wishlistRecordId);
        setWishlistRecordId(null);
      } else {
        // Optimistic UI update
        setIsInWishlist(true);
        await addToWishlist(currentUser.uid, productId);
        const newId = await checkInWishlist(currentUser.uid, productId);
        if (newId) {
          setWishlistRecordId(newId);
        }
      }
    } catch (error) {
      console.error("Failed to toggle wishlist", error);
      // Revert on error
      setIsInWishlist(!isInWishlist); 
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button 
      className={className} 
      onClick={handleToggle}
      disabled={isLoading}
      aria-label="Toggle Wishlist"
      style={{
        background: 'none',
        border: 'none',
        cursor: isLoading ? 'wait' : 'pointer',
        padding: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: isLoading ? 0.7 : 1,
        transition: 'all 0.2s ease'
      }}
    >
      <Heart 
        size={size} 
        fill={isInWishlist ? '#ef4444' : 'none'} 
        color={isInWishlist ? '#ef4444' : 'currentColor'} 
        style={{ transition: 'all 0.2s ease', transform: isInWishlist ? 'scale(1.1)' : 'scale(1)' }}
      />
    </button>
  );
}
