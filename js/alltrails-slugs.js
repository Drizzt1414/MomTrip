// Hand-curated AllTrails slugs per stopId. Only confident entries — incorrect
// slugs lead to a 404 on alltrails.com which is annoying but not dangerous.
// Slug pattern: country/state/trail-name (verified against actual AllTrails URLs).
//
// Add more slugs by visiting alltrails.com, finding the trail, and copying the
// last 3 path segments after /trail/.
//
// Used by alltrailsTrailUrl(stopId) in js/app.js.

const ALLTRAILS_SLUGS = {
  // Day 2 — Arches
  'd2-s2':  'us/utah/park-avenue-trail',
  'd2-s10': 'us/utah/delicate-arch-trail',
  'd2-s15': 'us/utah/devils-garden-trail',

  // Day 3 — Canyonlands
  'd3-s1':  'us/utah/mesa-arch-trail',
  'd3-s8':  'us/utah/grand-view-point-trail',

  // Day 6 — Goblin Valley / Little Wild Horse
  // (slugs to verify before adding)

  // Day 8-9 — Capitol Reef
  // 'd8-s2': 'us/utah/hickman-bridge-trail',
  // 'd9-s2': 'us/utah/cassidy-arch-trail',

  // Day 11 — Lower Calf Creek Falls
  // 'd11-s1': 'us/utah/lower-calf-creek-falls-trail',

  // Day 13 — Slot canyons
  // 'd13-s2': 'us/utah/peek-a-boo-and-spooky-slot-canyons',

  // Day 16 — Antelope (note: must book guided tour, not just walk in)
  // (Antelope has complex tour-operator URLs, not standard AllTrails entries)

  // Day 18 — Bryce
  // 'd18-s3': 'us/utah/queens-garden-trail',
  // 'd18-s5': 'us/utah/navajo-loop-trail',

  // Day 19-20 — Zion (verify slugs)
  // 'd19-XX': 'us/utah/angels-landing-trail',
  // 'd19-XX': 'us/utah/canyon-overlook-trail',
  // 'd20-XX': 'us/utah/the-narrows-bottom-up',
  // 'd20-XX': 'us/utah/emerald-pools-trail',

  // Day 23 — Red Rock Canyon
  'd23-s5': 'us/nevada/ice-box-canyon-trail',
};

if (typeof module !== 'undefined') module.exports = ALLTRAILS_SLUGS;
