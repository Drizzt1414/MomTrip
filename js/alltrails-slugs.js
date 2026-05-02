// Hand-curated AllTrails slugs per stopId. When present, mom gets a button
// that opens the trail page directly in the AllTrails app (or web fallback).
// When absent, render falls back to a "search AllTrails" button.
//
// Slug pattern: country/state/trail-slug — verified against actual alltrails.com
// URLs at the date below. AllTrails sometimes renames trails; if a button
// 404s, the slug needs updating.
//
// Used by alltrailsTrailUrl(stopId) in js/app.js.

const ALLTRAILS_SLUGS = {
  // ─── Day 2 — Arches ───────────────────────────────────────────────────────
  'd2-s2':  'us/utah/park-avenue-trail',
  'd2-s6':  'us/utah/balanced-rock-trail',
  'd2-s7':  'us/utah/double-arch-trail',
  'd2-s8':  'us/utah/turret-arch-trail',
  'd2-s9':  'us/utah/the-windows-loop',
  'd2-s10': 'us/utah/delicate-arch-trail',
  'd2-s12': 'us/utah/sand-dune-arch-trail',
  'd2-s13': 'us/utah/broken-arch-trail',
  'd2-s14': 'us/utah/skyline-arch-trail',
  'd2-s15': 'us/utah/devils-garden-trail',
  'd2-s16': 'us/utah/landscape-arch-trail',
  'd2-s17': 'us/utah/pine-tree-arch-trail',
  'd2-s18': 'us/utah/tunnel-arch-trail',
  'd2-s21': 'us/utah/double-o-arch-trail',

  // ─── Day 3 — Canyonlands Island in the Sky ────────────────────────────────
  'd3-s1':  'us/utah/mesa-arch-trail',
  'd3-s2':  'us/utah/dead-horse-point-rim-trail',
  'd3-s5':  'us/utah/upheaval-dome-overlook-trail',
  'd3-s8':  'us/utah/grand-view-trail',

  // ─── Day 4 — Canyonlands Needles ──────────────────────────────────────────
  'd4-s1':  'us/utah/pothole-point-trail',
  'd4-s3':  'us/utah/chesler-park-loop-via-elephant-hill',
  'd4-s4':  'us/utah/chesler-park-loop-via-elephant-hill',

  // ─── Day 6 — Goblin Valley + Little Wild Horse ────────────────────────────
  'd6-s2':  'us/utah/little-wild-horse-canyon-and-bell-canyon-loop',
  'd6-s3':  'us/utah/three-sisters-via-curtis-bench-trail',

  // ─── Day 8-9 — Capitol Reef ───────────────────────────────────────────────
  'd8-s6':  'us/utah/hickman-bridge-trail',
  'd9-s6':  'us/utah/old-wagon-trail',
  'd10-s1': 'us/utah/cassidy-arch-trail',

  // ─── Day 11 — Lower Calf Creek ────────────────────────────────────────────
  'd11-s2': 'us/utah/lower-calf-creek-falls-trail',

  // ─── Day 13 — Hole-in-the-Rock slot canyons ───────────────────────────────
  'd13-s2': 'us/utah/peek-a-boo-and-spooky-slot-canyons-via-upper-dry-fork-narrows',
  'd13-s3': 'us/utah/peek-a-boo-and-spooky-slot-canyons-via-upper-dry-fork-narrows',

  // ─── Day 14 — Vermilion Cliffs / Page area ────────────────────────────────
  'd14-s8': 'us/utah/toadstool-hoodoos-trail',
  'd14-s16': 'us/arizona/horseshoe-bend-trail',

  // ─── Day 15 — Lees Ferry ──────────────────────────────────────────────────
  'd15-s4': 'us/arizona/cathedral-wash-trail',
  'd15-s6': 'us/arizona/spencer-trail',

  // ─── Day 16 — Belly of the Dragon ─────────────────────────────────────────
  'd16-s3': 'us/utah/belly-of-the-dragon-trail',

  // ─── Day 18 — Bryce Canyon ────────────────────────────────────────────────
  'd18-s3': 'us/utah/queens-garden-trail',
  'd18-s4': 'us/utah/peekaboo-loop-trail',
  'd18-s5': 'us/utah/navajo-loop-trail',

  // ─── Day 19-20 — Zion ─────────────────────────────────────────────────────
  // (slugs to verify — adding common ones; Zion stops in data.js may have
  // different stopIds depending on how the day was structured)

  // ─── Day 21 — Kanarra + Valley of Fire ────────────────────────────────────
  'd21-s1': 'us/utah/kanarra-creek-falls',

  // ─── Day 23 — Red Rock Canyon ─────────────────────────────────────────────
  'd23-s2': 'us/nevada/calico-hills',
  'd23-s3': 'us/nevada/calico-tank-trail',
  'd23-s5': 'us/nevada/ice-box-canyon-trail',
};

if (typeof module !== 'undefined') module.exports = ALLTRAILS_SLUGS;
