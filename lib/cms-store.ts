import fs from "fs";
import path from "path";
import { essays as initialEssays, Essay } from "./essays";

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
  adminPasswordHash: string; // Plain/simple hashed or token for CMS access
  adminPasswordRaw: string;  // Kept for UI display in admin setting
  maintenanceMode: boolean;
};

export type CMSData = {
  essays: Essay[];
  dispatches: DispatchPost[];
  inquiries: PressInquiryItem[];
  subscribers: SubscriberItem[];
  settings: CMSSettings;
};

const DATA_FILE = path.join(process.cwd(), "data", "cms-db.json");

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

let memoryStore: CMSData = {
  essays: initialEssays,
  dispatches: initialDispatches,
  inquiries: initialInquiries,
  subscribers: initialSubscribers,
  settings: initialSettings
};

function ensureDataFile() {
  try {
    const dir = path.dirname(DATA_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    if (!fs.existsSync(DATA_FILE)) {
      fs.writeFileSync(DATA_FILE, JSON.stringify(memoryStore, null, 2), "utf-8");
    } else {
      const content = fs.readFileSync(DATA_FILE, "utf-8");
      const parsed = JSON.parse(content);
      const loadedSettings = { ...initialSettings, ...(parsed.settings || {}) };
      if (!loadedSettings.adminEmail || loadedSettings.adminEmail === "admin@ositachidoka.org") {
        loadedSettings.adminEmail = "jerryagbedun@gmail.com";
      }
      memoryStore = {
        essays: Array.isArray(parsed.essays) && parsed.essays.length > 0 ? parsed.essays : initialEssays,
        dispatches: Array.isArray(parsed.dispatches) && parsed.dispatches.length > 0 ? parsed.dispatches : initialDispatches,
        inquiries: Array.isArray(parsed.inquiries) ? parsed.inquiries : initialInquiries,
        subscribers: Array.isArray(parsed.subscribers) ? parsed.subscribers : initialSubscribers,
        settings: loadedSettings
      };
    }
  } catch {
    // Fallback to in-memory store if fs fails
  }
}

// Load data on startup
ensureDataFile();

function saveData() {
  try {
    const dir = path.dirname(DATA_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(memoryStore, null, 2), "utf-8");
  } catch {
    // Ignore fs errors in read-only environments
  }
}

export function getCMSData(): CMSData {
  ensureDataFile();
  return memoryStore;
}

export function updateCMSEssays(newEssays: Essay[]) {
  memoryStore.essays = newEssays;
  saveData();
}

export function updateCMSDispatches(newDispatches: DispatchPost[]) {
  memoryStore.dispatches = newDispatches;
  saveData();
}

export function addCMSInquiry(inquiry: Omit<PressInquiryItem, "id" | "date" | "status">) {
  const newItem: PressInquiryItem = {
    ...inquiry,
    id: `inq-${Date.now()}`,
    date: new Date().toISOString().split("T")[0],
    status: "New"
  };
  memoryStore.inquiries.unshift(newItem);
  saveData();
  return newItem;
}

export function updateInquiryStatus(id: string, status: "New" | "Reviewed" | "Archived") {
  const item = memoryStore.inquiries.find(i => i.id === id);
  if (item) {
    item.status = status;
    saveData();
  }
}

export function deleteInquiry(id: string) {
  memoryStore.inquiries = memoryStore.inquiries.filter(i => i.id !== id);
  saveData();
}

export function addCMSSubscriber(email: string, source = "Website") {
  ensureDataFile();
  const existing = memoryStore.subscribers.find(s => s.email.toLowerCase() === email.toLowerCase());
  if (existing) return existing;

  const newSub: SubscriberItem = {
    id: `sub-${Date.now()}`,
    email,
    date: new Date().toISOString().split("T")[0],
    source
  };
  memoryStore.subscribers.unshift(newSub);
  saveData();
  return newSub;
}

export function updateCMSSettings(newSettings: Partial<CMSSettings>) {
  memoryStore.settings = { ...memoryStore.settings, ...newSettings };
  saveData();
}
