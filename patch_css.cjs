const fs = require('fs');
let css = fs.readFileSync('app/globals.css', 'utf8');

// Container
css = css.replace(/background: #11131a;/g, 'background: #ffffff;');
css = css.replace(/color: #ffffff;/g, 'color: #0f172a;');
css = css.replace(/border: 1px solid #2a2f3e;/g, 'border: 1px solid #e2e8f0;');
css = css.replace(/box-shadow: 0 25px 60px rgba\(0, 0, 0, 0\.6\);/g, 'box-shadow: 0 10px 25px -5px rgba(0,0,0,0.05);');

// Body P
css = css.replace(/color: #e2e8f0 !important;/g, 'color: #000000 !important;');
css = css.replace(/color: #f8fafc !important;/g, 'color: #000000 !important;');
css = css.replace(/color: #94a3b8 !important;/g, 'color: #475569 !important;');

// Back link
css = css.replace(/color: #38bdf8;/g, 'color: #000000;');

// Also remove the bottom hack we added earlier if it exists
css = css.replace(/\.dark-reader-body, \.dark-reader-body \* \{ color: #000000 !important; \}\n?/g, '');

fs.writeFileSync('app/globals.css', css);
