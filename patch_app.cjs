const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

if (!code.includes('SubscribeContinuePage')) {
  code = code.replace(
    'import { SubscribePage } from "./pages/SubscribePage";',
    'import { SubscribePage } from "./pages/SubscribePage";\nimport { SubscribeContinuePage } from "./pages/SubscribeContinuePage";'
  );

  code = code.replace(
    '<Route path="/subscribe" element={<SubscribePage />} />',
    '<Route path="/subscribe" element={<SubscribePage />} />\n          <Route path="/subscribe/continue" element={<SubscribeContinuePage />} />'
  );

  fs.writeFileSync('src/App.tsx', code);
}
