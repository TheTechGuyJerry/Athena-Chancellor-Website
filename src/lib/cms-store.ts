import { essays as initialEssays, Essay } from "./essays";
import { db, storage } from "./firebase";
import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  deleteDoc,
  onSnapshot
} from "firebase/firestore";
import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  UploadTask
} from "firebase/storage";

export type AttachmentMetadata = {
  id: string;
  filename: string;
  url: string;
  storagePath: string;
  mimeType: string;
  size: number;
  uploadedAt: string;
};

export interface UploadProgressInfo {
  bytesTransferred: number;
  totalBytes: number;
  progressPercent: number;
  state: string;
}

export type DispatchPost = {
  id: string;
  slug: string;
  title: string;
  date: string;
  category: string;
  summary: string;
  content: string[];
  published: boolean;
  author: string;
  reads?: number;
  pdfUrl?: string;
  pdfFileName?: string;
  isHtmlUpload?: boolean;
  imageUrl?: string;
  attachments?: AttachmentMetadata[];
};

export type PressInquiryItem = {
  id: string;
  name: string;
  organization: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  date: string;
  status: "New" | "Reviewed" | "Archived";
};

export type SubscriberItem = {
  id: string;
  email: string;
  date: string;
  source: string;
};

export type CMSSettings = {
  siteTitle: string;
  contactEmail: string;
  adminEmail: string;
  adminPasswordHash: string;
  adminPasswordRaw: string;
  maintenanceMode: boolean;
};

export type CMSData = {
  essays: Essay[];
  dispatches: DispatchPost[];
  inquiries: PressInquiryItem[];
  subscribers: SubscriberItem[];
  settings: CMSSettings;
};

const initialDispatches: DispatchPost[] = [
  {
    id: "disp-1",
    slug: "moral-consensus-and-the-state",
    title: "Moral Consensus and the State: On Wole Soyinka's 92nd Birthday",
    date: "July 14, 2026",
    category: "Politics",
    summary: "Reflections on civic courage, institutional decay, and why political reform fails without a shared ethical baseline.",
    content: [
      "In my recent keynote address in Port Harcourt, I argued that constitutional amendments and legislative tweaks will fail to produce national renewal unless accompanied by a moral consensus.",
      "Power in Nigeria has become increasingly disconnected from public service. When citizens view the state purely as an extraction engine, civic duty collapses into private self-preservation.",
      "To rebuild Nigeria, we must construct local institutions that demonstrate visible integrity. Transparency is not merely an administrative procedure; it is a moral declaration."
    ],
    published: true,
    author: "Osita Chidoka",
    reads: 240
  },
  {
    id: "disp-2",
    slug: "mekaria-philosophy-in-action",
    title: "The Mekaria Philosophy: Reclaiming Excellence in Education",
    date: "June 28, 2026",
    category: "Youth",
    summary: "How our mentorship program is equipping 500 young leaders with technical skills, policy literacy, and executive discipline.",
    content: [
      "Through the Mekaria Mentorship Programme, we are testing a hypothesis: that young Nigerians, given rigorous training and moral clarity, can outperform institutional paralysis.",
      "Our fellows are currently developing open-data dashboards for local council budgets, analyzing transit logistics in Lagos, and drafting policy briefs for state assemblies.",
      "Excellence is a habit forged in discipline, not an accidental gift."
    ],
    published: true,
    author: "Osita Chidoka",
    reads: 185
  },
  {
    id: "disp-3",
    slug: "data-driven-regional-development",
    title: "Data-Driven Regional Governance in the South-East",
    date: "May 19, 2026",
    category: "Development",
    summary: "Moving beyond historical grievances to build concrete economic corridors, industrial parks, and digital infrastructure.",
    content: [
      "Grievance is a natural emotional response to historical unfairness, but it is a terrible foundation for economic planning.",
      "Our proposed South-East Economic Corridor focuses on three actionable metrics: power grid uptime in industrial clusters, port clearance efficiency, and software engineering talent production.",
      "When regional leaders lead with data, investors follow with capital."
    ],
    published: true,
    author: "Osita Chidoka",
    reads: 310
  },
  {
    id: "disp-4",
    slug: "modernizing-national-transport-systems",
    title: "Modernizing National Transit Logistics & Road Safety",
    date: "April 12, 2026",
    category: "Transport",
    summary: "Key lessons from FRSC intelligence systems applied to inter-state railway freight and urban traffic automation.",
    content: [
      "During my tenure as Corps Marshal of the FRSC, we pioneered technology-driven enforcement and real-time database management for vehicle licensing.",
      "Today, Nigeria's interstate transport network requires a similar digital leap — connecting rail freight corridors to seaport terminals with automated tracking.",
      "Safety and efficiency on national transit corridors are directly tied to economic productivity and investor confidence."
    ],
    published: true,
    author: "Osita Chidoka",
    reads: 215
  },
  {
    id: "disp-5",
    slug: "unlocking-sme-capital-and-innovation",
    title: "Unlocking SME Capital and Enterprise Innovation",
    date: "March 04, 2026",
    category: "Business",
    summary: "Strategic approaches to reducing regulatory bottlenecks and securing low-interest funding for African entrepreneurs.",
    content: [
      "Small and medium enterprises form the backbone of Nigeria's real economy, yet they face severe headwinds in credit access and multi-tier taxation.",
      "To unlock private enterprise, state governments must establish transparent collateral registries and streamlined business registration hubs.",
      "Empowering local business leaders is the fastest route to durable job creation across the nation."
    ],
    published: true,
    author: "Osita Chidoka",
    reads: 198
  },
  {
    id: "disp-6",
    slug: "preserving-heritage-inspiring-the-future",
    title: "Cultural Identity as an Anchor for Civic Virtue",
    date: "February 18, 2026",
    category: "Culture",
    summary: "Exploring how traditional values, civic philosophy, and cultural storytelling can guide modern African governance.",
    content: [
      "A nation without cultural memory quickly loses its moral compass in times of political turmoil.",
      "Our ancestral traditions emphasize communal accountability, respect for truth, and pride in honest labor — values that must be reinjected into public administration.",
      "Culture is not merely performance; it is the living philosophy that binds a society together."
    ],
    published: true,
    author: "Osita Chidoka",
    reads: 162
  },
  {
    id: "disp-7",
    slug: "principles-of-institutional-leadership",
    title: "Leadership Discipline: Execution vs Experience",
    date: "January 22, 2026",
    category: "Leadership",
    summary: "Why executive leadership requires a relentless focus on measurable delivery, institutional integrity, and courageous decision-making.",
    content: [
      "True leadership is judged not by the eloquence of speeches, but by the strength of the institutions left behind.",
      "Leaders must cultivate a culture of rigorous execution, clear accountability, and unyielding ethical standards across every level of public service.",
      "When leaders model personal discipline, institutions transform from bureaucratic bottlenecks into engines of public good."
    ],
    published: true,
    author: "Osita Chidoka",
    reads: 275
  }
];

const initialInquiries: PressInquiryItem[] = [
  {
    id: "inq-1",
    name: "Amina Yusuf",
    organization: "Channels Television",
    email: "a.yusuf@channelstv.com",
    phone: "+234 803 123 4567",
    subject: "Interview Request: State of the Nation Address Reaction",
    message: "We would like to invite Chief Osita Chidoka for a live 20-minute studio segment on Politics Today regarding his Wole Soyinka Lecture paper.",
    date: "2026-07-28",
    status: "New"
  },
  {
    id: "inq-2",
    name: "Emeka Okonkwo",
    organization: "The Guardian Nigeria",
    email: "e.okonkwo@guardian.ng",
    phone: "+234 802 987 6543",
    subject: "Op-Ed Syndication Request",
    message: "Requesting permission to publish an excerpt of 'Governance as the Foundation for Africa's Future' in Sunday Guardian edition.",
    date: "2026-07-15",
    status: "Reviewed"
  }
];

const initialSubscribers: SubscriberItem[] = [
  { id: "sub-1", email: "dr.nwosu@unizik.edu.ng", date: "2026-07-02", source: "The Canon" },
  { id: "sub-2", email: "kemi.adebayo@policyhub.ng", date: "2026-07-10", source: "Blog" },
  { id: "sub-3", email: "j.obi@mekaria.org", date: "2026-07-22", source: "Header" }
];

const initialSettings: CMSSettings = {
  siteTitle: "Osita Chidoka — Public Servant, Writer & Institution Builder",
  contactEmail: "jerryagbedun@gmail.com",
  adminEmail: "jerryagbedun@gmail.com",
  adminPasswordHash: "OsitaAdmin2026!",
  adminPasswordRaw: "OsitaAdmin2026!",
  maintenanceMode: false
};

let inMemoryData: CMSData = {
  essays: initialEssays,
  dispatches: initialDispatches,
  inquiries: initialInquiries,
  subscribers: initialSubscribers,
  settings: initialSettings
};

let isInitializingPromise: Promise<CMSData> | null = null;
let isRealtimeListenerAttached = false;

function notifyCMSListeners() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("osita_cms_updated"));
  }
}

// 1. Storage Upload Function using Firebase uploadBytesResumable
export async function uploadCMSFile(
  file: File,
  folder: "essays" | "dispatches" | "general" = "general",
  onProgress?: (progress: UploadProgressInfo) => void,
  onTaskCreated?: (task: UploadTask) => void,
  maxSizeBytes: number = 25 * 1024 * 1024 // 25MB default
): Promise<AttachmentMetadata> {
  if (!file) {
    throw new Error("No file provided for upload.");
  }

  if (file.size > maxSizeBytes) {
    const sizeInMB = (maxSizeBytes / (1024 * 1024)).toFixed(0);
    throw new Error(`File size (${(file.size / (1024 * 1024)).toFixed(1)}MB) exceeds maximum permitted limit of ${sizeInMB}MB.`);
  }

  const cleanName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
  const storagePath = `cms_attachments/${folder}/${Date.now()}_${cleanName}`;
  const storageRef = ref(storage, storagePath);

  console.log(`[Firebase Storage] Starting upload to bucket [${storage.app.options.storageBucket}] at path [${storagePath}] for file "${file.name}" (${(file.size / 1024).toFixed(1)} KB)...`);

  const uploadTask = uploadBytesResumable(storageRef, file, {
    contentType: file.type || "application/octet-stream"
  });

  if (onTaskCreated) {
    onTaskCreated(uploadTask);
  }

  return new Promise((resolve, reject) => {
    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const bytesTransferred = snapshot.bytesTransferred;
        const totalBytes = snapshot.totalBytes || file.size;
        const progressPercent = totalBytes > 0 ? Math.round((bytesTransferred / totalBytes) * 100) : 0;

        if (onProgress) {
          onProgress({
            bytesTransferred,
            totalBytes,
            progressPercent,
            state: snapshot.state
          });
        }
      },
      (error: any) => {
        if (error?.code === "storage/canceled") {
          console.info("[Firebase Storage] Upload canceled by user.");
        } else {
          console.error("Firebase Storage Upload Error:", {
            code: error?.code,
            message: error?.message,
            serverResponse: error?.serverResponse,
            name: error?.name,
            rawError: error
          });
        }

        let userFacingMsg = `Storage upload failed: ${error?.message || String(error)}`;

        switch (error?.code) {
          case "storage/unauthorized":
            userFacingMsg = "Permission denied (storage/unauthorized). You do not have authorization to upload to Firebase Storage.";
            break;
          case "storage/unauthenticated":
            userFacingMsg = "User unauthenticated (storage/unauthenticated). Please sign in to upload files.";
            break;
          case "storage/quota-exceeded":
            userFacingMsg = "Firebase Storage quota exceeded (storage/quota-exceeded).";
            break;
          case "storage/retry-limit-exceeded":
            userFacingMsg = "Network error / retry limit exceeded (storage/retry-limit-exceeded). Please check your connection.";
            break;
          case "storage/canceled":
            userFacingMsg = "Upload was canceled by user (storage/canceled).";
            break;
          case "storage/unknown":
            userFacingMsg = `An unknown Firebase Storage error occurred (storage/unknown). ${error?.serverResponse ? "Server response: " + JSON.stringify(error.serverResponse) : ""}`;
            break;
        }

        const formattedError = new Error(userFacingMsg);
        (formattedError as any).code = error?.code || "storage/unknown";
        reject(formattedError);
      },
      async () => {
        try {
          const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
          console.log(`[Firebase Storage] Upload complete! Download URL: ${downloadUrl}`);
          resolve({
            id: `file-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
            filename: file.name,
            url: downloadUrl,
            storagePath,
            mimeType: file.type || "application/octet-stream",
            size: file.size,
            uploadedAt: new Date().toISOString()
          });
        } catch (urlErr) {
          console.error("[Firebase Storage] Failed to retrieve download URL:", urlErr);
          reject(new Error(`Failed to retrieve download URL: ${urlErr instanceof Error ? urlErr.message : String(urlErr)}`));
        }
      }
    );
  });
}

// 2. Initialize and Fetch Authoritative CMS Data from Firestore
export async function initCMSStore(): Promise<CMSData> {
  if (isInitializingPromise) {
    return isInitializingPromise;
  }

  isInitializingPromise = (async () => {
    try {
      // Setup Realtime Listeners once
      setupRealtimeListeners();

      // Fetch Essays
      const essaysSnap = await getDocs(collection(db, "essays"));
      let fetchedEssays: Essay[] = [];
      if (!essaysSnap.empty) {
        fetchedEssays = essaysSnap.docs.map(docSnap => docSnap.data() as Essay);
      } else {
        console.log("Firestore essays collection is empty. Migrating initial essays to backend...");
        for (const essay of initialEssays) {
          await setDoc(doc(db, "essays", essay.slug), essay);
        }
        fetchedEssays = [...initialEssays];
      }

      // Fetch Dispatches
      const dispatchesSnap = await getDocs(collection(db, "dispatches"));
      let fetchedDispatches: DispatchPost[] = [];
      if (!dispatchesSnap.empty) {
        fetchedDispatches = dispatchesSnap.docs.map(docSnap => docSnap.data() as DispatchPost);
      } else {
        console.log("Firestore dispatches collection is empty. Migrating initial dispatches to backend...");
        for (const disp of initialDispatches) {
          await setDoc(doc(db, "dispatches", disp.id), disp);
        }
        fetchedDispatches = [...initialDispatches];
      }

      // Fetch Inquiries
      const inquiriesSnap = await getDocs(collection(db, "inquiries"));
      let fetchedInquiries: PressInquiryItem[] = [];
      if (!inquiriesSnap.empty) {
        fetchedInquiries = inquiriesSnap.docs.map(docSnap => docSnap.data() as PressInquiryItem);
      } else {
        for (const inq of initialInquiries) {
          await setDoc(doc(db, "inquiries", inq.id), inq);
        }
        fetchedInquiries = [...initialInquiries];
      }

      // Fetch Subscribers
      const subscribersSnap = await getDocs(collection(db, "subscribers"));
      let fetchedSubscribers: SubscriberItem[] = [];
      if (!subscribersSnap.empty) {
        fetchedSubscribers = subscribersSnap.docs.map(docSnap => docSnap.data() as SubscriberItem);
      } else {
        for (const sub of initialSubscribers) {
          await setDoc(doc(db, "subscribers", sub.id), sub);
        }
        fetchedSubscribers = [...initialSubscribers];
      }

      // Fetch Settings
      const settingsRef = doc(db, "settings", "global");
      const settingsSnap = await getDoc(settingsRef);
      let fetchedSettings: CMSSettings = initialSettings;
      if (settingsSnap.exists()) {
        fetchedSettings = { ...initialSettings, ...settingsSnap.data() } as CMSSettings;
      } else {
        await setDoc(settingsRef, initialSettings);
      }

      inMemoryData = {
        essays: fetchedEssays,
        dispatches: fetchedDispatches,
        inquiries: fetchedInquiries,
        subscribers: fetchedSubscribers,
        settings: fetchedSettings
      };

      notifyCMSListeners();
      return inMemoryData;
    } catch (err) {
      console.error("Error connecting to Firestore backend during CMS init:", err);
      return inMemoryData;
    }
  })();

  return isInitializingPromise;
}

// 3. Realtime Listeners
function setupRealtimeListeners() {
  if (isRealtimeListenerAttached || typeof window === "undefined") return;
  isRealtimeListenerAttached = true;

  try {
    onSnapshot(collection(db, "essays"), (snap) => {
      if (!snap.empty) {
        inMemoryData.essays = snap.docs.map(d => d.data() as Essay);
        notifyCMSListeners();
      }
    }, (err) => console.error("Realtime essays sync error:", err));

    onSnapshot(collection(db, "dispatches"), (snap) => {
      if (!snap.empty) {
        inMemoryData.dispatches = snap.docs.map(d => d.data() as DispatchPost);
        notifyCMSListeners();
      }
    }, (err) => console.error("Realtime dispatches sync error:", err));

    onSnapshot(collection(db, "inquiries"), (snap) => {
      inMemoryData.inquiries = snap.docs.map(d => d.data() as PressInquiryItem);
      notifyCMSListeners();
    }, (err) => console.error("Realtime inquiries sync error:", err));

    onSnapshot(collection(db, "subscribers"), (snap) => {
      inMemoryData.subscribers = snap.docs.map(d => d.data() as SubscriberItem);
      notifyCMSListeners();
    }, (err) => console.error("Realtime subscribers sync error:", err));

    onSnapshot(doc(db, "settings", "global"), (snap) => {
      if (snap.exists()) {
        inMemoryData.settings = { ...initialSettings, ...snap.data() } as CMSSettings;
        notifyCMSListeners();
      }
    }, (err) => console.error("Realtime settings sync error:", err));
  } catch (e) {
    console.error("Could not bind Firestore realtime listeners:", e);
  }
}

// Automatically start background init on module load
if (typeof window !== "undefined") {
  initCMSStore().catch(e => console.error("Auto initCMSStore failed:", e));
}

// 4. Synchronous Read Wrapper
export function getCMSData(): CMSData {
  return inMemoryData;
}

// 5. Backend Persistence Operations (Async + Strict Error Handling)

export async function saveEssay(essay: Essay): Promise<void> {
  if (!essay.slug) {
    throw new Error("Essay URL slug is required.");
  }
  const cleanDoc = JSON.parse(JSON.stringify(essay));
  try {
    // Write to Firestore server FIRST
    await setDoc(doc(db, "essays", essay.slug), cleanDoc);
    
    const idx = inMemoryData.essays.findIndex(e => e.slug === essay.slug);
    if (idx >= 0) {
      inMemoryData.essays[idx] = cleanDoc;
    } else {
      inMemoryData.essays.unshift(cleanDoc);
    }
    notifyCMSListeners();
  } catch (err) {
    console.error("Backend save failure for essay:", err);
    throw new Error(`Server write failed: ${err instanceof Error ? err.message : String(err)}`);
  }
}

export async function deleteEssay(slug: string): Promise<void> {
  try {
    await deleteDoc(doc(db, "essays", slug));
    inMemoryData.essays = inMemoryData.essays.filter(e => e.slug !== slug);
    notifyCMSListeners();
  } catch (err) {
    console.error("Backend delete failure for essay:", err);
    throw new Error(`Server delete failed: ${err instanceof Error ? err.message : String(err)}`);
  }
}

export async function saveDispatch(dispatch: DispatchPost): Promise<void> {
  if (!dispatch.id) {
    throw new Error("Dispatch ID is required.");
  }
  const cleanDoc = JSON.parse(JSON.stringify(dispatch));
  try {
    await setDoc(doc(db, "dispatches", dispatch.id), cleanDoc);
    const idx = inMemoryData.dispatches.findIndex(d => d.id === dispatch.id);
    if (idx >= 0) {
      inMemoryData.dispatches[idx] = cleanDoc;
    } else {
      inMemoryData.dispatches.unshift(cleanDoc);
    }
    notifyCMSListeners();
  } catch (err) {
    console.error("Backend save failure for dispatch:", err);
    throw new Error(`Server write failed: ${err instanceof Error ? err.message : String(err)}`);
  }
}

export async function deleteDispatch(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, "dispatches", id));
    inMemoryData.dispatches = inMemoryData.dispatches.filter(d => d.id !== id);
    notifyCMSListeners();
  } catch (err) {
    console.error("Backend delete failure for dispatch:", err);
    throw new Error(`Server delete failed: ${err instanceof Error ? err.message : String(err)}`);
  }
}

export async function addCMSInquiry(inquiry: Omit<PressInquiryItem, "id" | "date" | "status">): Promise<PressInquiryItem> {
  const newItem: PressInquiryItem = {
    ...inquiry,
    id: `inq-${Date.now()}`,
    date: new Date().toISOString().split("T")[0],
    status: "New"
  };
  try {
    await setDoc(doc(db, "inquiries", newItem.id), newItem);
    inMemoryData.inquiries.unshift(newItem);
    notifyCMSListeners();
    return newItem;
  } catch (err) {
    console.error("Backend save failure for inquiry:", err);
    throw new Error(`Server write failed: ${err instanceof Error ? err.message : String(err)}`);
  }
}

export async function updateInquiryStatus(id: string, status: "New" | "Reviewed" | "Archived"): Promise<PressInquiryItem[]> {
  const item = inMemoryData.inquiries.find(i => i.id === id);
  if (item) {
    const updated = { ...item, status };
    try {
      await setDoc(doc(db, "inquiries", id), updated);
      item.status = status;
      notifyCMSListeners();
    } catch (err) {
      console.error("Backend update failure for inquiry:", err);
      throw new Error(`Server update failed: ${err instanceof Error ? err.message : String(err)}`);
    }
  }
  return inMemoryData.inquiries;
}

export async function deleteInquiry(id: string): Promise<PressInquiryItem[]> {
  try {
    await deleteDoc(doc(db, "inquiries", id));
    inMemoryData.inquiries = inMemoryData.inquiries.filter(i => i.id !== id);
    notifyCMSListeners();
  } catch (err) {
    console.error("Backend delete failure for inquiry:", err);
    throw new Error(`Server delete failed: ${err instanceof Error ? err.message : String(err)}`);
  }
  return inMemoryData.inquiries;
}

export async function addCMSSubscriber(email: string, source = "Website"): Promise<SubscriberItem> {
  const existing = inMemoryData.subscribers.find(s => s.email.toLowerCase() === email.toLowerCase());
  if (existing) return existing;

  const newSub: SubscriberItem = {
    id: `sub-${Date.now()}`,
    email,
    date: new Date().toISOString().split("T")[0],
    source
  };
  try {
    await setDoc(doc(db, "subscribers", newSub.id), newSub);
    inMemoryData.subscribers.unshift(newSub);
    notifyCMSListeners();
    return newSub;
  } catch (err) {
    console.error("Backend save failure for subscriber:", err);
    throw new Error(`Server write failed: ${err instanceof Error ? err.message : String(err)}`);
  }
}

export async function updateCMSSettings(newSettings: Partial<CMSSettings>): Promise<CMSSettings> {
  const merged = { ...inMemoryData.settings, ...newSettings };
  try {
    await setDoc(doc(db, "settings", "global"), merged);
    inMemoryData.settings = merged;
    notifyCMSListeners();
    return merged;
  } catch (err) {
    console.error("Backend save failure for settings:", err);
    throw new Error(`Server write failed: ${err instanceof Error ? err.message : String(err)}`);
  }
}

// Legacy wrappers for compatibility
export function updateCMSEssays(newEssays: Essay[]) {
  inMemoryData.essays = newEssays;
  notifyCMSListeners();
  return newEssays;
}

export function updateCMSDispatches(newDispatches: DispatchPost[]) {
  inMemoryData.dispatches = newDispatches;
  notifyCMSListeners();
  return newDispatches;
}
