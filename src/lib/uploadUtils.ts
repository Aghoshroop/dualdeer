export const uploadImageToImgBB = async (file: File): Promise<string | null> => {
  const formData = new FormData();
  formData.append('image', file);
  
  const apiKey = process.env.NEXT_PUBLIC_IMGBB_API_KEY;

  if (!apiKey) {
    console.error("ImgBB API Key is missing from environment variables.");
    return null;
  }

  try {
    const res = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
      method: 'POST',
      body: formData
    });
    
    const data = await res.json();
    if (data.success) {
      return data.data.url; // Returns the permanent live HTTPS URL
    }
    console.error("ImgBB API returned an error:", data);
    return null;
  } catch (error) {
    console.error("ImgBB Network/Upload Failed:", error);
    return null;
  }
};
