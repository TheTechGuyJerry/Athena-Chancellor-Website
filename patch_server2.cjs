const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(
  'import { Resend } from "resend";',
  'import { Resend } from "resend";\nimport crypto from "crypto";'
);

code = code.replace(
  'const crypto = require("crypto");\n',
  ''
);

fs.writeFileSync('server.ts', code);
