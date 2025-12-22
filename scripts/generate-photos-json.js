// Node script to scan an assets/photos folder and generate data/photos.json
const fs = require('fs');
const path = require('path');
const folder = process.argv[2] || 'assets/photos';
const out = process.argv[3] || 'data/photos.json';
const exts = ['.jpg','.jpeg','.png','.webp','.svg'];
const files = fs.readdirSync(folder).filter(f => exts.includes(path.extname(f).toLowerCase()));
const rows = files.map(f => ({file: `${folder}/${f}`, caption: ''}));
fs.writeFileSync(out, JSON.stringify(rows, null, 2));
console.log(`Wrote ${rows.length} items to ${out}`);
