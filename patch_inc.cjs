const fs = require('fs');
let code = fs.readFileSync('src/lib/cms-store.ts', 'utf8');

code = code.replace(
  "export async function incrementDownloadCount(id: string, type: 'essay' | 'dispatch'): Promise<void> {",
  "export async function incrementDownloadCount(id: string, type: 'essay' | 'dispatch' | 'insight' | 'press_release'): Promise<void> {"
);

code = code.replace(
  `    if (type === 'essay') {
      const docRef = doc(db, "osita_essays", id);
      await updateDoc(docRef, { downloads: increment(1) });
    } else {
      const docRef = doc(db, "osita_dispatches", id);
      await updateDoc(docRef, { downloads: increment(1) });
    }`,
  `    if (type === 'essay') {
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
    }`
);

fs.writeFileSync('src/lib/cms-store.ts', code);
