// Stop-level hazard tags — used by weather.js to cross-reference forecast
// against the day's actual plan and surface specific named-stop warnings
// (e.g. "Cancel Peek-a-Boo and Spooky today — 65% rain forecast").
//
// Categories:
//   'slot-canyon'      : flash-flood lethal in rain. Rain ≥ 30% prob → cancel.
//   'dirt-road-clay'   : impassable when wet (Cow Dung, Hole-in-the-Rock,
//                        Hartnet). Rain ≥ 30% within 24h → skip.
//   'strenuous-hike'   : long/exposed effort that becomes risky in heat for
//                        60+. Heat ≥ 30°C → start by 7:00 or skip.
//   'exposed-rim'      : open slickrock / canyon rim. Thunderstorm code
//                        ≥ 95 → off the rim by midday (lightning).
//   'guided-tour'      : flash-flood concern present (e.g. Antelope) but
//                        the tour operator monitors weather — surface info,
//                        don't tell mom to cancel.

const STOP_HAZARDS = {
  // ─── Day 2 — Arches ───
  'd2-s10': ['strenuous-hike', 'exposed-rim'],   // Delicate Arch Trail (4.8 km RT slickrock, exposed)
  'd2-s15': ['strenuous-hike', 'exposed-rim'],   // Devils Garden Trailhead (primitive 12 km)

  // ─── Day 3 — Canyonlands + Fiery Furnace ───
  'd3-s1':  ['exposed-rim'],                     // Island in the Sky Mesa Arch
  'd3-s8':  ['exposed-rim'],                     // Grand View Point
  'd3-s12': ['strenuous-hike', 'exposed-rim'],   // Self-Guided Fiery Furnace (route-finding, slickrock)

  // ─── Day 4 — Needles ───
  'd4-s3':  ['strenuous-hike', 'exposed-rim'],   // Elephant Hill
  'd4-s4':  ['strenuous-hike', 'exposed-rim'],   // Chesler Park

  // ─── Day 5 — Cathedral Valley / Bentonite ───
  'd5-s4':  ['dirt-road-clay'],                  // Bentonite Hills (Cow Dung Road)
  'd5-s7':  ['dirt-road-clay'],                  // Mars Desert Research Station (Cow Dung Road)
  'd5-s8':  ['dirt-road-clay'],                  // Long Dong Silver Spire (dirt road)

  // ─── Day 7 — Little Wild Horse ───
  'd7-s2':  ['slot-canyon', 'strenuous-hike'],   // Little Wild Horse Bell Canyon Loop

  // ─── Day 12 — Escalante / Highway 12 ───
  'd12-s5':  ['strenuous-hike'],                 // Lower Calf Creek Falls (9.6 km RT)
  'd12-s13': ['slot-canyon'],                    // Zebra Slot

  // ─── Day 13 — Hole-in-the-Rock ───
  'd13-s2': ['slot-canyon'],                     // Peek-a-Boo Slot Canyon
  'd13-s3': ['slot-canyon'],                     // Spooky Slot Canyon
  'd13-s4': ['slot-canyon'],                     // Brimstone Gulch
  'd13-s5': ['slot-canyon'],                     // Dry Fork Narrows
  'd13-s8': ['dirt-road-clay'],                  // Dance Hall Rock (Hole-in-the-Rock Road)
  'd13-s9': ['dirt-road-clay'],                  // Hole in the Rock (Hole-in-the-Rock Road)

  // ─── Day 16 — Antelope Canyon ───
  'd16-s1': ['guided-tour'],                     // Lower Antelope Canyon (tour operator monitors weather)
  'd16-s2': ['guided-tour'],                     // Upper Antelope Canyon (same)

  // ─── Day 18 — Bryce Canyon ───
  'd18-s1':  ['exposed-rim'],                    // Sunset Point
  'd18-s3':  ['strenuous-hike', 'exposed-rim'],  // Queen's Garden
  'd18-s4':  ['strenuous-hike', 'exposed-rim'],  // Peekaboo Loop
  'd18-s5':  ['strenuous-hike', 'exposed-rim'],  // Navajo Loop
  'd18-s6':  ['exposed-rim'],                    // Inspiration Point
  'd18-s12': ['exposed-rim'],                    // Bryce Point
};

// Returns the list of stops on a given day that match a hazard category.
function stopsWithHazard(day, category) {
  if (!day || !day.stops) return [];
  return day.stops
    .filter(s => (STOP_HAZARDS[s.id] || []).includes(category))
    .map(s => ({ id: s.id, name: s.name }));
}

if (typeof window !== 'undefined') {
  window.STOP_HAZARDS = STOP_HAZARDS;
  window.stopsWithHazard = stopsWithHazard;
}
if (typeof module !== 'undefined') module.exports = { STOP_HAZARDS, stopsWithHazard };
