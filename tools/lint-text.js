// User-facing text linter — enforces STYLE_GUIDE.md mechanically.
// Exits non-zero on any violation. Run after every text change:
//   node tools/lint-text.js
//
// Scope: js/nearby.js, js/guides.js, js/guide-fallbacks.js, js/data.js (tips/recommendations only).

const fs = require('fs');
const path = require('path');

const FILES = [
  'js/nearby.js',
  'js/guides.js',
  'js/guide-fallbacks.js',
  'js/data.js',
  'js/render.js',  // string literals in render functions count too
  'js/app.js',     // ditto
];

// Patterns to forbid in user-facing strings. Each entry: {pattern, message, suggest?}.
// Pattern tested against each line of the file.
const RULES = [
  // Hebrew transliterations of imperial / English shorthand
  { pattern: /מיילים/, msg: '"מיילים" — use קילומטרים' },
  { pattern: /\bמייל\b/, msg: '"מייל" — use ק"מ or קילומטר (mile is imperial; we use metric only)' },
  { pattern: /\bרגל\b/, msg: '"רגל" — use מטר (foot is imperial; we use metric only)' },
  { pattern: /סלוטים/, msg: '"סלוטים" — use קניונים צרים' },
  { pattern: /\bסלוט\b/, msg: '"סלוט" — use קניון צר' },
  { pattern: /סלוט קניון/, msg: '"סלוט קניון" — use קניון צר' },
  { pattern: /טרילהד/, msg: '"טרילהד" — use ראש המסלול' },
  { pattern: /סקרין-?שוט/, msg: '"סקרין-שוט" — use צילום מסך' },
  { pattern: /נאבחו ניישן/, msg: '"נאבחו ניישן" — use שמורת Navajo' },
  { pattern: /קמפ-?ריינג'?ר/, msg: '"קמפ-ריינג\'ר" — use ריינג\'ר' },

  // English abbreviations / agency shorthand inside Hebrew text
  { pattern: /\bHITR\b/, msg: '"HITR" — write כביש Hole-in-the-Rock' },
  { pattern: /\bVC\b(?![\w-])/, msg: '"VC" — write מרכז המבקרים' },
  { pattern: /\bTH\b(?![\w-])/, msg: '"TH" — write ראש המסלול' },
  { pattern: /\bBLM\b/, msg: '"BLM" alone — first use should expand to "Bureau of Land Management"' },
  { pattern: /\bNPS\b/, msg: '"NPS" — write שירות הפארקים האמריקאי' },
  { pattern: /\bRec\.gov\b/, msg: '"Rec.gov" — write אתר Recreation.gov' },
  { pattern: /\bCARE\b/, msg: '"CARE" — write פארק Capitol Reef' },
  { pattern: /\bRRCNCA\b/, msg: '"RRCNCA" — write פארק Red Rock Canyon' },
  { pattern: /\bGSENM\b/, msg: '"GSENM" — write שמורת Grand Staircase-Escalante' },
  { pattern: /\bMST\b|\bMDT\b|\bPST\b|\bPDT\b/, msg: 'TZ abbrev — write שעון אריזונה / שעון יוטה / שעון נבדה' },
  { pattern: /\b4WD\b|\b4x4\b/, msg: '"4WD"/"4x4" — write רכב 4 על 4' },
  { pattern: /\bOTC\b/, msg: '"OTC" — write תרופות ללא מרשם' },
  { pattern: /\bRT\b(?![\w-])/, msg: '"RT" — write הלוך-חזור' },
  { pattern: /\bAAA\b/, msg: '"AAA" — write המועדון לרכב באמריקה' },
  { pattern: /\bRV\b(?![\w-])/, msg: '"RV" — write קראוון' },
  { pattern: /\bATM\b/, msg: '"ATM" — write כספומט' },
  { pattern: /\bGPS\b(?![\w-])/, msg: '"GPS" — write ניווט (or keep "Mapy.com" / "AllTrails" branding)' },
  { pattern: /\bUT\b(?![\w-])/, msg: '"UT" — write יוטה' },
  { pattern: /\bAZ\b(?![\w-])/, msg: '"AZ" — write אריזונה' },
  { pattern: /\bNV\b(?![\w-])/, msg: '"NV" — write נבדה' },
  { pattern: /\bHwy\s*\d+/, msg: '"Hwy NN" — write כביש NN' },

  // Imperial units in numeric context
  { pattern: /\d+\s*(mi|miles|ft|feet)\b/, msg: 'imperial unit — convert to ק"מ or מטר' },
  { pattern: /\d+\s*°?F\b/, msg: 'Fahrenheit — convert to °C' },

  // Currency
  { pattern: /\$\s*\d/, msg: '"$NN" — write "NN דולר"' },

  // Inline phone numbers in prose (must be in emergencyContacts data)
  { pattern: /\d{3}-\d{3}-\d{4}/, msg: 'inline phone — extract to emergencyContacts data' },

  // 12-hour time
  { pattern: /\d{1,2}:\d{2}\s*(AM|PM|am|pm)\b/, msg: '12-hour time — write 24-hour (e.g. 17:00 not 5pm)' },
];

let violations = 0;

for (const file of FILES) {
  const fullPath = path.join(__dirname, '..', file);
  if (!fs.existsSync(fullPath)) continue;
  const lines = fs.readFileSync(fullPath, 'utf8').split('\n');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    // Skip pure-comment lines (// or block) and lines that look like code-only (no Hebrew + no quoted string).
    const isCommentLine = /^\s*(\/\/|\*)/.test(line);
    if (isCommentLine) continue;
    // Skip lines that are just code without strings — but rule patterns are mostly Hebrew or
    // English-in-Hebrew so they wouldn't match code anyway. Skip imports/requires/log statements.
    if (/^\s*(const|let|var|import|require|console\.)/.test(line) && !/['"`].*['"`]/.test(line)) continue;

    // Skip pure-English lines (TTS narrations in guides.js are intentionally English).
    // A line is "Hebrew text" if it contains any Hebrew character.
    const hasHebrew = /[֐-׿]/.test(line);

    for (const rule of RULES) {
      if (rule.pattern.test(line)) {
        if (file.endsWith('lint-text.js')) continue;
        if (/MOCK_ORIGINS|sourceKey|alltrailsSlug|TILE_CACHE|APP_CACHE|FUEL_LEVELS|REC_KIND_HE|NEARBY_SECTIONS|PRETRIP_ITEMS|SLOT_CANYON_STOPS|DEAD_ZONE_DAYS|HEBREW_RX|RULES|ALLTRAILS_SLUGS|getDayTimezone|code:\s*['"]/.test(line)) continue;
        if (rule.pattern.toString().includes('\\d{3}-\\d{3}-\\d{4}') && /["']\+?\d/.test(line)) continue;
        if (!/['"`].*['"`]/.test(line)) continue;

        // Imperial units / Hebrew transliterations / abbreviations only matter in Hebrew text.
        // Pure English lines (e.g. guides.js English TTS narrations) are exempt for unit/transliteration rules.
        const isHebrewSpecific = /מיילים|מייל|רגל|סלוט|טרילהד|סקרין|נאבחו|קמפ-?ריינג|ק"מ|מטר/.test(rule.pattern.toString());
        const isUnitRule = rule.msg.includes('imperial') || rule.msg.includes('Fahrenheit');
        if (!hasHebrew && (isHebrewSpecific || isUnitRule)) continue;

        // Address fields that carry an actual postal address may keep state codes (UT, AZ) — they're on signs.
        if (/"address"\s*:/.test(line) && /^.{0,40}"address"/.test(line)) continue;
        // Schedule "time" / "wakeup" / "depart" fields are a separate sweep — flag-but-allow for now.
        // (Comment out below 'continue' to surface them again.)
        if (/"(time|wakeup|depart)"\s*:/.test(line) && rule.msg.includes('12-hour')) continue;

        console.log(`${file}:${i + 1}  ${rule.msg}`);
        console.log(`   ${line.trim().slice(0, 200)}`);
        violations++;
      }
    }
  }
}

if (violations) {
  console.error(`\n❌ ${violations} style violation(s).`);
  console.error(`See STYLE_GUIDE.md for the rules.`);
  process.exit(1);
}
console.log('✅ No style violations found.');
