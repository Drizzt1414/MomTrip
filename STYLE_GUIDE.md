# MomTrip Editorial Style Guide

User-facing text in this app is read by a 60+ Hebrew-speaking woman driving solo through the US Southwest. She reads English place names on signs but does NOT know American shorthand, gov-agency abbreviations, or unit conversions in her head. Every string must be readable aloud, complete, and warm.

## Hard rules

### 1. No abbreviations — ever — in user-facing text

| ❌ Don't write | ✅ Write |
|---|---|
| HITR Rd | כביש Hole-in-the-Rock |
| VC | מרכז המבקרים |
| TH | ראש המסלול |
| Rec.gov | אתר Recreation.gov |
| BLM | שמורת BLM (= Bureau of Land Management) — first use; afterward "השמורה" |
| NPS | שירות הפארקים האמריקאי |
| CARE | פארק Capitol Reef |
| RRCNCA | פארק Red Rock Canyon |
| GSENM | שמורת Grand Staircase-Escalante |
| HQ | מרכז |
| Hwy 12 | כביש 12 |
| AZ / NV / UT / NM / CA | אריזונה / נבדה / יוטה / ניו מקסיקו / קליפורניה |
| MST / MDT / PST / PDT | שעון אריזונה / שעון יוטה / שעון נבדה |
| 4WD | רכב 4 על 4 |
| OHV / ATV | רכב שטח |
| RV | קראוון |
| AAA | המועדון לרכב באמריקה |
| RT (round-trip) | הלוך-חזור |
| OTC | תרופות ללא מרשם |
| ER | חדר מיון |
| ATM | כספומט |
| GPS | ניווט |

### 2. Distance + temperature — metric only

- ❌ "6 mi RT" / "1500 ft gain" / "85°F"
- ✅ "כ-10 ק\"מ הלוך-חזור" / "טיפוס של 460 מטר" / "30 מעלות"

Conversion: 1 mile = 1.609 km, round to nearest 0.5 or 1. 1 foot = 0.305 meters. F to C: `(F-32)*5/9`.

If the place's English name is "Mile 12 trailhead" — keep the English name as-is, but in Hebrew prose use km.

### 3. No phone numbers in prose

Phone numbers go in structured data (`emergencyContacts: [{name, phone}]`) and render as tap-to-call buttons. Never inline like `"התקשרי ל-VC: 435-826-5499"`.

### 4. No internal codes / IDs / serial numbers

- ❌ `"היתר #0816993222-1"` / `"label=gen173nr-..."` / `"shuttle stop 5"`
- ✅ `"ההיתר שמור במייל ובסקרין-שוט"` / `"תחנת The Grotto (השביל ל-Angels Landing)"`

If a code MUST appear (booking confirmation she might read off), put it in a separate "details" field, never mid-prose.

### 5. Sentence shape — clear, complete, readable aloud

- ❌ Em-dash splitting one idea: `"בנטוניט (חימר) — אסור לחלוטין כשרטוב או אם ירד גשם ב-48 שעות"`
- ✅ Two sentences with a period: `"בכביש יש שכבת חימר שהופכת לבוץ דביק כשרטוב. אסור לנסוע בו אם ירד גשם ב-48 השעות האחרונות."`

- ❌ Stacked parenthetical: `"Antelope (DST = שעון יוטה במאי, אבל Page MST שעה אחורה)"`
- ✅ Two short sentences: `"סיורי Antelope רצים על שעון יוטה. שימי לב — שעון Page עצמו הוא שעה אחורה."`

### 6. First-mention pattern for English place names

Always write the FULL English name on first mention in a section. Don't shorten "Capitol Reef National Park" to "CARE". Don't shorten "Hole-in-the-Rock Road" to "HITR". After full first mention, may use the short proper name (e.g., "הפארק" / "הכביש").

### 7. Hebrew gender + voice

- All instructions in 2nd person feminine singular: "לקחי", "שימי לב", "תכנני", "תיהני".
- Avoid male-default ("יקח", "ישים").
- Match the existing UI ("נווטי", "חייגי") — same imperative voice.

### 8. Currency

- ❌ `"$15"` / `"~$80-100/wk"`
- ✅ `"15 דולר"` / `"כ-80-100 דולר לשבוע"`

### 9. Don't tell mom how to feel

- ❌ "מרהיב!" / "עוצר נשימה!" / "מומלץ ביותר!"
- ✅ Describe the place specifically. Let her decide if it's amazing.

### 10. Times — 24-hour format, no AM/PM

- ❌ "8:00 AM" / "9pm"
- ✅ "08:00" / "21:00"

## Soft rules

- Prefer the active voice ("עצרי", "תדלקי") over passive constructions.
- One thought per bullet. If a bullet has 3 ideas, split into 3 bullets.
- Numbers: use Hebrew letters for small numbers under 10 (אחד, שתיים, שלוש) only when they read naturally. Otherwise digits ("3 שעות", "6 ליטר").
- Place name + emoji separator: `"📍 Park Avenue Trail"` not `"📍Park Avenue Trail"`.

## How to verify before shipping

1. **Grep for abbreviations**: any `HITR|VC|TH|Rec\.gov|BLM|NPS|MST|MDT|PST|4WD|RV|AAA|RT|OTC|ATM` in user-facing strings is a bug.
2. **Grep for imperial units**: `\bmi\b|\bft\b|miles?|feet|°F` — bug.
3. **Grep for inline phones**: `\d{3}-\d{3}-\d{4}` in prose strings — should be in `emergencyContacts` instead.
4. **Read aloud**: if a sentence has more than one em-dash, rewrite.

## File scope

These rules apply to user-facing strings in:
- `js/nearby.js` — `region`, `note`, `prep[].text`, `food[].name|type|desc`, `gas[]`, `alternatives[]`, `practical[]`, `emergencyContacts[].name`
- `js/guides.js` — `intro`, `history`, `geology`, `lookFor[]`, `momTip`, future `fallback`
- `js/i18n.js` — UI labels
- `js/data.js` — `stops[].tip`, `recommendations[].why|action`
- `tools/create-excel.js` — `activities[].text` (source of truth for schedule rows)

Do NOT need to follow this guide:
- Internal code comments
- `id` fields, `sourceKey`, `parkCode`
- Hard-coded English place names in `name` fields (those are signs)
- Booking URLs (hrefs not visible as text)
