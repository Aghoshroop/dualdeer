import { collection, doc, getDocs, getDoc, addDoc, updateDoc, deleteDoc, setDoc, query, where, Timestamp, orderBy, limit, runTransaction } from 'firebase/firestore';
import { db } from './firebase';

// ========================
// Types
// ========================

export interface ContentBlock {
  id?: string;
  title: string;
  body: string;
  mediaType?: 'image' | 'video';
  imageUrl?: string;
  videoUrl?: string;
  ctaText?: string;
  ctaLink?: string;
}

export interface Product {
  id?: string;
  slug?: string;
  pastSlugs?: string[];
  name: string;
  description?: string;
  sizes?: string[];
  sizeUnits?: Record<string, number>;
  category: string;
  subcategory?: string;
  price: number;
  mrp?: number;
  priceUSD?: number;
  mrpUSD?: number;
  rating?: number;
  image: string;
  images?: string[];
  stock: number;
  isSeasonal?: boolean;
  isNew?: boolean;
  isPremium?: boolean;
  colors?: string[];
  status?: 'active' | 'deleted';
  createdAt?: Timestamp;
  isSoldOut?: boolean;
}

export interface UpcomingProduct extends Omit<Product, 'stock' | 'status' | 'isSoldOut' | 'sizes' | 'colors'> {
  launchDate?: string;
  comingSoon: true;
  notifyCount: number;
}

export interface ProductNotification {
  id?: string;
  productId: string;
  userId: string;
  email: string;
  status: 'waiting' | 'sent';
  createdAt: Timestamp;
}

export interface Review {
  id?: string;
  productId: string;
  userName: string;
  userAvatar?: string;
  userId?: string;
  rating: number; // 1-5
  text: string;
  date: Timestamp;
  image?: string;
}

export interface Category {
  id?: string;
  name: string;
  subcategories?: string[];
  image?: string;
  status: 'active' | 'inactive';
  createdAt?: Timestamp;
}

export interface Banner {
  id?: string;
  title: string;
  mediaType?: 'image' | 'video'; // defaults to 'image' if undefined
  image: string; // desktop image
  mobileImage?: string;
  desktopVideo?: string;
  mobileVideo?: string;
  link?: string; // Kept for backwards compatibility, but use ctaLink instead when provided
  ctaLink?: string;
  showCta?: boolean;
  order?: number;
  active: boolean;
  deleted?: boolean;
  deletedAt?: Timestamp;
  createdAt?: Timestamp;
}

export interface Coupon {
  id?: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  active: boolean;
  isPublic?: boolean;
  usageLimitType?: 'single_use' | 'once_per_user' | 'unlimited';
  applyTo?: 'total_cart' | 'first_item';
  usedBy?: string[];
  affiliateId?: string; // Optional link to an affiliate
  createdAt?: Timestamp;
}

export interface Affiliate {
  id?: string;
  userId: string;
  name: string;
  code: string;
  earnings: number; // Available balance
  pendingEarnings: number; // Commission waiting for delivery
  totalWithdrawn: number;
  pendingWithdrawal?: number;
  status: 'active' | 'suspended';
  createdAt?: Timestamp;
}

export interface WithdrawalRequest {
  id?: string;
  affiliateId: string;
  amount: number;
  paymentMethodDetails: string; // e.g., UPI ID
  status: 'pending' | 'approved' | 'paid' | 'rejected';
  createdAt?: Timestamp;
}

export interface OrderItem {
  productId: string;
  slug?: string;
  name: string;
  mrp: number;
  pricePaid: number;
  quantity: number;
  size?: string;
  image?: string;
}

export interface TrackingStage {
  stage: string;
  status: 'pending' | 'active' | 'completed';
  timestamp?: any;
  note?: string;
}

export interface OwnedGear {
  id?: string;
  userId: string;
  productId: string;
  orderId: string;
  name: string;
  size?: string;
  image?: string;
  originalPrice: number;
  purchaseDate: Timestamp;
  status: 'active' | 'retired' | 'replaced' | 'returned';
  gearHealth: 'new' | 'excellent' | 'good' | 'worn' | 'retired';
  passportId: string; // Unique Serial/Passport ID
  productVersion?: string;
  manufacturingBatch?: string;
}

export interface GearEvent {
  id?: string;
  ownedGearId: string;
  userId: string;
  type: 'purchased' | 'delivered' | 'warranty_activated' | 'care_guide_viewed' | 'care_reminder_sent' | 'review_submitted' | 'exchange_requested' | 'warranty_claim' | 'health_updated' | 'usage_logged';
  description: string;
  timestamp: Timestamp;
}

export interface WarrantyRecord {
  id?: string;
  ownedGearId: string;
  userId: string;
  status: 'active' | 'expired' | 'claimed' | 'voided';
  activationDate: Timestamp;
  expirationDate: Timestamp;
  coverageDetails: string;
  claimHistory?: { date: Timestamp, reason: string, status: string }[];
}

export interface CareReminder {
  id?: string;
  ownedGearId: string;
  userId: string;
  message: string;
  type: 'wash' | 'inspect' | 'store';
  status: 'active' | 'dismissed' | 'snoozed';
  createdAt: Timestamp;
  snoozedUntil?: Timestamp;
}

export interface TrackingInfo {
  courier?: string;
  trackingNumber?: string;
  estimatedDelivery?: any;
  stages: TrackingStage[];
}

export interface Order {
  id?: string;
  userId: string;
  shippingDetails?: {
    name: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    zip: string;
    country?: string;
  };
  items: OrderItem[];
  total: number;
  discountAmount?: number;
  appliedCoupon?: string;
  status: 'payment_pending' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'cancellation_requested' | 'cancelled' | 'return_requested' | 'return_approved' | 'return_picked_up' | 'returned';
  tracking?: TrackingInfo;
  affiliateId?: string;
  affiliateCommission?: number;
  cancellationReason?: string;
  returnReason?: string;
  paymentMethod?: string;
  utrNumber?: string;
  currency?: string;
  exchangeRate?: number;
  stripeInvoiceId?: string;
  stripeStatus?: string;
  shiprocketSyncStatus?: 'pending' | 'synced' | 'failed';
  shiprocketOrderId?: string;
  razorpay?: {
    orderId?: string;
    paymentId?: string;
    paymentLinkId?: string;
    qrId?: string;
    status?: string;
    amount?: number;
    currency?: string;
    method?: string;
    webhookEvent?: string;
    signature?: string;
    createdAt?: any;
    paidAt?: any;
    expiresAt?: any;
  };
  createdAt?: any;
  updatedAt?: any;
}

// ========================
// Generic Helper
// ========================

const getCollectionData = async <T>(collectionName: string): Promise<T[]> => {
  const querySnapshot = await getDocs(collection(db, collectionName));
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as T));
};

const addDocument = async (collectionName: string, data: any) => {
  const docRef = await addDoc(collection(db, collectionName), {
    ...data,
    createdAt: Timestamp.now(),
  });
  return docRef.id;
};

const updateDocument = async (collectionName: string, id: string, data: any) => {
  const docRef = doc(db, collectionName, id);
  await updateDoc(docRef, data);
};

const deleteDocument = async (collectionName: string, id: string) => {
  const docRef = doc(db, collectionName, id);
  await deleteDoc(docRef);
};

// ========================
// Products
// ========================
export const getProducts = async (): Promise<Product[]> => {
  const all = await getCollectionData<Product>('products');
  return all.filter(p => p.status !== 'deleted').map(p => ({...p, slug: p.slug || p.id}));
};

export const getDeletedProducts = async (): Promise<Product[]> => {
  const all = await getCollectionData<Product>('products');
  return all.filter(p => p.status === 'deleted').map(p => ({...p, slug: p.slug || p.id}));
};

export const getProduct = async (id: string): Promise<Product | null> => {
  try {
    const docSnap = await getDoc(doc(db, 'products', id));
    if (docSnap.exists()) {
      const data = { id: docSnap.id, ...docSnap.data() } as Product;
      return { ...data, slug: data.slug || data.id };
    }
  } catch(e) {
    console.error("Error fetching single product", e);
  }
  return null;
};

export const getProductBySlug = async (slug: string): Promise<Product | null> => {
  try {
    const q = query(collection(db, 'products'), where('slug', '==', slug), limit(1));
    const snap = await getDocs(q);
    if (!snap.empty) {
      return { id: snap.docs[0].id, ...snap.docs[0].data() } as Product;
    }
    
    // Fallback: Check past slugs for backward compatibility
    const qPast = query(collection(db, 'products'), where('pastSlugs', 'array-contains', slug), limit(1));
    const snapPast = await getDocs(qPast);
    if (!snapPast.empty) {
      return { id: snapPast.docs[0].id, ...snapPast.docs[0].data() } as Product;
    }
  } catch(e) {
    console.error("Error fetching single product by slug", e);
  }
  return null;
};

export const generateSlug = (name: string): string => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

export const getUniqueSlug = async (baseSlug: string, excludeId?: string): Promise<string> => {
  let uniqueSlug = baseSlug;
  let counter = 2;
  let isUnique = false;

  while (!isUnique) {
    const q = query(collection(db, 'products'), where('slug', '==', uniqueSlug), limit(1));
    const snap = await getDocs(q);
    
    if (snap.empty || (excludeId && snap.docs[0].id === excludeId)) {
      isUnique = true;
    } else {
      uniqueSlug = `${baseSlug}-${counter}`;
      counter++;
    }
  }
  return uniqueSlug;
};


export const addProduct = async (data: Omit<Product, 'id'>) => {
  let finalSlug = data.slug;
  if (!finalSlug) {
    const baseSlug = generateSlug(data.name);
    finalSlug = await getUniqueSlug(baseSlug);
  }
  return addDocument('products', { ...data, slug: finalSlug, status: 'active' });
};

export const updateProduct = async (id: string, data: Partial<Product>) => {
  let finalSlug = data.slug;
  if (data.name && !finalSlug) {
    const baseSlug = generateSlug(data.name);
    finalSlug = await getUniqueSlug(baseSlug, id);
    data.slug = finalSlug;
  }
  
  const currentProduct = await getProduct(id);
  if (currentProduct && data.slug && currentProduct.slug !== data.slug) {
    const pastSlugs = currentProduct.pastSlugs || [];
    if (currentProduct.slug && currentProduct.slug !== id && !pastSlugs.includes(currentProduct.slug)) {
      pastSlugs.push(currentProduct.slug);
    }
    data.pastSlugs = pastSlugs;
  }
  
  return updateDocument('products', id, data);
};

// Soft delete
export const deleteProduct = async (id: string) => {
  await updateDocument('products', id, { status: 'deleted' });
};

// Permanent delete
export const hardDeleteProduct = async (id: string) => deleteDocument('products', id);

export const restoreProduct = async (id: string, data?: Product) => {
  await updateDocument('products', id, { status: 'active' });
};

// ========================
// Product Notifications
// ========================
export const addProductNotification = async (productId: string, userId: string, email: string) => {
  return addDocument('product_notifications', {
    productId,
    userId,
    email,
    status: 'waiting',
    createdAt: Timestamp.now()
  });
};

export const getProductNotifications = async (): Promise<ProductNotification[]> => {
  try {
    const q = query(collection(db, 'product_notifications'), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ProductNotification));
  } catch(e) {
    console.error("Error fetching product notifications", e);
    return [];
  }
};

export const checkIfAlreadyNotified = async (productId: string, email: string): Promise<boolean> => {
  try {
    const q = query(
      collection(db, 'product_notifications'), 
      where('productId', '==', productId),
      where('email', '==', email)
    );
    const snap = await getDocs(q);
    return !snap.empty;
  } catch(e) {
    console.error("Error checking notification status", e);
    return false;
  }
};

// ========================
// Reviews
// ========================
export const getReviews = async (productId: string): Promise<Review[]> => {
  try {
    const q = query(collection(db, 'reviews'), where('productId', '==', productId));
    const querySnapshot = await getDocs(q);
    const reviews = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Review));
    // Sort descending by date locally
    return reviews.sort((a, b) => b.date.toMillis() - a.date.toMillis());
  } catch(e) {
    console.error("Error fetching reviews", e);
    return [];
  }
};

export const getAllSiteReviews = async (): Promise<Review[]> => {
  try {
    const q = query(collection(db, 'reviews'), orderBy('date', 'desc'), limit(15));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Review));
  } catch(e) {
    console.error("Error fetching all reviews", e);
    return [];
  }
};
export const addReview = async (review: Omit<Review, 'id' | 'date'>) => {
  const docRef = await addDoc(collection(db, 'reviews'), {
    ...review,
    date: Timestamp.now()
  });
  return docRef.id;
};

export const updateReview = async (id: string, data: Partial<Review>) => {
  return updateDocument('reviews', id, data);
};

export const deleteReview = async (id: string) => {
  return deleteDocument('reviews', id);
};

// ========================
// Categories
// ========================
export const getCategories = () => getCollectionData<Category>('categories');
export const addCategory = (data: Omit<Category, 'id'>) => addDocument('categories', data);
export const updateCategory = (id: string, data: Partial<Category>) => updateDocument('categories', id, data);
export const deleteCategory = (id: string) => deleteDocument('categories', id);

// ========================
// Banners
// ========================
export const getBanners = () => getCollectionData<Banner>('banners');
export const addBanner = (data: Omit<Banner, 'id'>) => addDocument('banners', data);
export const updateBanner = (id: string, data: Partial<Banner>) => updateDocument('banners', id, data);
export const deleteBanner = (id: string) => deleteDocument('banners', id);

// ========================
// Coupons
// ========================
export const getCoupons = () => getCollectionData<Coupon>('coupons');
export const addCoupon = (data: Omit<Coupon, 'id'>) => addDocument('coupons', data);
export const updateCoupon = (id: string, data: Partial<Coupon>) => updateDocument('coupons', id, data);
export const deleteCoupon = (id: string) => deleteDocument('coupons', id);

export const validateCoupon = async (code: string, userId?: string): Promise<Coupon | null> => {
  const q = query(collection(db, 'coupons'), where('code', '==', code.trim().toUpperCase()), where('active', '==', true));
  const querySnapshot = await getDocs(q);
  
  if (querySnapshot.empty) {
    return null;
  }
  
  const coupon = { id: querySnapshot.docs[0].id, ...querySnapshot.docs[0].data() } as Coupon;
  
  if (coupon.usageLimitType === 'once_per_user') {
    if (!userId) {
      throw new Error('You must be logged in to use this coupon.');
    }
    if (coupon.usedBy && coupon.usedBy.includes(userId)) {
      throw new Error('You have already used this coupon.');
    }
  }

  return coupon;
};

// ========================
// Users CRM & Subscribers
// ========================
export const getUsers = async () => {
  const querySnapshot = await getDocs(collection(db, 'users'));
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const getSubscribers = async () => {
  const querySnapshot = await getDocs(collection(db, 'subscribers'));
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const addSubscriber = async (email: string) => {
  return addDocument('subscribers', { email });
};

// ========================
// Orders
// ========================
export const getUserOrders = async (userId: string): Promise<Order[]> => {
  const q = query(collection(db, 'orders'), where('userId', '==', userId));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
};

export const getAllOrders = async (): Promise<Order[]> => {
  const querySnapshot = await getDocs(collection(db, 'orders'));
  const orders = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
  // Sort descending by creation date if available
  return orders.sort((a, b) => {
    if (a.createdAt && b.createdAt) return b.createdAt.toMillis() - a.createdAt.toMillis();
    return 0;
  });
};

export const createOrder = async (orderData: Omit<Order, 'id'>) => {
  return addDocument('orders', orderData);
};

export const updateOrder = async (id: string, data: Partial<Order> | Record<string, any>) => {
  return updateDocument('orders', id, data);
};

export const deleteOrder = async (id: string) => {
  return deleteDocument('orders', id);
};
export const getOrder = async (id: string): Promise<Order | null> => {
  try {
    const docSnap = await getDoc(doc(db, 'orders', id));
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Order;
    }
  } catch(e) {
    console.error("Error fetching single order", e);
  }
  return null;
};

// ========================
// Inventory Management
// ========================
export const reserveInventory = async (items: OrderItem[]) => {
  try {
    await runTransaction(db, async (transaction) => {
      // First, read all product documents to ensure we have enough stock
      const productRefs = items.map(item => doc(db, 'products', item.productId));
      const productDocs = await Promise.all(productRefs.map(ref => transaction.get(ref)));
      
      const updates = [];
      
      for (let i = 0; i < productDocs.length; i++) {
        const pDoc = productDocs[i];
        if (!pDoc.exists()) {
          throw new Error(`Product ${items[i].productId} does not exist`);
        }
        
        const data = pDoc.data();
        const requestedQuantity = items[i].quantity;
        const currentStock = data.stock || 0;
        
        if (currentStock < requestedQuantity) {
          throw new Error(`Insufficient stock for ${data.name}`);
        }
        
        updates.push({
          ref: pDoc.ref,
          newStock: currentStock - requestedQuantity
        });
      }
      
      // If we got here, all products have enough stock. Perform the updates.
      for (const update of updates) {
        transaction.update(update.ref, { stock: update.newStock });
      }
    });
    return true;
  } catch (e) {
    console.error("Error reserving inventory:", e);
    throw e;
  }
};

export const releaseInventory = async (items: OrderItem[]) => {
  try {
    await runTransaction(db, async (transaction) => {
      const productRefs = items.map(item => doc(db, 'products', item.productId));
      const productDocs = await Promise.all(productRefs.map(ref => transaction.get(ref)));
      
      const updates = [];
      
      for (let i = 0; i < productDocs.length; i++) {
        const pDoc = productDocs[i];
        if (pDoc.exists()) {
          const data = pDoc.data();
          const quantityToRestore = items[i].quantity;
          updates.push({
            ref: pDoc.ref,
            newStock: (data.stock || 0) + quantityToRestore
          });
        }
      }
      
      for (const update of updates) {
        transaction.update(update.ref, { stock: update.newStock });
      }
    });
    return true;
  } catch (e) {
    console.error("Error releasing inventory:", e);
    return false;
  }
};

// ========================
// CMS Content Blocks
// ========================
export const getContentBlocks = () => getCollectionData<ContentBlock>('content');

export const getContentBlock = async (id: string): Promise<ContentBlock | null> => {
  try {
    const docSnap = await getDoc(doc(db, 'content', id));
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as ContentBlock;
    }
  } catch (e) {
    console.error("Error fetching content block", e);
  }
  return null;
};

export const updateContentBlock = async (id: string, data: Partial<ContentBlock>) => {
  const docRef = doc(db, 'content', id);
  await setDoc(docRef, data, { merge: true }); // setDoc merge creates it safely if it doesn't exist
};

// ========================
// Wishlist
// ========================
export interface WishlistItem {
  id?: string;
  userId: string;
  productId: string;
  createdAt?: Timestamp;
}

export const getWishlist = async (userId: string): Promise<WishlistItem[]> => {
  const q = query(collection(db, 'wishlists'), where('userId', '==', userId));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as WishlistItem));
};

export const addToWishlist = async (userId: string, productId: string) => {
  return addDocument('wishlists', {
    userId,
    productId,
    createdAt: Timestamp.now()
  });
};

export const removeFromWishlist = async (id: string) => {
  return deleteDocument('wishlists', id);
};

export const checkInWishlist = async (userId: string, productId: string): Promise<string | null> => {
  const q = query(collection(db, 'wishlists'), where('userId', '==', userId), where('productId', '==', productId));
  const querySnapshot = await getDocs(q);
  if (!querySnapshot.empty) {
    return querySnapshot.docs[0].id;
  }
  return null;
};

// ========================
// AI Global Brain (Cross-Device Memory)
// ========================
export interface AIMemory {
  id?: string;
  userId: string;
  userName: string;
  context: string;
  lastInteraction: Timestamp;
}

export const getAIMemory = async (userId: string): Promise<AIMemory | null> => {
  try {
    const q = query(collection(db, 'ai_memory'), where('userId', '==', userId));
    const snap = await getDocs(q);
    if (!snap.empty) {
      return { id: snap.docs[0].id, ...snap.docs[0].data() } as AIMemory;
    }
  } catch (e) {
    console.error("AI Brain read error:", e);
  }
  return null;
};

export const updateAIMemory = async (userId: string, userName: string, newContext: string) => {
  try {
    const existing = await getAIMemory(userId);
    if (existing && existing.id) {
      // Keep memory bounded to avoid massive strings. Extract latest keywords or just append cleanly.
      const updatedContext = (existing.context + " | " + newContext).slice(-2000); // keep last 2000 chars of brain data
      await updateDocument('ai_memory', existing.id, {
        context: updatedContext,
        lastInteraction: Timestamp.now()
      });
    } else {
      await addDocument('ai_memory', {
        userId,
        userName,
        context: newContext,
        lastInteraction: Timestamp.now()
      });
    }
  } catch (e) {
    console.error("AI Brain write error:", e);
  }
};

// ========================
// AI Global Knowledge Base (V2 STRUCTURED GRAPH)
// ========================
export interface KnowledgeNode {
  id?: string;
  subject: string;
  relation: string;
  object: string;
  confidence: number;
  sources: number;
  contradictions?: string[];
  createdAt?: Timestamp;
}

export const getGlobalKnowledgeV2 = async (): Promise<KnowledgeNode[]> => {
  try {
    const q = query(collection(db, 'global_knowledge_v2'), orderBy('confidence', 'desc'), limit(500));
    const snap = await getDocs(q);
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as KnowledgeNode));
  } catch (e) {
    console.error("Global Knowledge V2 read error:", e);
    return [];
  }
};

export const addGlobalKnowledgeV2 = async (node: KnowledgeNode) => {
  try {
    await addDoc(collection(db, 'global_knowledge_v2'), {
      ...node,
      createdAt: Timestamp.now()
    });
  } catch (e) {
    console.error("Global Knowledge V2 write error:", e);
  }
};

export const updateKnowledgeConfidence = async (id: string, newConfidence: number, incrementSource: boolean) => {
  try {
    const docRef = doc(db, 'global_knowledge_v2', id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
       const data = docSnap.data();
       await updateDoc(docRef, {
          confidence: newConfidence,
          sources: incrementSource ? (data.sources || 1) + 1 : data.sources
       });
    }
  } catch(e) {
    console.error("Knowledge update error", e);
  }
}

// ========================
// AI User Memory (Preferences & Context)
// ========================
export interface UserMemoryV2 {
  id?: string;
  userId: string;
  preferences: string[];
  pastQueries: string[];
  lastUpdated: Timestamp;
}

export const getUserMemoryV2 = async (userId: string): Promise<UserMemoryV2 | null> => {
   try {
     const q = query(collection(db, 'user_memory'), where('userId', '==', userId));
     const snap = await getDocs(q);
     if (!snap.empty) {
       return { id: snap.docs[0].id, ...snap.docs[0].data() } as UserMemoryV2;
     }
   } catch(e) {}
   return null;
}

export const updateUserMemoryV2 = async (userId: string, prefsToAdd: string[], queryToAdd: string) => {
   try {
     const existing = await getUserMemoryV2(userId);
     if (existing && existing.id) {
        const newPrefs = Array.from(new Set([...existing.preferences, ...prefsToAdd])).slice(-10);
        const newQueries = [...existing.pastQueries, queryToAdd].slice(-20);
        await updateDoc(doc(db, 'user_memory', existing.id), {
           preferences: newPrefs,
           pastQueries: newQueries,
           lastUpdated: Timestamp.now()
        });
     } else {
        await addDoc(collection(db, 'user_memory'), {
           userId,
           preferences: prefsToAdd,
           pastQueries: [queryToAdd],
           lastUpdated: Timestamp.now()
        });
     }
   } catch(e) {}
}

// ========================
// Reaction Test Leaderboard
// ========================
export interface ReactionScore {
  id?: string;
  name: string;
  sport?: string;
  reactionTime: number; // in milliseconds
  createdAt?: Timestamp;
}

export const getReactionLeaderboard = async (): Promise<ReactionScore[]> => {
  try {
    const q = query(collection(db, 'reaction_leaderboard'), orderBy('reactionTime', 'asc'), limit(50));
    const snap = await getDocs(q);
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as ReactionScore));
  } catch (e) {
    console.error("Leaderboard read error:", e);
    return [];
  }
};

export const submitReactionScore = async (score: Omit<ReactionScore, 'id'>) => {
  try {
    await addDoc(collection(db, 'reaction_leaderboard'), {
      ...score,
      createdAt: Timestamp.now()
    });
  } catch (e) {
    console.error("Leaderboard write error:", e);
  }
};

// ========================
// Reaction Test V2 (Auth + Tap)
// ========================
export interface ReactionTestSetting {
  id?: string;
  gameActive: boolean;
  activeCycleId: string;
  updatedAt?: Timestamp;
}

export interface ReactionScoreV2 {
  id?: string;
  userId: string;
  name: string;
  attempt1?: number | null;
  attempt2?: number | null;
  attempt3?: number | null;
  bestTime: number;
  cycleId: string;
  createdAt?: Timestamp;
}

export const getReactionTestSetting = async (): Promise<ReactionTestSetting | null> => {
  try {
    const docSnap = await getDoc(doc(db, 'settings', 'reactionTest'));
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as ReactionTestSetting;
    }
  } catch (e) {
    console.error("Settings read error:", e);
  }
  return null;
};

export const updateReactionTestSetting = async (data: Partial<ReactionTestSetting>) => {
  try {
    await setDoc(doc(db, 'settings', 'reactionTest'), {
      ...data,
      updatedAt: Timestamp.now()
    }, { merge: true });
  } catch (e) {
    console.error("Settings write error:", e);
  }
};

export const getUserReactionScore = async (userId: string, cycleId: string): Promise<ReactionScoreV2 | null> => {
  try {
    const q = query(
      collection(db, 'reaction_scores_v2'),
      where('userId', '==', userId),
      where('cycleId', '==', cycleId)
    );
    const snap = await getDocs(q);
    if (!snap.empty) {
      return { id: snap.docs[0].id, ...snap.docs[0].data() } as ReactionScoreV2;
    }
  } catch (e) {
    console.error("Score read error:", e);
  }
  return null;
};

export const getReactionScoresForCycle = async (cycleId: string): Promise<ReactionScoreV2[]> => {
  try {
    const q = query(
      collection(db, 'reaction_scores_v2'),
      where('cycleId', '==', cycleId),
      orderBy('bestTime', 'asc')
    );
    const snap = await getDocs(q);
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as ReactionScoreV2));
  } catch (e) {
    console.error("Leaderboard read error:", e);
    return [];
  }
};

export const submitReactionScoreV2 = async (score: Omit<ReactionScoreV2, 'id' | 'createdAt'>) => {
  try {
    await addDoc(collection(db, 'reaction_scores_v2'), {
      ...score,
      createdAt: Timestamp.now()
    });
  } catch (e) {
    console.error("Score write error:", e);
  }
};

export const deleteReactionScoreV2 = async (id: string) => {
  try {
    await deleteDoc(doc(db, 'reaction_scores_v2', id));
  } catch (e) {
    console.error("Score delete error:", e);
  }
};


// ========================
// Global Notifications
// ========================
export interface AdminUser {
  id?: string;
  email: string;
  name?: string;
  role: 'super_admin' | 'admin' | 'manager';
  createdAt?: Timestamp;
}

export interface QueuedEmail {
  id?: string;
  to: string;
  subject: string;
  html: string;
  status: 'pending' | 'sent' | 'failed';
  retryCount: number;
  error?: string;
  createdAt?: Timestamp;
  lastAttempt?: Timestamp;
}

export interface AppNotification {
  id?: string;
  title: string;
  message: string;
  url?: string;
  active: boolean;
  createdAt?: Timestamp;
}

export const getActiveNotifications = async (): Promise<AppNotification[]> => {
  try {
    const q = query(collection(db, 'notifications'), where('active', '==', true), orderBy('createdAt', 'desc'), limit(10));
    const snap = await getDocs(q);
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as AppNotification));
  } catch (e) {
    console.error("Notifications read error:", e);
    return [];
  }
};

export const getAllNotifications = async (): Promise<AppNotification[]> => {
  try {
    const q = query(collection(db, 'notifications'), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as AppNotification));
  } catch (e) {
    console.error("Notifications read error:", e);
    return [];
  }
}

export const addNotification = async (notif: Omit<AppNotification, 'id' | 'createdAt'>) => {
  try {
    await addDoc(collection(db, 'notifications'), {
      ...notif,
      createdAt: Timestamp.now()
    });
  } catch (e) {
    console.error("Notification write error:", e);
  }
};

export const updateNotification = async (id: string, data: Partial<AppNotification>) => {
  try {
    await updateDoc(doc(db, 'notifications', id), data);
  } catch (e) {
    console.error("Notification update error:", e);
  }
};

export const deleteNotification = async (id: string) => {
  try {
    await deleteDoc(doc(db, 'notifications', id));
  } catch (e) {
    console.error("Notification delete error:", e);
  }
};

// ========================
// Chat System
// ========================
export interface ChatMessage {
  id?: string;
  userId: string;
  text: string;
  sender: 'admin' | 'user';
  readByAdmin: boolean;
  readByUser: boolean;
  createdAt: Timestamp;
}

export const getChatMessages = async (userId: string): Promise<ChatMessage[]> => {
  try {
    const q = query(collection(db, 'chats'), where('userId', '==', userId));
    const snap = await getDocs(q);
    const msgs = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as ChatMessage));
    return msgs.sort((a, b) => {
      const timeA = (a.createdAt as any)?.toMillis ? (a.createdAt as any).toMillis() : a.createdAt;
      const timeB = (b.createdAt as any)?.toMillis ? (b.createdAt as any).toMillis() : b.createdAt;
      return Number(timeA) - Number(timeB); // asc
    });
  } catch (e) {
    console.error("Chat read error:", e);
    return [];
  }
};

export const sendChatMessage = async (userId: string, text: string, sender: 'admin' | 'user') => {
  try {
    await addDoc(collection(db, 'chats'), {
      userId,
      text,
      sender,
      readByAdmin: sender === 'admin',
      readByUser: sender === 'user',
      createdAt: Timestamp.now()
    });
  } catch (e) {
    console.error("Chat write error:", e);
  }
};

export const markMessagesAsRead = async (userId: string, reader: 'admin' | 'user') => {
  try {
    const q = query(collection(db, 'chats'), where('userId', '==', userId), where(reader === 'admin' ? 'readByAdmin' : 'readByUser', '==', false));
    const snap = await getDocs(q);
    
    const updates = snap.docs.map(docSnap => 
      updateDoc(doc(db, 'chats', docSnap.id), {
        [reader === 'admin' ? 'readByAdmin' : 'readByUser']: true
      })
    );
    await Promise.all(updates);
  } catch (e) {
    console.error("Chat mark read error:", e);
  }
};

// ========================
// Videos
// ========================

export interface Video {
  id?: string;
  title: string;
  description: string;
  category: string;
  videoUrl: string;
  publicId: string;
  productId?: string; // Optional linkage to specific product
  createdAt: Timestamp;
}

export const getVideos = () => getCollectionData<Video>('videos');

export const getVideosByCategory = async (category: string): Promise<Video[]> => {
  const q = query(collection(db, 'videos'), where('category', '==', category));
  const querySnapshot = await getDocs(q);
  const data: Video[] = [];
  querySnapshot.forEach((doc) => {
    data.push({ id: doc.id, ...doc.data() } as Video);
  });
  // Sort by createdAt client-side to avoid needing a composite index if not present
  return data.sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis());
};

export const addVideo = (data: Omit<Video, 'id'>) => addDocument('videos', data);
export const deleteVideo = (id: string) => deleteDocument('videos', id);

const RESERVED_PREFIXES = [
  'DUALDEER', 'ADMIN', 'SUPPORT', 'HELP', 'TEAM', 'OFFICIAL', 'OWNER', 
  'SHOP', 'STORE', 'ROOT', 'API', 'SYSTEM', 'STAFF', 'TEST', 'NULL', 'UNDEFINED'
];

const PROFANITY_LIST = [
  'BADWORD', 'XXX', 'SLUR', 'FUCK', 'SHIT', 'BITCH', 'CUNT', 'DICK', 'COCK', 'PUSSY', 'ASSHOLE'
  // Extend as needed
];

const normalizePrefix = (raw: string) => {
  // Trim, remove all non-alphanumeric, convert to uppercase
  return raw.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().trim();
};

export const checkAffiliatePrefix = async (rawPrefix: string): Promise<{status: 'available' | 'taken' | 'reserved' | 'profanity' | 'network_error' | 'permission_denied' | 'error', normalized: string}> => {
  const prefix = normalizePrefix(rawPrefix);
  
  if (prefix.length < 3) return { status: 'error', normalized: prefix };
  
  if (RESERVED_PREFIXES.includes(prefix)) {
    return { status: 'reserved', normalized: prefix };
  }
  
  if (PROFANITY_LIST.some(p => prefix.includes(p))) {
    return { status: 'profanity', normalized: prefix };
  }

  try {
    const docSnap = await getDoc(doc(db, 'affiliate_codes', prefix));
    if (docSnap.exists()) {
      return { status: 'taken', normalized: prefix };
    }
    return { status: 'available', normalized: prefix };
  } catch (e: any) {
    console.error("Error checking prefix:", e);
    if (e.code === 'unavailable' || e.message?.includes('offline')) {
      return { status: 'network_error', normalized: prefix };
    }
    if (e.code === 'permission-denied') {
      return { status: 'permission_denied', normalized: prefix };
    }
    return { status: 'error', normalized: prefix };
  }
};

export const generateWeightedReward = (): number => {
  const rand = Math.random() * 100;
  if (rand < 62) return 200; // 62%
  if (rand < 77) return 220; // 15% (62 + 15)
  if (rand < 86) return 240; // 9%  (77 + 9)
  if (rand < 92) return 260; // 6%  (86 + 6)
  if (rand < 97) return 280; // 5%  (92 + 5)
  return 300;                // 3%  (97 + 3)
};

export const registerAffiliate = async (userId: string, name: string, rawPrefix: string): Promise<{ awardedBonus: number }> => {
  const prefix = normalizePrefix(rawPrefix);
  
  if (prefix.length < 3) throw new Error("Prefix too short.");
  if (RESERVED_PREFIXES.includes(prefix)) throw new Error("This affiliate name is reserved.");
  if (PROFANITY_LIST.some(p => prefix.includes(p))) throw new Error("This affiliate name is not allowed.");

  const finalCode = `${prefix}DUALDEER5`;
  const awardedBonus = generateWeightedReward();
  
  const codeRef = doc(db, 'affiliate_codes', prefix);
  const userRef = doc(db, 'affiliates', userId);
  const couponRef = doc(collection(db, 'coupons'));

  await runTransaction(db, async (transaction) => {
    const codeDoc = await transaction.get(codeRef);
    if (codeDoc.exists()) {
      throw new Error("This affiliate name has just been taken. Please choose another.");
    }

    // 1. Reserve the code
    transaction.set(codeRef, {
      userId,
      createdAt: Timestamp.now()
    });

    // 2. Create Coupon
    const couponData: Omit<Coupon, 'id'> = {
      code: finalCode,
      discountType: 'percentage',
      discountValue: 5,
      active: true,
      isPublic: false,
      usageLimitType: 'unlimited',
      applyTo: 'first_item',
      affiliateId: userId,
      createdAt: Timestamp.now()
    };
    transaction.set(couponRef, couponData);

    // 3. Create Affiliate
    const affiliateData: Omit<Affiliate, 'id'> = {
      userId,
      name,
      code: finalCode,
      earnings: awardedBonus, // Randomized Welcome Bonus
      pendingEarnings: 0,
      totalWithdrawn: 0,
      status: 'active',
      createdAt: Timestamp.now()
    };
    transaction.set(userRef, affiliateData);
  });
  
  return { awardedBonus };
};

export const getAffiliate = async (userId: string): Promise<Affiliate | null> => {
  try {
    const docSnap = await getDoc(doc(db, 'affiliates', userId));
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Affiliate;
    }
  } catch (e) {
    console.error("Error fetching affiliate:", e);
  }
  return null;
};

export const getAffiliates = async (): Promise<Affiliate[]> => {
  return getCollectionData<Affiliate>('affiliates');
};

export const processAffiliateCommission = async (orderId: string, orderData: Order) => {
  if (!orderData.affiliateId || !orderData.affiliateCommission || orderData.affiliateCommission <= 0) return;
  
  try {
    // Only process if the order status is actually delivered.
    // Also, we need to make sure we don't process it twice.
    // We can check if it's already processed, but for now we just rely on the status change edge.
    // We will update the affiliate doc:
    const affiliateRef = doc(db, 'affiliates', orderData.affiliateId);
    
    // We can't easily check if processed here without a transaction or marking the order. 
    // We'll trust the caller to only call this once when status changes to 'delivered'.
    
    // Increment the earnings
    const snap = await getDoc(affiliateRef);
    if (snap.exists()) {
       const aff = snap.data() as Affiliate;
       await updateDoc(affiliateRef, {
          earnings: (aff.earnings || 0) + orderData.affiliateCommission
       });
       
       // Optional: We can mark the order as commission paid
       await updateDoc(doc(db, 'orders', orderId), {
          affiliateCommissionPaid: true
       });
    }
  } catch(e) {
    console.error("Failed to process commission", e);
  }
};

export const processRefund = async (orderId: string, amount: number, reason: string): Promise<void> => {
  const orderRef = doc(db, 'orders', orderId);
  const orderDoc = await getDoc(orderRef);
  if (!orderDoc.exists()) throw new Error('Order not found');

  await updateDoc(orderRef, {
    refundStatus: 'processed',
    refundAmount: amount,
    refundReason: reason,
    updatedAt: Timestamp.now()
  });
};

// ========================
// Email Queue Functions
// ========================

export const queueEmail = async (emailData: Omit<QueuedEmail, 'id' | 'createdAt' | 'status' | 'retryCount'>): Promise<string> => {
  const colRef = collection(db, 'emailQueue');
  const docRef = await addDoc(colRef, {
    ...emailData,
    status: 'pending',
    retryCount: 0,
    createdAt: Timestamp.now()
  });
  return docRef.id;
};

export const getPendingEmails = async (limitCount: number = 20): Promise<QueuedEmail[]> => {
  const colRef = collection(db, 'emailQueue');
  const q = query(colRef, where('status', '==', 'pending'), orderBy('createdAt', 'asc'), limit(limitCount));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as QueuedEmail));
};

export const updateQueuedEmailStatus = async (
  id: string, 
  status: 'sent' | 'failed' | 'pending', 
  retryCount: number, 
  error?: string
): Promise<void> => {
  const docRef = doc(db, 'emailQueue', id);
  await updateDoc(docRef, {
    status,
    retryCount,
    error: error || null,
    lastAttempt: Timestamp.now()
  });
};

export const requestWithdrawal = async (affiliateId: string, amount: number, upiId: string) => {
  // 1. Create withdrawal request
  await addDoc(collection(db, 'withdrawal_requests'), {
    affiliateId,
    amount,
    paymentMethodDetails: upiId,
    status: 'pending',
    createdAt: Timestamp.now()
  });

  // 2. Add to pendingWithdrawal (do not deduct from earnings until approved)
  const affiliateRef = doc(db, 'affiliates', affiliateId);
  const snap = await getDoc(affiliateRef);
  if (snap.exists()) {
     const aff = snap.data() as Affiliate & { pendingWithdrawal?: number };
     await updateDoc(affiliateRef, {
        pendingWithdrawal: (aff.pendingWithdrawal || 0) + amount
     });
  }
};

export const getWithdrawalRequests = async (): Promise<WithdrawalRequest[]> => {
  const reqs = await getCollectionData<WithdrawalRequest>('withdrawal_requests');
  return reqs.sort((a, b) => b.createdAt!.toMillis() - a.createdAt!.toMillis());
};

export const approveWithdrawalRequest = async (requestId: string, affiliateId: string, amount: number) => {
  await updateDoc(doc(db, 'withdrawal_requests', requestId), { status: 'paid' });
  
  const affiliateRef = doc(db, 'affiliates', affiliateId);
  const snap = await getDoc(affiliateRef);
  if (snap.exists()) {
     const aff = snap.data() as Affiliate & { pendingWithdrawal?: number };
     await updateDoc(affiliateRef, {
        earnings: Math.max(0, (aff.earnings || 0) - amount),
        pendingWithdrawal: Math.max(0, (aff.pendingWithdrawal || 0) - amount),
        totalWithdrawn: (aff.totalWithdrawn || 0) + amount
     });
  }
};

// ========================
// Upcoming Products & Launch Notifications
// ========================

export const getUpcomingProducts = async (): Promise<UpcomingProduct[]> => {
  const products = await getCollectionData<UpcomingProduct>('upcomingProducts');
  return products.sort((a, b) => b.createdAt!.toMillis() - a.createdAt!.toMillis());
};

export const addUpcomingProduct = async (product: Omit<UpcomingProduct, 'id' | 'notifyCount' | 'createdAt'>): Promise<string> => {
  const docRef = await addDoc(collection(db, 'upcomingProducts'), {
    ...product,
    notifyCount: 0,
    createdAt: Timestamp.now()
  });
  return docRef.id;
};

export const updateUpcomingProduct = async (id: string, data: Partial<UpcomingProduct>): Promise<void> => {
  const docRef = doc(db, 'upcomingProducts', id);
  await updateDoc(docRef, data);
};

export const deleteUpcomingProduct = async (id: string): Promise<void> => {
  const docRef = doc(db, 'upcomingProducts', id);
  await deleteDoc(docRef);
};

export const subscribeToProductNotification = async (productId: string, userId: string, email: string): Promise<{ success: boolean; message: string }> => {
  const q = query(
    collection(db, 'productNotifications'),
    where('productId', '==', productId),
    where('userId', '==', userId)
  );
  
  const existingDocs = await getDocs(q);
  if (!existingDocs.empty) {
    return { success: false, message: 'Already subscribed' };
  }

  try {
    await runTransaction(db, async (transaction) => {
      const productRef = doc(db, 'upcomingProducts', productId);
      const productDoc = await transaction.get(productRef);
      
      if (!productDoc.exists()) {
        throw new Error('Product does not exist');
      }

      const currentCount = productDoc.data().notifyCount || 0;
      transaction.update(productRef, { notifyCount: currentCount + 1 });
      
      const newNotificationRef = doc(collection(db, 'productNotifications'));
      transaction.set(newNotificationRef, {
        productId,
        userId,
        email,
        status: 'waiting',
        createdAt: Timestamp.now()
      });
    });
    
    return { success: true, message: 'Successfully subscribed' };
  } catch (error) {
    console.error('Subscription error:', error);
    return { success: false, message: 'Failed to subscribe' };
  }
};

export const getProductSubscribers = async (productId: string): Promise<ProductNotification[]> => {
  const q = query(collection(db, 'productNotifications'), where('productId', '==', productId));
  const snap = await getDocs(q);
  return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as ProductNotification));
};

export const launchUpcomingProduct = async (productId: string): Promise<{ success: boolean; message: string; subscribers: ProductNotification[] }> => {
  try {
    const upcomingRef = doc(db, 'upcomingProducts', productId);
    const upcomingSnap = await getDoc(upcomingRef);
    
    if (!upcomingSnap.exists()) {
      return { success: false, message: 'Upcoming product not found', subscribers: [] };
    }
    
    const productData = upcomingSnap.data() as UpcomingProduct;
    const { comingSoon, notifyCount, launchDate, ...liveProductData } = productData;
    
    const liveProduct: Omit<Product, 'id'> = {
      ...liveProductData,
      stock: 100,
      status: 'active',
      isNew: true,
      sizes: ['S', 'M', 'L', 'XL'],
      createdAt: Timestamp.now()
    };
    
    await addDoc(collection(db, 'products'), liveProduct);
    const subscribers = await getProductSubscribers(productId);
    await deleteDoc(upcomingRef);
    
    return { success: true, message: 'Launched successfully', subscribers };
  } catch (error) {
    console.error('Error launching product:', error);
    return { success: false, message: 'Failed to launch', subscribers: [] };
  }
};

export const markNotificationsAsSent = async (notificationIds: string[]): Promise<void> => {
  try {
    const promises = notificationIds.map(id => updateDoc(doc(db, 'productNotifications', id), { status: 'sent' }));
    await Promise.all(promises);
  } catch (error) {
    console.error('Failed to mark notifications as sent:', error);
  }
};

// ========================
// Chat Sessions
// ========================
export interface ChatSession {
  id?: string;
  userId: string;
  title: string;
  messages: any[];
  updatedAt: Timestamp;
}

export const saveChatSession = async (chatId: string, userId: string, title: string, messages: any[]) => {
  try {
    const docRef = doc(db, 'chat_sessions', chatId);
    await setDoc(docRef, {
      userId,
      title,
      messages,
      updatedAt: Timestamp.now()
    }, { merge: true });
  } catch (error) {
    console.error("Error saving chat session", error);
  }
};

export const getChatSessions = async (userId: string): Promise<ChatSession[]> => {
  try {
    const q = query(
      collection(db, 'chat_sessions'),
      where('userId', '==', userId)
    );
    const snap = await getDocs(q);
    const sessions = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as ChatSession));
    return sessions.sort((a, b) => {
      const timeA = a.updatedAt ? a.updatedAt.toMillis() : 0;
      const timeB = b.updatedAt ? b.updatedAt.toMillis() : 0;
      return timeB - timeA;
    });
  } catch (error) {
    console.error("Error fetching chat sessions", error);
    return [];
  }
};
