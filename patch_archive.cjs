const fs = require('fs');
let code = fs.readFileSync('src/components/Archive.tsx', 'utf8');

if (!code.includes('safeSortTime')) {
  code = code.replace(
    'import { Essay } from "../lib/essays";',
    'import { Essay } from "../lib/essays";\nimport { safeSortTime } from "../lib/url-utils";'
  );
}

// Replace groupedByYear sort and inner sort
const oldGroupCode = `    return Object.entries(groups)
      .map(([year, list]) => ({ year: Number(year), list }))
      .sort((a, b) => b.year - a.year);`;

const newGroupCode = `    return Object.entries(groups)
      .map(([year, list]) => ({ 
        year: Number(year), 
        list: list.sort((a, b) => safeSortTime(a.month) - safeSortTime(b.month)) 
      }))
      .sort((a, b) => a.year - b.year);`;

code = code.replace(oldGroupCode, newGroupCode);

fs.writeFileSync('src/components/Archive.tsx', code);
