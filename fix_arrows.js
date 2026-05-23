const fs = require('fs');
const path = require('path');

function walk(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    const dirPath = path.join(dir, f);
    const isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walk(dirPath, callback) : callback(dirPath);
  });
}

walk('C:\\Users\\nwoke\\assetflux\\app', function(filePath) {
  if (!filePath.endsWith('.jsx') && !filePath.endsWith('.js')) return;
  let content = fs.readFileSync(filePath, 'utf8');

  // Fix raw -> in JSX text nodes (not inside JS expressions like arrow functions)
  // We target: >\s*->\s*< patterns (text content between tags)
  // and: >some text -></Link> patterns
  const fixed = content
    // text that ends with -> before a closing tag
    .replace(/([^=])\s*->/g, (match, before) => {
      // Don't replace inside JS expressions (inside {}) or attribute values
      return `${before} &rarr;`;
    });

  if (fixed !== content) {
    fs.writeFileSync(filePath, fixed, 'utf8');
    console.log(`Fixed: ${filePath}`);
  }
});
