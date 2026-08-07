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
  pdfUrl?: string;
  pdfFileName?: string;
  isHtmlUpload?: boolean;
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

const STORAGE_KEY = "osita_cms_local_db_v3";

export function getCMSData(): CMSData {
  if (typeof window === "undefined") {
    return {
      essays: initialEssays,
      dispatches: initialDispatches,
      inquiries: initialInquiries,
      subscribers: initialSubscribers,
      settings: initialSettings
    };
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const defaultData: CMSData = {
        essays: initialEssays,
        dispatches: initialDispatches,
        inquiries: initialInquiries,
        subscribers: initialSubscribers,
        settings: initialSettings
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultData));
      return defaultData;
    }
    const parsed = JSON.parse(raw);
    return {
      essays: Array.isArray(parsed.essays) && parsed.essays.length > 0 ? parsed.essays : initialEssays,
      dispatches: Array.isArray(parsed.dispatches) && parsed.dispatches.length > 0 ? parsed.dispatches : initialDispatches,
      inquiries: Array.isArray(parsed.inquiries) ? parsed.inquiries : initialInquiries,
      subscribers: Array.isArray(parsed.subscribers) ? parsed.subscribers : initialSubscribers,
      settings: { ...initialSettings, ...(parsed.settings || {}) }
    };
  } catch {
    return {
      essays: initialEssays,
      dispatches: initialDispatches,
      inquiries: initialInquiries,
      subscribers: initialSubscribers,
      settings: initialSettings
    };
  }
}

export function saveCMSData(data: CMSData) {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (err) {
      console.warn("Error saving to localStorage", err);
    }
  }
}

export function updateCMSEssays(newEssays: Essay[]) {
  const current = getCMSData();
  current.essays = newEssays;
  saveCMSData(current);
  return newEssays;
}

export function updateCMSDispatches(newDispatches: DispatchPost[]) {
  const current = getCMSData();
  current.dispatches = newDispatches;
  saveCMSData(current);
  return newDispatches;
}

export function addCMSInquiry(inquiry: Omit<PressInquiryItem, "id" | "date" | "status">) {
  const current = getCMSData();
  const newItem: PressInquiryItem = {
    ...inquiry,
    id: `inq-${Date.now()}`,
    date: new Date().toISOString().split("T")[0],
    status: "New"
  };
  current.inquiries.unshift(newItem);
  saveCMSData(current);
  return newItem;
}

export function updateInquiryStatus(id: string, status: "New" | "Reviewed" | "Archived") {
  const current = getCMSData();
  const item = current.inquiries.find(i => i.id === id);
  if (item) {
    item.status = status;
    saveCMSData(current);
  }
  return current.inquiries;
}

export function deleteInquiry(id: string) {
  const current = getCMSData();
  current.inquiries = current.inquiries.filter(i => i.id !== id);
  saveCMSData(current);
  return current.inquiries;
}

export function addCMSSubscriber(email: string, source = "Website") {
  const current = getCMSData();
  const existing = current.subscribers.find(s => s.email.toLowerCase() === email.toLowerCase());
  if (existing) return existing;

  const newSub: SubscriberItem = {
    id: `sub-${Date.now()}`,
    email,
    date: new Date().toISOString().split("T")[0],
    source
  };
  current.subscribers.unshift(newSub);
  saveCMSData(current);
  return newSub;
}

export function updateCMSSettings(newSettings: Partial<CMSSettings>) {
  const current = getCMSData();
  current.settings = { ...current.settings, ...newSettings };
  saveCMSData(current);
  return current.settings;
}
