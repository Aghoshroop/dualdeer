const fs = require('fs');

async function main() {
  console.log("Fetching sitemap...");
  const sitemapRes = await fetch('http://localhost:3000/sitemap.xml');
  if (!sitemapRes.ok) {
    console.error("Failed to fetch sitemap:", sitemapRes.status);
    return;
  }
  const xml = await sitemapRes.text();
  
  // Extract URLs
  const urls = [];
  const locRegex = /<loc>(.*?)<\/loc>/g;
  let match;
  while ((match = locRegex.exec(xml)) !== null) {
    urls.push(match[1]);
  }

  console.log(`Found ${urls.length} URLs in sitemap.`);
  
  const results = [];

  for (const url of urls) {
    console.log(`Checking ${url}...`);
    // Map to local
    const localUrl = url.replace('https://dualdeer.com', 'http://localhost:3000');
    
    try {
      const res = await fetch(localUrl, { redirect: 'manual' });
      const status = res.status;
      
      let redirect = false;
      if (status >= 300 && status < 400) {
        redirect = true;
      }
      
      const html = await res.text();
      
      // Checks
      const hasTitle = /<title[^>]*>.*?<\/title>/is.test(html);
      const hasDesc = /<meta[^>]+name=["']description["'][^>]*>/is.test(html);
      
      let canonicalMatches = false;
      let canonicalHref = '';
      const canMatch = /<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["'][^>]*>/is.exec(html);
      if (canMatch) {
        canonicalHref = canMatch[1];
        if (canonicalHref === url) {
          canonicalMatches = true;
        }
      }
      
      // By default Next.js might not inject robots unless we specify noindex
      const robotsMatch = /<meta[^>]+name=["']robots["'][^>]+content=["']([^"']+)["'][^>]*>/is.exec(html);
      const isNoindex = robotsMatch ? robotsMatch[1].includes('noindex') : false;
      const indexable = !isNoindex;
      
      const hasSchema = /<script[^>]+type=["']application\/ld\+json["'][^>]*>/is.test(html);
      
      const hasH1 = /<h1[^>]*>.*?<\/h1>/is.test(html);
      
      results.push({
        url,
        status,
        redirect,
        canonicalMatches,
        canonicalHref,
        indexable,
        hasTitle,
        hasDesc,
        hasSchema,
        hasH1
      });
      
    } catch (e) {
      console.error(`Error fetching ${localUrl}:`, e);
      results.push({
        url,
        status: 0,
        error: e.message
      });
    }
  }

  fs.writeFileSync('sitemap_report.json', JSON.stringify(results, null, 2));
  console.log("Report saved to sitemap_report.json");
}

main();
