const fs = require('fs');
let code = fs.readFileSync('src/pages/EssayDetailPage.tsx', 'utf8');

if (!code.includes('incrementViewCount')) {
  code = code.replace(
    'import { getCMSData } from "../lib/cms-store";',
    'import { getCMSData, incrementViewCount } from "../lib/cms-store";'
  );

  code = code.replace(
    /const essay = essays.find\(\(e\) => e.slug === currentSlug\);/,
    `const essay = essays.find((e) => e.slug === currentSlug);

  useEffect(() => {
    if (essay && essay.slug) {
      incrementViewCount(essay.slug, 'essay');
    }
  }, [essay?.slug]);`
  );

  fs.writeFileSync('src/pages/EssayDetailPage.tsx', code);
  console.log('patched essay views');
}
