const fs = require('fs');

function patchFile(file) {
  let code = fs.readFileSync(file, 'utf8');
  
  // change dependency to selectedPost?.id
  code = code.replace(
    /\}, \[selectedPost\]\);/,
    '}, [selectedPost?.id]);'
  );
  
  fs.writeFileSync(file, code);
  console.log('patched', file);
}

patchFile('src/pages/BlogPage.tsx');
patchFile('src/pages/CategoryArchivePage.tsx');
patchFile('src/pages/EssayDetailPage.tsx'); // wait, essay detail page has essay?.slug
