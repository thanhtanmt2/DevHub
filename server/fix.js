const fs = require('fs');
let content = fs.readFileSync('e:/Desktop/tlcn/client/src/pages/candidate/WorkspacePage.jsx', 'utf8');
content = content.replace('from "./components/WorkspaceLogs"', 'from "../candidate/components/WorkspaceLogs"');
fs.writeFileSync('e:/Desktop/tlcn/client/src/pages/admin/WorkspacePage.jsx', content, 'utf8');
console.log('Fixed!');
