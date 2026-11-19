import fs from 'node:fs';
// The UI contains no seed or personal booking data. Import data after authentication.
const html=fs.readFileSync(new URL('../travel-app/ui-source.html',import.meta.url),'utf8');
fs.writeFileSync(new URL('../travel-app/ui.mjs',import.meta.url),'export const HTML = '+JSON.stringify(html)+';\n');
