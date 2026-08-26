const fs = require('fs');
let css = fs.readFileSync('app/globals.css', 'utf8');

css = css.replace(/background: #0f1422;/g, 'background: #f8fafc;');
css = css.replace(/border: 1px solid #1e293b;/g, 'border: 1px solid #e2e8f0;');

fs.writeFileSync('app/globals.css', css);
