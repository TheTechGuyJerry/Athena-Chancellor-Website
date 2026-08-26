const fs = require('fs');
let code = fs.readFileSync('src/lib/osita-importer.ts', 'utf8');
code = code.replace(
  /export function getEpisodeThumbnailUrl\(episodeUrl\?: string, imageUrl\?: string\): string \| undefined \{\s*const ytId = extractYouTubeId\(episodeUrl\);\s*if \(ytId\) \{\s*return `https:\/\/img\.youtube\.com\/vi\/\$\{ytId\}\/hqdefault\.jpg`;\s*\}\s*if \(imageUrl && imageUrl\.startsWith\("http"\) && !imageUrl\.includes\("aida-public"\)\) \{\s*return imageUrl;\s*\}\s*return undefined;\s*\}/g,
  `export function getEpisodeThumbnailUrl(episodeUrl?: string, imageUrl?: string): string | undefined {
  const ytId = extractYouTubeId(episodeUrl);
  if (ytId) {
    return \`https://img.youtube.com/vi/\${ytId}/hqdefault.jpg\`;
  }
  return imageUrl || undefined;
}`
);
fs.writeFileSync('src/lib/osita-importer.ts', code);
