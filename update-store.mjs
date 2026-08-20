import fs from 'fs';
let code = fs.readFileSync('src/lib/cms-store.ts', 'utf8');

// Add Newsletter type
if (!code.includes("export type NewsletterItem")) {
  code = code.replace("export type SubscriberItem = {", "export type NewsletterItem = {\n  id: string;\n  subject: string;\n  content: string;\n  status: 'draft' | 'scheduled' | 'sent';\n  createdAt: string;\n  scheduledFor?: string;\n  sentAt?: string;\n};\n\nexport type SubscriberItem = {");
}

// Add newsletters array to CMSData
if (!code.includes("newsletters: NewsletterItem[];")) {
  code = code.replace("subscribers: SubscriberItem[];", "subscribers: SubscriberItem[];\n  newsletters: NewsletterItem[];");
}

// Add initialNewsletters
if (!code.includes("const initialNewsletters: NewsletterItem[]")) {
  code = code.replace("const initialSubscribers: SubscriberItem[] = [", "const initialNewsletters: NewsletterItem[] = [];\n\nconst initialSubscribers: SubscriberItem[] = [");
}

// Add to initialData
if (!code.includes("newsletters: initialNewsletters,")) {
  code = code.replace("subscribers: initialSubscribers,", "subscribers: initialSubscribers,\n  newsletters: initialNewsletters,");
}

// We need to fetch and sync newsletters from Firestore
// Just to be safe, I'll write a full replace for the firestore parts later if needed,
// but for the sake of the preview, keeping it in memory is mostly enough if we just add the methods.

if (!code.includes("export async function saveNewsletter(")) {
  code += `\n
export async function saveNewsletter(newsletter: Partial<NewsletterItem>): Promise<NewsletterItem> {
  const isNew = !newsletter.id;
  const newNL: NewsletterItem = {
    id: newsletter.id || \`nl-\${Date.now()}\`,
    subject: newsletter.subject || "Untitled Newsletter",
    content: newsletter.content || "",
    status: newsletter.status || 'draft',
    createdAt: newsletter.createdAt || new Date().toISOString(),
    scheduledFor: newsletter.scheduledFor,
    sentAt: newsletter.sentAt
  };

  try {
    const { doc, setDoc } = await import("firebase/firestore");
    const { db } = await import("./firebase");
    if (db) {
      await setDoc(doc(db, "osita_newsletters", newNL.id), newNL);
    }
  } catch (err) {
    console.warn("Backend unavailable, saving newsletter to memory.");
  }

  const existingIndex = inMemoryData.newsletters.findIndex(n => n.id === newNL.id);
  if (existingIndex >= 0) {
    inMemoryData.newsletters[existingIndex] = newNL;
  } else {
    inMemoryData.newsletters.push(newNL);
  }
  
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("osita_cms_updated"));
  }
  return newNL;
}

export async function deleteNewsletter(id: string): Promise<void> {
  try {
    const { doc, deleteDoc } = await import("firebase/firestore");
    const { db } = await import("./firebase");
    if (db) {
      await deleteDoc(doc(db, "osita_newsletters", id));
    }
  } catch (err) {
    console.warn("Backend unavailable, deleting newsletter from memory.");
  }

  inMemoryData.newsletters = inMemoryData.newsletters.filter(n => n.id !== id);
  
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("osita_cms_updated"));
  }
}
`;
}

// Adding firebase fetch for newsletters
// Look for where subscribers are fetched
code = code.replace(
  `const subscribersSnap = await getDocs(collection(db, "osita_subscribers"));`,
  `const subscribersSnap = await getDocs(collection(db, "osita_subscribers"));\n      const newslettersSnap = await getDocs(collection(db, "osita_newsletters"));`
);

code = code.replace(
  `fetchedSubscribers = subscribersSnap.docs.map(docSnap => docSnap.data() as SubscriberItem);`,
  `fetchedSubscribers = subscribersSnap.docs.map(docSnap => docSnap.data() as SubscriberItem);\n        const fetchedNewsletters = newslettersSnap.docs.map(docSnap => docSnap.data() as NewsletterItem);\n        inMemoryData.newsletters = fetchedNewsletters;`
);

code = code.replace(
  `onSnapshot(collection(db, "osita_subscribers"), (snap) => {`,
  `onSnapshot(collection(db, "osita_newsletters"), (snap) => {\n      inMemoryData.newsletters = snap.docs.map(d => d.data() as NewsletterItem);\n      window.dispatchEvent(new CustomEvent("osita_cms_updated"));\n    }, (err) => console.error("Realtime newsletters sync error:", err));\n\n    onSnapshot(collection(db, "osita_subscribers"), (snap) => {`
);

fs.writeFileSync('src/lib/cms-store.ts', code);
