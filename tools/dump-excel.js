// dump-excel.js — print rows from the latest xlsx for a given day range
// Usage: node tools/dump-excel.js [fromDay] [toDay]
const ExcelJS = require('exceljs');
const path = require('path');
const fs = require('fs');

const XLSX = path.join(__dirname, '..', 'mom-trip-recommendations.xlsx');
const fromDay = parseInt(process.argv[2] || '1', 10);
const toDay = parseInt(process.argv[3] || '5', 10);

(async () => {
  const stat = fs.statSync(XLSX);
  console.log(`SOURCE: ${path.basename(XLSX)}`);
  console.log(`  mtime: ${stat.mtime.toISOString()}`);
  console.log(`  bytes: ${stat.size}\n`);

  const wb = new ExcelJS.Workbook();
  await wb.xlsx.readFile(XLSX);
  const ws = wb.getWorksheet(1);

  let currentDay = 0;
  let printing = false;
  ws.eachRow({ includeEmpty: false }, (row, rowNum) => {
    const cells = row.values.slice(1).map(v => {
      if (v == null) return '';
      if (typeof v === 'object' && v.richText) return v.richText.map(r => r.text).join('');
      if (typeof v === 'object' && v.text) return v.text;
      return String(v);
    });
    const joined = cells.join(' | ').trim();
    if (!joined) return;

    const dayMatch = joined.match(/Day\s+(\d+)\s*[—-]/i);
    if (dayMatch) {
      currentDay = parseInt(dayMatch[1], 10);
      printing = currentDay >= fromDay && currentDay <= toDay;
      if (printing) console.log(`\n${'='.repeat(80)}\n${joined}\n${'='.repeat(80)}`);
      return;
    }

    if (printing) {
      const time = (cells[0] || '').padEnd(11);
      const kind = (cells[1] || '').padEnd(18);
      const dur = (cells[2] || '').padEnd(14);
      const text = (cells[3] || '').replace(/\s+/g, ' ').slice(0, 110);
      const note = (cells[4] || '').replace(/\s+/g, ' ').slice(0, 60);
      const change = (cells[5] || '').replace(/\s+/g, ' ').slice(0, 60);
      if (time.trim() || kind.trim() || text) {
        console.log(`  ${time} ${kind} ${dur} ${text}${note ? '  | NOTE: ' + note : ''}${change ? '  | CHG: ' + change : ''}`);
      }
    }
  });
})();
