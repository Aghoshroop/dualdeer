import { collection, doc, getDocs, getDoc, addDoc, updateDoc, deleteDoc, setDoc, query, where, Timestamp } from 'firebase/firestore';
import { db } from './firebase';

// ========================
// Types
// ========================

export interface ContentBlock {
  id?: string;
  title: string;
  body: string;
  imageUrl?: string;
  ctaText?: string;
  ctaLink?: string;
}

export interface Product {
  id?: string;
  name: string;
  description?: string;
  sizes?: string[];
  category: string;
  subcategory?: string;
  price: number;
  mrp?: number;
  rating?: number;
  image: string;
  images?: string[];
  stock: number;
  isSeasonal?: boolean;
  isNew?: boolean;
  colors?: string[];
  createdAt?: Timestamp;
}

export interface Review {
  id?: string;
  productId: string;
  userName: string;
  userAvatar?: string;
  rating: number; // 1-5
  text: string;
  date: Timestamp;
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
  image: string;
  link?: string;
  active: boolean;
  createdAt?: Timestamp;
}

export interface Coupon {
  id?: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  active: boolean;
  usageLimitType?: 'single_use' | 'once_per_user' | 'unlimited';
  usedBy?: string[];
  createdAt?: Timestamp;
}

export interface OrderItem {
  productId: string;
  name: string;
  mrp: number;
  pricePaid: number;
  quantity: number;
  size?: string;
  image?: string;
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
  };
  items: OrderItem[];
  total: number;
  discountAmount?: number;
  status: 'processing' | 'shipped' | 'delivered';
  createdAt?: Timestamp;
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
export const getProducts = () => getCollectionData<Product>('products');

export const getProduct = async (id: string): Promise<Product | null> => {
  try {
    const docSnap = await getDoc(doc(db, 'products', id));
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Product;
    }
  } catch(e) {
    console.error("Error fetching single product", e);
  }
  return null;
};

export const addProduct = (data: Omit<Product, 'id'>) => addDocument('products', data);
export const updateProduct = (id: string, data: Partial<Product>) => updateDocument('products', id, data);
export const deleteProduct = (id: string) => deleteDocument('products', id);

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

export const addReview = async (review: Omit<Review, 'id' | 'date'>) => {
  const docRef = await addDoc(collection(db, 'reviews'), {
    ...review,
    date: Timestamp.now()
  });
  return docRef.id;
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

export const updateOrder = async (id: string, data: Partial<Order>) => {
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
