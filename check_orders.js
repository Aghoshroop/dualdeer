const { initializeApp } = require('firebase/app');
const { getFirestore, collection, query, orderBy, limit, getDocs } = require('firebase/firestore');
const fs = require('fs');
const envConfig = fs.readFileSync('.env.local', 'utf8').split('\n').reduce((acc, line) => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) acc[match[1]] = match[2].replace(/^["']|["']$/g, '');
  return acc;
}, {});
Object.assign(process.env, envConfig);


const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function checkOrders() {
  console.log("Fetching last 5 orders from Firebase directly...");
  const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'), limit(5));
  const snap = await getDocs(q);
  
  snap.forEach(doc => {
    const data = doc.data();
    console.log(`\nOrder ID: ${doc.id}`);
    console.log(`Status: ${data.status}`);
    console.log(`Total: ${data.total}`);
    console.log(`Email: ${data.shippingDetails?.email}`);
    if (data.razorpay) {
      console.log(`Razorpay Data:`, data.razorpay);
    }
  });
  console.log("\nDone.");
  process.exit(0);
}

checkOrders().catch(console.error);
