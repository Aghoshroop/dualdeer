export function normalizeTimestamp(val: any): number | null {
  if (!val) return null;
  if (typeof val === 'number') return val;
  if (typeof val.toMillis === 'function') return val.toMillis();
  if (typeof val.toDate === 'function') return val.toDate().getTime();
  if (val instanceof Date) return val.getTime();
  return null;
}

export function deepSerialize(obj: any): any {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj !== 'object') return obj;
  
  if (Array.isArray(obj)) {
    return obj.map(deepSerialize);
  }
  
  // Handled timestamp objects immediately
  if (typeof obj.toMillis === 'function') return obj.toMillis();
  if (typeof obj.toDate === 'function') return obj.toDate().getTime();
  if (obj instanceof Date) return obj.getTime();

  const serialized: any = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      if (typeof obj[key] === 'function') continue;
      serialized[key] = deepSerialize(obj[key]);
    }
  }
  return serialized;
}

export function serializeProduct(product: any): any {
  return deepSerialize(product);
}

export function serializeCategory(category: any): any {
  return deepSerialize(category);
}

export function serializeReview(review: any): any {
  return deepSerialize(review);
}

export function serializeOrder(order: any): any {
  return deepSerialize(order);
}
