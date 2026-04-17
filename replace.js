const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(function(file) {
    file = dir + '/' + file;
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      results = results.concat(walk(file));
    } else { 
      if (file.endsWith('.tsx') || file.endsWith('.ts')) {
        results.push(file);
      }
    }
  });
  return results;
}

const files = walk('./src');

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;
  content = content.replace(/\/product\/\$\{product\.id\}/g, '/product/${product.slug || product.id}');
  content = content.replace(/\/product\/\$\{p\.id\}/g, '/product/${p.slug || p.id}');
  content = content.replace(/\/product\/\$\{activeProduct\.id\.replace\('-dup', ''\)\}/g, '/product/${activeProduct.slug || activeProduct.id.replace(\'-dup\', \'\')}');
  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Updated ${file}`);
  }
});
