import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function checkProducts() {
  const productsRef = collection(db, 'products');
  const snapshot = await getDocs(productsRef);
  
  const categories = new Set();
  
  snapshot.forEach(doc => {
    const data = doc.data();
    if (data.category) {
      categories.add(data.category.toUpperCase());
    }
  });

  console.log('Categories found on products:', Array.from(categories));
}

checkProducts().then(() => process.exit(0)).catch((err) => { console.error(err); process.exit(1); });
