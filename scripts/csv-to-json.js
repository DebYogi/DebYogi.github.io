#!/usr/bin/env node
// Simple CSV to JSON converter for projects/posts.
// Usage: node csv-to-json.js projects.csv data/projects.json

const fs = require('fs');
const path = require('path');
const csvParse = require('csv-parse/lib/sync');

if(process.argv.length < 3){
  console.error('Usage: node csv-to-json.js <input.csv> [output.json]');
  process.exit(1);
}

const input = process.argv[2];
const output = process.argv[3] || ('data/' + path.basename(input).replace(/\.csv$/i, '.json'));

const csv = fs.readFileSync(input, 'utf8');
const records = csvParse(csv, {columns:true, skip_empty_lines:true});

// If CSV contains a `type` column with 'experience'/'education', convert into grouped JSON
if(records.length && records[0].type){
  const grouped = { experience: [], education: [] };
  records.forEach(r => {
    if(r.type && (r.type.toLowerCase() === 'experience' || r.type.toLowerCase() === 'education')){
      const t = r.type.toLowerCase();
      // remove type key
      delete r.type;
      grouped[t].push(r);
    }
  });
  fs.writeFileSync(output, JSON.stringify(grouped, null, 2), 'utf8');
  console.log(`Wrote grouped timeline with ${grouped.experience.length} experience and ${grouped.education.length} education entries to ${output}`);
} else {
  fs.writeFileSync(output, JSON.stringify(records, null, 2), 'utf8');
  console.log(`Wrote ${records.length} rows to ${output}`);
}
