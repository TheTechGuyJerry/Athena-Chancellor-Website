const fs = require('fs');
let code = fs.readFileSync('src/pages/EssayDetailPage.tsx', 'utf8');

const regex = /(const essay = useMemo<Essay \| null>\(\(\) => \{[\s\S]*?\}\, \[currentSlug, essays\]\);)/;
code = code.replace(
  regex,
  `$1

  useEffect(() => {
    if (essay && essay.slug) {
      incrementViewCount(essay.slug, 'essay');
    }
  }, [essay?.slug]);`
);
fs.writeFileSync('src/pages/EssayDetailPage.tsx', code);
console.log("Patched EssayDetail");
