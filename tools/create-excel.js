const ExcelJS = require('exceljs');
const path = require('path');
const fs = require('fs');

// CLI: --days=1-5 to filter, --output=name.xlsx to override filename
const ARGS = Object.fromEntries(process.argv.slice(2)
  .filter(a => a.startsWith('--'))
  .map(a => { const [k, v] = a.replace(/^--/, '').split('='); return [k, v ?? true]; }));

const DAY_FILTER = (() => {
  if (!ARGS.days) return null;
  const m = String(ARGS.days).match(/^(\d+)-(\d+)$/);
  if (!m) { console.error('Bad --days, expected e.g. --days=1-5'); process.exit(1); }
  return { from: parseInt(m[1], 10), to: parseInt(m[2], 10) };
})();

const OUT_OVERRIDE = ARGS.output ? path.join(__dirname, '..', ARGS.output) : null;

// If the main file is locked (open in Excel), fall back to a timestamped name
// so we can still ship the update rather than failing silently.
const OUT = (() => {
  if (OUT_OVERRIDE) return OUT_OVERRIDE;
  const primary = path.join(__dirname, '..', 'mom-trip-recommendations.xlsx');
  try {
    const fd = fs.openSync(primary, 'r+');
    fs.closeSync(fd);
    return primary;
  } catch (_) {
    const stamp = new Date().toISOString().slice(0,16).replace(/[-:T]/g,'');
    return path.join(__dirname, '..', `mom-trip-recommendations-${stamp}.xlsx`);
  }
})();

// Load js/data.js for lat/lng lookup. data.js is the merged source of truth
// (regenerated from the DAYS array below by tools/merge-schedule.js).
function loadDataJs() {
  const raw = fs.readFileSync(path.join(__dirname, '..', 'js', 'data.js'), 'utf8');
  const json = raw.slice(raw.indexOf('{'), raw.lastIndexOf('}') + 1);
  return JSON.parse(json);
}
const TRIP_DATA = loadDataJs();

// Returns { lat, lng } or null. Order of precedence:
//  1. Hotel match (for keep/cancel rows whose text starts with the hotel name)
//  2. Stop fuzzy match against day.stops by headline of activity text
function lookupCoords(dayNumber, act) {
  const day = TRIP_DATA.days.find(d => d.dayNumber === dayNumber);
  if (!day) return null;

  if ((act.type === 'keep' || act.type === 'cancel') && day.hotel?.coordinates) {
    return day.hotel.coordinates;
  }

  const norm = s => (s || '').toLowerCase().replace(/[^\w\s]/g, ' ').replace(/\s+/g, ' ').trim();
  const head = (act.text || '').split(/\s+—\s+/)[0];
  const headTokens = new Set(norm(head).split(' ').filter(w => w.length > 3));
  if (!headTokens.size) return null;

  let best = null, bestScore = 0;
  for (const stop of (day.stops || [])) {
    if (!stop.coordinates) continue;
    const stopTokens = new Set(norm(stop.name).split(' ').filter(w => w.length > 3));
    let overlap = 0;
    for (const t of headTokens) if (stopTokens.has(t)) overlap++;
    const score = overlap / Math.max(headTokens.size, stopTokens.size);
    if (score > bestScore) { bestScore = score; best = stop; }
  }
  return best && bestScore >= 0.4 ? best.coordinates : null;
}

// Per-row issue registry. Keyed by day + a substring that uniquely identifies
// the activity text. Severity drives row color (HIGH=red, MED=amber, INFO=yellow).
const PROBLEMS = [
  {
    day: 21, match: 'Kanarra Falls — hike through a narrow canyon', severity: 'MED',
    text: "Day 21 — major revisions. ⚠️ VALLEY OF FIRE SUMMER CLOSURES (May 15-Sept 30): Fire Wave / Seven Wonders / Pastel Canyon / Pink Canyon, White Domes Loop, Pinnacles Loop, Prospect Trail, Arrowhead Trail, Natural Arch Trail (excluding Arch Rock), and Charlie's Spring are ALL CLOSED on May 25, 2026 due to extreme heat (110+°F regularly, history of fatalities). Park rangers strictly enforce — citations issued. Mom's wishlist Fire Wave + White Domes are not accessible on this trip date. The afternoon was redesigned around trails that are open year-round: Atlatl Rock, Petrified Logs Loop, Mouse's Tank / Petroglyph Canyon, Rainbow Vista, Elephant Rock Loop. REMOVED FROM ORIGINAL PLAN: (a) 'Petrified Logs Kanarra Falls' as a Kanarra stop — petrified wood is real, just at Valley of Fire (or at Escalante Petrified Forest), not at Kanarra. Re-added as 'Petrified Logs Loop' on the Valley of Fire afternoon. (b) 'Seven Wonders Kanarra Falls' — Seven Wonders is at Valley of Fire near Fire Wave; closed in summer anyway. RENAMED: 'Elephant Rock Kanarra Falls' → 'Elephant Rock — Valley of Fire'. FIXED URL: permit site was 'kanarraville.org' (doesn't exist) → 'kanarrafalls.com' (permit confirmed booked 2026-05-01). FIXED DRIVE TIME: Kanarraville → Valley of Fire '2 hrs' was wrong; ~3 hrs actual on I-15. FIXED TIMING COLLISION: old schedule had Valley of Fire walk 1:35-3:05 PM overlapping Fire Wave 2:25-3:25 PM. RETITLED: 'Nevada' → 'Kanarra Falls + Valley of Fire → Las Vegas' (morning is in Utah). END TIME: was 5:30 PM; now ~6:40 PM. NEW STOPS NEEDED IN STOPS[]: Petrified Logs Loop and Rainbow Vista — narrative-only for now until you verify Google Maps coords."
  },
  {
    day: 9, match: 'Lunch break in the Fruita area', severity: 'INFO',
    text: 'Considered but not added: Fremont River Trail — mostly flat, follows the river along the orchards near Fruita campground. Easy.',
  },
  {
    day: 10, match: 'Capitol Gorge Trailhead', severity: 'INFO',
    text: "Name changed twice: originally 'Waterpocket Tanks' (didn't exist as named, original coords pointed 13 mi south of the park area) → renamed to 'Capitol Gorge Tanks' (also not a real Google Maps destination — Tanks aren't a named place) → finally 'Capitol Gorge Trailhead' (verified on Google Maps by Oren). The Tanks themselves exist as natural water pockets along the trail but aren't a separate destination — start at the trailhead and walk in.",
  },
  {
    day: 10, match: 'Drive 20 minutes east from Bicknell on Highway 24 to the Sulphur Creek', severity: 'MED',
    text: '⚠️ Heavy day — Sulphur Creek + Grand Wash + Cassidy Arch + Golden Throne + Capitol Gorge Tanks ≈ 9.5 hrs of hiking. Mom may need to omit one or two activities based on energy. Suggested cuts if running short: Capitol Gorge Tanks (least essential), or shorten Golden Throne to a partial trail.',
  },
  {
    day: 11, match: 'Drive ~2 hours from Cathedral Valley Inn', severity: 'INFO',
    text: 'Day 11 changes (multiple). DROPPED from schedule: (a) Long Canyon Overlook — couldn\'t be verified on Google Maps; mom\'s reference may have been the Moab Long Canyon Trail (4x4 only, wrong area), and Claude\'s own ~37.85,-111.51 guess was a hallucination. Mom drives through Long Canyon naturally on Hwy 12 west to Boulder; no separate stop needed. (b) Deer Creek — coords were 150 mi off in Provo/SLC area, doesn\'t belong on a Capitol Reef day. (c) Cottonwood Wash Route — coords 80+ mi off near Green River, audit notes \'not a formally established trail\', looks uninteresting on Google Maps. (d) Petroglyph Panel — geographically off-route (in Fruita, west; day goes south). Stop entry preserved if you want to add another day. (e) Upper Muley Twist Canyon — combined 3-hr Lower+Upper row was unrealistic (each is 8-14 mi). Kept Lower partial; dropped Upper (requires Strike Valley access, separate full-day hike). RENAMED + FIXED: \'Switchbacks\' → \'Burr Trail Switchbacks\' with verified Google-Maps coords. ADDED to schedule: Notom-Bullfrog Road as the morning scenic drive (was orphan map-pin only).',
  },
  {
    day: 19, match: "Zion N/P Visitor Center", severity: 'INFO',
    text: "Day 19 is intentionally flexible. Mom picks up the shuttle pass at the Visitor Center and rides to whichever stops she wants at her own pace. Zion's shuttle has 9 stops (Visitor Center → Human History Museum → Canyon Junction → Court of the Patriarchs → Zion Lodge → The Grotto → Weeping Rock [closed since 2019] → Big Bend → Temple of Sinawava). Hop-on/off, runs ~6 AM-9 PM in summer, ~7-15 min between buses. Easy senior-friendly trail picks (researchable on Google Maps): Riverside Walk (paved, from Temple of Sinawava), Lower Emerald Pools (from Zion Lodge), Pa'rus Trail (paved, from Visitor Center). Avoid: Angels Landing (permit + chains, very strenuous), The Narrows (cold-water wading).",
  },
  {
    day: 20, match: "Zion N/P Visitor Center", severity: 'INFO',
    text: "Same as Day 19 — intentionally flexible. Mom picks shuttle stops at her own pace. Two days at Zion gives time to do different stops on each day.",
  },
  {
    day: 18, match: "Drive 1.5 hours north from Kanab to Rainbow Point", severity: 'MED',
    text: "⚠️ HEAVIEST DAY OF THE TRIP. Day 18 combines (a) all of original Day 17's Bryce scenic viewpoints (Rainbow, Yovimpa, Ponderosa, Agua Canyon, Natural Bridge, Bryce Point) PLUS (b) the original Day 18 hiking (Queen's Garden + Peekaboo + Navajo Loop full Figure-8 ~6.4 mi). Total: ~13 hrs from 7 AM to ~8:25 PM hotel — past mom's 6-7 PM target. CHANGES: (1) Day 17 became White Pocket guided tour, so Bryce viewpoints moved here. (2) Visitor Center added as OPTIONAL — skip if pressed for time. (3) Hike now includes Peekaboo Loop per mom's wishlist (full Figure-8). If 6.4 mi is too much on the day, mom can drop Peekaboo and do just Queen's Garden + Navajo Loop (3 mi, ~3 hrs) instead — saves ~2 hrs, hotel arrival ~6:30 PM. (4) Bryce Canyon Resort booking is TBD — option X (skip, start from Kanab) or option Y (use it, easier 10-min Day 18 morning drive instead of 1.5 hr from Kanab). FIXED COORDS: Ponderosa Canyon now verified. HOTEL: Zion's Most Wanted at end of day — coords verified.",
  },
  {
    day: 17, match: "Wake up early; tour pickup at Travelodge Kanab", severity: 'MED',
    text: "⚠️ WHITE POCKET TOUR — KEY DETAILS (Dreamland Safari Tours, Order #B-8DXGM5J): (1) ⏰ Pickup at 8:00 AM MOUNTAIN TIME at Travelodge Kanab (NOT Arizona time). Mom is in Kanab, UT — Mountain Time. If her phone is still on Phoenix time from yesterday's Antelope Canyon tour, set it back to Mountain Time the night before so she's not 1 hr early/late. (2) BRING: small backpack, 2-3L water per person, hiking shoes, layers, sunglasses, sunscreen, hat, camera. Mom + Uri committed to bringing OWN LUNCH. (3) Tour office: 406 E 300 S Kanab (next to Travelodge — same address). Phone: 801-251-6036. (4) CANCELLATION: 30+ days = 85% refund, 11-30 days = 75%, 48 hrs-10 days = 65%, less than 48 hrs / no-show = 0% (full charge). (5) Day 17 was REORGANIZED — original Bryce Canyon Scenic schedule has been dropped. The 6 Bryce viewpoints (Rainbow Point, Yovimpa Point, Agua Canyon, Ponderosa Canyon, Natural Bridge, Bryce Point) were moved to Day 18 stops; they will be properly integrated into Day 18 schedule when Day 18 is reviewed. The Day 18 hotel (currently Zion's Most Wanted in Zion) will need to change because Day 18 is now a Bryce-focused day.",
  },
  {
    day: 16, match: "Pickup at Knights Inn Page at 9:00 AM", severity: 'MED',
    text: "⚠️ ANTELOPE CANYON TOUR — KEY OPERATIONAL DETAILS: (1) ⏰ TIMEZONE TRAP: tour runs on Arizona/Phoenix time (MST), but Utah is on MDT during DST (1 hour ahead). On the morning of the tour, set mom's phone time zone to 'Phoenix' to avoid being 1 hr early/late. (2) 🚫 STRICT NO-BAG POLICY: no bags, backpacks, fanny packs, hydration packs, purses, camera bags, hiking sticks/canes, tripods/monopods, selfie sticks, GoPros/action cameras, drones, or umbrellas. Allowed: water bottle (handheld), phone camera, neck-strap camera, cash for guide tips. (3) 👟 CLOSED-TOE SHOES REQUIRED — no sandals, open-toe, or heels. (4) 💵 Cash for guide tips appreciated. (5) 📅 Cancellation: 5+ days = full refund, 3-4 days = 48%, within 72 hrs = no refund. (6) Pickup at hotel — confirm hotel address with the tour company when booking.",
  },
  {
    day: 16, match: "Belly of the Dragon", severity: 'INFO',
    text: "ADDED on Day 16 as an afternoon extension after Antelope Canyon. Belly of the Dragon is a short sandstone tunnel walk on US-89 about 14 mi north of Kanab. Verified Google Maps coords. Followed by a Kanab Main Street stroll + dinner to push hotel arrival to ~6:35 PM (within mom's 6-7 PM target).",
  },
  {
    day: 15, match: "Drive 25 minutes northwest from Page on Highway 89A", severity: 'INFO',
    text: "Day 15 changes. DROPPED: White Hoodoos — couldn't be found on Google Maps; audit notes mom may have confused it with White Pocket (which is on Day 21). Likely a hallucination. FIXED COORDS: Spencer Trail — was missing coords; now at verified Google-Maps value. SOFTENED: Spencer Trail to PARTIAL only (1.5 hrs) — full trail is ~9 mi RT with 1500 ft elevation, too strenuous for senior. DROPPED: Spencer Trail Rim (orphan, no coords) — duplicate concept. ADDED: Glen Canyon Dam Powerplant Tour as afternoon activity at Carl Hayden Visitor Center.",
  },
  {
    day: 15, match: "Glen Canyon Dam Powerplant Tour", severity: 'INFO',
    text: "ALTERNATIVE: If mom prefers a beach over an industrial tour, swap this for Lone Rock Beach instead — a popular Lake Powell sandy beach stop on the Utah side near Wahweap (~15-20 min drive from hotel). Either makes a good afternoon activity. Note: also consider White Ghost Hoodoo (Big Water area, ~45 min N of Page, opposite direction from Lees Ferry) — could fit as a morning detour if mom skips one of the Lees Ferry stops.",
  },
  {
    day: 14, match: "TODAY HAS TWO ROUTES", severity: 'INFO',
    text: 'Day 14 changes (multiple). FIXED COORDS: (a) Big Water — was at 36.36, -110.17 (Arizona, ~100 mi off). Now at verified Google-Maps coords for Big Water, UT. Treated as a drive-by point (mom likely marked it as something to see on the road, not a stop). (b) Stud Horse Point — was ~16 mi off; now at verified Google-Maps coords. Also treated as drive-by, not a stop. DROPPED: (c) Vermilion Cliffs (orphan stop) — coords were ~100 mi west; the actual Vermilion Cliffs corridor along Hwy 89A is implicitly visible during the day\'s drive narrative anyway. Mom flagged this as detail-noise. (d) Hwy 89 Intersection (orphan, no coords) — generic road junction, not a destination. (e) Glen Canyon Trail / Glen Canyon Rim Trail — no coords + audit confirms no such trail exists near Glen Canyon. Mom\'s reference was likely a hallucinated name; the broader Glen Canyon NRA is what mom drives through, and Hanging Garden Trail + Horseshoe Bend Trail (already in schedule) are within it. HOTEL: synced Lake Powell Resort coords to verified Google-Maps value.',
  },
  {
    day: 13, match: "Drive 25 minutes south from Escalante on Hole-in-the-Rock Road", severity: 'INFO',
    text: 'Day 13 changes (multiple). FIXED COORDS: (a) Peek-a-Boo Slot — was at ~37.62, -112.16 (a different Peekaboo near Bryce/Hatch, ~75 mi west). Now points to the actual Peek-a-Boo at Dry Fork via verified Google-Maps coords. (b) Spooky Slot — was ~6 mi off; now correct. DROPPED: Bighorn Canyon — coords were way out of the Hole-in-the-Rock corridor, couldn\'t verify on Google Maps. Removed entirely. ADDED: Devils Garden Outstanding Natural Area (NEW stop on Day 13 — moved from Day 12, replaces the wrong Arches Devil\'s Garden coords mom had earlier). Inserted as morning stop on the way south. SCHEDULE: Split the combined "4 slot canyons in 4-5 hrs" row into 4 separate rows so mom sees each slot with its own map pin and timing — they\'re still done as one continuous hike from the Lower Dry Fork Trailhead, in this order: Peek-a-Boo → Spooky → Brimstone → Dry Fork Narrows. HOTEL: synced Day 13 Escalante Outfitters coords to the Day 12 verified value (same hotel, two-night stay).',
  },
  {
    day: 12, match: 'Drive 10 minutes south from Boulder', severity: 'INFO',
    text: 'Day 12 changes (multiple). DROPPED: (a) Grand Staircase NM stop — too vague (the whole region IS the monument, not a single point). REPLACED with a specific stop at the Escalante Interagency Visitor Center (verified Google-Maps coords) — gives mom context on the monument with maps, exhibits, and ranger talks. (b) Devil\'s Garden Hoodoos — coords pointed to the Arches NP Devil\'s Garden (near Moab, ~150 mi NE), not the Grand Staircase one mom asked about. The Grand Staircase Devil\'s Garden is on Hole-in-the-Rock Road — moved to Day 13 where it geographically fits. (c) Wide Hollow Reservoir — coords were ~30 mi north of Escalante and the reservoir is actually right next to the Petrified Forest SP. Dropped as duplicate. (d) Homestead Overlook — coords looked wrong (north of Boulder area); Google Maps shows nothing meaningful at the location. Dropped. (e) Calf Creek Overlook (orphan d12-s11) — duplicate of the Calf Creek Viewpoint area. Dropped. RENAMED + FIXED: \'Upper Calf Creek Overlook\' → \'Calf Creek Viewpoint\' with verified Google-Maps coords (it\'s a roadside vista pullout on Hwy 12, not a walk-up overlook). UPDATED: Petrified Forest SP coords + hotel coords to verified Google-Maps values.',
  },
];

function findProblem(dayNumber, act) {
  if (!act || !act.text) return null;
  const t = act.text.toLowerCase();
  for (const p of PROBLEMS) {
    if (p.day === dayNumber && t.includes(p.match.toLowerCase())) return p;
  }
  return null;
}

const SEVERITY_FILL = {
  HIGH: 'FFCDD2',  // light red
  MED:  'FFE0B2',  // light amber
  INFO: 'FFF59D',  // light yellow
};
const SEVERITY_FG = {
  HIGH: 'B71C1C',
  MED:  '7A3F00',
  INFO: '7A6800',
};

const C = {
  headerBg:    '1F3864',
  sectionBg:   '2E75B6',
  driving:     'EDE7F6',
  stop:        'DDEEFF',
  walk:        'E8F5E9',
  hike:        'C8E6C9',
  tour:        'FFF3E0',
  add:         'E8F5E0',
  note:        'FFFDE7',
  hotelKeep:   'FFF8DC',
  hotelCancel: 'FFDDDD',
  drivingLbl:  'CE93D8',
  stopLbl:     '90CAF9',
  walkLbl:     'A5D6A7',
  hikeLbl:     '66BB6A',
  tourLbl:     'FFCC80',
  addLbl:      '81C784',
  noteLbl:     'FFF176',
  hotelLbl:    'F9A825',
  cancelLbl:   'EF9A9A',
  dark:        '1A1A2E',
  white:       'FFFFFF',
  dim:         '555555',
  cancel:      'B71C1C',
  border:      'CFD8DC',
};

const DAYS_EN   = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
const MONTHS_EN = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function fmtDate(iso) {
  const d = new Date(iso + 'T12:00:00');
  return `${DAYS_EN[d.getDay()]}, ${MONTHS_EN[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

function fill(hex) { return { type:'pattern', pattern:'solid', fgColor:{ argb:'FF'+hex } }; }
function bdr()     { return { top:{style:'thin',color:{argb:'FF'+C.border}}, left:{style:'thin',color:{argb:'FF'+C.border}}, bottom:{style:'thin',color:{argb:'FF'+C.border}}, right:{style:'thin',color:{argb:'FF'+C.border}} }; }
function font(sz, bold, color) { return { name:'Calibri', size:sz||10, bold:!!bold, color:{ argb:'FF'+(color||C.dark) } }; }

const TYPES = {
  driving: { label:'In the car',       rowBg:C.driving,     lblBg:C.drivingLbl, lblFg:C.dark },
  stop:    { label:'Quick stop',       rowBg:C.stop,        lblBg:C.stopLbl,    lblFg:C.dark },
  walk:    { label:'Short walk',       rowBg:C.walk,        lblBg:C.walkLbl,    lblFg:C.dark },
  hike:    { label:'Hike',             rowBg:C.hike,        lblBg:C.hikeLbl,    lblFg:C.dark },
  tour:    { label:'Guided tour',      rowBg:C.tour,        lblBg:C.tourLbl,    lblFg:C.dark },
  add:     { label:'Add to plan ⭐',   rowBg:C.add,         lblBg:C.addLbl,     lblFg:C.dark },
  note:    { label:'Note ⚠️',          rowBg:C.note,        lblBg:C.noteLbl,    lblFg:C.dark },
  keep:    { label:'Sleep tonight 🏨', rowBg:C.hotelKeep,   lblBg:C.hotelLbl,   lblFg:C.dark },
  cancel:  { label:'Sleep tonight 🏨', rowBg:C.hotelCancel, lblBg:C.cancelLbl,  lblFg:C.cancel },
};

// wakeup = time to wake up and start getting ready
// depart = time to leave the hotel
// Each day's first activity is always the drive from the hotel to the first stop
const DAYS = [
  {
    day:1, date:'2026-05-05', title:'Arrival — Salt Lake City', wakeup:'—', depart:'9:35 AM (landing)',
    activities:[
      { type:'note',    text:"Land at Salt Lake City airport (SLC) at 09:35. Plan about 1.5 hours to deplane, collect bags, and pick up the rental car before heading out.", duration:'~1.5 hrs', time:'9:35 AM' },
      { type:'driving', text:"Pick up the rental car at Salt Lake City airport and head out — about a 3.5 hour drive south to Moab, Utah. The road passes through beautiful mountains and canyons. Enjoy the scenery on the way.", duration:'~3.5 hrs', time:'~11:00 AM' },
      { type:'keep',    text:'Sun Outdoor Arches Gateway — Moab, Utah', duration:'', time:'~3:00 PM' },
    ],
  },
  {
    day:2, date:'2026-05-06', title:'Arches National Park', wakeup:'6:00 AM', depart:'7:00 AM',
    activities:[
      { type:'driving', text:"A 15 minute drive from the hotel to the entrance of Arches National Park.", duration:'15 min', time:'7:00 AM' },
      { type:'stop',    text:"Stop at the Arches Visitor Center to pick up the park entry pass and a map.", duration:'10 min', time:'7:20 AM' },
      { type:'hike',    text:"Park Avenue Trail — walk between tall sandstone walls, like a natural corridor carved by nature. Flat and easy.", duration:'1.5 hrs', time:'7:35 AM' },
      { type:'driving', text:"Continue deeper into the park. The La Sal Mountains appear on the right — stay in the car and enjoy the view through the window.", duration:'5 min', time:'9:10 AM' },
      { type:'stop',    text:"Courthouse Towers — pull over by the road, look at the huge red rock towers rising from the desert, and take photos.", duration:'10 min', time:'9:15 AM' },
      { type:'walk',    text:"Balanced Rock — a short, easy loop around a famous huge rock balanced perfectly on a thin base.", duration:'20 min', time:'9:30 AM' },
      { type:'walk',    text:"The Windows section — from one parking lot you can walk to three different arches: Turret Arch, the Windows Loop, and Double Arch. You can stand under several of them — they are huge.", duration:'1.5 hrs', time:'10:00 AM' },
      { type:'hike',    text:"Delicate Arch Trail — the world-famous arch. A steep walk on open slickrock in the sun. Bring extra water. Worth every step.", duration:'2.5–3 hrs', time:'11:45 AM' },
      { type:'stop',    text:"Fiery Furnace Viewpoint — pull over and look from the railing into the narrow maze of rock fins. Entry without a guided tour or permit is not allowed.", duration:'10 min', time:'2:40 PM' },
      { type:'stop',    text:"Skyline Arch — visible from the road. Stop for a quick photo.", duration:'5 min', time:'2:52 PM' },
      { type:'walk',    text:"Sand Dune Arch + Broken Arch — two arches on a short side trail by the road. Sand Dune is about 0.6 km through deep sand to a small arch hidden between rock fins (cool and shaded — kids love the sand). Broken Arch is another 0.6 km on open slickrock to a large arch. Most people combine the two into one stop.", duration:'45 min', time:'3:00 PM', change:'🆕 NEW ROW — added Sand Dune Arch + Broken Arch (mom asked where they were)' },
      { type:'hike',    text:"Devils Garden — the best trail in all of Arches. On the way in you pass Tunnel Arch and Pine Tree Arch, then reach Landscape Arch (the longest natural arch in the world). From there the primitive trail continues deeper to Partition Arch, Navajo Arch, Double O Arch, Dark Angel, and Private Arch — each arch a different shape, and the trail gets quieter and more remote the further you go.", duration:'2–4 hrs', time:'3:50 PM', change:'✏️ EXPANDED — named 8 individual arches on the trail (Pine Tree, Partition, Navajo, Dark Angel, Private, etc.)' },
      { type:'keep',    text:'Sun Outdoors Arches Gateway — Moab, Utah (same hotel)', duration:'', time:'~7:00 PM', change:'⏰ TIME UPDATED — ~6:30 PM → ~7:00 PM (longer day with added arches)' },
    ],
  },
  {
    day:3, date:'2026-05-07', title:'Canyonlands + Fiery Furnace', wakeup:'6:30 AM', depart:'7:20 AM',
    activities:[
      { type:'driving', text:"A 35 minute drive from the hotel into Arches National Park to the Fiery Furnace parking lot. You already have the park entry pass from yesterday — no need to stop at the Visitor Center. Take a screenshot of the Recreation.gov permit before driving in (cell signal is weak at the trailhead).", duration:'35 min', time:'7:20 AM', change:"🆕 NEW ROW — drive into Arches to Fiery Furnace TH (mom insisted on adding the self-guided permit hike)" },
      { type:'hike',    text:"Self-Guided Fiery Furnace Exploration — permit approved for 2 adults, start at 08:00. You navigate the maze of sandstone fins on open slickrock on your own. There is no marked trail — narrow passages between walls, small jumps between rocks, rock steps. About 3 km round-trip, but it takes far longer than the distance suggests because you find your own way. Plan a full 3.5 hours. Bring water, snacks, and shoes with good grip. This is not an easy walk — it is the challenging hike Mom asked for.", duration:'3.5 hrs', time:'8:00 AM', change:"🆕 NEW ROW — Self-Guided Fiery Furnace Exploration (added 2026-05-01 after permit booked)" },
      { type:'driving', text:"About a 55 minute drive from Fiery Furnace to Dead Horse Point — exit Arches south on the park road, a short stretch north on Highway 191, then west on Highway 313 across the mesa.", duration:'55 min', time:'11:30 AM', change:"🔁 ROUTE CHANGE — was 'Moab → DHP 30 min'; now 'Fiery Furnace TH → DHP 55 min'" },
      { type:'stop',    text:"Dead Horse Point — walk to the canyon rim. The Colorado River flows 600 meters below in a horseshoe bend. One of the most striking viewpoints in Utah. A short lunch from the cooler on a bench at the canyon edge.", duration:'60 min', time:'12:25 PM', change:"⏰ TIME + DURATION — was 8:30 AM 45–90 min; trimmed to 60 min + shifted to fit Fiery Furnace morning" },
      { type:'driving', text:"A 15 minute drive from Dead Horse Point to the entrance of Canyonlands Island in the Sky.", duration:'15 min', time:'1:25 PM', change:"⏰ TIME — was 10:00 AM" },
      { type:'stop',    text:"Shafer Canyon Overlook — pull over and look down at the road that switchbacks far into the canyon below.", duration:'10 min', time:'1:40 PM', change:"⏰ TIME — was 10:15 AM" },
      { type:'stop',    text:"Gooseneck Overlook — the Colorado River bends 270 degrees into a tight loop below. Very dramatic.", duration:'10 min', time:'1:52 PM', change:"⏰ TIME — was 10:27 AM" },
      { type:'driving', text:"A 20 minute drive across the mesa to Upheaval Dome at the far side of the park.", duration:'20 min', time:'2:02 PM', change:"⏰ TIME — was 10:37 AM" },
      { type:'walk',    text:"Upheaval Dome — a short walk to the rim of a mysterious crater. Scientists are not sure whether a meteorite made it or a salt dome — either way, it looks like something from another planet.", duration:'45 min', time:'2:22 PM', change:"⏰ TIME — was 11:00 AM" },
      { type:'walk',    text:"Whale Rock — a large whale-shaped sandstone dome right next to Upheaval Dome. A short 1.6 km trail with an easy climb on open slickrock. From the top you see Upheaval Dome from above — the best view of it.", duration:'45 min', time:'3:07 PM', change:"⏰ TIME — was 11:45 AM" },
      { type:'driving', text:"Drive back across the mesa toward the main viewpoints.", duration:'20 min', time:'3:52 PM', change:"⏰ TIME — was 12:30 PM" },
      { type:'walk',    text:"Mesa Arch — an easy 0.8 km walk to a sandstone arch that frames the canyon 300 meters below.", duration:'25 min', time:'4:12 PM', change:"⏰ TIME — was 12:50 PM" },
      { type:'stop',    text:"Green River Overlook, Murphy Point and Buck Canyon Overlook — stop at each of the three viewpoints for canyon views. Each one is a short walk from the car.", duration:'10–15 min each', time:'4:37 PM', change:"⏰ TIME — was 1:20 PM" },
      { type:'stop',    text:"White Rim Overlook — an easy 1.5 km walk to a viewpoint that looks straight down at White Rim Road winding through the canyon. A good place to sit and see how deep the canyon really is.", duration:'30 min', time:'5:07 PM', change:"⏰ TIME — was 1:50 PM" },
      { type:'note',    text:"Musselman Arch — a long flat famous arch you may have read about. It sits on White Rim Road about 300 meters below you. Reaching it requires a 4-by-4 vehicle and a permit — not possible in your rental car. On a clear day you can see the top of it from some of the overlooks.", duration:'', time:'' },
      { type:'walk',    text:"Grand View Point — the end of the main park road. Walk along the canyon rim in any direction. The best panoramic views in Canyonlands.", duration:'45 min', time:'5:37 PM', change:"⏰ TIME — was 2:25 PM" },
      { type:'driving', text:"About a 30 minute drive south on Highways 313 and 191 back to Moab.", duration:'30 min', time:'6:22 PM', change:"🗑️ REPLACED — old Hwy 128/Fisher Towers segment removed (Fisher Towers dropped to fit Fiery Furnace morning)" },
      { type:'keep',    text:'The Bowen Motel — Moab, Utah', duration:'', time:'~6:55 PM', change:'⏰ TIME UPDATED — ~5:45 PM → ~6:55 PM (Fiery Furnace adds ~1hr net to the day)' },
    ],
  },
  {
    day:4, date:'2026-05-08', title:'Canyonlands — Needles District', wakeup:'7:00 AM', depart:'8:00 AM',
    activities:[
      { type:'driving', text:"Long drive — 1 hour 15 minutes south from Moab on Highway 191 then west on Highway 211 to reach the Needles district of Canyonlands.", duration:'1 hr 15 min', time:'8:00 AM' },
      { type:'walk',    text:"Pot Hole Point — walk across flat open slickrock filled with water-carved basins. You are walking on the rock itself, not a marked trail.", duration:'20 min', time:'9:15 AM' },
      { type:'stop',    text:"Big Spring Canyon Overlook — pull over at the end of a short spur road to look at the canyon below.", duration:'10 min', time:'9:35 AM' },
      { type:'hike',    text:"Elephant Hill and Chesler Park Loop — a full morning hike through a hidden meadow completely surrounded by the famous Needles spires — red and white striped towers reaching into the sky.", duration:'3–5 hrs', time:'9:55 AM' },
      { type:'driving', text:"Long drive back — about 3 hours from the Needles trailhead back through Moab and south to Caineville and Cathedral Valley Inn.", duration:'~3 hrs', time:'3:00 PM' },
      { type:'keep',    text:'Cathedral Valley Inn — Caineville, UT', duration:'', time:'~6:00 PM', change:'⏰ TIME UPDATED — ~4:30 PM → ~6:00 PM (start shift +90 min)' },
    ],
  },
  {
    day:5, date:'2026-05-09', title:'Cathedral Valley + Bentonite Hills', wakeup:'7:00 AM', depart:'8:00 AM',
    activities:[
      { type:'driving', text:"Drive 30 minutes north from the hotel on Hartnet Road into Cathedral Valley — a remote and spectacular part of Capitol Reef that almost no tourists visit.", duration:'30 min', time:'8:00 AM' },
      { type:'hike',    text:"Temple of the Sun — a 400-foot tall isolated red sandstone monolith rising from a perfectly flat valley. Walk to the base and around it. It is one of the most extraordinary places on the entire trip.", duration:'1.5 hrs', time:'8:30 AM' },
      { type:'walk',    text:"Temple of the Moon — the companion formation just a few minutes further along the same road. Visit both together.", duration:'30 min', time:'10:00 AM' },
      { type:'walk',    text:"Gypsum Sinkhole — on the same loop road: a massive open crater in the middle of the flat valley. Very eerie and unusual.", duration:'30 min', time:'10:35 AM' },
      { type:'driving', text:"Drive south on Hartnet Road, then west on Highway 24 to Hanksville. From Hanksville take a short detour NORTH on Cow Dung Road for two quick side-trips.", duration:'30 min', time:'11:10 AM' },
      { type:'stop',    text:"Mars Desert Research Station (drive-by) — a real research facility where scientists simulate Mars missions. You cannot enter, but you can stop on the road and see it from outside.", duration:'10 min', time:'11:30 AM' },
      { type:'walk',    text:"Bentonite Hills — rainbow-striped clay badlands. No official trails — walk where others have walked. A famously Mars-like landscape.", duration:'30 min', time:'11:45 AM' },
      { type:'driving', text:"Drive back south on Cow Dung Road to Highway 24, then west out of Hanksville toward Factory Butte and Coal Mine Road.", duration:'15 min', time:'12:20 PM' },
      { type:'driving', text:"Coal Mine Road through the Factory Butte area — drive slowly through a moonscape of banded clay hills in grey, purple, and red. Pull over whenever you see something beautiful.", duration:'20–40 min', time:'12:40 PM' },
      { type:'stop',    text:"Factory Butte Overlook — a designated pullout where you stop, look at Factory Butte mesa rising 1,500 ft above the desert floor, and take photos. The most iconic landmark in the area.", duration:'10 min', time:'1:10 PM' },
      { type:'stop',    text:"Long Dong Silver Spire (also called Blue Valley Spire) — a 350-foot solo rock spire 7.6 mi west of Hanksville, about a 20-minute drive on dirt road. Worth a photo stop.", duration:'20 min', time:'1:25 PM' },
      { type:'stop',    text:"Skyline Rim Overlook — pull over on Highway 24 for a wide view over the badlands below.", duration:'10 min', time:'1:50 PM' },
      { type:'driving', text:"Highway 24 south of Hanksville — the dramatic badland views on both sides are what she read about. Drive slowly and look out the window.", duration:'scenic drive', time:'2:05 PM' },
      { type:'walk',    text:"Neilson Wash — walk along this desert canyon wash through colorful layered rock.", duration:'30–45 min', time:'2:30 PM' },
      { type:'driving', text:"Drive ~30 minutes west on Highway 24 from Caineville into Capitol Reef National Park.", duration:'30 min', time:'3:15 PM', change:'🆕 NEW SEGMENT — Capitol Reef afternoon block (extends to ~6:00 PM target)' },
      { type:'stop',    text:"Capitol Reef Visitor Center — pick up a map, use restrooms, browse exhibits on the Waterpocket Fold and Fremont culture before driving the Scenic Drive.", duration:'30 min', time:'3:45 PM', change:'🆕 NEW ROW — Capitol Reef Visitor Center' },
      { type:'driving', text:"Drive south on the paved Capitol Reef Scenic Drive — 8 miles through the heart of the Waterpocket Fold past sandstone cliffs glowing in afternoon light.", duration:'25 min', time:'4:15 PM', change:'🆕 NEW ROW — Capitol Reef Scenic Drive' },
      { type:'stop',    text:"Pleasant Creek — south end of the Capitol Reef Scenic Drive. A quiet spot on the creek with massive rock walls; turnaround point before driving back north.", duration:'30 min', time:'4:40 PM', change:'🆕 NEW ROW — Pleasant Creek (Scenic Drive south end)' },
      { type:'driving', text:"Drive ~50 minutes back north on the Scenic Drive, then east on Highway 24 to Cathedral Valley Inn in Caineville.", duration:'~50 min', time:'5:10 PM', change:'🆕 NEW ROW — Capitol Reef return drive' },
      { type:'keep',    text:'Cathedral Valley Inn — Caineville, UT (second night, same hotel)', duration:'', time:'~6:00 PM', change:'⏰ TIME UPDATED — ~2:55 PM → ~6:00 PM (start shift +30 min + Capitol Reef afternoon)' },
    ],
  },
  {
    day:6, date:'2026-05-10', title:'Goblin Valley', wakeup:'7:00 AM', depart:'8:00 AM',
    activities:[
      { type:'driving', text:"Drive 20 minutes south from Cathedral Valley Inn toward Goblin Valley, through the Temple Mountain area — interesting sandstone buttes on both sides. Stay in the car.", duration:'20 min', time:'8:00 AM' },
      { type:'walk',    text:"Goblin Valley main basin — walk freely among hundreds of mushroom-shaped rock hoodoos. There is no marked trail — just wander wherever you like. It looks like the surface of Mars.", duration:'1.5 hrs', time:'8:30 AM' },
      { type:'walk',    text:"Carmel Canyon Trailhead — short loop through bluish-grey hoodoos and goblin-shaped rock formations. The trailhead is right at the Goblin Valley parking area.", duration:'1 hr', time:'10:00 AM' },
      { type:'walk',    text:"Three Sisters — see the famous three-goblin rock formation, one of the iconic shapes of Goblin Valley.", duration:'30 min', time:'11:00 AM' },
      { type:'walk',    text:"Goblin's Lair — climb down into a rocky pit where the walls close in around you. A short scramble at the lair entrance.", duration:'30 min', time:'11:30 AM' },
      { type:'walk',    text:"Curtis Bench Trail — short rim-view walk above the goblin basin with overlooks across the valley.", duration:'30 min', time:'12:05 PM' },
      { type:'walk',    text:"Entrada Canyon Trail — loop through Entrada sandstone canyons just east of the basin.", duration:'30 min', time:'12:40 PM' },
      { type:'note',    text:"Free time at Goblin Valley — wander the basin at your own pace through the afternoon. Grab food at the park picnic area or in the car as you go. Stay until golden hour.", duration:'~4 hrs', time:'1:15 PM', change:'🆕 NEW ROW — afternoon free time at Goblin Valley (replaces early hotel return)' },
      { type:'walk',    text:"Goblin Valley golden hour — return to the main basin or wander the goblins as the light warms. The hoodoos light up to a fiery red as the sun lowers — community-recommended peak photography moment of the area.", duration:'1 hr', time:'5:30 PM', change:'🆕 NEW ROW — Goblin Valley sunset photography' },
      { type:'driving', text:"Drive 35 minutes east to Hanksville.", duration:'35 min', time:'6:30 PM' },
      { type:'keep',    text:"Dukes Slickrock Campground & RV — Hanksville, UT", duration:'', time:'~7:05 PM', change:'⏰ TIME UPDATED — ~1:55 PM → ~7:05 PM (stay through Goblin Valley golden hour)' },
    ],
  },
  {
    day:7, date:'2026-05-11', title:'Little Wild Horse Canyon', wakeup:'7:00 AM', depart:'8:00 AM',
    activities:[
      { type:'driving', text:"Drive 45 minutes south from Hanksville on Highway 24 and Highway 95 to the Little Wild Horse trailhead.", duration:'45 min', time:'8:00 AM' },
      { type:'walk',    text:"Farnsworth Canyon — explore this desert canyon on foot.", duration:'45 min', time:'8:45 AM' },
      { type:'walk',    text:"Wild Horse Window — walk to a natural rock window framing the sky.", duration:'30 min', time:'9:30 AM' },
      { type:'hike',    text:"Little Wild Horse Bell Canyon Loop — walk through one of the best slot canyons you can do without any permit. The walls are only a few feet apart and twist and turn for miles. Wonderful.", duration:'3–4 hrs', time:'10:10 AM' },
      { type:'driving', text:"Drive 30 minutes back north toward Hanksville.", duration:'30 min', time:'1:45 PM' },
      { type:'stop',    text:"Hollow Mountain — a gas station and gift shop built inside a hollow cave in a rock. A very quirky and memorable stop on the way back. Refuel, snack, and stretch before the afternoon scenic drive south.", duration:'15 min', time:'2:15 PM' },
      { type:'driving', text:"Drive ~1 hour south from Hanksville on Highway 95 — the Bicentennial Highway / Utah Scenic Byway. Fully paved, road surface excellent the entire route. Open desert and red rock canyons.", duration:'~1 hr', time:'2:30 PM', change:'🆕 NEW SEGMENT — Hwy 95 south scenic drive to Hite Overlook (extends afternoon)' },
      { type:'stop',    text:"Hite Overlook — paved-access viewpoint over the confluence of the Dirty Devil and Colorado Rivers in Glen Canyon National Recreation Area. Easy short trail (~1,030 ft) along the rim with sweeping vistas.", duration:'45 min', time:'3:30 PM', change:'🆕 NEW ROW — Hite Overlook' },
      { type:'driving', text:"Drive ~1 hour back north on Highway 95 to Hanksville.", duration:'~1 hr', time:'4:15 PM', change:'🆕 NEW ROW — Hwy 95 return drive' },
      { type:'keep',    text:"Dukes Slickrock Campground & RV — Hanksville, UT (same camp, second night)", duration:'', time:'~5:15 PM', change:'⏰ TIME UPDATED — ~2:40 PM → ~5:15 PM (added Hwy 95 + Hite Overlook scenic drive)' },
    ],
  },
  {
    day:8, date:'2026-05-12', title:'Capitol Reef — Main District', wakeup:'6:30 AM', depart:'7:30 AM',
    activities:[
      { type:'driving', text:"Drive 35 minutes west from Hanksville on Highway 24 into Capitol Reef National Park.", duration:'35 min', time:'7:30 AM' },
      { type:'hike',    text:"Chimney Rock Canyon Trail — hike around a tall red rock chimney that stands alone in the landscape.", duration:'2 hrs', time:'8:05 AM' },
      { type:'driving', text:"Drive 10 minutes to the Fruita area of the park.", duration:'10 min', time:'10:10 AM' },
      { type:'walk',    text:"Fruita Historic District — stroll through a living pioneer orchard and original pioneer buildings. You can pick fruit in season.", duration:'35 min', time:'10:20 AM' },
      { type:'stop',    text:"Goosenecks Overlook — pull over and look down at a winding river far below.", duration:'10 min', time:'11:00 AM' },
      { type:'driving', text:"Drive 15 minutes to the hotel in Bicknell for a lunch break.", duration:'15 min', time:'11:25 AM' },
      { type:'note',    text:"Lunch and short rest at the hotel.", duration:'1 hr', time:'11:40 AM' },
      { type:'driving', text:"Drive 15 minutes back into the park.", duration:'15 min', time:'12:40 PM' },
      { type:'walk',    text:"Fremont Gorge Overlook — hike to a dramatic gorge view (~4.5 mi RT, ~1100 ft elevation — moderate effort, longer than the name suggests).", duration:'~2.5 hrs', time:'12:55 PM' },
      { type:'driving', text:"Drive 5 minutes east on Highway 24 to the Hickman Bridge trailhead.", duration:'5 min', time:'3:30 PM' },
      { type:'walk',    text:"Hickman Bridge Trail — walk to a large natural bridge spanning a canyon. One of Capitol Reef's iconic short hikes.", duration:'1.5 hrs', time:'3:35 PM' },
      { type:'driving', text:"Drive 5 minutes back to the Sunset Point area.", duration:'5 min', time:'5:10 PM' },
      { type:'note',    text:"Short rest at a scenic spot near Sunset Point. Use the time to stretch, snack, take photos.", duration:'1 hr 15 min', time:'5:15 PM' },
      { type:'stop',    text:"Sunset Point — the best time to see this viewpoint. The rock glows orange in the evening light. (Note: actual sunset in May is ~8:30 PM; 6:30 is afternoon light, not full golden hour.)", duration:'20 min', time:'6:30 PM' },
      { type:'driving', text:"Drive 15 minutes back to the hotel in Bicknell.", duration:'15 min', time:'6:50 PM' },
      { type:'keep',    text:'Aquarius Inn — Bicknell, UT', duration:'', time:'~7:05 PM' },
    ],
  },
  {
    day:9, date:'2026-05-13', title:'Capitol Reef — Trails', wakeup:'7:00 AM', depart:'8:00 AM',
    activities:[
      { type:'driving', text:"Drive 20 minutes east from Bicknell into Capitol Reef National Park.", duration:'20 min', time:'8:00 AM' },
      { type:'walk',    text:"Rim Overlook (Navajo Knobs) — walk along the canyon rim with sweeping views across the Waterpocket Fold. (Just to the Rim Overlook, NOT the full Navajo Knobs trail which is ~9 mi RT.)", duration:'1.5 hrs', time:'8:20 AM' },
      { type:'driving', text:"Drive 5 minutes to the Cohab Canyon trailhead in Fruita.", duration:'5 min', time:'9:55 AM' },
      { type:'walk',    text:"Cohab Canyon Trail — walk into a hidden canyon named after Mormon polygamists who hid there.", duration:'1.5 hrs', time:'10:00 AM' },
      { type:'walk',    text:"Frying Pan Trail — continues from Cohab Canyon along an interconnected trail with views over the valley.", duration:'2 hrs', time:'11:30 AM' },
      { type:'note',    text:"Lunch break in the Fruita area (picnic area or Gifford House for fresh-baked goods).", duration:'45 min', time:'1:30 PM' },
      { type:'driving', text:"Drive 10 minutes south on the scenic drive to the Old Wagon Trail trailhead.", duration:'10 min', time:'2:15 PM' },
      { type:'walk',    text:"Old Wagon Trail Loop — moderate ~3.5 mi loop on a historic wagon road with sweeping views over the park's south side.", duration:'3 hrs', time:'2:25 PM' },
      { type:'driving', text:"Drive 30 minutes back to Bicknell.", duration:'30 min', time:'5:25 PM' },
      { type:'keep',    text:'Aquarius Inn — Bicknell, UT (same hotel, second night)', duration:'', time:'~5:55 PM' },
    ],
  },
  {
    day:10, date:'2026-05-14', title:'Capitol Reef — South District', wakeup:'6:30 AM', depart:'7:30 AM',
    activities:[
      { type:'driving', text:"Drive 20 minutes east from Bicknell on Highway 24 to the Sulphur Creek Trailhead.", duration:'20 min', time:'7:30 AM' },
      { type:'walk',    text:"Sulphur Creek Route — walk along a shallow creek between sandstone walls (~5–6 mi RT). Cool and shaded; mom may walk in the water in some places. Alternate start: Chimney Rock Trailhead nearby (slightly different access).", duration:'~3 hrs', time:'7:50 AM' },
      { type:'driving', text:"Drive 25 minutes south on the Capitol Reef scenic drive to the Grand Wash trailhead.", duration:'25 min', time:'10:50 AM' },
      { type:'walk',    text:"Grand Wash — walk through a wide open canyon wash between towering sandstone walls.", duration:'1.5 hrs', time:'11:15 AM' },
      { type:'hike',    text:"Cassidy Arch — hike up to a large natural arch named after the outlaw Butch Cassidy, who hid in these canyons.", duration:'2 hrs', time:'12:45 PM' },
      { type:'driving', text:"Capitol Gorge Road — drive slowly through a narrow canyon on a dirt road. The walls rise high on both sides.", duration:'20 min', time:'2:45 PM' },
      { type:'hike',    text:"Golden Throne Trail — hike to views of a massive golden sandstone dome that glows in the afternoon sun.", duration:'~2 hrs', time:'3:05 PM' },
      { type:'walk',    text:"Capitol Gorge Trailhead — start the short Capitol Gorge Trail (~1 mi RT). Walk through the canyon, past the Pioneer Register inscriptions, to the natural water pockets at the end.", duration:'1 hr', time:'5:05 PM' },
      { type:'driving', text:"Drive about 45 minutes northeast on Highway 24 to Cathedral Valley Inn in Caineville.", duration:'~45 min', time:'6:05 PM' },
      { type:'keep',    text:'Cathedral Valley Inn — Caineville, UT (third stay)', duration:'', time:'~6:50 PM' },
    ],
  },
  {
    day:11, date:'2026-05-15', title:'Muley Twist & Waterpocket Fold', wakeup:'6:00 AM', depart:'7:00 AM',
    activities:[
      { type:'driving', text:"Drive ~2 hours from Cathedral Valley Inn — east on Highway 24 to Notom Junction, then SOUTH on Notom-Bullfrog Road (a scenic dirt/gravel road through Strike Valley with sweeping Waterpocket Fold views) all the way to the Headquarters Canyon trailhead area.", duration:'~2 hrs', time:'7:00 AM' },
      { type:'walk',    text:"Headquarters Canyon — hike into this quiet remote canyon at the south end of Capitol Reef.", duration:'1.5 hrs', time:'9:00 AM' },
      { type:'driving', text:"Drive a few miles south on Notom-Bullfrog Road to the Lower Muley Twist trailhead.", duration:'10 min', time:'10:30 AM' },
      { type:'hike',    text:"Lower Muley Twist Canyon — partial walk in (~3 mi out-and-back). The full canyon is 9+ miles, but the first stretch shows the dramatic twisting walls.", duration:'3.5 hrs', time:'10:40 AM' },
      { type:'note',    text:"Lunch break at the canyon trailhead area.", duration:'45 min', time:'2:10 PM' },
      { type:'driving', text:"Drive north on Notom-Bullfrog Road, then west on the Burr Trail toward the Strike Valley access (mostly unpaved).", duration:'45 min', time:'2:55 PM' },
      { type:'stop',    text:"Strike Valley Overlook — pull over and look at the Waterpocket Fold — a 100-mile long wrinkle in the earth's crust — from above.", duration:'15 min', time:'3:40 PM' },
      { type:'stop',    text:"Burr Trail Switchbacks — the dramatic tight switchback climb up the western side of the Waterpocket Fold. Pull over at the top for photos.", duration:'15 min', time:'3:55 PM' },
      { type:'driving', text:"Continue west on the Burr Trail (now paved) toward Singing Canyon.", duration:'25 min', time:'4:10 PM' },
      { type:'walk',    text:"Singing Canyon — a short slot canyon along the Burr Trail with eerie acoustics. Walk in and listen to the wind.", duration:'45 min', time:'4:35 PM' },
      { type:'driving', text:"Final drive west into Boulder, UT.", duration:'15 min', time:'5:20 PM' },
      { type:'keep',    text:'Boulder Mountain Guest Ranch — Boulder, UT', duration:'', time:'~5:35 PM' },
    ],
  },
  {
    day:12, date:'2026-05-16', title:'Escalante / Highway 12', wakeup:'6:30 AM', depart:'7:30 AM',
    activities:[
      { type:'driving', text:"Drive 10 minutes south from Boulder — the road immediately reaches the Head of the Rock Overlook.", duration:'10 min', time:'7:30 AM' },
      { type:'stop',    text:"Head of the Rock Overlook — pull over for a wide view of the canyon country below before descending.", duration:'15 min', time:'7:40 AM' },
      { type:'driving', text:"The Hogback — a famous section of Highway 12 where the road narrows to a ridge with sheer drops on both sides. Drive slowly and look — it is spectacular and a little exciting.", duration:'5 min', time:'7:58 AM' },
      { type:'stop',    text:"Calf Creek Viewpoint — pull over on Hwy 12 for a vista point view of the Calf Creek canyon. Quick stop.", duration:'15 min', time:'8:07 AM' },
      { type:'hike',    text:"Lower Calf Creek Falls — walk 3 miles through a green canyon to a 126-foot waterfall hidden in the desert. One of the most beautiful places on the trip.", duration:'3–4 hrs', time:'8:30 AM' },
      { type:'driving', text:"Drive 30 minutes west along Highway 12 into Escalante.", duration:'30 min', time:'12:20 PM' },
      { type:'stop',    text:"Escalante Interagency Visitor Center — stop on Main Street for context on Grand Staircase-Escalante National Monument: maps, exhibits, ranger talks.", duration:'30 min', time:'12:50 PM' },
      { type:'walk',    text:"Escalante River Trail — walk along the river through the canyon.", duration:'1.5 hrs', time:'1:25 PM' },
      { type:'walk',    text:"Escalante Petrified Forest State Park — see ancient trees turned to colorful stone. Wide Hollow Reservoir is right at the same location (small blue lake adjoining the park). Good place to rest.", duration:'1 hr', time:'2:55 PM' },
      { type:'walk',    text:"Escalante Natural Bridge — walk to a natural bridge formation.", duration:'30 min', time:'3:55 PM' },
      { type:'hike',    text:"Zebra Slot Canyon — a narrow slot canyon with dramatic striped walls in pink, red, and white. The walls are very close together.", duration:'2 hrs', time:'4:30 PM', change:"⏱️ DURATION TRIMMED — 2.5 hrs → 2 hrs (pacing fix; Day 12 was ending at 7:30 PM, now ~7:00 PM within the 18-19 PM window)." },
      { type:'stop',    text:"Sunset at Head of the Rocks Overlook — drive back up Highway 12 for the same viewpoint you saw this morning, now golden at sunset.", duration:'15 min', time:'6:30 PM', change:"⏰ TIME — was 7:00 PM" },
      { type:'keep',    text:'Escalante Outfitters — Escalante, UT', duration:'', time:'~7:00 PM', change:'⏰ TIME — was ~7:30 PM (within pacing window after Zebra Slot trim)' },
    ],
  },
  {
    day:13, date:'2026-05-17', title:'Hole in the Rock Road', wakeup:'6:30 AM', depart:'7:30 AM',
    activities:[
      { type:'driving', text:"Drive 25 minutes south from Escalante on Hole-in-the-Rock Road (a dirt road into the canyon backcountry) to Devil's Garden.", duration:'25 min', time:'7:30 AM' },
      { type:'walk',    text:"Devils Garden Outstanding Natural Area — short walk among hoodoos, arches, and balanced rocks. (NOT the Devil's Garden in Arches NP — different place; this is the Grand Staircase one.)", duration:'1 hr', time:'7:55 AM' },
      { type:'driving', text:"Continue south 25 minutes to the Lower Dry Fork Trailhead — start of the Dry Fork slot canyon hike.", duration:'25 min', time:'8:55 AM' },
      { type:'hike',    text:"Peek-a-Boo Slot Canyon — drop into the first of four connected slots from the Lower Dry Fork Trailhead. Climb up a small step at the entrance, then walk through curvy red walls.", duration:'1.5 hrs', time:'9:20 AM' },
      { type:'hike',    text:"Spooky Slot Canyon — exit Peek-a-Boo and walk to Spooky, the narrowest of the four (walls only ~10 inches apart in places). Turn sideways to pass.", duration:'1 hr', time:'10:50 AM' },
      { type:'hike',    text:"Brimstone Gulch — short hike further down the wash to a darker, deeper slot canyon.", duration:'45 min', time:'11:50 AM' },
      { type:'walk',    text:"Dry Fork Narrows — return walk through the wash narrows back toward the trailhead.", duration:'45 min', time:'12:35 PM' },
      { type:'note',    text:"Lunch break at the trailhead area.", duration:'45 min', time:'1:20 PM' },
      { type:'walk',    text:"Rim Trail — short walk along the canyon edge above the slots, with overlooks down into the canyons mom just hiked.", duration:'30 min', time:'2:05 PM' },
      { type:'driving', text:"Continue south on Hole-in-the-Rock Road — 45 minutes to Dance Hall Rock.", duration:'45 min', time:'2:35 PM' },
      { type:'walk',    text:"Dance Hall Rock — a large smooth rock that pioneers used as an outdoor dance floor on their journey south. Walk across it.", duration:'20 min', time:'3:20 PM' },
      { type:'driving', text:"Continue south — 30 minutes to the end of the road at the river.", duration:'30 min', time:'3:40 PM' },
      { type:'walk',    text:"Hole in the Rock — walk down through a narrow crack in a cliff that pioneers used to lower their wagons to the river below. A historic and dramatic spot.", duration:'30 min', time:'4:10 PM' },
      { type:'driving', text:"Drive 1.5 hours back north to Escalante.", duration:'1.5 hrs', time:'4:40 PM' },
      { type:'keep',    text:'Escalante Outfitters — Escalante, UT (same hotel, second night)', duration:'', time:'~6:10 PM' },
    ],
  },
  {
    day:14, date:'2026-05-18', title:'Grand Staircase → Vermilion Cliffs → Page', wakeup:'6:00 AM', depart:'7:00 AM',
    activities:[
      // ── CHOICE: the day forks into two route options depending on weather. ──
      { type:'note',    text:"TODAY HAS TWO ROUTES — pick based on the weather. The app shows the forecast and asks you which to take. If NO rain is forecast AND none fell in the last 24 hours → take OPTION 1 (scenic backcountry dirt road, most beautiful). If ANY rain is forecast OR it rained recently → take OPTION 2 (paved detour). Cottonwood Canyon Road is clay and becomes impassable when wet, even with 4WD. Both routes meet at Big Water, Arizona, and the afternoon is the same for both.", duration:'', time:'', route:'both', change:"🆕 NEW ROW — brought back mom's two-route structure (rainy-day alternative was lost)" },

      // ── OPTION 1 — DRY WEATHER (backcountry scenic route) ──
      { type:'driving', text:"OPTION 1 (no rain): Drive 30 minutes north from Escalante to Cannonville, where Cottonwood Canyon Road begins.", duration:'30 min', time:'7:00 AM', route:'dry', change:'🔀 ROUTE — Option 1 (dry only)' },
      { type:'driving', text:"OPTION 1: Cottonwood Canyon Road — scenic dirt road through Grand Staircase country. Drive slowly, enjoy the layered red and white rock. The road is clay — if rain starts, turn around immediately.", duration:'~2 hrs', time:'7:35 AM', route:'dry', change:'🔀 ROUTE — Option 1 (dry only)' },
      { type:'walk',    text:"OPTION 1: Grosvenor Arch — walk to a dramatic double arch rising out of the desert. One of the largest arches in the region. Accessed only via the dirt road.", duration:'30 min', time:'9:35 AM', route:'dry', change:'🔀 ROUTE — Option 1 (dry only)' },
      { type:'walk',    text:"OPTION 1: Hackberry Canyon — optional short walk into a quiet wash off Cottonwood Canyon Road if you want to stretch.", duration:'30 min', time:'10:10 AM', route:'dry', change:"🆕 NEW ROW — split Hackberry Canyon into its own row (mom asked for it by name)" },
      { type:'walk',    text:"OPTION 1: Kodachrome Basin State Park — walk among colorful stone pillars called sand pipes. The colors are remarkable — reds, pinks, and creams.", duration:'1 hr', time:'10:45 AM', route:'dry', change:"✏️ ROUTE + SPELLING — Option 1; \"colours\" → \"colors\"" },

      // ── OPTION 2 — WET WEATHER (paved detour) ──
      { type:'driving', text:"OPTION 2 (if rainy or rained recently): Skip the dirt road entirely. Stay on Highway 12 east, then US-89 south all the way to Big Water, Arizona. You miss Grosvenor Arch, Hackberry Canyon, and Kodachrome Basin — but the paved route is safe in any weather and the afternoon stops are just as beautiful.", duration:'~2.5 hrs', time:'7:00 AM', route:'wet', change:"🆕 NEW ROW — added the rain alternative route that was lost from mom's original plan" },

      // ── BOTH ROUTES CONVERGE at Big Water, AZ ──
      { type:'note',    text:"Both routes meet here, at Highway 89 near Big Water, Arizona. From this point on, the afternoon plan is the same regardless of weather.", duration:'', time:'11:45 AM', route:'both', change:'🆕 NEW ROW — convergence marker' },
      { type:'stop',    text:"Big Water Visitor Center — BLM visitor center on Hwy 89 between Kanab and Page. Paleontology museum; 14+ new dinosaur species discovered in this monument. Ask here about Glen Canyon National Recreation Area trails. Note: this center has been closed intermittently — call ahead: 435-826-5499.", duration:'25 min', time:'12:00 PM', route:'both', change:"🆕 NEW ROW — added Big Water Visitor Center (mom had it in her original plan; was missing)" },
      { type:'stop',    text:"Toadstools and Pedestal Alley — pull over to see rocks balanced on thin pedestals, like giant mushrooms. Nearby, Stud Horse Point is a short detour across the road with a wide view over the Vermilion Cliffs.", duration:'25 min', time:'12:35 PM', route:'both', change:'✏️ EXPANDED — added Stud Horse Point detour (was missing)' },
      { type:'driving', text:"Highway 89 toward Page — open desert drive between the Vermilion Cliffs region and Page. Look out the window for the red rock walls along the way (Big Water and Stud Horse Point are drive-by points to see from the car, not stops).", duration:'30 min', time:'1:05 PM', route:'both' },
      { type:'walk',    text:"Skylight Arch — walk to a natural arch that frames the sky.", duration:'30 min', time:'1:35 PM', route:'both' },
      { type:'walk',    text:"Hanging Garden Trail — a short walk to a lush green spring-fed garden hanging from a desert cliff. Unexpected and beautiful.", duration:'30 min', time:'2:10 PM', route:'both' },
      { type:'stop',    text:"Glen Canyon Dam Overlook — pull over and look at the enormous concrete dam holding back Lake Powell.", duration:'15 min', time:'2:45 PM', route:'both' },
      { type:'hike',    text:"Horseshoe Bend Trail — a short easy hike to one of the most photographed places in America: the Colorado River bending in a perfect horseshoe far below.", duration:'45 min', time:'3:05 PM', route:'both' },
      { type:'walk',    text:"Wahweap Marina — walk down to the boat marina at the edge of Lake Powell. Good spot to touch the water.", duration:'20 min', time:'3:55 PM', route:'both' },
      { type:'driving', text:"Drive 10 minutes from the marina to the hotel.", duration:'10 min', time:'4:15 PM', route:'both' },
      { type:'note',    text:"Free time in Page — dinner in town, browse the area, or a brief rest at the hotel before the sunset stop. Not dead time at the hotel — get out and enjoy Page.", duration:'~2.5 hrs', time:'4:25 PM', route:'both' },
      { type:'driving', text:"Drive 5 minutes from the hotel to Wahweap Overlook for sunset.", duration:'5 min', time:'6:55 PM', route:'both' },
      { type:'stop',    text:"Wahweap Overlook at sunset — look out over Lake Powell from above as the rocks turn golden then orange. Sunset on May 18 is ~8:00 PM; mom can stay until last light.", duration:'45 min', time:'7:00 PM', route:'both' },
      { type:'driving', text:"Drive 10 minutes back to the hotel.", duration:'10 min', time:'7:45 PM', route:'both' },
      { type:'keep',    text:'Lake Powell Resort — Page, AZ', duration:'', time:'~7:55 PM', route:'both' },
    ],
  },
  {
    day:15, date:'2026-05-19', title:'Lees Ferry / Marble Canyon', wakeup:'7:00 AM', depart:'8:00 AM',
    activities:[
      { type:'driving', text:"Drive 25 minutes northwest from Page on Highway 89A to the Lees Ferry and Marble Canyon area.", duration:'25 min', time:'8:00 AM' },
      { type:'walk',    text:"Marble Canyon — look at the beginning of the Grand Canyon system from the rim.", duration:'1 hr', time:'8:25 AM' },
      { type:'walk',    text:"Navajo Bridge — two historic bridges side by side over the Colorado River. Walk across one of them and look down at the river.", duration:'20 min', time:'9:30 AM' },
      { type:'walk',    text:"Cathedral Wash — a short canyon hike to the Colorado River.", duration:'1 hr', time:'9:55 AM' },
      { type:'walk',    text:"Lees Ferry — walk along the historic river crossing where, for over a century, this was the only place to cross the Colorado River for hundreds of miles.", duration:'45 min', time:'11:00 AM' },
      { type:'hike',    text:"Spencer Trail (PARTIAL only) — start the climb above Lees Ferry for first overlooks. The full trail is ~9 mi RT with 1500 ft elevation — too strenuous; turn back at ~1.5 hrs.", duration:'1.5 hrs', time:'11:50 AM' },
      { type:'note',    text:"Lunch break at Lees Ferry area or grab food on the drive back.", duration:'45 min', time:'1:25 PM' },
      { type:'driving', text:"Drive 25 minutes back to Page.", duration:'25 min', time:'2:10 PM' },
      { type:'stop',    text:"Glen Canyon Dam Powerplant Tour — guided tour into the working hydroelectric powerplant at Glen Canyon Dam. Meet at the Carl Hayden Visitor Center on the north end of the dam in Page. Tours run regularly; reserve in advance.", duration:'1.5 hrs', time:'2:35 PM' },
      { type:'driving', text:"Drive 15 minutes north on Highway 89 to Wahweap Overlook.", duration:'15 min', time:'4:05 PM', change:"🆕 NEW ROW — extend afternoon (was ending 4:10 PM hotel, almost 2 hrs early on the pacing rule)." },
      { type:'stop',    text:"Wahweap Overlook — panoramic overlook of Lake Powell and the surrounding red rock canyons. Easy paved access; great photo stop.", duration:'30 min', time:'4:20 PM', change:"🆕 NEW ROW — Wahweap Overlook (Lake Powell panorama)." },
      { type:'driving', text:"Drive 10 minutes north to Lone Rock Beach.", duration:'10 min', time:'4:50 PM', change:"🆕 NEW ROW — short drive to the Lake Powell beach." },
      { type:'walk',    text:"Lone Rock Beach — Lake Powell sandy beach with the iconic Lone Rock standing in the water. Mom can walk along the shore, dip her feet, take photos. A relaxing end-of-day after the morning hikes.", duration:'1 hr', time:'5:00 PM', change:"🆕 NEW ROW — Lone Rock Beach (Lake Powell). Memory-flagged as the natural Page-area afternoon filler." },
      { type:'driving', text:"Drive 25 minutes south back to Page.", duration:'25 min', time:'6:00 PM', change:"🆕 NEW ROW — return drive." },
      { type:'keep',    text:'Knights Inn Page — Page, AZ', duration:'', time:'~6:25 PM', change:'⏰ TIME UPDATED — was ~4:10 PM (within pacing window after Wahweap Overlook + Lone Rock Beach afternoon block).' },
    ],
  },
  {
    day:16, date:'2026-05-20', title:'Antelope Canyon', wakeup:'8:00 AM', depart:'9:00 AM',
    activities:[
      { type:'note',    text:"Pickup at Knights Inn Page at 9:00 AM (PHX/MST time) — tour shuttle picks mom up at the hotel, no driving needed.", duration:'', time:'9:00 AM' },
      { type:'tour',    text:"Lower Antelope Canyon — guided tour into a sandstone slot canyon. Descend 5 flights of stairs into the largest cavern, walk through curving red walls, exit via welded ladders.", duration:'~1 hr', time:'9:45 AM' },
      { type:'note',    text:"Short break / restroom stop at Big Lake Trading Post (Shell gas station) on the way to Upper Antelope.", duration:'~30 min', time:'11:00 AM' },
      { type:'tour',    text:"Upper Antelope Canyon — guided tour with 4x4 ride to entrance. Famous for golden light beams in mid-day. Walk through, photograph, exit via 150 steps over the canyon top.", duration:'~1.5 hrs', time:'12:00 PM' },
      { type:'note',    text:"Tour shuttle drops mom back at Knights Inn Page.", duration:'', time:'~2:00 PM' },
      { type:'driving', text:"Pack up and drive ~1 hr 15 min west on US-89 toward Kanab — turnoff at the Belly of the Dragon pullout (~14 mi north of Kanab).", duration:'~1 hr 15 min', time:'2:30 PM' },
      { type:'walk',    text:"Belly of the Dragon — short tunnel walk on US-89 about 14 miles north of Kanab. A sandstone tunnel carved by water — a quick scenic stop.", duration:'30 min', time:'3:45 PM' },
      { type:'driving', text:"Continue 20 minutes south on US-89 into Kanab.", duration:'20 min', time:'4:15 PM' },
      { type:'walk',    text:"Kanab Main Street — historic downtown stroll: shops, galleries, Western movie history, plus dinner at one of the local restaurants.", duration:'2 hrs', time:'4:35 PM' },
      { type:'keep',    text:'Travelodge by Wyndham Kanab — Kanab, UT', duration:'', time:'~6:35 PM' },
    ],
  },
  {
    day:17, date:'2026-05-21', title:'White Pocket Guided Tour (Dreamland Safari)', wakeup:'7:00 AM', depart:'8:00 AM',
    activities:[
      { type:'note',    text:"Wake up early; tour pickup at Travelodge Kanab at 8:00 AM Mountain Time. Bring water (2-3L per person), lunch, hiking shoes, layers, sunglasses, sunscreen, hat, camera, small backpack. Tour is full-day with Dreamland Safari Tours, order #B-8DXGM5J.", duration:'', time:'7:00 AM' },
      { type:'tour',    text:"White Pocket Guided Tour (Dreamland Safari Tours, Order B-8DXGM5J) — pickup at Travelodge Kanab. Full-day guided 4WD tour into Vermilion Cliffs National Monument to White Pocket: a remote area of swirled white-and-red sandstone formations. Hiking among the formations with the guide, photo stops, natural history narration. Snacks + water refills provided.", duration:'~8-9 hrs', time:'8:00 AM' },
      { type:'note',    text:"Tour returns to the hotel late afternoon (typically ~4:30-5:30 PM, depending on logistics).", duration:'', time:'~5:00 PM' },
      { type:'walk',    text:"Kanab Main Street — dinner in town after the tour. Quiet historic downtown for an evening stroll.", duration:'1.5 hrs', time:'5:30 PM' },
      { type:'keep',    text:'Travelodge by Wyndham Kanab — Kanab, UT (second night, same hotel as Day 16)', duration:'', time:'~7:00 PM' },
    ],
  },
  {
    day:18, date:'2026-05-22', title:'Bryce Canyon — Scenic + Hiking', wakeup:'6:00 AM', depart:'7:00 AM',
    activities:[
      { type:'driving', text:"Drive 1.5 hours north from Kanab to Rainbow Point at the far south end of Bryce Canyon (or 10 min from Bryce Canyon Resort if mom slept there last night).", duration:'~1.5 hrs', time:'7:00 AM' },
      { type:'walk',    text:"Rainbow Point — the highest point in Bryce Canyon (9,115 feet). Walk to the edge and look south — on a clear day you can see the Grand Canyon on the horizon.", duration:'25 min', time:'8:30 AM' },
      { type:'stop',    text:"Yovimpa Point — right next to Rainbow Point, a different angle on the same view. Combine both in one stop.", duration:'10 min', time:'8:55 AM' },
      { type:'driving', text:"Drive north along the park road to the next viewpoint.", duration:'5 min', time:'9:10 AM' },
      { type:'stop',    text:"Ponderosa Canyon — pullout on the park road. Look down into a forested side canyon full of ponderosa pines growing among the hoodoos.", duration:'10 min', time:'9:20 AM' },
      { type:'stop',    text:"Agua Canyon — pull over for one of the best views in the entire park: two enormous hoodoos named The Hunter and The Rabbit stand below you.", duration:'15 min', time:'9:35 AM' },
      { type:'stop',    text:"Natural Bridge — pull over to see a large natural arch from the roadside.", duration:'10 min', time:'9:55 AM' },
      { type:'driving', text:"Drive 15 minutes north to Bryce Point.", duration:'15 min', time:'10:10 AM' },
      { type:'walk',    text:"Bryce Point — the single best viewpoint in all of Bryce Canyon. Walk along the rim and look down into an enormous horseshoe filled with hundreds of orange and white hoodoos.", duration:'30 min', time:'10:30 AM' },
      { type:'stop',    text:"Inspiration Point — one more canyon viewpoint, a slightly different angle from Bryce Point.", duration:'15 min', time:'11:05 AM' },
      { type:'walk',    text:"Sunset Point — stand at the rim and look into the amphitheater before descending. This is where the big hike starts.", duration:'15 min', time:'11:25 AM' },
      { type:'stop',    text:"Visitor Center Bryce Canyon (OPTIONAL) — restrooms, park map, exhibits. Skip if the day feels tight.", duration:'20 min', time:'11:45 AM' },
      { type:'note',    text:"Lunch break at the Bryce Canyon lodge / visitor center area before the big hike.", duration:'45 min', time:'12:10 PM' },
      { type:'hike',    text:"Figure-8 Loop: Queen's Garden + Peekaboo Loop + Navajo Loop (Wall Street) — the full classic Bryce hike (~6.4 mi). Descend through Queen's Garden hoodoos, continue around Peekaboo Loop past the Cathedral and Wall of Windows, return via Wall Street's slot canyon. Long but iconic.", duration:'~5 hrs', time:'12:55 PM' },
      { type:'driving', text:"Drive 2.5 hours south and west to Zion's Most Wanted Hotel in Hildale.", duration:'2.5 hrs', time:'5:55 PM' },
      { type:'keep',    text:"Zion's Most Wanted Hotel — Hildale, UT", duration:'', time:'~8:25 PM' },
    ],
  },
  {
    day:19, date:'2026-05-23', title:'Zion Canyon — Day 1', wakeup:'6:30 AM', depart:'7:30 AM',
    activities:[
      { type:'driving', text:"Drive 1 hour from Hildale (Zion's Most Wanted Hotel) through the east entrance of Zion on Highway 9.", duration:'1 hr', time:'7:30 AM' },
      { type:'driving', text:"Drive through the Zion-Mt Carmel Tunnel to the Visitor Center.", duration:'10 min', time:'8:30 AM' },
      { type:'stop',    text:"Zion N/P Visitor Center — pick up shuttle pass and park map. Mom takes the shuttle to whichever stops she wants to visit at her own pace (private cars are not allowed in the canyon).", duration:'all day', time:'8:45 AM' },
      { type:'driving', text:"Drive 45 minutes to St. George at the end of the day.", duration:'45 min', time:'late afternoon' },
      { type:'keep',    text:'Economy Inn & Suites — St. George, UT', duration:'', time:'evening' },
    ],
  },
  {
    day:20, date:'2026-05-24', title:'Zion Canyon — Day 2', wakeup:'6:30 AM', depart:'7:30 AM',
    activities:[
      { type:'driving', text:"Drive 45 minutes from St. George to the Zion Visitor Center.", duration:'45 min', time:'7:30 AM' },
      { type:'stop',    text:"Zion N/P Visitor Center — pick up shuttle pass. Mom takes the shuttle to whichever stops she wants at her own pace (private cars are not allowed in the canyon).", duration:'all day', time:'8:15 AM' },
      { type:'driving', text:"Drive 45 minutes back to St. George at the end of the day.", duration:'45 min', time:'late afternoon' },
      { type:'keep',    text:'Economy Inn & Suites — St. George, UT (second night, same hotel as Day 19)', duration:'', time:'evening' },
    ],
  },
  {
    day:21, date:'2026-05-25', title:'Kanarra Falls + Valley of Fire → Las Vegas', wakeup:'6:00 AM', depart:'7:00 AM',
    activities:[
      { type:'driving', text:"Drive 1 hour north from the hotel to Kanarraville on Interstate 15.", duration:'1 hr', time:'7:00 AM' },
      { type:'hike',    text:"Kanarra Falls — hike through a narrow canyon stream to a series of small waterfalls. You wade through the water — bring water shoes. Permit is BOOKED ($15/person, kanarrafalls.com — 250 hikers/day cap, especially tight on Memorial Day weekend).", duration:'3.5 hrs', time:'8:00 AM', change:"⏰ DURATION TIGHTENED — was '3-4 hrs' range; locked to 3.5 hrs as planning value. ✏️ URL FIXED — was 'kanarraville.org' (site does not exist) → 'kanarrafalls.com'. Permit confirmed booked 2026-05-01." },
      { type:'driving', text:"Drive ~3 hours south on Interstate 15 from Kanarraville to Valley of Fire State Park in Nevada. You will cross from Utah into Arizona and then Nevada along the way.", duration:'~3 hrs', time:'11:30 AM', change:"⏰ DURATION CORRECTED — was '~2 hrs' which was an underestimate. Actual driving Kanarraville → Valley of Fire is ~3 hrs on I-15." },
      { type:'stop',    text:"Valley of Fire Visitor Center — pick up a park map, restrooms, browse the geology + petroglyph exhibits.", duration:'15 min', time:'2:30 PM', change:"🆕 NEW ROW — VC visit added (was missing from the original plan)." },
      { type:'driving', text:"Drive 5 minutes from the VC to the Atlatl Rock parking lot.", duration:'5 min', time:'2:45 PM' },
      { type:'walk',    text:"Atlatl Rock — climb the metal staircase up the side of the boulder to see ancient petroglyphs etched into the sandstone — rock art over 1,000 years old, face-to-face.", duration:'20 min', time:'2:50 PM', change:"🆕 NEW ROW — Atlatl Rock split out as its own activity (was buried inside the vague 'Valley of Fire' row in the original plan)." },
      { type:'driving', text:"Drive 5 minutes to the Petrified Logs Loop pullout.", duration:'5 min', time:'3:10 PM' },
      { type:'walk',    text:"Petrified Logs Loop — short paved/gravel loop past ancient petrified wood lying where it fossilized. NOTE: This is the REAL 'Petrified Logs' — mom's original 'Petrified Logs Kanarra Falls' note was a ChatGPT location mistake. Petrified wood is here at Valley of Fire, not at Kanarra Falls.", duration:'20 min', time:'3:15 PM', change:"🆕 NEW ROW — Petrified Logs Loop (Valley of Fire). The place mom asked about exists, just here, not at Kanarra. ⚠️ COORDS NEEDED: please verify the parking-lot coordinates on Google Maps before the trip — currently narrative-only (no map pin)." },
      { type:'driving', text:"Drive 10 minutes north on Mouse's Tank Road to the Mouse's Tank trailhead.", duration:'10 min', time:'3:35 PM' },
      { type:'walk',    text:"Mouse's Tank / Petroglyph Canyon Trail — a 0.75-mile sandy walk between rock walls covered in ancient petroglyphs. Ends at a small natural water tank named after a 19th-century outlaw who hid here.", duration:'45 min', time:'3:45 PM', change:"🆕 NEW ROW — Mouse's Tank trail promoted from orphan map-pin to a real schedule row." },
      { type:'driving', text:"Drive 5 minutes to the Rainbow Vista parking lot.", duration:'5 min', time:'4:30 PM' },
      { type:'walk',    text:"Rainbow Vista — short 1-mile walk to a panoramic overlook of multicolored sandstone cliffs (every color in the rainbow, no exaggeration). One of the iconic Valley of Fire views.", duration:'40 min', time:'4:35 PM', change:"🆕 NEW ROW — Rainbow Vista added (open year-round; replaces the closed Fire Wave Trail). ⚠️ COORDS NEEDED: please verify the parking-lot coordinates on Google Maps — currently narrative-only." },
      { type:'driving', text:"Drive 10 minutes south, passing Elephant Rock visible on your left, to the Elephant Rock Loop trailhead near the East Entrance.", duration:'10 min', time:'5:15 PM' },
      { type:'walk',    text:"Elephant Rock Loop — short 0.3-mile loop trail with a close-up view of the famous Elephant Rock arch (it really does look like an elephant's head and trunk).", duration:'25 min', time:'5:25 PM', change:"🆕 NEW ROW — Elephant Rock Loop trail (replaces White Domes Trail which is closed May 15-Sept 30 every year)." },
      { type:'driving', text:"Drive 50 minutes west on Interstate 15 into Las Vegas.", duration:'~50 min', time:'5:50 PM' },
      { type:'keep',    text:'Tuscany Suites & Casino — Las Vegas, NV', duration:'', time:'~6:40 PM', change:'⏰ TIME UPDATED — ~5:30 PM → ~6:40 PM (drive-time correction +1 hr; afternoon redesigned around the May 15-Sept 30 trail closures at Valley of Fire — see the Day 21 Problem note for full closure list).' },
    ],
  },
  {
    day:22, date:'2026-05-26', title:'Las Vegas', wakeup:'flexible', depart:'flexible',
    activities:[
      { type:'note',    text:"A rest day. Put your luggage down and explore Las Vegas at your own pace — the Strip, shows, restaurants, shopping. No planned hikes or drives today.", duration:'free day', time:'' },
      { type:'keep',    text:'Tuscany Suites & Casino — Las Vegas, NV (same hotel)', duration:'', time:'' },
    ],
  },
  {
    day:23, date:'2026-05-27', title:'Red Rock Canyon', wakeup:'8:00 AM', depart:'9:00 AM',
    activities:[
      { type:'driving', text:"Drive 30 minutes west from the hotel on Highway 159 to Red Rock Canyon.", duration:'30 min', time:'9:00 AM' },
      { type:'stop',    text:"Red Rock Canyon Visitor Center — pick up a map of the scenic drive.", duration:'10 min', time:'9:30 AM' },
      { type:'walk',    text:"Calico Hills — walk among dramatic red and cream sandstone hills. Calico Tank is a small water pocket at the top of a short rocky scramble.", duration:'1.5 hrs', time:'9:45 AM' },
      { type:'walk',    text:"Sandstone Quarry area — walk and explore the sandstone formations.", duration:'30 min', time:'11:20 AM' },
      { type:'hike',    text:"Ice Box Canyon — hike into a shaded canyon that stays cool even in summer. Waterfalls appear after rain.", duration:'1.5–2 hrs', time:'11:55 AM' },
      { type:'stop',    text:"High Point Overlook — pull over for a last wide view of Red Rock Canyon before heading back to the city.", duration:'15 min', time:'1:45 PM' },
      { type:'driving', text:"Drive 30 minutes back to Las Vegas.", duration:'30 min', time:'2:05 PM' },
      { type:'note',    text:"Vegas evening from 4:00 PM — free time on the Strip (Bellagio fountains, dinner, casinos) or at the hotel. Mom picks.", duration:'', time:'4:00 PM', change:"🆕 NEW ROW — flexible Vegas evening block (last evening before flight)." },
      { type:'keep',    text:'Tuscany Suites & Casino — Las Vegas, NV (last night)', duration:'', time:'evening' },
    ],
  },
  {
    day:24, date:'2026-05-28', title:'Departure — Las Vegas', wakeup:'9:00 AM', depart:'by 10:00 AM',
    activities:[
      { type:'driving', text:"Drive ~20 minutes south to the McCarran Rent-A-Car Center (7135 Gilespie St) — return the Sixt car here, NOT at the terminal itself. Free rental-center shuttle takes you to LAS Terminal 1 or 3 (~10 min). Allow extra time for car-return paperwork + shuttle wait + airport check-in + security.", duration:'allow 2–3 hrs', time:'10:00 AM', change:"✏️ TEXT UPDATED — added McCarran Rent-A-Car Center address, named Sixt, flagged the off-airport return + shuttle to terminal." },
    ],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
async function build() {
  const wb = new ExcelJS.Workbook();
  wb.creator = 'Trip Planner';
  wb.created = wb.modified = new Date();

  // ══════════════════════════════════════════════════════════════════════════
  // SHEET 1 — MOM'S DAILY GUIDE
  // ══════════════════════════════════════════════════════════════════════════
  const s1 = wb.addWorksheet("📅 Day by Day", {
    views: [{ state:'frozen', ySplit:2 }],
    pageSetup: { paperSize:9, orientation:'portrait', fitToPage:true, fitToWidth:1 },
  });

  s1.columns = [
    { key:'time',   width:11 },
    { key:'type',   width:18 },
    { key:'text',   width:62 },
    { key:'dur',    width:13 },
    { key:'lat',    width:11 },
    { key:'lng',    width:11 },
    { key:'problem',width:42 },
    { key:'change', width:38 },
  ];

  // Sheet title
  s1.mergeCells('A1:H1');
  const shTitle = s1.getCell('A1');
  shTitle.value     = "Mom's Canyon Trip 2026 — What You're Doing Each Day";
  shTitle.fill      = fill(C.headerBg);
  shTitle.font      = font(14, true, C.white);
  shTitle.alignment = { vertical:'middle', horizontal:'center' };
  s1.getRow(1).height = 36;

  // Column headers
  const hRow = s1.addRow(['Time', 'Activity', 'What you are doing', 'How long', 'Lat', 'Lng', '⚠️ Problem to fix', '🆕 What changed this session']);
  hRow.eachCell(cell => {
    cell.fill      = fill('2C3E50');
    cell.font      = font(10.5, true, C.white);
    cell.border    = bdr();
    cell.alignment = { vertical:'middle', horizontal:'center', wrapText:true };
  });
  hRow.height = 26;

  const DAYS_TO_RENDER = DAY_FILTER
    ? DAYS.filter(d => d.day >= DAY_FILTER.from && d.day <= DAY_FILTER.to)
    : DAYS;

  for (const day of DAYS_TO_RENDER) {
    // ── Day header ────────────────────────────────────────────────────────
    const wakeStr   = day.wakeup === 'flexible' ? 'Flexible day' : `Wake up ${day.wakeup}`;
    const leaveStr  = day.depart === 'flexible' || /landing/i.test(day.depart || '') || day.depart === '—'
                        ? day.depart
                        : `Leave at ${day.depart}`;
    const dayLabel  = `Day ${day.day}  —  ${fmtDate(day.date)}     ${day.title}     ${wakeStr}  |  ${leaveStr}`;

    const dRow = s1.addRow([dayLabel, '', '', '', '', '', '', '']);
    s1.mergeCells(`A${dRow.number}:H${dRow.number}`);
    dRow.getCell(1).value = dayLabel;
    dRow.getCell(1).fill  = fill(C.headerBg);
    dRow.getCell(1).font  = font(11.5, true, C.white);
    dRow.getCell(1).alignment = { vertical:'middle', horizontal:'left', indent:2 };
    dRow.height = 28;

    // ── Activity rows ─────────────────────────────────────────────────────
    for (const act of day.activities) {
      const cfg = TYPES[act.type] || TYPES.note;
      const changeText = act.change || '';
      const coords = lookupCoords(day.day, act);
      const latStr = coords ? coords.lat.toFixed(5) : '';
      const lngStr = coords ? coords.lng.toFixed(5) : '';
      const problem = findProblem(day.day, act);
      const problemText = problem ? `[${problem.severity}] ${problem.text}` : '';
      const r = s1.addRow([act.time, cfg.label, act.text, act.duration, latStr, lngStr, problemText, changeText]);

      // Row fill: warning color overrides default activity color when there's a problem.
      const rowFillHex = problem ? SEVERITY_FILL[problem.severity] : cfg.rowBg;
      r.eachCell({ includeEmpty:true }, cell => {
        cell.fill      = fill(rowFillHex);
        cell.font      = font(10);
        cell.border    = bdr();
        cell.alignment = { vertical:'middle', wrapText:true };
      });

      // Time cell
      const tc0 = r.getCell(1);
      tc0.font      = { name:'Calibri', size:10, italic:true, color:{ argb:'FF'+C.dim } };
      tc0.alignment = { vertical:'middle', horizontal:'center', wrapText:false };

      // Label badge
      const lc = r.getCell(2);
      lc.fill      = fill(cfg.lblBg);
      lc.font      = font(10, true, act.type==='cancel' ? C.cancel : C.dark);
      lc.alignment = { vertical:'middle', horizontal:'center', wrapText:true };

      // Text
      const tc = r.getCell(3);
      tc.alignment = { vertical:'middle', wrapText:true, indent:1 };
      if (act.type === 'cancel') tc.font = font(10, true, C.cancel);
      if (act.type === 'add')    tc.font = font(10, false, '1B5E20');

      // Duration
      const dc = r.getCell(4);
      dc.font      = font(9.5, false, C.dim);
      dc.alignment = { vertical:'middle', horizontal:'center', wrapText:true };

      // Lat / Lng cells — monospace, dim, centered
      for (const idx of [5, 6]) {
        const co = r.getCell(idx);
        co.font      = { name:'Consolas', size:9, color:{ argb:'FF555555' } };
        co.alignment = { vertical:'middle', horizontal:'center' };
      }

      // Problem column — bold + colored, only when there's an issue.
      const pc = r.getCell(7);
      if (problem) {
        pc.fill      = fill(SEVERITY_FILL[problem.severity]);
        pc.font      = font(9.5, true, SEVERITY_FG[problem.severity]);
        pc.alignment = { vertical:'top', wrapText:true, indent:1 };
      } else {
        pc.font      = font(9, false, 'AAAAAA');
        pc.alignment = { vertical:'middle', horizontal:'center' };
      }

      // Change column — highlights only rows that actually changed
      const cc = r.getCell(8);
      if (changeText) {
        cc.fill      = fill('FFF3E0');
        cc.font      = font(9.5, true, '7A3F00');
        cc.alignment = { vertical:'middle', wrapText:true, indent:1 };
      } else {
        cc.font      = font(9, false, 'AAAAAA');
        cc.alignment = { vertical:'middle', horizontal:'center' };
      }

      const lineCount = Math.max(
        Math.ceil(act.text.length / 75),
        Math.ceil((act.duration||'').length / 14),
        Math.ceil((changeText||'').length / 40),
        Math.ceil((problemText||'').length / 42),
        1,
      );
      r.height = Math.max(32, lineCount * 18 + 10);
    }

    // Spacer
    const sp = s1.addRow(['','','','','','','','']);
    sp.height = 8;
    sp.eachCell(cell => { cell.fill = fill('F0F0F0'); });
  }

  // ══════════════════════════════════════════════════════════════════════════
  // SHEET 2 — RECOMMENDATIONS
  // ══════════════════════════════════════════════════════════════════════════
  const s2 = wb.addWorksheet('🗺️ Recommendations', {
    views: [{ state:'frozen', ySplit:3 }],
    pageSetup: { paperSize:9, orientation:'landscape', fitToPage:true, fitToWidth:1 },
  });
  s2.columns = [
    { key:'priority', width:10 },
    { key:'type',     width:18 },
    { key:'when',     width:26 },
    { key:'name',     width:34 },
    { key:'why',      width:44 },
    { key:'action',   width:44 },
    { key:'lat',      width:10 },
    { key:'lng',      width:10 },
  ];

  s2.mergeCells('A1:H1');
  const t2 = s2.getCell('A1');
  t2.value     = "Recommended Changes to Mom's Trip";
  t2.fill      = fill(C.headerBg);
  t2.font      = font(14, true, C.white);
  t2.alignment = { vertical:'middle', horizontal:'center' };
  s2.getRow(1).height = 36;

  const h2 = s2.addRow(['Priority','Type','Day / Date / Area','Name','Why It Matters','What to Do / Notes','Lat','Lng']);
  h2.eachCell(cell => {
    cell.fill      = fill('2C3E50');
    cell.font      = font(10.5, true, C.white);
    cell.border    = bdr();
    cell.alignment = { vertical:'middle', horizontal:'center', wrapText:true };
  });
  h2.height = 28;

  function applySection2(row) {
    row.eachCell(cell => {
      cell.fill      = fill(C.sectionBg);
      cell.font      = font(10.5, true, C.white);
      cell.alignment = { vertical:'middle', horizontal:'left', indent:1 };
    });
    row.height = 22;
  }
  function applyRec(row, priority) {
    const bg    = priority==='HIGH' ? 'FFE5E5' : priority==='MEDIUM' ? 'FFF0E0' : 'FFFBE0';
    const badge = priority==='HIGH' ? 'FF6B6B' : priority==='MEDIUM' ? 'F4A261' : 'FFD700';
    row.eachCell({ includeEmpty:true }, cell => {
      cell.fill      = fill(bg);
      cell.font      = font(10);
      cell.border    = bdr();
      cell.alignment = { vertical:'top', wrapText:true, indent:1 };
    });
    row.height = 55;
    const pc = row.getCell(1);
    pc.fill      = fill(badge);
    pc.font      = font(10, true);
    pc.alignment = { vertical:'middle', horizontal:'center' };
    row.getCell(4).font = font(10, true);
    row.getCell(3).font = font(9.5, false, C.dim);
    [7,8].forEach(ci => {
      row.getCell(ci).font      = { name:'Courier New', size:9, color:{argb:'FF555555'} };
      row.getCell(ci).alignment = { vertical:'middle', horizontal:'center' };
    });
  }

  const recs = [
    { _s:'⚠️  עצירות חסרות — חשובות מאוד' },
    { p:'HIGH', t:'Add Stop', w:'Day 4 or 5\nשישי 8 במאי / שבת 9 במאי\n(Cathedral Valley Inn)', n:'Temple of the Sun\nCathedral Valley', y:"את ישנה 3 לילות ב-Cathedral Valley Inn ואין שום עצירה מתוכננת ב-Cathedral Valley. מונולית בודד של אבן חול אדומה בגובה 120 מטר בצפון Capitol Reef. כמעט אף אחד לא מגיע לכאן.", a:'דרך Hartnet Road צפונה מ-Caineville. כביש עפר, עביר כשיבש. שלוש העצירות של Cathedral Valley באותה לולאה של 4-5 שעות.', lat:38.298, lng:-111.122 },
    { p:'HIGH', t:'Add Stop', w:'Day 4 or 5\nשישי 8 במאי / שבת 9 במאי', n:'Temple of the Moon\nCathedral Valley', y:'תצורה תאומה ל-Temple of the Sun באותה לולאת כביש.', a:'באותה לולאה של Hartnet Road. לבקר יחד עם Temple of the Sun ו-Gypsum Sinkhole.', lat:38.297, lng:-111.120 },
    { p:'HIGH', t:'Add Stop', w:'Day 4 or 5\nשישי 8 במאי / שבת 9 במאי', n:'Gypsum Sinkhole\nCathedral Valley', y:'מכתש ענקי בקרקעית העמק השטוח — מאוד מוזר ומיוחד.', a:'באותה לולאת כביש כמו ה-Temples.', lat:38.305, lng:-111.100 },
    { _s:'⚠️  ZION — ימים 19 ו-20 ריקים מתוכן' },
    { p:'HIGH', t:'Fill Empty Day', w:'Day 19\nשבת 23 במאי\n(Zion)', n:'Angels Landing Trail', y:"אחד המסלולים המפורסמים בעולם. שרשראות בקטע הסופי לרכס פסגה צר. בכלל לא מתוכנן.", a:'דרוש היתר — להזמין ב-recreation.gov > Zion NP > Angels Landing. חלופה: Observation Point (בלי היתר, נוף אפילו טוב יותר).', lat:37.269, lng:-112.948 },
    { p:'HIGH', t:'Fill Empty Day', w:'Day 19 or 20\n(Zion)', n:'The Narrows\n(Temple of Sinawava)', y:'הליכה בנהר Virgin River בין קירות קניון צרים — חוויה ייחודית. בלי היתר.', a:"לשכור wetsuit בספרינגדייל — מים במאי כ-7°C, קרים מאוד. שאטל לתחנה האחרונה (Temple of Sinawava). לתכנן 4-6 שעות.", lat:37.298, lng:-112.948 },
    { p:'HIGH', t:'Fill Empty Day', w:'Day 20\nראשון 24 במאי\n(Zion)', n:'Emerald Pools Trails', y:'שלוש בריכות מדורגות עם מפלים. יפהפה ונגיש. לא בתוכנית.', a:'Lower Pool: קל 0.6 מייל. Middle: 1.0 מייל. Upper: 1.2 מייל. שאטל לתחנת The Grotto.', lat:37.255, lng:-112.957 },
    { p:'MEDIUM', t:'Fill Empty Day', w:'Day 19\nשבת 23 במאי\n(הגעה דרך Hwy 9)', n:'Canyon Overlook Trail', y:'מסלול קצר של מייל אחד עם תצפית מרהיבה על הקניון. חימום טוב. בלי שאטל.', a:'טרילהד בצד המזרחי של מנהרת Zion-Mt Carmel ב-Hwy 9.', lat:37.220, lng:-112.943 },
    { _s:'🏨  שינויי מלונות' },
    { p:'HIGH', t:'Sleeping Change', w:'Days 19–20\n23-24 במאי', n:'לבטל Economy Inn & Suites\nולהזמין מלון בספרינגדייל במקום', y:'St. George במרחק 45+ דקות מהשאטל של Zion. ספרינגדייל במרחק 5 דקות — מאפשר התחלה מוקדמת ל-Angels Landing ויום מלא בקניון.', a:'Hampton Inn Springdale או דומה. הכרחי אם משיגים היתר ל-Angels Landing (חייבים להתחיל עד 7:00).', lat:37.199, lng:-112.988 },
    { p:'MEDIUM', t:'Sleeping Change', w:'Day 14 area\nשני 18 במאי', n:'אופציונלי: להוסיף לילה ב-Monument Valley\n(The View Hotel)', y:'התמונה האייקונית של ה-Mittens דורשת אור של שעת זהב. הגעה בצהריים נותנת אור שטוח וחזק.', a:'The View Hotel (שמורת Navajo) על שפת הקניון. להזמין הרבה זמן מראש. לפחות להגיע עד 18:00 בערב לתפיסת שעת הזהב.', lat:36.999, lng:-110.113 },
    { _s:'🔧  שגיאות בנתונים — לתקן או להסיר לפני הטיול' },
    { p:'FIX', t:'Remove', w:'Day 5 — שבת 9 במאי', n:'להסיר: Cosmic Ash Hills Walk Utah', y:'מסלול כזה לא קיים בשום מקום.', a:'להסיר מהמסלול.', lat:'', lng:'' },
    { p:'FIX', t:'Fix Coords', w:'Day 5 — שבת 9 במאי', n:'לתקן: קואורדינטות שגויות ב-Rainbow Hills Loop', y:'הקואורדינטות מוטעות בכ-130 ק"מ (מצביעות ליד St. George).', a:"לבקש מאמא למצוא את הכתבה שקראה — צריך לאמת את המיקום המדויק.", lat:'', lng:'' },
    { p:'FIX', t:'Fix Coords', w:'Day 6 — ראשון 10 במאי', n:'לתקן: Carmel Canyon Loop Utah', y:'הקואורדינטות מצביעות ל-St. George — 270 ק"מ הרחק. ישבור את הניווט.', a:'קואורדינטות נכונות: בערך (38.570, -110.710) ב-Goblin Valley.', lat:38.570, lng:-110.710 },
    { p:'DONE', t:'Removed', w:'Day 21 — שני 25 במאי', n:'הוסר: Petrified Logs Kanarra Falls', y:'Petrified Logs קיימים — אבל ב-Escalante Petrified Forest State Park, לא ב-Kanarra Falls. ChatGPT בלבל בין שני מקומות.', a:'✅ הוסר מהמסלול ב-2026-05-01. Petrified Logs לא יבוקרו בטיול הזה.', lat:'', lng:'' },
    { p:'DONE', t:'Removed', w:'Day 21 — שני 25 במאי', n:'הוסר: Seven Wonders Kanarra Falls', y:'Seven Wonders הוא מסלול אמיתי — אבל ב-Valley of Fire (ליד טרילהד Fire Wave), לא ב-Kanarra Falls.', a:'✅ הוסר מהמסלול ב-2026-05-01. עצירת Fire Wave ביום 21 כבר עוברת באזור הזה — אין צורך בשינוי תוכנית, רק שינוי שם.', lat:'', lng:'' },
    { p:'DONE', t:'Renamed', w:'Day 21 — שני 25 במאי', n:'שונה שם: Elephant Rock — Valley of Fire\n(היה: "Elephant Rock Kanarra Falls")', y:'Elephant Rock נמצא ב-Valley of Fire, לא ב-Kanarra Falls. השם הישן בלבל בין שני מקומות.', a:'✅ שונה ב-2026-05-01. אמא עוברת על-יד Elephant Rock שנראה מהכביש בשעה 15:00 בנסיעה מ-Atlatl Rock ל-Fire Wave.', lat:36.430, lng:-114.460 },
    { p:'FIX', t:'Add Coords', w:'Day 15 — שלישי 19 במאי', n:'לתקן: Spencer Trail — להוסיף קואורדינטות', y:'מסלול אמיתי וכדאי ב-Lees Ferry. הקואורדינטות פשוט חסרות.', a:'קואורדינטות טרילהד Spencer Trail: (36.864, -111.586). 3.5 מייל הלוך-חזור.', lat:36.864, lng:-111.586 },
    { p:'FIX', t:'Fix Coords', w:'Day 12 — שבת 16 במאי', n:"לתקן: Devil's Garden Hoodoos Utah", y:"הקואורדינטות מצביעות ל-Arches National Park. ה-Devil's Garden של Escalante הוא מקום אחר לחלוטין.", a:"קואורדינטות נכונות ליד Escalante: בערך (37.787, -111.396).", lat:37.787, lng:-111.396 },
  ];

  for (const rec of recs) {
    if (rec._s) {
      const sr = s2.addRow([rec._s,'','','','','','','']);
      s2.mergeCells(`A${sr.number}:H${sr.number}`);
      applySection2(sr);
      continue;
    }
    const r = s2.addRow([rec.p, rec.t, rec.w, rec.n, rec.y, rec.a, rec.lat, rec.lng]);
    applyRec(r, rec.p);
  }
  s2.autoFilter = { from:'A2', to:'H2' };

  // ══════════════════════════════════════════════════════════════════════════
  // SHEET 3 — LEGEND
  // ══════════════════════════════════════════════════════════════════════════
  const s3 = wb.addWorksheet('📋 Legend', {});
  s3.columns = [{ width:24 }, { width:65 }];

  function addLeg(label, desc, lblBg, rowBg) {
    const lr = s3.addRow([label, desc]);
    lr.getCell(1).fill      = fill(lblBg);
    lr.getCell(1).font      = font(10.5, true);
    lr.getCell(1).alignment = { vertical:'middle', horizontal:'center' };
    lr.getCell(2).fill      = fill(rowBg||lblBg);
    lr.getCell(2).font      = font(10.5);
    lr.getCell(2).alignment = { vertical:'middle', wrapText:true };
    lr.height = 34;
    [1,2].forEach(ci => { lr.getCell(ci).border = bdr(); });
  }

  const lt = s3.addRow(['Daily Guide — Activity Color Key','']);
  s3.mergeCells(`A${lt.number}:B${lt.number}`);
  lt.getCell(1).fill = fill(C.headerBg); lt.getCell(1).font = font(13,true,C.white);
  lt.getCell(1).alignment = { vertical:'middle', horizontal:'center' }; lt.height = 34;
  s3.addRow(['','']);
  addLeg('In the car',     'You stay in the car. Look out the window or drive to the next place. No need to park or get out.',  C.drivingLbl, C.driving);
  addLeg('Quick stop',     'Park the car, walk a short distance to the viewpoint, take a photo, continue. Usually 5–15 minutes.', C.stopLbl, C.stop);
  addLeg('Short walk',     'Get out of the car and walk — usually less than an hour. Easy, no special gear needed.',               C.walkLbl, C.walk);
  addLeg('Hike',           'Longer walk — 1 hour or more. Wear comfortable shoes and bring water.',                                C.hikeLbl, C.hike);
  addLeg('Guided tour',    'Your guide leads you. Just follow, listen, and enjoy.',                                                 C.tourLbl, C.tour);
  addLeg('Add to plan ⭐', 'A highly recommended stop that is currently missing from the itinerary.',                              C.addLbl,  C.add);
  addLeg('Note ⚠️',        'An important tip or warning about this day.',                                                          C.noteLbl, C.note);
  addLeg('Sleep tonight 🏨 (gold)',  'Hotel for the night — no change needed.',                                                   C.hotelLbl, C.hotelKeep);
  addLeg('Sleep tonight 🏨 (red)',   'Hotel for the night — this one should be CANCELLED and replaced. See details in the row.',  C.cancelLbl, C.hotelCancel);

  s3.addRow(['','']);
  const lt2 = s3.addRow(['Time Column — How to Read It','']);
  s3.mergeCells(`A${lt2.number}:B${lt2.number}`);
  lt2.getCell(1).fill = fill(C.headerBg); lt2.getCell(1).font = font(13,true,C.white);
  lt2.getCell(1).alignment = { vertical:'middle', horizontal:'center' }; lt2.height = 30;
  s3.addRow(['','']);
  const rows3 = [
    ['Wake up time (in header)', 'When to wake up, shower, have breakfast, and get ready to go.'],
    ['Leave time (in header)',   'When to get in the car and drive away from the hotel.'],
    ['Time in each row',         'The estimated time that activity starts — shown in italic grey.'],
    ['First row of each day',    'Always shows the drive from the hotel to the first stop, so you know how long you are in the car before anything begins.'],
    ['Drive time included',      'All times already account for driving between stops — no need to add extra.'],
  ];
  for (const [label, desc] of rows3) {
    const rr = s3.addRow([label, desc]);
    rr.getCell(1).fill = fill('D6E4F0'); rr.getCell(1).font = font(10.5, true);
    rr.getCell(2).fill = fill('EBF5FB'); rr.getCell(2).font = font(10.5);
    rr.height = 32;
    [1,2].forEach(ci => { rr.getCell(ci).border = bdr(); rr.getCell(ci).alignment = { vertical:'middle', wrapText:true, indent:1 }; });
  }

  // ══════════════════════════════════════════════════════════════════════════
  // SHEET — KNOWN ISSUES (data-quality flags surfaced from js/data.js)
  // ══════════════════════════════════════════════════════════════════════════
  const sIss = wb.addWorksheet('⚠️ Known Issues', {
    pageSetup: { paperSize:9, orientation:'landscape', fitToPage:true, fitToWidth:1 },
  });
  sIss.columns = [
    { key:'severity', width:10 },
    { key:'where',    width:20 },
    { key:'item',     width:34 },
    { key:'problem',  width:60 },
    { key:'next',     width:50 },
  ];
  sIss.mergeCells('A1:E1');
  const issT = sIss.getCell('A1');
  issT.value     = 'Known data issues — items to verify before mom drives';
  issT.fill      = fill(C.headerBg);
  issT.font      = font(13, true, C.white);
  issT.alignment = { vertical:'middle', horizontal:'center' };
  sIss.getRow(1).height = 32;

  const issH = sIss.addRow(['Severity','Where','Item','Problem','What to do next']);
  issH.eachCell(cell => {
    cell.fill      = fill('2C3E50');
    cell.font      = font(10.5, true, C.white);
    cell.border    = bdr();
    cell.alignment = { vertical:'middle', horizontal:'center' };
  });
  issH.height = 24;

  const issues = [];

  for (const iss of issues) {
    const rr = sIss.addRow([iss.severity, iss.where, iss.item, iss.problem, iss.next]);
    rr.eachCell({ includeEmpty:true }, cell => {
      cell.border = bdr();
      cell.alignment = { vertical:'top', wrapText:true, indent:1 };
      cell.font = font(10);
    });
    rr.getCell(1).font = font(10, true, C.cancel);
    rr.getCell(1).alignment = { vertical:'top', horizontal:'center', wrapText:true };
    rr.height = 70;
  }

  await wb.xlsx.writeFile(OUT);
  console.log('✅  Written:', OUT);
  if (DAY_FILTER) console.log(`   (filtered to days ${DAY_FILTER.from}–${DAY_FILTER.to})`);
}

build().catch(e => { console.error(e); process.exit(1); });
