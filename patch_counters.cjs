const fs = require('fs');
let code = fs.readFileSync('src/lib/cms-store.ts', 'utf8');

const oldIncDown = `export async function incrementDownloadCount(id: string, type: 'essay' | 'dispatch' | 'insight' | 'press_release'): Promise<void> {`;
const newIncDown = `const sessionTrackedDownloads = new Set<string>();\nexport async function incrementDownloadCount(id: string, type: 'essay' | 'dispatch' | 'insight' | 'press_release'): Promise<void> {\n  const key = \`\${type}-\${id}\`;\n  if (sessionTrackedDownloads.has(key)) return;\n  sessionTrackedDownloads.add(key);\n`;

code = code.replace(oldIncDown, newIncDown);

const oldIncView = `export async function incrementViewCount(id: string, type: 'essay' | 'dispatch' | 'insight' | 'press_release'): Promise<void> {`;
const newIncView = `const sessionTrackedViews = new Set<string>();\nexport async function incrementViewCount(id: string, type: 'essay' | 'dispatch' | 'insight' | 'press_release'): Promise<void> {\n  const key = \`\${type}-\${id}\`;\n  if (sessionTrackedViews.has(key)) return;\n  sessionTrackedViews.add(key);\n`;

code = code.replace(oldIncView, newIncView);

fs.writeFileSync('src/lib/cms-store.ts', code);
console.log('patched counters');
