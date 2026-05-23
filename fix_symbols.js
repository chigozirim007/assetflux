const fs = require('fs');
const path = require('path');

function walk(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walk(dirPath, callback) : callback(path.join(dir, f));
  });
}

const replacements = {
  'â‚¿': 'BTC',
  'Îž': 'ETH',
  'â€¦': '...',
  'â€”': '-',
  'âœ“': 'Check',
  'â† ': '<-',
  'â†’': '->',
  'ðŸš€': '',
  'ðŸ” ': '',
  'ðŸ“¬': '',
  'ðŸ””': '',
  'ðŸ“ˆ': '',
  'ðŸ ¢': '',
  'ðŸ  ': '',
  'ðŸ“§': '',
  'ðŸ“±': '',
  'ðŸ“Š': '',
  'â–²': '^',
  'â–¼': 'v',
  'ðŸ”': '',
  'ðŸ“': '',
  'ðŸ Ÿ': '',
  'ðŸ’°': '',
  'ðŸŒ ': '',
  'ðŸ‘¥': '',
  'ðŸŽ¯': '',
  'ðŸ’¡': '',
  'ðŸ›¡ï¸ ': '', // Some symbols might be multiple bytes
};

// Also replace Jane Doe placeholders
const placeholderReplacements = {
  'placeholder="Jane"': 'placeholder=""',
  'placeholder="Doe"': 'placeholder=""',
  'placeholder="janedoe"': 'placeholder=""',
};

walk('C:\\Users\\nwoke\\assetflux\\app', function(filePath) {
  if (filePath.endsWith('.jsx') || filePath.endsWith('.js')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let changed = false;
    
    for (const [bad, good] of Object.entries(replacements)) {
      if (content.includes(bad)) {
        content = content.split(bad).join(good);
        changed = true;
      }
    }

    for (const [bad, good] of Object.entries(placeholderReplacements)) {
      if (content.includes(bad)) {
        content = content.split(bad).join(good);
        changed = true;
      }
    }
    
    if (changed) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Updated ${filePath}`);
    }
  }
});
