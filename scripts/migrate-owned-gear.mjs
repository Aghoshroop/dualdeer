import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import crypto from 'crypto';
import fs from 'fs';

// Check if service account exists
const serviceAccountPath = './serviceAccountKey.json';
if (!fs.existsSync(serviceAccountPath)) {
  console.log("No serviceAccountKey.json found. Skipping migration.");
  process.exit(0);
}

const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();

async function migrate() {
  console.log("Starting migration to ownedGear...");
  
  const ordersSnap = await db.collection('orders').where('status', 'in', ['delivered', 'completed', 'shipped']).get();
  console.log(`Found ${ordersSnap.size} delivered/shipped orders.`);

  const batch = db.batch();
  let count = 0;

  for (const doc of ordersSnap.docs) {
    const order = doc.data();
    const items = order.items || [];
    
    for (const item of items) {
      const gearId = `${doc.id}_${item.productId}_${item.size || 'STD'}`;
      const gearRef = db.collection('ownedGear').doc(gearId);
      
      const purchaseDate = order.updatedAt || order.createdAt || Timestamp.now();
      
      const gearData = {
        userId: order.userId,
        productId: item.productId,
        orderId: doc.id,
        name: item.name,
        size: item.size || null,
        image: item.image || null,
        originalPrice: item.pricePaid || item.mrp || 0,
        purchaseDate: purchaseDate,
        status: 'active',
        gearHealth: 'new',
        passportId: `DD-${crypto.randomBytes(4).toString('hex').toUpperCase()}`,
        productVersion: 'v1.0',
        manufacturingBatch: 'B-001'
      };
      
      batch.set(gearRef, gearData, { merge: true });
      
      // Create initial warranty record
      const warrantyRef = db.collection('warrantyRecords').doc(`WAR-${gearId}`);
      const expirationDate = new Timestamp(purchaseDate.seconds + 31536000, 0); // +1 year
      batch.set(warrantyRef, {
        ownedGearId: gearId,
        userId: order.userId,
        status: 'active',
        activationDate: purchaseDate,
        expirationDate: expirationDate,
        coverageDetails: '1-Year Performance Guarantee covering material and manufacturing defects.'
      }, { merge: true });
      
      // Create initial event
      const eventRef = db.collection('gearEvents').doc(`EVT-PURCHASE-${gearId}`);
      batch.set(eventRef, {
        ownedGearId: gearId,
        userId: order.userId,
        type: 'purchased',
        description: 'Product purchased and digital passport created.',
        timestamp: purchaseDate
      }, { merge: true });

      count++;
    }
  }

  if (count > 0) {
    await batch.commit();
    console.log(`Successfully migrated ${count} gear items, warranties, and events.`);
  } else {
    console.log("No gear items to migrate.");
  }
}

migrate().then(() => process.exit(0)).catch(console.error);
