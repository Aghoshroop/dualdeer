import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, addDoc } from 'firebase/firestore';

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

async function checkAndAddCategories() {
  const categoriesRef = collection(db, 'categories');
  const snapshot = await getDocs(categoriesRef);
  
  let hasMen = false;
  let hasWomen = false;
  
  snapshot.forEach(doc => {
    const data = doc.data();
    console.log(`Found category: ${data.name}`);
    if (data.name === 'MEN' || data.name === 'Men') hasMen = true;
    if (data.name === 'WOMEN' || data.name === 'Women') hasWomen = true;
  });

  if (!hasWomen) {
    console.log('Adding WOMEN category...');
    await addDoc(categoriesRef, {
      name: 'WOMEN',
      status: 'active',
      createdAt: new Date()
    });
    console.log('Added WOMEN category.');
  }
}

checkAndAddCategories().then(() => process.exit(0)).catch((err) => { console.error(err); process.exit(1); });
