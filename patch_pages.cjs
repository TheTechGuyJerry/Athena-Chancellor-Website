const fs = require('fs');

const files = [
  'src/pages/BlogPage.tsx', 
  'src/pages/CategoryArchivePage.tsx', 
  'src/pages/EssayDetailPage.tsx'
];

for (const file of files) {
  let code = fs.readFileSync(file, 'utf8');
  
  if (!code.includes('safeIsoDate')) {
    code = code.replace(
      'import { formatDocumentDownloadUrl, stripHtml } from "../lib/url-utils";',
      'import { formatDocumentDownloadUrl, stripHtml, safeIsoDate, safeSortTime } from "../lib/url-utils";'
    );
  }

  code = code.replace(
    /new Date\((a\.date|b\.date)\)\.getTime\(\)/g,
    (match, prop) => `safeSortTime(${prop})`
  );

  code = code.replace(
    /new Date\(selectedPost\.date\)\.toISOString\(\)/g,
    'safeIsoDate(selectedPost.date)'
  );

  // In EssayDetailPage.tsx
  code = code.replace(
    /new Date\(\`\$\{essay\.month\} 1\, \$\{essay\.year\}\`\)\.toISOString\(\)/g,
    'safeIsoDate(`${essay.month} 1, ${essay.year}`)'
  );

  fs.writeFileSync(file, code);
}
