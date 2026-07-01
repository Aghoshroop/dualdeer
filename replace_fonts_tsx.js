const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      if (!file.includes('node_modules') && !file.includes('.next')) {
        results = results.concat(walk(file));
      }
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      results.push(file);
    }
  });
  return results;
}

const files = walk('src');
let changedCount = 0;
files.forEach(f => {
  let content = fs.readFileSync(f, 'utf8');
  let original = content;
  
  // Replace in JSX
  content = content.replace(/\{formatPrice\(([^)]+)\)\}/g, '{renderPrice($1)}');
  content = content.replace(/\{formatProductPrice\(([^)]+)\)\}/g, '{renderProductPrice($1)}');
  
  if (content !== original) {
    // Update destructuring
    content = content.replace(/const\s+\{\s*([^}]+)\s*\}\s*=\s*useCurrency\(\)/g, (match, p1) => {
      let vars = p1.split(',').map(s => s.trim()).filter(Boolean);
      if (original.includes('formatPrice') && !vars.includes('renderPrice')) vars.push('renderPrice');
      if (original.includes('formatProductPrice') && !vars.includes('renderProductPrice')) vars.push('renderProductPrice');
      return `const { ${Array.from(new Set(vars)).join(', ')} } = useCurrency()`;
    });
    fs.writeFileSync(f, content);
    changedCount++;
  }
});
console.log('Changed files:', changedCount);
