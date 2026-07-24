export const uploadImageToImgBB = async (file: File): Promise<string | null> => {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY;

  if (!cloudName || !apiKey) {
    console.error("Cloudinary configuration missing in environment variables.");
    return null;
  }

  try {
    // 1. Get secure signature from our backend
    const signRes = await fetch('/api/cloudinary/sign', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paramsToSign: {} }) // We just need timestamp and signature
    });

    if (!signRes.ok) {
      console.error("Failed to fetch Cloudinary signature");
      return null;
    }

    const { timestamp, signature } = await signRes.json();

    // 2. Upload file securely to Cloudinary
    const formData = new FormData();
    formData.append('file', file);
    formData.append('api_key', apiKey);
    formData.append('timestamp', timestamp.toString());
    formData.append('signature', signature);
    // Optional: formData.append('folder', 'products');

    const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: 'POST',
      body: formData,
    });

    const data = await uploadRes.json();

    if (uploadRes.ok && data.secure_url) {
      return data.secure_url; // Returns the permanent live HTTPS URL
    }

    console.error("Cloudinary API returned an error:", data);
    return null;
  } catch (error) {
    console.error("Cloudinary Network/Upload Failed:", error);
    return null;
  }
};
