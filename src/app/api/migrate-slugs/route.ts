import { NextResponse } from 'next/server';
import { getProducts, updateProduct, Product } from '@/lib/firebaseUtils';

const generateSlug = (name: string) => {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
};

export async function GET() {
  try {
    const products: Product[] = await getProducts();
    const slugMap = new Map<string, number>();
    
    let updatedCount = 0;
    for (const product of products) {
      if (!product.id) continue;
      
      let baseSlug = generateSlug(product.name);
      if (!baseSlug) baseSlug = 'product';

      let finalSlug = baseSlug;
      let counter = slugMap.get(baseSlug) || 0;
      
      if (counter > 0) {
        finalSlug = `${baseSlug}-${counter}`;
      }
      
      slugMap.set(baseSlug, counter + 1);

      if (product.slug !== finalSlug) {
        await updateProduct(product.id, { slug: finalSlug });
        updatedCount++;
      }
    }

    return NextResponse.json({ message: `Successfully migrated ${updatedCount} products with slugs.`, total: products.length });
  } catch (error: any) {
    console.error("Migration error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
