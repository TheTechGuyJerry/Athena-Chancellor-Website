import { DispatchPost } from "./cms-store";

export const YOUTUBE_PLAYLIST_ID = "PL50Grh-pH1e2Cgzg98w8bMOP92JztSx1z";
export const YOUTUBE_API_KEY = "AIzaSyC0oI6kZjXCzbNFT8IgkHt25JaEYaYSoec";

export type OsitaInsightImportItem = {
  title: string;
  description: string;
  publicationDate: string;
  featuredImage?: string;
  episodeUrl: string;
  category: "Osita Insight";
  source: "ClearPath Media";
  isAlreadyImported?: boolean;
};

export function extractYouTubeId(url: string | undefined | null): string | null {
  if (!url) return null;
  const match = url.match(/(?:v=|\/embed\/|\/vi\/|youtu\.be\/|\/v\/|\/e\/|watch\?v=|\&v=)([^#\&\?]*)/);
  if (match && match[1] && match[1].length === 11) {
    return match[1];
  }
  return null;
}

export function getEpisodeThumbnailUrl(episodeUrl?: string, imageUrl?: string): string | undefined {
  const ytId = extractYouTubeId(episodeUrl);
  if (ytId) {
    return `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`;
  }
  return imageUrl || undefined;
}

export async function fetchOsitaInsightsFromYouTube(
  customApiKey?: string,
  customPlaylistId?: string
): Promise<OsitaInsightImportItem[]> {
  const apiKey =
    customApiKey ||
    (typeof import.meta !== "undefined" && import.meta.env?.VITE_YOUTUBE_API_KEY) ||
    (typeof import.meta !== "undefined" && import.meta.env?.YOUTUBE_API_KEY) ||
    (typeof process !== "undefined" && process.env?.VITE_YOUTUBE_API_KEY) ||
    (typeof process !== "undefined" && process.env?.YOUTUBE_API_KEY) ||
    YOUTUBE_API_KEY;

  const playlistId =
    customPlaylistId ||
    (typeof import.meta !== "undefined" && import.meta.env?.VITE_YOUTUBE_PLAYLIST_ID) ||
    (typeof import.meta !== "undefined" && import.meta.env?.YOUTUBE_PLAYLIST_ID) ||
    (typeof process !== "undefined" && process.env?.VITE_YOUTUBE_PLAYLIST_ID) ||
    (typeof process !== "undefined" && process.env?.YOUTUBE_PLAYLIST_ID) ||
    YOUTUBE_PLAYLIST_ID;

  if (!apiKey || !playlistId) {
    console.warn("YouTube API key or Playlist ID missing.");
    return [];
  }

  const items: OsitaInsightImportItem[] = [];
  let pageToken = "";

  try {
    do {
      const url = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=50&playlistId=${playlistId}&key=${apiKey}${pageToken ? `&pageToken=${pageToken}` : ""}`;
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(`YouTube API request failed (${res.status}): ${res.statusText}`);
      }
      const data = await res.json();

      if (Array.isArray(data.items)) {
        for (const item of data.items) {
          const snippet = item.snippet;
          if (!snippet) continue;

          const videoId = snippet.resourceId?.videoId;
          if (!videoId) continue;

          const title = snippet.title;
          if (!title || title.includes("Private video") || title.includes("Deleted video")) {
            continue;
          }

          const episodeUrl = `https://www.youtube.com/watch?v=${videoId}`;
          const publicationDate = snippet.publishedAt ? snippet.publishedAt.split("T")[0] : new Date().toISOString().split("T")[0];

          const rawDesc = snippet.description || "";
          const description = rawDesc.trim().length > 0
            ? rawDesc.trim()
            : "Executive commentary and analysis on governance and public leadership from OsitaInsight on ClearPath Media.";

          const thumbs = snippet.thumbnails || {};
          const featuredImage =
            thumbs.maxres?.url ||
            thumbs.high?.url ||
            thumbs.medium?.url ||
            thumbs.default?.url ||
            `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;

          items.push({
            title,
            description,
            publicationDate,
            featuredImage,
            episodeUrl,
            category: "Osita Insight",
            source: "ClearPath Media",
          });
        }
      }

      pageToken = data.nextPageToken || "";
    } while (pageToken);

    return items;
  } catch (err) {
    console.warn("YouTube API fetch error:", err);
    return [];
  }
}

export async function fetchOsitaInsightsFromClearPath(): Promise<OsitaInsightImportItem[]> {
  // 1. Try YouTube Data API first using provided Playlist ID & API Key
  try {
    const ytItems = await fetchOsitaInsightsFromYouTube();
    if (ytItems.length > 0) {
      console.log(`Successfully fetched ${ytItems.length} OsitaInsight items from YouTube API.`);
      return ytItems;
    }
  } catch (err) {
    console.warn("YouTube Data API fetch failed, falling back to web scraper:", err);
  }

  // 2. Fallback to Web Scraper if YouTube API is unavailable
  const url = "https://www.clearpathmedia.ng/programmes/osita-insights";
  let fullContent = "";

  try {
    const pageRes = await fetch(url);
    if (!pageRes.ok) {
      throw new Error(`Failed to fetch Osita Insights page: ${pageRes.statusText}`);
    }
    const pageHtml = await pageRes.text();
    fullContent += pageHtml;

    // Look for index JS script tag URL
    const scriptMatch = pageHtml.match(/src=["'](\/assets\/index-[^"']+\.js)["']/i);
    if (scriptMatch) {
      const scriptUrl = "https://www.clearpathmedia.ng" + scriptMatch[1];
      try {
        const jsRes = await fetch(scriptUrl);
        if (jsRes.ok) {
          const jsText = await jsRes.text();
          fullContent += " " + jsText;
        }
      } catch (err) {
        console.warn("Could not fetch secondary JS bundle from ClearPath Media:", err);
      }
    }
  } catch (err) {
    console.error("Scraper fetch error:", err);
    throw err;
  }

  const extractedItems: OsitaInsightImportItem[] = [];

  // Extract items matching structured video/episode blocks
  const objectRegex = /\{[^{}]*title:["'](.*?)["'],youtubeUrl:["'](.*?)["'][^{}]*\}/gi;
  let match: RegExpExecArray | null;

  while ((match = objectRegex.exec(fullContent)) !== null) {
    const block = match[0];

    const titleMatch = block.match(/title:"([^"]+)"/) || block.match(/title:'([^']+)'/);
    const urlMatch = block.match(/youtubeUrl:"([^"]+)"/) || block.match(/youtubeUrl:'([^']+)'/);
    const summaryMatch = block.match(/suggestedSummary:"([^"]+)"/) || block.match(/suggestedSummary:'([^']+)'/);
    const dateMatch =
      block.match(/(?:publishedAt|createdAt|date):"([^"]+)"/) ||
      block.match(/(?:publishedAt|createdAt|date):'([^']+)'/);
    const imageMatch =
      block.match(/(?:coverImage|thumbnailImage|imageUrl):"([^"]+)"/) ||
      block.match(/(?:coverImage|thumbnailImage|imageUrl):'([^']+)'/);

    if (titleMatch && urlMatch) {
      const title = titleMatch[1].replace(/\\'/g, "'").replace(/\\"/g, '"').trim();
      const episodeUrl = urlMatch[1].trim();

      if (
        !title ||
        ["OsitaInsight", "Host, OsitaInsight", "OsitaInsight - ClearPath Media"].includes(title)
      ) {
        continue;
      }

      const description = summaryMatch
        ? summaryMatch[1].replace(/\\'/g, "'").replace(/\\"/g, '"').trim()
        : "Executive commentary and analysis on governance and public leadership from OsitaInsight on ClearPath Media.";

      const publicationDate = dateMatch ? dateMatch[1].split("T")[0] : new Date().toISOString().split("T")[0];

      let rawImage = imageMatch ? imageMatch[1].trim() : "";
      if (rawImage.startsWith("/")) {
        rawImage = "https://www.clearpathmedia.ng" + rawImage;
      }

      const featuredImage = getEpisodeThumbnailUrl(episodeUrl, rawImage);

      extractedItems.push({
        title,
        description,
        publicationDate,
        featuredImage,
        episodeUrl,
        category: "Osita Insight",
        source: "ClearPath Media",
      });
    }
  }

  // Deduplicate by episodeUrl or title
  const uniqueList: OsitaInsightImportItem[] = [];
  const seenUrls = new Set<string>();
  const seenTitles = new Set<string>();

  for (const item of extractedItems) {
    const normUrl = item.episodeUrl.toLowerCase();
    const normTitle = item.title.toLowerCase();
    if (!seenUrls.has(normUrl) && !seenTitles.has(normTitle)) {
      seenUrls.add(normUrl);
      seenTitles.add(normTitle);
      uniqueList.push(item);
    }
  }

  return uniqueList;
}

export function detectDuplicates(
  scrapedItems: OsitaInsightImportItem[],
  existingDispatches: DispatchPost[]
): OsitaInsightImportItem[] {
  const existingUrls = new Set<string>();
  const existingTitles = new Set<string>();

  for (const d of existingDispatches) {
    if (d.episodeUrl) existingUrls.add(d.episodeUrl.toLowerCase().trim());
    if (d.pdfUrl && d.pdfUrl.startsWith("http")) existingUrls.add(d.pdfUrl.toLowerCase().trim());
    if (d.title) existingTitles.add(d.title.toLowerCase().trim());
  }

  return scrapedItems.map((item) => {
    const normUrl = item.episodeUrl.toLowerCase().trim();
    const normTitle = item.title.toLowerCase().trim();
    const isAlreadyImported = existingUrls.has(normUrl) || existingTitles.has(normTitle);

    return {
      ...item,
      isAlreadyImported,
    };
  });
}
