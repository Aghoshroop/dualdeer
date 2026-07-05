export interface LaunchEmailData {
  productName: string;
  productImage: string;
  baseUrl: string;
}

export const getNotifyLaunchTemplate = ({ productName, productImage, baseUrl }: LaunchEmailData) => {
  const imgUrl = productImage || 'https://dualdeer.com/og-image.jpg';

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #111; background-color: #fcfcfc; padding: 20px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="text-transform: uppercase; letter-spacing: 2px; font-weight: 900; margin: 0; color: #000;">DUAL DEER</h1>
      </div>
      
      <div style="text-align: center; margin-bottom: 30px;">
        <img src="${imgUrl}" alt="${productName}" style="max-width: 100%; height: auto; border-radius: 8px; box-shadow: 0 10px 25px rgba(0,0,0,0.1);" />
      </div>

      <h2 style="text-align: center; color: #000; text-transform: uppercase; letter-spacing: 1px;">The Wait is Over.</h2>
      <p style="font-size: 16px; line-height: 1.6; text-align: center; margin-bottom: 30px;">
        You asked us to notify you when the <strong>${productName}</strong> dropped. 
        We're thrilled to announce that it is now officially live and available for purchase.
      </p>

      <div style="text-align: center; margin-bottom: 40px;">
        <a href="${baseUrl}/shop" style="background-color: #000; color: #fff; padding: 14px 28px; text-decoration: none; text-transform: uppercase; font-weight: bold; letter-spacing: 1px; border-radius: 4px; display: inline-block;">
          Shop Now
        </a>
      </div>
      
      <p style="font-size: 12px; color: #888; text-align: center; border-top: 1px solid #eee; padding-top: 20px;">
        You are receiving this email because you opted in for a launch notification for this product.
        <br/><br/>
        &copy; ${new Date().getFullYear()} DualDeer. All rights reserved.
      </p>
    </div>
  `;
};
