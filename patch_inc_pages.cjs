const fs = require('fs');

const b = 'src/pages/BlogPage.tsx';
let bCode = fs.readFileSync(b, 'utf8');
bCode = bCode.replace(
  `onClick={() => incrementDownloadCount(selectedPost.id, 'dispatch')}`,
  `onClick={() => incrementDownloadCount(selectedPost.id, selectedPost.category?.toLowerCase().includes('press') ? 'press_release' : 'insight')}`
);
fs.writeFileSync(b, bCode);

const c = 'src/pages/CategoryArchivePage.tsx';
let cCode = fs.readFileSync(c, 'utf8');
cCode = cCode.replace(
  `onClick={() => incrementDownloadCount(selectedPost.id, 'dispatch')}`,
  `onClick={() => incrementDownloadCount(selectedPost.id, categoryMatch.toLowerCase().includes('press') ? 'press_release' : 'insight')}`
);
fs.writeFileSync(c, cCode);
