export const PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID;

// Prevent TypeScript errors for window.fbq
declare global {
  interface Window {
    fbq: any;
    _fbq: any;
  }
}

export const pageview = () => {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'PageView');
  }
};

export const event = (name: string, options = {}) => {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', name, options);
  }
};

// Initialize advanced matching if user data is available
export const initAdvancedMatching = (email?: string, phone?: string) => {
  if (typeof window !== 'undefined' && window.fbq && PIXEL_ID) {
    const data: any = {};
    if (email) data.em = email.toLowerCase().trim();
    if (phone) data.ph = phone.replace(/[^\d]/g, ''); // Extract only digits
    
    if (Object.keys(data).length > 0) {
      window.fbq('init', PIXEL_ID, data);
    }
  }
};
