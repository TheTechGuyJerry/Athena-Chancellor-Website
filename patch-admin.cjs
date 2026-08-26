const fs = require('fs');
let code = fs.readFileSync('src/pages/AdminPage.tsx', 'utf8');
code = code.replace(
  'const rows = subscribers.map((s) => `"${s.email}","${s.date}","${s.source}"`).join("\\n");',
  'const rows = subscribers.map((s) => `"${s.email}","${s.date}","${s.source}","${s.stateOfResidence || "" }","${s.organisation || "" }","${s.status || "subscribed" }"`).join("\\n");'
);
fs.writeFileSync('src/pages/AdminPage.tsx', code);
