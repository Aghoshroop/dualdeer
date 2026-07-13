import { NextResponse } from 'next/server';
import { collection, getDocs, doc, setDoc, query, where, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Order } from '@/lib/firebaseUtils';

export async function GET() {
  try {
    const ordersSnap = await getDocs(query(collection(db, 'orders'), where('status', 'in', ['delivered', 'completed', 'shipped'])));
    
    let count = 0;

    // Iterate through orders
    for (const orderDoc of ordersSnap.docs) {
      const order = orderDoc.data() as Order;
      const orderId = orderDoc.id;
      const items = order.items || [];
      
      const purchaseDate = order.updatedAt || order.createdAt || Timestamp.now();
      
      for (const item of items) {
        // Generate a deterministic ID based on order, product, and size
        const gearId = `${orderId}_${item.productId}_${item.size || 'STD'}`;
        const gearRef = doc(db, 'ownedGear', gearId);
        
        // Random 8-char hex passport ID
        const passportId = `DD-${Math.floor(Math.random() * 0xFFFFFFFF).toString(16).toUpperCase().padStart(8, '0')}`;
        
        const gearData = {
          userId: order.userId,
          productId: item.productId,
          orderId: orderId,
          name: item.name,
          size: item.size || null,
          image: item.image || null,
          originalPrice: item.pricePaid || item.mrp || 0,
          purchaseDate: purchaseDate,
          status: 'active',
          gearHealth: 'new',
          passportId,
          productVersion: 'v1.0',
          manufacturingBatch: 'B-001'
        };
        
        await setDoc(gearRef, gearData, { merge: true });
        
        // Warranty record
        const warrantyRef = doc(db, 'warrantyRecords', `WAR-${gearId}`);
        let pDateObj = purchaseDate.toDate ? purchaseDate.toDate() : new Date((purchaseDate as any).seconds ? (purchaseDate as any).seconds * 1000 : purchaseDate);
        const expirationDate = Timestamp.fromDate(new Date(pDateObj.getTime() + 31536000000)); // +1 year
        
        await setDoc(warrantyRef, {
          ownedGearId: gearId,
          userId: order.userId,
          status: 'active',
          activationDate: purchaseDate,
          expirationDate: expirationDate,
          coverageDetails: '1-Year Performance Guarantee covering material and manufacturing defects.',
          claimHistory: []
        }, { merge: true });
        
        // Initial Event
        const eventRef = doc(db, 'gearEvents', `EVT-PURCHASE-${gearId}`);
        await setDoc(eventRef, {
          ownedGearId: gearId,
          userId: order.userId,
          type: 'purchased',
          description: 'Product purchased and digital passport created.',
          timestamp: purchaseDate
        }, { merge: true });
  
        count++;
      }
    }

    return NextResponse.json({ message: `Successfully migrated ${count} gear items, warranties, and events.` });
  } catch (error: any) {
    console.error("Migration error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
