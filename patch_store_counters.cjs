const fs = require('fs');
let code = fs.readFileSync('src/lib/cms-store.ts', 'utf8');

const oldIncDown = `export async function incrementDownloadCount(id: string, type: 'essay' | 'dispatch' | 'insight' | 'press_release'): Promise<void> {
  try {
    const { doc, updateDoc, increment } = await import("firebase/firestore");
    const { db } = await import("./firebase");
    
    if (!db) return;

    if (type === 'essay') {
      const docRef = doc(db, "essays", id);
      await updateDoc(docRef, { downloads: increment(1) });
    } else if (type === 'insight') {
      const docRef = doc(db, "insights", id);
      await updateDoc(docRef, { downloads: increment(1) });
    } else if (type === 'press_release') {
      const docRef = doc(db, "press_releases", id);
      await updateDoc(docRef, { downloads: increment(1) });
    } else {
      // fallback if type is dispatch
      try {
        const docRef = doc(db, "insights", id);
        await updateDoc(docRef, { downloads: increment(1) });
      } catch (e) {
        const docRef2 = doc(db, "press_releases", id);
        await updateDoc(docRef2, { downloads: increment(1) });
      }
    }
  } catch (error) {
    console.error("Failed to increment download count", error);
  }
}`;

const newCounters = `export async function incrementDownloadCount(id: string, type: 'essay' | 'dispatch' | 'insight' | 'press_release'): Promise<void> {
  try {
    const { doc, updateDoc, increment } = await import("firebase/firestore");
    const { db } = await import("./firebase");
    if (!db) return;

    if (type === 'essay') {
      const docRef = doc(db, "essays", id);
      await updateDoc(docRef, { downloads: increment(1) });
      const item = inMemoryData.essays.find(e => e.slug === id);
      if (item) { item.downloads = (item.downloads || 0) + 1; notifyCMSListeners(); }
    } else if (type === 'insight') {
      const docRef = doc(db, "insights", id);
      await updateDoc(docRef, { downloads: increment(1) });
      const item = inMemoryData.insights?.find(e => e.id === id);
      if (item) { item.downloads = (item.downloads || 0) + 1; notifyCMSListeners(); }
    } else if (type === 'press_release') {
      const docRef = doc(db, "press_releases", id);
      await updateDoc(docRef, { downloads: increment(1) });
      const item = inMemoryData.pressReleases?.find(e => e.id === id);
      if (item) { item.downloads = (item.downloads || 0) + 1; notifyCMSListeners(); }
    } else {
      try {
        const docRef = doc(db, "insights", id);
        await updateDoc(docRef, { downloads: increment(1) });
        const item = inMemoryData.insights?.find(e => e.id === id);
        if (item) { item.downloads = (item.downloads || 0) + 1; notifyCMSListeners(); }
      } catch (e) {
        const docRef2 = doc(db, "press_releases", id);
        await updateDoc(docRef2, { downloads: increment(1) });
        const item = inMemoryData.pressReleases?.find(e => e.id === id);
        if (item) { item.downloads = (item.downloads || 0) + 1; notifyCMSListeners(); }
      }
    }
  } catch (error) {
    console.error("Failed to increment download count", error);
  }
}

export async function incrementViewCount(id: string, type: 'essay' | 'dispatch' | 'insight' | 'press_release'): Promise<void> {
  try {
    const { doc, updateDoc, increment } = await import("firebase/firestore");
    const { db } = await import("./firebase");
    if (!db) return;

    if (type === 'essay') {
      const docRef = doc(db, "essays", id);
      await updateDoc(docRef, { views: increment(1) });
      const item = inMemoryData.essays.find(e => e.slug === id);
      if (item) { item.views = (item.views || 0) + 1; notifyCMSListeners(); }
    } else if (type === 'insight') {
      const docRef = doc(db, "insights", id);
      await updateDoc(docRef, { views: increment(1) });
      const item = inMemoryData.insights?.find(e => e.id === id);
      if (item) { item.views = (item.views || 0) + 1; notifyCMSListeners(); }
    } else if (type === 'press_release') {
      const docRef = doc(db, "press_releases", id);
      await updateDoc(docRef, { views: increment(1) });
      const item = inMemoryData.pressReleases?.find(e => e.id === id);
      if (item) { item.views = (item.views || 0) + 1; notifyCMSListeners(); }
    } else {
      try {
        const docRef = doc(db, "insights", id);
        await updateDoc(docRef, { views: increment(1) });
        const item = inMemoryData.insights?.find(e => e.id === id);
        if (item) { item.views = (item.views || 0) + 1; notifyCMSListeners(); }
      } catch (e) {
        const docRef2 = doc(db, "press_releases", id);
        await updateDoc(docRef2, { views: increment(1) });
        const item = inMemoryData.pressReleases?.find(e => e.id === id);
        if (item) { item.views = (item.views || 0) + 1; notifyCMSListeners(); }
      }
    }
  } catch (error) {
    console.error("Failed to increment view count", error);
  }
}`;

if (code.includes(oldIncDown)) {
  code = code.replace(oldIncDown, newCounters);
  fs.writeFileSync('src/lib/cms-store.ts', code);
  console.log('patched store successfully');
} else {
  console.log('could not find old string');
}
