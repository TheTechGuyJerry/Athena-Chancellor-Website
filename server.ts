import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { fetchOsitaInsightsFromClearPath } from "./src/lib/osita-importer";
import { collection, getDocs } from "firebase/firestore";
import { db } from "./src/lib/firebase";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  // Sitemap generation
  app.get("/sitemap.xml", async (_req, res) => {
    try {
      let essays: any[] = [];
      let dispatches: any[] = [];
      
      try {
        const essaysSnap = await getDocs(collection(db, "essays"));
        essays = essaysSnap.docs.map(d => d.data());
      } catch (e) {
        console.warn("Could not fetch essays for sitemap:", e);
      }

      try {
        const dispatchesSnap = await getDocs(collection(db, "dispatches"));
        dispatches = dispatchesSnap.docs.map(d => d.data());
      } catch (e) {
        console.warn("Could not fetch dispatches for sitemap:", e);
      }

      let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>https://ositachidoka.com/</loc><priority>1.0</priority></url>
  <url><loc>https://ositachidoka.com/about</loc><priority>0.8</priority></url>
  <url><loc>https://ositachidoka.com/collections</loc><priority>0.9</priority></url>
  <url><loc>https://ositachidoka.com/blog</loc><priority>0.9</priority></url>
  <url><loc>https://ositachidoka.com/press-releases</loc><priority>0.8</priority></url>
  <url><loc>https://ositachidoka.com/insights</loc><priority>0.8</priority></url>
  <url><loc>https://ositachidoka.com/mekariamentorship</loc><priority>0.7</priority></url>
  <url><loc>https://ositachidoka.com/pressinquiry</loc><priority>0.7</priority></url>
`;

      // Dynamic essay URLs
      for (const essay of essays) {
        if (essay.slug) {
          xml += `  <url><loc>https://ositachidoka.com/collections/${essay.slug}</loc><priority>0.8</priority></url>\n`;
        }
      }

      // Dynamic dispatch URLs
      for (const dispatch of dispatches) {
        if (dispatch.published !== false && (dispatch.slug || dispatch.id)) {
          const category = dispatch.category?.toLowerCase() || "";
          let prefix = "blog";
          if (category.includes("insight")) prefix = "insights";
          else if (category.includes("press release")) prefix = "press-releases";
          
          xml += `  <url><loc>https://ositachidoka.com/${prefix}/${dispatch.slug || dispatch.id}</loc><priority>0.7</priority></url>\n`;
        }
      }

      xml += `</urlset>`;

      res.header('Content-Type', 'application/xml');
      res.send(xml);
    } catch (err) {
      console.error("[Sitemap Generation Error]", err);
      res.status(500).end();
    }
  });

  // Requirement 1: Backend scraper/import service for Osita Insights
  app.get("/api/scrape-osita-insights", async (_req, res) => {
    try {
      console.log("[Backend Scraper] Scraping Osita Insights from ClearPath Media...");
      const items = await fetchOsitaInsightsFromClearPath();
      res.json({ success: true, count: items.length, items });
    } catch (err) {
      console.error("[Backend Scraper Error]", err);
      res.status(500).json({
        success: false,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  });

  // Vite middleware setup
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
