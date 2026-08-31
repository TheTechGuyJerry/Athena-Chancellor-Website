const fs = require('fs');
let code = fs.readFileSync('src/components/Archive.tsx', 'utf8');

const oldGroupCode = `    return Object.entries(groups)
      .map(([year, list]) => ({ 
        year: Number(year), 
        list: list.sort((a, b) => safeSortTime(a.month) - safeSortTime(b.month)) 
      }))
      .sort((a, b) => a.year - b.year);`;

const newGroupCode = `    return Object.entries(groups)
      .map(([year, list]) => ({ 
        year: Number(year), 
        list: list.sort((a, b) => safeSortTime(b.month) - safeSortTime(a.month)) 
      }))
      .sort((a, b) => b.year - a.year);`;

code = code.replace(oldGroupCode, newGroupCode);
fs.writeFileSync('src/components/Archive.tsx', code);
