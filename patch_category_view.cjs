const fs = require('fs');

function patchFile(file) {
  let code = fs.readFileSync(file, 'utf8');
  if (!code.includes('incrementViewCount')) {
    code = code.replace(
      'incrementDownloadCount,',
      'incrementDownloadCount, incrementViewCount,'
    );
    
    code = code.replace(
      /useEffect\(\(\) => \{\n\s*if \(selectedPost\) \{/,
      `useEffect(() => {
    if (selectedPost) {
      incrementViewCount(selectedPost.id, selectedPost.category?.toLowerCase().includes('press') ? 'press_release' : 'insight');`
    );

    fs.writeFileSync(file, code);
    console.log('patched', file);
  }
}

patchFile('src/pages/CategoryArchivePage.tsx');
patchFile('src/pages/BlogPage.tsx');
