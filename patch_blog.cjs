const fs = require('fs');
let code = fs.readFileSync('src/pages/BlogPage.tsx', 'utf8');

if (!code.includes('getEpisodeThumbnailUrl')) {
  code = code.replace(
    'import { SEOHead } from "../components/SEOHead";',
    'import { SEOHead } from "../components/SEOHead";\nimport { getEpisodeThumbnailUrl, extractYouTubeId } from "../lib/osita-importer";'
  );
}

// In the rendering of selectedPost
code = code.replace(
  '  if (selectedPost) {',
  `  if (selectedPost) {
    const ytId = extractYouTubeId(selectedPost.episodeUrl || selectedPost.pdfUrl);
    const thumbUrl = getEpisodeThumbnailUrl(selectedPost.episodeUrl, selectedPost.imageUrl);`
);

// Add the image to the SEO Head
code = code.replace(
  'image={selectedPost.imageUrl}',
  'image={thumbUrl || selectedPost.imageUrl}'
);

// Add the image to the layout
code = code.replace(
  '<div className="dark-reader-header">',
  `{ytId ? (
              <div style={{ marginBottom: "28px", borderRadius: "8px", overflow: "hidden", aspectRatio: "16 / 9", background: "#000", boxShadow: "0 10px 25px -5px rgba(0,0,0,0.2)" }}>
                <iframe
                  src={\`https://www.youtube.com/embed/\${ytId}?autoplay=1\`}
                  title={selectedPost.title}
                  width="100%"
                  height="100%"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            ) : thumbUrl ? (
              <div style={{ marginBottom: "28px", borderRadius: "8px", overflow: "hidden", aspectRatio: "16 / 9", background: "#f1f5f9" }}>
                <img src={thumbUrl} alt={selectedPost.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
            ) : null}
            <div className="dark-reader-header">`
);

// Also add image to the card
code = code.replace(
  '<article',
  `<article`
);

// We need to carefully replace the card content
const cardContentTarget = `<div className="dispatch-card-meta" style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px", fontSize: "12px" }}>`;
const cardContentReplacement = `{getEpisodeThumbnailUrl(post.episodeUrl, post.imageUrl) && (
                      <div
                        style={{
                          borderRadius: "6px",
                          overflow: "hidden",
                          aspectRatio: "16 / 9",
                          marginBottom: "16px",
                          background: "#f1f5f9",
                          position: "relative"
                        }}
                      >
                        <img
                          src={getEpisodeThumbnailUrl(post.episodeUrl, post.imageUrl)}
                          alt={post.title}
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                      </div>
                    )}
                    <div className="dispatch-card-meta" style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px", fontSize: "12px" }}>`;

code = code.replace(cardContentTarget, cardContentReplacement);

fs.writeFileSync('src/pages/BlogPage.tsx', code);
