const fs = require('fs');
let code = fs.readFileSync('src/lib/url-utils.ts', 'utf8');
code += `
export function safeIsoDate(dateStr: string | undefined | null, defaultIso?: string): string {
  const fallback = defaultIso || new Date().toISOString();
  if (!dateStr) return fallback;
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return fallback;
  return d.toISOString();
}

export function safeSortTime(dateStr: string | undefined | null): number {
  if (!dateStr) return 0;
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return 0;
  return d.getTime();
}
`;
fs.writeFileSync('src/lib/url-utils.ts', code);
