const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(function(file) {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      results = results.concat(walk(file));
    } else { 
      if(file.endsWith('.module.css') || file.endsWith('.tsx') || file.endsWith('.css')) results.push(file);
    }
  });
  return results;
}

const files = walk('./src');
let changedCount = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;

  // CSS replacement logic
  if (file.endsWith('.css')) {
    // Dark mode backgrounds (black) -> var(--color-background)
    content = content.replace(/background(-color)?:\s*(#000|#000000|black)(;|\s|!|\})/gi, 'background$1: var(--color-background)$3');
    // Dark mode text (white) -> var(--color-text)
    content = content.replace(/color:\s*(#fff|#ffffff|white)(;|\s|!|\})/gi, 'color: var(--color-text)$2');
    
    // Borders
    content = content.replace(/border(-color)?:\s*1px\s+solid\s*(#222|#333|rgba\(255,\s*255,\s*255,\s*0\.1\))/gi, 'border$1: 1px solid var(--color-border)');
    
    // Light buttons in dark mode (white bg, black text)
    // We should map white background to foreground, and black text to background!
    content = content.replace(/background(-color)?:\s*(#fff|#ffffff|white)(;|\s|!|\})/gi, 'background$1: var(--color-foreground)$3');
    content = content.replace(/color:\s*(#000|#000000|black)(;|\s|!|\})/gi, 'color: var(--color-background)$2');
    
    // Background surface colors (#111, #1a1a1a) -> var(--color-surface)
    content = content.replace(/background(-color)?:\s*(#111|#111111|#1a1a1a)(;|\s|!|\})/gi, 'background$1: var(--color-surface)$3');

    // Replace hardcoded rgbas that use white
    content = content.replace(/rgba\(255,\s*255,\s*255,\s*(0\.\d+)\)/g, 'var(--color-border)');
  }
  
  // TSX inline styles replacement logic
  if (file.endsWith('.tsx')) {
    // For inline styles like color: '#fff' -> color: 'var(--color-text)'
    content = content.replace(/color:\s*['"](#fff|#ffffff|white)['"]/gi, "color: 'var(--color-text)'");
    content = content.replace(/color:\s*['"](#000|#000000|black)['"]/gi, "color: 'var(--color-background)'");
    
    content = content.replace(/background(-color)?:\s*['"](#000|#000000|black)['"]/gi, "background$1: 'var(--color-background)'");
    content = content.replace(/background(-color)?:\s*['"](#fff|#ffffff|white)['"]/gi, "background$1: 'var(--color-foreground)'");
    content = content.replace(/background(-color)?:\s*['"](#111|#111111|#1a1a1a)['"]/gi, "background$1: 'var(--color-surface)'");
    
    // borders
    content = content.replace(/border:\s*['"]1px\s+solid\s*(#222|#333|rgba\(255,255,255,0\.1\))['"]/gi, "border: '1px solid var(--color-border)'");
    content = content.replace(/borderBottom:\s*['"]1px\s+solid\s*(#222|#333|rgba\(255,255,255,0\.1\))['"]/gi, "borderBottom: '1px solid var(--color-border)'");
  }

  if (content !== original) {
    fs.writeFileSync(file, content);
    changedCount++;
  }
});
console.log('Changed files:', changedCount);
