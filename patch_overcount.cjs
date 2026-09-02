const fs = require('fs');
let code = fs.readFileSync('src/lib/cms-store.ts', 'utf8');

const regexDownload = /const sessionTrackedDownloads = new Set<string>\(\);\nexport async function incrementDownloadCount[\s\S]*?console\.error\("Failed to increment download count", error\);\n  \}\n\}/;

const newDownload = `export async function incrementDownloadCount(id: string, type: 'essay' | 'dispatch' | 'insight' | 'press_release'): Promise<void> {
  if (typeof window === "undefined") return;
  const key = \`download-\${type}-\${id}\`;
  if (sessionStorage.getItem(key)) return;
  sessionStorage.setItem(key, "1");

  try {
    const { doc, updateDoc, increment } = await import("firebase/firestore");
    const { db } = await import("./firebase");
    if (!db) return;

    if (type === 'essay') {
      await updateDoc(doc(db, "essays", id), { downloads: increment(1) });
    } else if (type === 'insight') {
      await updateDoc(doc(db, "insights", id), { downloads: increment(1) });
    } else if (type === 'press_release') {
      await updateDoc(doc(db, "press_releases", id), { downloads: increment(1) });
    } else {
      try {
        await updateDoc(doc(db, "insights", id), { downloads: increment(1) });
      } catch (e) {
        await updateDoc(doc(db, "press_releases", id), { downloads: increment(1) });
      }
    }
  } catch (error) {
    console.error("Failed to increment download count", error);
  }
}`;

code = code.replace(regexDownload, newDownload);

const regexView = /const sessionTrackedViews = new Set<string>\(\);\nexport async function incrementViewCount[\s\S]*?console\.error\("Failed to increment view count", error\);\n  \}\n\}/;

const newView = `export async function incrementViewCount(id: string, type: 'essay' | 'dispatch' | 'insight' | 'press_release'): Promise<void> {
  if (typeof window === "undefined") return;
  const key = \`view-\${type}-\${id}\`;
  if (sessionStorage.getItem(key)) return;
  sessionStorage.setItem(key, "1");

  try {
    const { doc, updateDoc, increment } = await import("firebase/firestore");
    const { db } = await import("./firebase");
    if (!db) return;

    if (type === 'essay') {
      await updateDoc(doc(db, "essays", id), { views: increment(1) });
    } else if (type === 'insight') {
      await updateDoc(doc(db, "insights", id), { views: increment(1) });
    } else if (type === 'press_release') {
      await updateDoc(doc(db, "press_releases", id), { views: increment(1) });
    } else {
      try {
        await updateDoc(doc(db, "insights", id), { views: increment(1) });
      } catch (e) {
        await updateDoc(doc(db, "press_releases", id), { views: increment(1) });
      }
    }
  } catch (error) {
    console.error("Failed to increment view count", error);
  }
}`;

code = code.replace(regexView, newView);

fs.writeFileSync('src/lib/cms-store.ts', code);
console.log('patched overcount');
