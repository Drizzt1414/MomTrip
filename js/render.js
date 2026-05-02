// === Rendering Engine — Clean & Confident ===
// Designed for an anxious mom who needs reassurance

const DEFAULT_AUDIT = { status:'verified', issues:[], suggestedCoords:null };
function sAudit(s) { return s.audit || DEFAULT_AUDIT; }

let _lastRenderedDay = null;

function render() {
  try {
    _render();
  } catch (err) {
    console.error('render failed', err);
    const app = document.getElementById('app');
    if (app) app.innerHTML = `<div class="empty"><div class="big-icon">💛</div>
      <p style="font-size:17px;line-height:1.5;">משהו השתבש בהצגת היום.<br>נסי לטעון מחדש את הדף.</p>
      <button class="listen-btn" style="margin-top:16px" onclick="location.reload()">🔄 טעני מחדש</button></div>`;
  }
}

function _render() {
  // Tear down leaflet maps so innerHTML rewrite doesn't leak them.
  if (typeof leafletMaps !== 'undefined') {
    for (const id in leafletMaps) {
      try { leafletMaps[id].remove(); } catch(_) {}
    }
    leafletMaps = {};
  }

  // Update header badge — pending pre-trip items.
  try {
    const badge = document.getElementById('checklistBadge');
    if (badge) {
      const n = (typeof pretripPendingCount === 'function') ? pretripPendingCount() : 0;
      if (n > 0) { badge.textContent = String(n); badge.hidden = false; }
      else { badge.hidden = true; }
    }
  } catch (_) {}

  // Pre-trip checklist screen — full overlay when open.
  if (state.showPretrip) {
    renderPretripChecklist();
    return;
  }

  const day = getCurrentDay();
  const stops = getDayStops(day);
  const prog = getDayProgress(day);
  const total = getTotalProgress();
  const days = TRIP_DATA.days;
  const idx = days.findIndex(d => d.dayNumber === state.currentDay);

  // Header
  document.getElementById('headerTitle').textContent = `${UI.day} ${day.dayNumber} — ${day.title || UI.appTitle}`;
  document.getElementById('headerSub').textContent = `${prog.checked}/${prog.total} ${UI.stops} ${UI.completed}`;
  document.getElementById('progressFill').style.width = prog.pct + '%';

  // Day picker
  let picker = '';
  for (const d of days) {
    const dp = getDayProgress(d);
    const active = d.dayNumber === state.currentDay;
    const hasErr = (d.stops || []).some(s => sAudit(s).status === 'error' && !removedStops[s.id]);
    let cls = 'day-chip';
    if (active) cls += ' active';
    if (dp.pct === 100 && dp.total > 0) cls += ' all-done';
    else if (dp.checked > 0) cls += ' has-progress';
    if (hasErr) cls += ' has-errors';
    picker += `<button class="${cls}" onclick="goToDay(${d.dayNumber})"><span class="chip-num">${d.dayNumber}</span>${d.date ? `<span class="chip-date">${formatDateShort(d.date)}</span>` : ''}</button>`;
  }
  document.getElementById('dayPicker').innerHTML = picker;
  // Only scroll the active chip into view when the day actually changed — otherwise
  // every checkbox tick scroll-jacks the horizontal nav under her finger.
  if (_lastRenderedDay !== state.currentDay) {
    _lastRenderedDay = state.currentDay;
    requestAnimationFrame(() => {
      const c = document.querySelector('.day-chip.active');
      if (c && c.scrollIntoView) c.scrollIntoView({ behavior: 'auto', block: 'nearest', inline: 'center' });
    });
  }

  // Nav buttons
  const pb = document.getElementById('prevBtn'), nb = document.getElementById('nextBtn');
  pb.disabled = idx === 0;
  nb.disabled = idx === days.length - 1;
  pb.textContent = idx === 0 ? '' : `◀ ${UI.day} ${days[idx - 1].dayNumber}`;
  nb.textContent = idx === days.length - 1 ? `🎉 ${UI.tripComplete}` : `${UI.day} ${days[idx + 1].dayNumber} ▶`;

  // Main content
  let h = '';

  // Praise banner — FIRST THING mom sees on every day. Named + warm.
  h += `<div class="praise-banner">
    <div class="praise-text">${praiseForDay(day.dayNumber)}</div>
  </div>`;

  // Tip banner (first visit)
  if (!state.bannerDismissed && day.dayNumber <= 2) {
    h += `<div class="tip-banner">
      <button class="tip-close" onclick="dismissBanner()">✕</button>
      <h3>📱 לפני הטיול</h3>
      <p>פתחי <b>Google Maps</b> → חפשי את האזור → לחצי <b>"הורדה"</b><br>
      הניווט יעבוד <b>גם בלי אינטרנט!</b></p>
    </div>`;
  }

  // Reassurance card — the KEY differentiator for anxious mom
  const errStops = stops.filter(s => sAudit(s).status === 'error');
  const warnStops = stops.filter(s => sAudit(s).status === 'warning');
  const errCount = errStops.length;
  h += `<div class="reassurance">
    <h3>💛 ${day.titleHe || day.title || `יום ${day.dayNumber}`}</h3>
    <p>${getReassuranceMessage(day, stops, errCount)}</p>
  </div>`;

  // Detailed error/warning summary for this day (if any)
  if (errStops.length > 0 || warnStops.length > 0) {
    h += `<div class="day-issues">`;
    if (errStops.length > 0) {
      h += `<div class="day-issue-section error-section">
        <div class="day-issue-title">❌ ${errStops.length} תחנות עם בעיות קריטיות</div>`;
      for (const s of errStops) {
        h += `<div class="day-issue-item">
          <div class="day-issue-name ltr">${s.emoji} ${s.name}</div>`;
        for (const iss of sAudit(s).issues) {
          h += `<div class="day-issue-detail">• ${iss}</div>`;
        }
        if (sAudit(s).suggestedCoords) {
          const sc = sAudit(s).suggestedCoords;
          const d = s.coordinates ? Math.round(haversine(s.coordinates.lat, s.coordinates.lng, sc.lat, sc.lng)) : null;
          h += `<div class="day-issue-fix">💡 ${d != null ? `הקואורדינטות הנוכחיות רחוקות ${d} מייל מהמיקום הנכון.` : 'הקואורדינטות אינן מדויקות.'} לחצי על התחנה למטה כדי לתקן.</div>`;
        } else if (!s.coordinates) {
          h += `<div class="day-issue-fix">📍 אין קואורדינטות — לא ניתן לנווט למקום הזה.</div>`;
        }
        h += `</div>`;
      }
      h += `</div>`;
    }
    if (warnStops.length > 0) {
      h += `<div class="day-issue-section warning-section">
        <div class="day-issue-title">⚠️ ${warnStops.length} תחנות שכדאי לבדוק</div>`;
      for (const s of warnStops) {
        h += `<div class="day-issue-item">
          <div class="day-issue-name ltr">${s.emoji} ${s.name}</div>`;
        for (const iss of sAudit(s).issues) {
          h += `<div class="day-issue-detail">• ${iss}</div>`;
        }
        h += `</div>`;
      }
      h += `</div>`;
    }
    h += `</div>`;
  }

  // Day hero — Hebrew primary (mom's first language), English as subtitle,
  // plus wake-up / leave-by badges, totals line (drive + walk), and weather chip.
  const heroHe = day.titleHe || (day.title ? '' : `יום ${day.dayNumber}`);
  const totals = computeDayTotals(day);
  const weather = (typeof getWeatherForDay === 'function') ? getWeatherForDay(day.dayNumber) : null;
  h += `<div class="day-hero">
    ${heroHe ? `<h2>${heroHe}</h2>` : ''}
    ${day.title ? `<div class="day-en ltr">${day.title}</div>` : ''}
    <div class="day-date">${formatDateHe(day.date)}</div>
    ${(day.wakeup || day.depart) ? `
      <div class="day-times">
        ${day.wakeup ? `<span class="time-chip wake"><span class="time-ico">🌅</span> ${UI.wakeUp} <b>${day.wakeup}</b></span>` : ''}
        ${day.depart ? `<span class="time-chip leave"><span class="time-ico">🚗</span> ${UI.leaveBy} <b>${day.depart}</b></span>` : ''}
      </div>` : ''}
    ${renderWeatherChip(weather)}
    ${(totals.driveMin || totals.walkMin) ? `
      <div class="day-totals">
        ${totals.driveMin ? `<span class="total-chip"><span>🚗</span> ${UI.totalDrive} ~${fmtMin(totals.driveMin)}</span>` : ''}
        ${totals.walkMin  ? `<span class="total-chip"><span>🥾</span> ${UI.totalWalk} ~${fmtMin(totals.walkMin)}</span>` : ''}
      </div>` : ''}
    ${day.comments ? `<div class="day-comment">${day.comments}</div>` : ''}
  </div>`;

  // Route picker — shown only for days whose schedule contains dry/wet branches (Day 14).
  h += renderRoutePicker(day, weather);

  // Listen card: daily briefing + voice picker + voice-status chip
  const heN = (typeof hebrewVoices === 'function') ? hebrewVoices().length : 0;
  const enN = (typeof englishVoices === 'function') ? englishVoices().length : 0;
  h += `<div class="listen-card">
    <h3>🎧 ${UI.whatToday}</h3>
    <button class="listen-btn" onclick="playDailyBriefing(${day.dayNumber})">
      <span class="play-icon">▶</span>
      ${UI.listenSummary}
    </button>
    <div class="voice-status">
      <span class="vs-chip ${heN ? 'ok' : 'bad'}">🇮🇱 ${heN ? `${heN} קולות` : 'לא מותקן'}</span>
      <span class="vs-chip ${enN ? 'ok' : 'bad'}">🇺🇸 ${enN ? `${enN} voices` : 'not installed'}</span>
    </div>
    ${renderVoicePicker()}
  </div>`;

  // Route map — use chronological order so added stops sit at the right point
  // in the polyline (originals from day.schedule, added items after their anchor).
  const orderedStops = (typeof getDayStopsOrdered === 'function') ? getDayStopsOrdered(day) : stops;
  const withCoords = orderedStops.filter(s => getStopCoords(s));
  if (withCoords.length >= 2) {
    h += `<div class="map-wrap"><div class="map-container" id="routeMap-${day.dayNumber}"></div></div>`;
  }

  // Hotel — call button is primary action, always shown first when phone exists
  if (day.hotel) {
    const ht = day.hotel, hc = ht.coordinates;
    // Format phone for display (visible to mom even before tapping the button)
    const phoneDisplay = ht.phone ? String(ht.phone).replace(/^\+?1\s*/, '').replace(/[^\d]+/g, '-').replace(/^-|-$/g, '') : '';
    h += `<div class="hotel-card">
      <div class="hotel-label">🏨 ${UI.hotelTonight}</div>
      <div class="hotel-name">${ht.name}</div>
      ${ht.address ? `<div class="hotel-addr">${ht.address}</div>` : ''}
      ${ht.phone ? `<a class="hotel-call-primary" href="${phoneUrl(ht.phone)}">
        <span class="hotel-call-icon">📞</span>
        <span class="hotel-call-label">${UI.call} למלון</span>
        <span class="hotel-call-num ltr">${phoneDisplay}</span>
      </a>` : ''}
      <div class="hotel-actions">
        ${hc ? `<a class="act-btn blue" href="${mapsNavUrl(hc)}" target="_blank" rel="noopener noreferrer">📍 ${UI.navigate}</a>` : ''}
        ${hc ? `<a class="act-btn outline" href="${mapyShowUrl(hc)}" target="_blank" rel="noopener noreferrer">🗺️ Mapy</a>` : ''}
      </div>
    </div>`;
  }

  // Time-zone chip — only on days where TZ differs from the default.
  h += renderTimezoneChip(day);

  // Dead-zone chip — only on days with known no-signal stretches.
  h += renderDeadZoneChip(day);

  // Conditions card — weather + warnings. Auto-fetches on render.
  h += renderConditionsCard(day);

  // Day prep — critical bullets to read BEFORE leaving the hotel. Goes first
  // because urgent items (fuel, water, permits) need to be seen before plans.
  h += renderDayPrep(day);

  // Daily fuel check — chip banner.
  h += renderFuelChip(day);

  // Per-day recommendations (add/cancel/fix flagged for this date)
  h += renderDayRecommendations(day);

  // Per-day "what's around" — restaurants, gas, alternatives, practical
  h += renderDayNearby(day);

  // Unified schedule — every row from the xlsx narrative (driving/stop/walk/hike/
  // tour/sleep/add/note/cancel) with the matched stop underneath when coords exist.
  if (day.schedule && day.schedule.length) {
    h += `<div class="section-label">☀️ ${UI.todayPlan}</div>`;
    h += renderSchedule(day);
  } else if (stops.length > 0) {
    // Legacy fallback if the merge didn't run — iterate stops only.
    h += `<div class="section-label">☀️ ${UI.todayPlan} · ${stops.length} ${UI.stops}</div>`;
    stops.forEach((s, i) => {
      const nextStop = i < stops.length - 1 ? stops[i + 1] : null;
      h += renderStop(s, nextStop, i, stops.length);
      if (nextStop) h += renderDirCard(s, nextStop);
    });
  } else {
    h += `<div class="empty"><div class="big-icon">🏖️</div><p>${UI.noStops}</p></div>`;
  }

  document.getElementById('app').innerHTML = h;

  // Init maps. The route map iterates full stops list. Per-stop expansion maps
  // are initialized for any schedule row whose stopId is currently expanded.
  requestAnimationFrame(() => {
    if (withCoords.length >= 2) initRouteMap(`routeMap-${day.dayNumber}`, orderedStops);
    const byId = {};
    for (const s of stops) byId[s.id] = s;
    const sched = (day.schedule || []).filter(r => r.stopId && byId[r.stopId]);
    sched.forEach((row, i) => {
      const s = byId[row.stopId];
      if (!state.expanded[s.id] || !getStopCoords(s)) return;
      const nextRow = sched.slice(i + 1).find(r => r.stopId && byId[r.stopId] && getStopCoords(byId[r.stopId]));
      const next = nextRow ? byId[nextRow.stopId] : null;
      if (next) initRouteSegmentMap(`stopMap-${s.id}`, s, next);
      else initStopMap(`stopMap-${s.id}`, getStopCoords(s), s.name);
    });
  });
}

// Reassurance message — calms anxiety, praises her planning
function getReassuranceMessage(day, stops, errCount) {
  const count = stops.length;
  if (count === 0) return 'יום חופשי! אפשר לנוח ולהתפנק. מגיע לך 💛';
  let msg = `תכננת יום מדהים עם ${count} תחנות! `;
  if (day.hotel) msg += `המלון מוכן ומחכה לך. `;
  if (errCount > 0) {
    msg += `יש ${errCount} תחנות שכדאי לבדוק — לחצי עליהן לפרטים. `;
  } else {
    msg += `כל התחנות מאומתות ומוכנות. `;
  }
  msg += `את מטיילת מדהימה! 🌟`;
  return msg;
}

function isHikeStop(stop) {
  const n = (stop.name || '').toLowerCase();
  const e = stop.emoji || '';
  if (e === '🥾') return true;
  // Anything with "loop road" / "scenic loop" is a drive, not a hike.
  if (/\bloop road\b|\bscenic loop\b|\bpark loop\b/.test(n)) return false;
  return n.includes('trail') || n.includes('loop') || n.includes('hike') || n.includes('narrows') || n.includes('slot');
}

function estimateWalk(stop) {
  const d = (stop.difficulty || '').toLowerCase();
  if (d.includes('moderate-hard') || d.includes('hard')) return { min: 180, mi: 7 };
  if (d.includes('moderate'))                            return { min: 120, mi: 5 };
  if (d.includes('easy-moderate'))                       return { min: 75, mi: 3 };
  if (d.includes('easy'))                                return { min: 45, mi: 1.5 };
  return { min: 60, mi: 2 };
}

function driveMinFromDist(distMi) {
  // haversine × 1.35 road factor, avg 25 mph on park roads
  return Math.round(distMi * 1.35 / 25 * 60);
}

function fmtMin(m) {
  if (m < 60) return `${m} דק׳`;
  return `${Math.floor(m/60)}ש׳ ${m%60 > 0 ? m%60 + 'ד' : ''}`.trim();
}

function renderDayTimeline(stops) {
  const drives = [];
  const walks = [];

  stops.forEach((s, i) => {
    const hike = isHikeStop(s);
    const walk = hike ? estimateWalk(s) : null;
    walks.push(walk);

    if (i === 0) { drives.push(null); return; }
    const prev = stops[i - 1];
    const ca = getStopCoords(s), cb = getStopCoords(prev);
    let distMi = s.audit && s.audit.distFromPrev != null ? s.audit.distFromPrev : null;
    if (distMi == null && ca && cb) distMi = haversine(cb.lat, cb.lng, ca.lat, ca.lng);
    drives.push(distMi != null ? { min: driveMinFromDist(distMi), mi: Math.round(distMi * 10) / 10 } : null);
  });

  const totalDriveMin = drives.reduce((acc, d) => acc + (d ? d.min : 0), 0);
  const totalWalkMin = walks.reduce((acc, w) => acc + (w ? w.min : 0), 0);
  const totalWalkMi  = walks.reduce((acc, w) => acc + (w ? w.mi  : 0), 0);

  let h = `<div class="timeline-card">
    <div class="timeline-header">
      <span class="timeline-title">🗺️ סדר היום</span>
      <div class="timeline-totals">
        <span>🚗 ~${fmtMin(totalDriveMin)} נסיעה</span>
        ${totalWalkMin > 0 ? `<span>🥾 ~${fmtMin(totalWalkMin)} הליכה · ${Math.round(totalWalkMi * 10) / 10} mi</span>` : ''}
      </div>
    </div>
    <div class="timeline-body">`;

  stops.forEach((s, i) => {
    const walk = walks[i];
    const drv = drives[i];
    const numColor = i === 0 ? '#3a8a4a' : i === stops.length - 1 ? '#c85a3a' : '#2d7a9c';
    const checked = state.checked[s.id];

    if (drv) {
      h += `<div class="tl-drive">
        <div class="tl-drive-line"></div>
        <span class="tl-drive-label">🚗 ~${fmtMin(drv.min)} · ${drv.mi} mi</span>
      </div>`;
    }

    h += `<div class="tl-stop ${checked ? 'tl-done' : ''}">
      <div class="tl-num" style="background:${numColor}">${i + 1}</div>
      <div class="tl-info">
        <div class="tl-name">${s.emoji} ${s.name}</div>
        ${walk
          ? `<div class="tl-walk">🅿️ חנה בטריילהד ← 🥾 ~${fmtMin(walk.min)} · ${walk.mi} mi${s.difficulty ? ` · ${s.difficulty}` : ''}</div>`
          : `<div class="tl-walk tl-quick">🅿️ חנייה קצרה ליד האתר</div>`
        }
      </div>
    </div>`;
  });

  h += `</div></div>`;
  return h;
}

function renderStop(s, nextStop, index, total) {
  const checked = state.checked[s.id];
  const expanded = state.expanded[s.id];
  const coords = getStopCoords(s);
  const nextCoords = nextStop ? getStopCoords(nextStop) : null;
  const audit = sAudit(s);
  const hasIssues = audit.issues.length > 0;

  // Navigate button: destination is the next stop (so tapping נווטי launches
  // turn-by-turn nav to where mom is going next, not the spot she's at).
  const isHike = isHikeStop(s);
  let navUrl = '#';
  let navLabel = UI.navigate;
  if (nextCoords) {
    navUrl = mapsNavUrl(nextCoords);
    navLabel = isHike ? `🅿️ נווטי לטריילהד` : `📍 נווטי ל${nextStop.name.substring(0, 20)}`;
  } else if (coords) {
    navUrl = mapsNavUrl(coords);
    navLabel = isHike ? `🅿️ נווטי לטריילהד` : `📍 ${UI.navigate}`;
  }

  let cls = 'stop-card';
  if (checked) cls += ' checked';
  if (audit.status === 'error') cls += ' has-error';
  else if (audit.status === 'warning') cls += ' has-warning';

  const delay = Math.min((index || 0) * 40, 300);
  let h = `<div class="${cls}" style="animation-delay:${delay}ms">
    <div class="stop-row">
      <button class="stop-check ${checked ? 'done' : ''}" onclick="toggleCheck('${s.id}')">${checked ? '✓' : ''}</button>
      <div class="stop-body">
        <span class="stop-name-text ltr"><span class="stop-num" style="background:${index===0?'#3a8a4a':index===(total-1)?'#c85a3a':'#2d7a9c'}">${(index||0)+1}</span>${s.emoji} ${s.name}</span>
        ${s.tip ? `<div class="stop-meta">${s.tip}</div>` : ''}
        ${s.difficulty ? `<div class="stop-meta">${s.difficulty}</div>` : ''}
        ${hasIssues ? `<div class="audit-chip ${audit.status}">${audit.status === 'error' ? '❌' : '⚠️'} ${audit.status === 'error' ? UI.error : UI.warning}</div>` : ''}
        <div class="stop-actions">
          <button class="stop-btn listen" onclick="toggleExpanded('${s.id}')">
            🎧 ${expanded ? UI.close : UI.tellMeMore}
          </button>
          ${coords ? `<a class="stop-btn navigate" href="${navUrl}" target="_blank" rel="noopener noreferrer">${navLabel}</a>` : ''}
        </div>
      </div>
    </div>`;

  if (expanded) {
    h += `<div class="expand-panel">`;
    h += renderGuidePanel(s);
    // Map always shows route to next stop (not just a pin)
    if (coords) {
      const mapId = `stopMap-${s.id}`;
      h += `<div class="stop-map-wrap"><div class="stop-map" id="${mapId}"></div></div>`;
    }
    if (hasIssues) h += renderAuditPanel(s);
    h += `</div>`;
  }

  h += `</div>`;
  // Store nextStop ref for map init
  s._nextStop = nextStop;
  return h;
}

function renderAuditPanel(s) {
  const audit = sAudit(s);
  const cls = audit.status === 'error' ? 'error-box' : 'warning-box';
  let h = `<div class="audit-box ${cls}">`;
  for (const issue of audit.issues) {
    const icon = audit.status === 'error' ? '❌' : '⚠️';
    h += `<div class="issue-row"><span class="issue-icon">${icon}</span><span>${issue}</span></div>`;
  }
  if (s.coordinates) {
    h += `<div class="coords-box">📍 ${s.coordinates.lat.toFixed(4)}, ${s.coordinates.lng.toFixed(4)}`;
    if (audit.suggestedCoords) {
      const sc = audit.suggestedCoords;
      const d = haversine(s.coordinates.lat, s.coordinates.lng, sc.lat, sc.lng);
      h += `<br>💡 מוצע: ${sc.lat.toFixed(4)}, ${sc.lng.toFixed(4)} (${Math.round(d)} מייל הפרש)`;
    }
    h += `</div>`;
  }
  h += `<div class="fix-btns">`;
  if (audit.suggestedCoords) {
    const sc = audit.suggestedCoords;
    h += `<button class="fix-btn apply" onclick="event.stopPropagation();applyCoordFix('${s.id}',${sc.lat},${sc.lng})">✏️ ${UI.fix}</button>`;
  }
  h += `<button class="fix-btn remove" onclick="event.stopPropagation();removeStop('${s.id}')">🗑️ ${UI.removeStop}</button>`;
  h += `</div></div>`;
  return h;
}

function renderGuidePanel(s) {
  return `<div class="guide-box"><div class="guide-text placeholder">🎧 תיאור המקום יתווסף בקרוב</div></div>`;
}

function renderDirCard(from, to) {
  const fc = getStopCoords(from), tc = getStopCoords(to);
  const key = `${from.id}-${to.id}`;
  const open = state.dirOpen[key];
  let dist = null, time = '', sanity = '';
  if (fc && tc) {
    dist = haversine(fc.lat, fc.lng, tc.lat, tc.lng);
    time = fmtTime(dist);
    if (dist > 150) sanity = ' impossible';
    else if (dist > 80) sanity = ' suspicious';
  }
  let h = `<div class="dir-card${open ? ' open' : ''}${sanity}" onclick="toggleDir('${key}')">
    <span>🚗</span>
    <span class="dir-label">${time ? `${time} · ${fmtDist(dist)}` : '—'}</span>
    ${sanity ? '<span>⚠️</span>' : ''}
    <span class="dir-sub">לחצי לניווט</span>
  </div>`;
  if (open && fc && tc) {
    h += `<div class="dir-expand">
      <a class="maps-link" href="${mapsDirUrl(fc, tc)}" target="_blank" rel="noopener noreferrer">🗺️ ${UI.openInMaps}</a>
      ${sanity ? `<div class="audit-box ${sanity === ' impossible' ? 'error-box' : 'warning-box'}" style="margin-top:8px;text-align:right;">
        ${sanity === ' impossible' ? UI.impossibleDist : UI.suspiciousDist} (${fmtDist(dist)})
      </div>` : ''}
    </div>`;
  }
  return h;
}

function playDailyBriefing(dayNum) {
  const day = TRIP_DATA.days.find(d => d.dayNumber === dayNum);
  if (!day) return;
  const stops = getDayStops(day);
  let b = `בוקר טוב! היום יום ${day.dayNumber} בטיול, ${formatDateHe(day.date)}. `;
  if (day.titleHe) b += `אנחנו ב${day.titleHe}. `;
  b += `תכננת יום נפלא עם ${stops.length} תחנות! `;
  if (stops[0]) b += `נתחיל ב${stops[0].name}. `;
  if (day.hotel) b += `הלילה ישנים ב${day.hotel.name}. הכל מוכן. `;
  b += `את מטיילת מדהימה, יום נפלא מחכה לך!`;
  speakHebrew(b, `סיכום יום ${day.dayNumber}`);
}

// Audit screen
function renderAuditScreen() {
  const issues = [];
  for (const day of TRIP_DATA.days) {
    for (const s of (day.stops || [])) {
      if (sAudit(s).issues.length > 0 && !removedStops[s.id]) issues.push({ day, s });
    }
  }
  const errs = issues.filter(i => sAudit(i.s).status === 'error');
  const warns = issues.filter(i => sAudit(i.s).status === 'warning');

  // Count how many errors still need wizard review
  const unreviewedErrors = errs.filter(i => !wizardDecisions[i.s.id]).length;

  let h = `<div class="audit-overlay">
    <div class="audit-top">
      <h2>🔍 ${UI.auditDashboard}</h2>
      <button class="close-btn" onclick="toggleAuditScreen()">✕</button>
    </div>
    <div class="audit-summary">
      <div class="stat-card errors">${errs.length}<div class="stat-label">${UI.criticalIssues}</div></div>
      <div class="stat-card warnings">${warns.length}<div class="stat-label">${UI.warnings}</div></div>
      <div class="stat-card ok">${TRIP_DATA.stats.verified}<div class="stat-label">✅ ${UI.verified}</div></div>
    </div>`;

  // Wizard launch button
  if (unreviewedErrors > 0) {
    h += `<div style="padding:0 var(--sp-16) var(--sp-16);">
      <button class="wizard-launch-btn" onclick="toggleAuditScreen();startWizard();">
        🧙 בואי נעבור על ${unreviewedErrors} בעיות ביחד
        <span class="wizard-launch-sub">נסביר כל בעיה ותחליטי מה לעשות</span>
      </button>
    </div>`;
  } else if (errs.length > 0) {
    h += `<div style="padding:0 var(--sp-16) var(--sp-16);">
      <div class="wizard-done-banner">✅ כל הבעיות נבדקו! הטיול מוכן</div>
    </div>`;
  }

  h += `<div class="audit-list">`;

  for (const item of [...errs, ...warns]) {
    const day = item.day;
    const stop = item.s;
    const audit = sAudit(stop);
    h += `<div class="audit-entry ${audit.status}">
      <div class="audit-entry-head">
        <span class="audit-entry-name">${stop.name}</span>
        <span class="audit-entry-day">${UI.day} ${day.dayNumber}</span>
      </div>
      <div style="font-size:14px;color:var(--text-secondary);line-height:1.6;">`;
    for (const iss of audit.issues) {
      h += `<div class="issue-row"><span class="issue-icon">${audit.status === 'error' ? '❌' : '⚠️'}</span><span>${iss}</span></div>`;
    }
    if (stop.coordinates) {
      h += `<div class="coords-box">📍 (${stop.coordinates.lat.toFixed(4)}, ${stop.coordinates.lng.toFixed(4)})`;
      if (audit.suggestedCoords) {
        const sc = audit.suggestedCoords;
        const d = haversine(stop.coordinates.lat, stop.coordinates.lng, sc.lat, sc.lng);
        h += `<br>💡 Suggested: (${sc.lat.toFixed(4)}, ${sc.lng.toFixed(4)}) — ${Math.round(d)} mi off`;
      }
      h += `</div>`;
    }
    h += `<div class="fix-btns">`;
    if (audit.suggestedCoords) {
      const sc = audit.suggestedCoords;
      h += `<button class="fix-btn apply" onclick="applyCoordFix('${stop.id}',${sc.lat},${sc.lng});toggleAuditScreen();toggleAuditScreen();">✏️ Fix</button>`;
    }
    h += `<button class="fix-btn remove" onclick="removeStop('${stop.id}');toggleAuditScreen();toggleAuditScreen();">🗑️ Remove</button>`;
    h += `<button class="fix-btn apply" onclick="toggleAuditScreen();goToDay(${day.dayNumber});">👁️ Day ${day.dayNumber}</button>`;
    h += `</div></div></div>`;
  }

  if (!issues.length) h += `<div class="empty"><div class="big-icon">✅</div><p>${UI.allVerified}</p></div>`;
  h += `</div></div>`;

  let o = document.getElementById('auditOverlay');
  if (!o) { o = document.createElement('div'); o.id = 'auditOverlay'; document.body.appendChild(o); }
  o.innerHTML = h;
}

// ─── Unified schedule renderer (xlsx narrative + stops merged) ────────────────

const KIND_META = {
  driving: { cls:'k-driving', icon:'🚗', label: () => UI.kindDriving },
  stop:    { cls:'k-stop',    icon:'📍', label: () => UI.kindStop },
  walk:    { cls:'k-walk',    icon:'🚶', label: () => UI.kindWalk },
  hike:    { cls:'k-hike',    icon:'🥾', label: () => UI.kindHike },
  tour:    { cls:'k-tour',    icon:'🎟️', label: () => UI.kindTour },
  sleep:   { cls:'k-sleep',   icon:'🏨', label: () => UI.kindSleep },
  add:     { cls:'k-add',     icon:'⭐', label: () => UI.kindAdd },
  note:    { cls:'k-note',    icon:'⚠️', label: () => UI.kindNote },
  cancel:  { cls:'k-cancel',  icon:'❌', label: () => UI.kindCancel },
};

function computeDayTotals(day) {
  let driveMin = 0, walkMin = 0;
  for (const row of (day.schedule || [])) {
    const m = row.durationMin || 0;
    if (row.kind === 'driving') driveMin += m;
    else if (row.kind === 'walk' || row.kind === 'hike') walkMin += m;
  }
  return { driveMin, walkMin };
}

function renderSchedule(day) {
  const stops = getDayStops(day);
  const byId = {}; for (const s of stops) byId[s.id] = s;
  const eff = (typeof effectiveRoute === 'function') ? effectiveRoute(day) : 'dry';
  const rows = (day.schedule || [])
    .filter(r => !r.orphan || byId[r.stopId])
    // Hide branch rows that don't match the active weather choice. Rows with
    // route === null or route === 'both' are always shown.
    .filter(r => !r.route || r.route === 'both' || r.route === eff);
  let stopCounter = 0;
  let h = '';
  // Group added items by afterStopId for inline insertion. Items with no
  // afterStopId (added before any stop was checked, or with explicit "end")
  // go to a separate bucket rendered at the end.
  const addedDayList = (state.addedStops && state.addedStops[String(day.dayNumber)]) || [];
  const addedAfter = {};
  const addedAtEnd = [];
  for (const a of addedDayList) {
    if (a.afterStopId) (addedAfter[a.afterStopId] = addedAfter[a.afterStopId] || []).push(a);
    else addedAtEnd.push(a);
  }

  rows.forEach((row, i) => {
    if (['stop','walk','hike','tour'].includes(row.kind) && row.stopId && byId[row.stopId]) stopCounter++;
    h += renderScheduleRow(row, i, stopCounter, byId, rows, day.hotel);
    // Inline-insert any added items anchored to this row's stop.
    if (row.stopId && addedAfter[row.stopId]) {
      for (const a of addedAfter[row.stopId]) {
        h += renderAddedInline(a, day.dayNumber);
      }
    }
  });
  // Trailing bucket — for items added without a current position.
  for (const a of addedAtEnd) {
    h += renderAddedInline(a, day.dayNumber);
  }
  return h;
}

// Compact card for an inline-added stop. Sits between schedule rows and is
// visually distinct (purple ✨ left border) so mom sees it's her addition.
function renderAddedInline(s, dayNumber) {
  const c = getStopCoords(s);
  const navUrl = c ? mapsNavUrl(c) : null;
  const checked = state.checked[s.id];
  return `<div class="sched-row added-inline ${checked ? 'done' : ''}">
    <div class="added-inline-head">
      <span class="added-marker">✨ נוסף ע"י אמא</span>
      <span class="added-inline-name ltr">${escapeForText(s.name)}</span>
    </div>
    ${s.tip ? `<div class="sched-text">${escapeForText(s.tip)}</div>` : ''}
    <div class="sched-actions">
      <button class="stop-check ${checked ? 'done' : ''}" onclick="toggleCheck('${s.id}')">${checked ? '✓' : ''}</button>
      ${navUrl ? `<a class="stop-btn navigate" href="${navUrl}" target="_blank" rel="noopener noreferrer">📍 ${UI.navigate}</a>` : ''}
      <button class="stop-btn remove-added" onclick="removeAddedFromDay(${dayNumber},'${s.id}')">🗑️ הסירי</button>
    </div>
  </div>`;
}

function renderScheduleRow(row, index, stopNumber, byId, rows, hotel) {
  const meta = KIND_META[row.kind] || KIND_META.note;
  const stop = row.stopId ? byId[row.stopId] : null;
  const checked = stop ? state.checked[stop.id] : false;
  const expanded = stop ? state.expanded[stop.id] : false;
  const coords = stop ? getStopCoords(stop) : null;
  const audit = stop ? sAudit(stop) : null;
  const hasIssues = audit && audit.issues.length > 0;

  // Nav target = next coord-bearing stop after this row, falling back to the
  // day's hotel if this is the last stop. So tapping נווטי launches turn-by-turn
  // nav to where mom is going next, not to the spot she's already standing at.
  let navTarget = null, navTargetName = null;
  if (stop && coords) {
    for (let j = index + 1; j < rows.length; j++) {
      const r = rows[j];
      const ns = r.stopId ? byId[r.stopId] : null;
      const nc = ns ? getStopCoords(ns) : null;
      if (nc) { navTarget = nc; navTargetName = ns.name; break; }
    }
    if (!navTarget && hotel && hotel.coordinates) {
      navTarget = hotel.coordinates;
      navTargetName = `🏨 ${hotel.name}`;
    }
  }
  const navUrl = navTarget ? mapsNavUrl(navTarget) : (coords ? mapsNavUrl(coords) : null);

  // Title line: activity chip + time + duration.
  let cls = `sched-row ${meta.cls}`;
  if (checked) cls += ' done';
  if (row.kind === 'cancel') cls += ' alert-cancel';
  if (row.kind === 'add') cls += ' alert-add';
  if (row.kind === 'note') cls += ' alert-note';
  if (hasIssues && audit.status === 'error') cls += ' has-error';
  else if (hasIssues && audit.status === 'warning') cls += ' has-warning';

  let h = `<div class="${cls}">
    <div class="sched-head">
      <span class="kind-chip ${meta.cls}"><span>${meta.icon}</span>${meta.label()}</span>
      ${row.time ? `<span class="sched-time">${row.time}</span>` : ''}
      ${row.duration ? `<span class="sched-dur">${row.duration}</span>` : ''}
      ${stopNumber && stop ? `<span class="sched-num">${stopNumber}</span>` : ''}
    </div>`;

  if (!row.text && stop) {
    // Orphan row: xlsx didn't name this stop — lead with the stop name, tip as body.
    h += `<div class="sched-stop-name ltr">${stop.emoji || ''} ${stop.name}</div>`;
    if (stop.tip) h += `<div class="sched-text">${escapeForText(stop.tip)}</div>`;
  } else if (row.text) {
    // xlsx narrative — the place name is already embedded in the sentence.
    h += `<div class="sched-text">${escapeForText(row.text)}</div>`;
  }

  // Action row: only for coord-bearing items.
  if (stop && coords) {
    h += `<div class="sched-actions">
      <button class="stop-check ${checked ? 'done' : ''}" onclick="toggleCheck('${stop.id}')" aria-label="סמני כהושלם">${checked ? '✓' : ''}</button>
      <button class="stop-btn listen" onclick="toggleExpanded('${stop.id}')">🎧 ${expanded ? UI.close : UI.tellMeMore}</button>
      <a class="stop-btn navigate" href="${navUrl}" target="_blank" rel="noopener noreferrer">📍 ${navTargetName ? `${UI.navigate} ל${navTargetName.substring(0, 22)}` : UI.navigate}</a>
      ${stop && coords ? `<a class="stop-btn mapy" href="${mapyShowUrl(coords)}" target="_blank" rel="noopener noreferrer" title="Open in Mapy.com (offline maps)">🗺️ Mapy</a>` : ''}
      ${stop && alltrailsTrailUrl(stop.id) ? `<a class="stop-btn alltrails" href="${alltrailsTrailUrl(stop.id)}" target="_blank" rel="noopener noreferrer" title="Open trail in AllTrails">🥾 AllTrails</a>` : ''}
    </div>`;
  }

  if (hasIssues) {
    h += `<div class="sched-audit-chip ${audit.status}">${audit.status === 'error' ? '❌' : '⚠️'} ${audit.status === 'error' ? UI.error : UI.warning}</div>`;
  }

  if (stop && expanded) {
    h += `<div class="expand-panel">`;
    h += renderGuidePanel(stop);
    if (coords) {
      h += `<div class="stop-map-wrap"><div class="stop-map" id="stopMap-${stop.id}"></div></div>`;
    }
    if (hasIssues) h += renderAuditPanel(stop);
    h += `</div>`;
  }

  h += `</div>`;
  return h;
}

function escapeForText(s) {
  // Minimal HTML escaping since narrative text is data-embedded but not user input.
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

// ─── Day-level recommendations panel ─────────────────────────────────────────

const REC_KIND_HE = {
  'Add Stop':        'להוסיף עצירה',
  'Fix Coords':      'תיקון קואורדינטות',
  'Add Coords':      'להוסיף קואורדינטות',
  'Remove':          'להסיר',
  'Removed':         'הוסר',
  'Renamed':         'שינוי שם',
  'Sleeping Change': 'שינוי מלון',
  'Fill Empty Day':  'מילוי יום ריק',
};
function recKindLabel(kind) { return REC_KIND_HE[kind] || kind; }

function recsForDay(day) {
  const all = (TRIP_DATA.recommendations || []);
  if (!all.length) return [];
  const target = day.dayNumber;
  // Matches "Day 4", "Day 4 or 5", "Days 19–20", "Day 19 or 20", etc.
  const re = /Days?\s*(\d+)(?:\s*(?:or|and|through|to|-|–|,)\s*(\d+))?/gi;
  return all.filter(r => {
    if (!r.when) return false;
    re.lastIndex = 0;
    let m;
    while ((m = re.exec(r.when)) !== null) {
      const a = parseInt(m[1], 10);
      const b = m[2] ? parseInt(m[2], 10) : a;
      const lo = Math.min(a, b), hi = Math.max(a, b);
      if (target >= lo && target <= hi) return true;
    }
    return false;
  });
}

function renderDayRecommendations(day) {
  const list = recsForDay(day);
  if (!list.length) return '';
  const id = `recs-d${day.dayNumber}`;
  const open = state.recsOpen && state.recsOpen[day.dayNumber];
  const counts = list.reduce((a,r) => (a[r.priority] = (a[r.priority] || 0) + 1, a), {});
  let summary = '';
  if (counts.HIGH)   summary += `<span class="rec-badge high">${counts.HIGH} ${UI.priorityHigh}</span>`;
  if (counts.MEDIUM) summary += `<span class="rec-badge med">${counts.MEDIUM} ${UI.priorityMedium}</span>`;
  if (counts.FIX)    summary += `<span class="rec-badge fix">${counts.FIX} ${UI.priorityFix}</span>`;

  let h = `<div class="recs-card ${open ? 'open' : ''}">
    <button class="recs-toggle" onclick="toggleRecsOpen(${day.dayNumber})" aria-expanded="${open?'true':'false'}" aria-controls="${id}">
      <span class="recs-title">💡 ${UI.recommendationsTitle}</span>
      <span class="recs-summary">${summary}</span>
      <span class="recs-chev">${open ? '▴' : '▾'}</span>
    </button>`;
  if (open) {
    h += `<div class="recs-body" id="${id}">`;
    for (const r of list) {
      const prio = r.priority === 'HIGH' ? 'high' : r.priority === 'MEDIUM' ? 'med' : 'fix';
      h += `<div class="rec-item ${prio}">
        <div class="rec-head"><span class="rec-prio-chip ${prio}">${r.priority}</span><span class="rec-kind">${recKindLabel(r.kind)}</span></div>
        <div class="rec-name">${escapeForText(r.name)}</div>
        ${r.why ? `<div class="rec-why">${escapeForText(r.why)}</div>` : ''}
        ${r.action ? `<div class="rec-action"><b>מה לעשות:</b> ${escapeForText(r.action)}</div>` : ''}
        ${(r.lat && r.lng) ? `<a class="stop-btn navigate" href="https://www.google.com/maps/dir/?api=1&destination=${r.lat},${r.lng}&travelmode=driving" target="_blank" rel="noopener noreferrer">📍 ${UI.navigate}</a>` : ''}
      </div>`;
    }
    h += `</div>`;
  }
  h += `</div>`;
  return h;
}

// ─── Pre-trip checklist screen ──────────────────────────────────────────────

function renderPretripChecklist() {
  const done = state.pretripDone || {};
  const items = (typeof PRETRIP_ITEMS !== 'undefined') ? PRETRIP_ITEMS : [];
  const totalUrgent = items.filter(i => i.urgent).length;
  const doneUrgent = items.filter(i => i.urgent && done[i.id]).length;

  let h = `<div class="pretrip-screen">
    <div class="pretrip-head">
      <h2 class="pretrip-title">📋 הכנות לפני הטיול</h2>
      <button class="pretrip-close" onclick="togglePretripChecklist()" aria-label="סגרי">✕</button>
    </div>
    <div class="pretrip-progress">
      <div class="pretrip-progress-text">${doneUrgent} מתוך ${totalUrgent} פריטים דחופים סומנו</div>
      <div class="pretrip-progress-bar">
        <div class="pretrip-progress-fill" style="width: ${totalUrgent ? (doneUrgent/totalUrgent*100) : 0}%"></div>
      </div>
    </div>
    <div class="pretrip-list">`;
  for (const it of items) {
    const isDone = !!done[it.id];
    h += `<div class="pretrip-item ${isDone ? 'done' : ''} ${it.urgent ? 'urgent' : ''}">
      <button class="pretrip-check ${isDone ? 'on' : ''}" onclick="togglePretripItem('${it.id}')" aria-label="סמני כבוצע">${isDone ? '✓' : ''}</button>
      <div class="pretrip-body">
        <div class="pretrip-item-head">
          <span class="pretrip-icon">${it.icon}</span>
          <span class="pretrip-name">${escapeForText(it.title)}</span>
          ${it.urgent && !isDone ? '<span class="pretrip-urgent">דחוף</span>' : ''}
        </div>
        <div class="pretrip-detail">${escapeForText(it.detail)}</div>
      </div>
    </div>`;
  }
  h += `</div></div>`;
  document.getElementById('app').innerHTML = h;
}

// ─── Day prep panel — critical bullets at top of day ────────────────────────

function renderDayPrep(day) {
  // Combine static prep (from TRIP_NEARBY) with weather-derived warnings.
  const data = (typeof TRIP_NEARBY !== 'undefined') ? TRIP_NEARBY[day.dayNumber] : null;
  const staticPrep = (data && data.prep) ? data.prep : [];

  let weatherPrep = [];
  if (typeof getWeatherForDay === 'function') {
    const w = getWeatherForDay(day.dayNumber);
    if (w && typeof getWeatherWarnings === 'function') {
      weatherPrep = getWeatherWarnings(day, w);
    }
  }

  const allPrep = [...weatherPrep, ...staticPrep];
  const contacts = (data && data.emergencyContacts) ? data.emergencyContacts : [];
  if (!allPrep.length && !contacts.length) return '';

  const urgent = allPrep.filter(p => p.urgent);
  const standard = allPrep.filter(p => !p.urgent);

  let h = `<div class="day-prep-card">
    <div class="day-prep-head">
      <span class="day-prep-title">🌅 הכנה ליום</span>
      ${urgent.length ? `<span class="day-prep-urgent-chip">⚠️ ${urgent.length} דחוף</span>` : ''}
    </div>
    <ul class="day-prep-list">`;
  for (const p of urgent) {
    h += `<li class="day-prep-item urgent">
      <span class="day-prep-icon">${p.icon || '•'}</span>
      <span class="day-prep-text">${escapeForText(p.text)}</span>
    </li>`;
  }
  for (const p of standard) {
    h += `<li class="day-prep-item">
      <span class="day-prep-icon">${p.icon || '•'}</span>
      <span class="day-prep-text">${escapeForText(p.text)}</span>
    </li>`;
  }
  h += `</ul>`;

  // Tap-to-call contact buttons — replaces inline phone numbers in prep prose.
  if (contacts.length) {
    h += `<div class="day-prep-contacts">`;
    for (const c of contacts) {
      h += `<a class="day-prep-contact" href="${phoneUrl(c.phone)}">
        <span class="contact-icon">📞</span>
        <span class="contact-name">${escapeForText(c.name)}</span>
      </a>`;
    }
    h += `</div>`;
  }

  h += `</div>`;
  return h;
}

// Days where mom will be in known cell-signal dead zones for hours. Surfaces
// a prominent banner so she preps (offline maps loaded, told someone the route,
// etc.). Source: research agent + NPS coverage maps.
const DEAD_ZONE_DAYS = {
  3:  'Fiery Furnace TH (Arches): קליטה חלשה. צילמי screenshot של ההיתר וההוראות מראש.',
  4:  'Needles District (Canyonlands): קליטה חלשה בקניונים. הורידי מפות אופליין.',
  5:  'Cathedral Valley loop: אפס קליטה ל-5-7 שעות. תספרי למישהו את התוכנית.',
  10: 'Notom-Bullfrog + Burr Trail: אפס קליטה לרוב הלולאה.',
  13: 'כביש Hole-in-the-Rock: אפס קליטה סלולרית אחרי הקילומטרים הראשונים. הקניונים הצרים מנותקים לחלוטין.',
  14: 'Cottonwood Canyon Rd: קליטה נופלת באמצע. חוזרת בבייגוואטר.',
  17: 'White Pocket: אפס קליטה. הסיור המודרך מצויד ברדיו.',
};

function renderDeadZoneChip(day) {
  const note = DEAD_ZONE_DAYS[day.dayNumber];
  if (!note) return '';
  return `<div class="deadzone-chip">
    <span class="deadzone-icon">📵</span>
    <span class="deadzone-text">${escapeForText(note)}</span>
  </div>`;
}

// Time-zone chip — surfaces which TZ today's hotel/region is on. Critical for
// Days 14-16 (Page is AZ MST = 1hr behind Utah; Antelope tours run on Navajo
// time = Utah time, but Page town is MST). Days 21-24 are Vegas = Pacific.
function getDayTimezone(day) {
  // Match by day number for the trip's known TZ transitions.
  const n = day.dayNumber;
  if (n >= 21) return { code: 'PDT', label: 'שעון נבדה', note: 'שעה אחורה ממאונטיין' };
  if (n === 14 || n === 15) return { code: 'MST', label: 'שעון Page (אריזונה)', note: 'שעה אחורה משעון יוטה — אבל Antelope על שעון Navajo = שעון יוטה' };
  if (n === 16) return { code: 'MIX', label: 'מעבר Page → Kanab', note: 'בוקר ב-AZ MST. אחה"צ ב-UT MDT (שעה קדימה).' };
  return { code: 'MDT', label: 'שעון יוטה', note: '' };
}

function renderTimezoneChip(day) {
  const tz = getDayTimezone(day);
  if (!tz || tz.code === 'MDT') return '';  // default — no chip needed
  const cls = tz.code === 'MIX' ? 'mix' : '';
  return `<div class="tz-chip ${cls}">
    <span class="tz-icon">🕐</span>
    <span class="tz-label">${tz.label}</span>
    ${tz.note ? `<span class="tz-note">${escapeForText(tz.note)}</span>` : ''}
  </div>`;
}

// Conditions card — weather forecast + manual fetch button. Auto-runs the fetch
// in the background on render. Sits above the prep card so weather context
// arrives before the static bullets.
function renderConditionsCard(day) {
  if (typeof getWeatherForDay !== 'function') return '';
  const w = getWeatherForDay(day.dayNumber);
  if (!w) {
    // Kick a background fetch and show "activating..." state.
    const triggered = (typeof ensureWeatherForDay === 'function') ? ensureWeatherForDay(day.dayNumber) : false;
    return `<div class="conditions-card pending">
      <span class="conditions-title">🌦️ מזג אוויר</span>
      <span class="conditions-status">${triggered ? 'בודק עכשיו...' : 'לא נטען'}</span>
      <button class="conditions-refresh" onclick="refreshWeatherForDay(${day.dayNumber})">הפעילי</button>
    </div>`;
  }
  if (w.outOfRange) {
    return `<div class="conditions-card out-of-range">
      <span class="conditions-title">🌦️ מזג אוויר</span>
      <span class="conditions-status">תחזית זמינה רק 16 ימים מראש</span>
    </div>`;
  }
  const tmaxC = w.tmax != null ? Math.round((w.tmax - 32) * 5 / 9) : null;
  const tminC = w.tmin != null ? Math.round((w.tmin - 32) * 5 / 9) : null;
  const emoji = (typeof weatherEmoji === 'function') ? weatherEmoji(w.code) : '🌤️';
  const cond  = (typeof weatherShortHe === 'function') ? weatherShortHe(w.code) : '';

  return `<div class="conditions-card has-data">
    <div class="conditions-row">
      <span class="conditions-emoji">${emoji}</span>
      <span class="conditions-temps">${tmaxC != null ? `${tmaxC}°` : '—'}<span class="conditions-sep">/</span><span class="conditions-tmin">${tminC != null ? `${tminC}°` : '—'}</span></span>
      <span class="conditions-cond">${cond}</span>
      ${w.precipProb ? `<span class="conditions-precip">💧 ${w.precipProb}%</span>` : ''}
      <button class="conditions-refresh small" onclick="refreshWeatherForDay(${day.dayNumber})" title="רענני">↻</button>
    </div>
  </div>`;
}

// ─── Per-day "what's around" panel ──────────────────────────────────────────

const NEARBY_SECTIONS = [
  { key: 'food',         icon: '🍽️', label: 'אוכל' },
  { key: 'gas',          icon: '⛽', label: 'דלק' },
  { key: 'alternatives', icon: '✨', label: 'אופציות נוספות' },
  { key: 'practical',    icon: '🛒', label: 'מעשי (סופר/שירותים/בית מרקחת)' },
];

function renderDayNearby(day) {
  const hasNearby = (typeof TRIP_NEARBY !== 'undefined' && TRIP_NEARBY[day.dayNumber]);
  const removedToday = (typeof getRemovedStopsForDay === 'function') ? getRemovedStopsForDay(day) : [];
  if (!hasNearby && !removedToday.length) return '';

  const data = hasNearby ? TRIP_NEARBY[day.dayNumber] : {};
  const dayKey = String(day.dayNumber);
  const open = state.nearbyOpen && state.nearbyOpen[dayKey];
  const addedDayList = (state.addedStops && state.addedStops[dayKey]) || [];
  const addedKeys = new Set(addedDayList.map(x => x.sourceKey));

  // Total item count for the header summary (nearby + removed).
  const totalsNearby = NEARBY_SECTIONS.reduce((sum, s) => sum + ((data[s.key] || []).length), 0);
  const totals = totalsNearby + removedToday.length;

  let h = `<div class="nearby-card ${open ? 'open' : ''}">
    <button class="nearby-toggle" onclick="toggleNearbyOpen(${day.dayNumber})" aria-expanded="${open?'true':'false'}">
      <span class="nearby-title">📍 מה יש באזור</span>
      <span class="nearby-summary">${totals} מקומות${data.region ? ` · ${escapeForText(data.region)}` : ''}</span>
      <span class="nearby-chev">${open ? '▴' : '▾'}</span>
    </button>`;

  if (open) {
    h += `<div class="nearby-body">`;
    if (data.note) {
      h += `<div class="nearby-note">💡 ${escapeForText(data.note)}</div>`;
    }
    for (const sec of NEARBY_SECTIONS) {
      const items = data[sec.key] || [];
      if (!items.length) continue;
      const secKey = `${day.dayNumber}:${sec.key}`;
      const secOpen = state.nearbyOpen && state.nearbyOpen[secKey] === true;  // default closed — force her to pick a category
      h += `<div class="nearby-section ${secOpen ? 'open' : ''}">
        <button class="nearby-sec-head" onclick="toggleNearbyOpen(${day.dayNumber}, '${sec.key}')">
          <span class="nearby-sec-label">${sec.icon} ${sec.label}</span>
          <span class="nearby-sec-count">${items.length}</span>
          <span class="nearby-sec-chev">${secOpen ? '▴' : '▾'}</span>
        </button>`;
      if (secOpen) {
        h += `<div class="nearby-sec-body">`;
        items.forEach((it, i) => {
          const sourceKey = `${sec.key}:${i}`;
          const isAdded = addedKeys.has(sourceKey);
          const navUrl = (it.lat && it.lng) ? mapsNavUrl({ lat: it.lat, lng: it.lng }) : null;
          h += `<div class="nearby-item ${isAdded ? 'is-added' : ''}">
            <div class="nearby-item-head">
              <span class="nearby-item-name ltr">${escapeForText(it.name)}</span>
              ${it.type ? `<span class="nearby-item-type">${escapeForText(it.type)}</span>` : ''}
              ${isAdded ? `<span class="nearby-added-chip">✓ נוסף לתוכנית</span>` : ''}
            </div>
            ${it.desc ? `<div class="nearby-item-desc">${escapeForText(it.desc)}</div>` : ''}
            <div class="nearby-item-actions">
              ${navUrl ? `<a class="nearby-item-nav" href="${navUrl}" target="_blank" rel="noopener noreferrer">📍 ${UI.navigate}</a>` : ''}
              ${(it.lat && it.lng) ? `<a class="nearby-item-mapy" href="${mapyShowUrl({lat: it.lat, lng: it.lng})}" target="_blank" rel="noopener noreferrer">🗺️ Mapy</a>` : ''}
              ${!isAdded ? `
                <button class="nearby-item-add" onclick="addNearbyToDay(${day.dayNumber}, '${sourceKey}', 'now')">➕ הוסיפי עכשיו (אחרי המקום הנוכחי)</button>
                <button class="nearby-item-add-end" onclick="addNearbyToDay(${day.dayNumber}, '${sourceKey}', 'end')">📌 לסוף היום</button>
              ` : ''}
            </div>
          </div>`;
        });
        h += `</div>`;
      }
      h += `</div>`;
    }

    // Removed sub-section — soft-removed stops that originally belonged to this day.
    if (removedToday.length) {
      const secKey = `${day.dayNumber}:removed`;
      const secOpen = !state.nearbyOpen || state.nearbyOpen[secKey] !== false;
      h += `<div class="nearby-section removed ${secOpen ? 'open' : ''}">
        <button class="nearby-sec-head" onclick="toggleNearbyOpen(${day.dayNumber}, 'removed')">
          <span class="nearby-sec-label">🗑️ הוסרו (אפשר להחזיר)</span>
          <span class="nearby-sec-count">${removedToday.length}</span>
          <span class="nearby-sec-chev">${secOpen ? '▴' : '▾'}</span>
        </button>`;
      if (secOpen) {
        h += `<div class="nearby-sec-body">`;
        for (const s of removedToday) {
          const c = (typeof getStopCoords === 'function') ? getStopCoords(s) : s.coordinates;
          const navUrl = c ? mapsNavUrl(c) : null;
          h += `<div class="nearby-item">
            <div class="nearby-item-head">
              <span class="nearby-item-name ltr">${s.emoji ? s.emoji + ' ' : ''}${escapeForText(s.name)}</span>
              ${s.type ? `<span class="nearby-item-type">${escapeForText(s.type)}</span>` : ''}
            </div>
            ${s.tip ? `<div class="nearby-item-desc">${escapeForText(s.tip)}</div>` : ''}
            <div class="nearby-item-actions">
              ${navUrl ? `<a class="nearby-item-nav" href="${navUrl}" target="_blank" rel="noopener noreferrer">📍 ${UI.navigate}</a>` : ''}
              <button class="nearby-item-revive" onclick="reviveStop('${s.id}')">↩️ החזירי לתוכנית</button>
            </div>
          </div>`;
        }
        h += `</div>`;
      }
      h += `</div>`;
    }

    h += `</div>`;
  }
  h += `</div>`;
  return h;
}

// Daily fuel chip — granular levels so she can report exactly what she sees on
// the gauge. We treat anything 1/3 or below as "should refuel soon".
const FUEL_LEVELS = [
  { key: 'full', label: 'מלא',  pct: 1.00 },
  { key: '3_4',  label: '3/4',  pct: 0.75 },
  { key: '2_3',  label: '2/3',  pct: 0.66 },
  { key: 'half', label: '1/2',  pct: 0.50 },
  { key: '1_3',  label: '1/3',  pct: 0.33 },
  { key: '1_4',  label: '1/4',  pct: 0.25 },
  { key: 'low',  label: 'נמוך', pct: 0.10 },
];
function fuelPct(level) {
  const f = FUEL_LEVELS.find(x => x.key === level);
  return f ? f.pct : null;
}
function fuelLabel(level) {
  const f = FUEL_LEVELS.find(x => x.key === level);
  return f ? f.label : '';
}

function renderFuelChip(day) {
  const dayKey = String(day.dayNumber);
  const level = state.fuelLevel && state.fuelLevel[dayKey];
  const pct = fuelPct(level);
  const data = (typeof TRIP_NEARBY !== 'undefined') ? TRIP_NEARBY[day.dayNumber] : null;

  // Alert when 1/3 or lower.
  let alertGas = null;
  if (pct !== null && pct <= 0.34 && data && data.gas && data.gas.length) {
    alertGas = data.gas[0];
  }

  // Visual class — green 2/3+, orange 1/2-1/3, red 1/4 or low.
  const cls = level
    ? (pct >= 0.5 ? 'set-ok' : pct >= 0.34 ? 'set-warn' : 'set-low')
    : '';

  let h = `<div class="fuel-chip ${cls}">`;
  h += `<div class="fuel-row">
    <span class="fuel-q">⛽ הדלק:</span>
    <div class="fuel-opts">`;
  for (const f of FUEL_LEVELS) {
    const isOn = level === f.key;
    const lowCls = f.pct <= 0.34 ? 'low' : '';
    h += `<button class="fuel-opt ${lowCls} ${isOn ? 'on' : ''}" onclick="setFuelLevel(${day.dayNumber},'${f.key}')">${f.label}</button>`;
  }
  h += `</div>
    ${level ? `<button class="fuel-clear" onclick="clearFuelLevel(${day.dayNumber})" title="אפסי">↺</button>` : ''}
  </div>`;
  if (alertGas && alertGas.lat && alertGas.lng) {
    const navUrl = mapsNavUrl({ lat: alertGas.lat, lng: alertGas.lng });
    h += `<div class="fuel-alert">
      🚨 <b>תדלקי קודם</b> — ${escapeForText(alertGas.name)}.
      <a class="fuel-nav" href="${navUrl}" target="_blank" rel="noopener noreferrer">📍 ${UI.navigate}</a>
    </div>`;
  }
  h += `</div>`;
  return h;
}

// ─── English voice picker ───────────────────────────────────────────────────

function renderVoicePicker() {
  const heVoices = hebrewVoices();
  const enVoices = englishVoices();
  if (!heVoices.length && !enVoices.length) {
    return `<div id="voicePicker" class="voice-picker">
      <label class="voice-label">🔊 ${UI.voicePickerTitle}:</label>
      <div class="voice-note">${UI.voiceLoading}</div>
    </div>`;
  }
  const maleRx = /daniel|alex|fred|oliver|james|aaron|mark|david|ryan|tom|paul|arthur|george|matthew|asaf/i;

  function opt(v, currentName) {
    const tag = maleRx.test(v.name) ? '♂' : '♀';
    return `<option value="${escapeForText(v.name)}" ${v.name === currentName ? 'selected' : ''}>${tag} ${escapeForText(v.name)} · ${escapeForText(v.lang)}</option>`;
  }

  let html = `<div id="voicePicker" class="voice-picker">`;

  // Hebrew picker (the primary one — mom's content is Hebrew now).
  if (heVoices.length) {
    const heCurrent = getSelectedVoice('שלום אמא');
    const heCurrentName = heCurrent ? heCurrent.name : '';
    const heOpts = heVoices.slice().sort((a, b) => a.name.localeCompare(b.name)).map(v => opt(v, heCurrentName)).join('');
    html += `<div class="voice-row">
      <label class="voice-label">🇮🇱 קול בעברית:</label>
      <select class="voice-select ltr" onchange="setHebrewVoice(this.value)">${heOpts}</select>
      <button class="voice-test" onclick="speakText('שלום אמא, ככה אני נשמע.','דוגמה')">🎧</button>
    </div>`;
  } else {
    html += `<div class="voice-row">
      <label class="voice-label">🇮🇱 קול בעברית:</label>
      <div class="voice-note">לא מותקן — באנדרואיד: הגדרות → שפות → טקסט-לדיבור → התקנת חבילת עברית.</div>
    </div>`;
  }

  // English picker (kept for the daily briefing and any English-text speak calls).
  if (enVoices.length) {
    const enCurrent = getSelectedVoice('Hi');
    const enCurrentName = enCurrent ? enCurrent.name : '';
    const enOpts = enVoices.slice().sort((a, b) => {
      const am = maleRx.test(a.name) ? 0 : 1;
      const bm = maleRx.test(b.name) ? 0 : 1;
      if (am !== bm) return am - bm;
      return a.name.localeCompare(b.name);
    }).map(v => opt(v, enCurrentName)).join('');
    html += `<div class="voice-row">
      <label class="voice-label ltr">🇺🇸 English voice:</label>
      <select class="voice-select ltr" onchange="setVoice(this.value)">${enOpts}</select>
      <button class="voice-test" onclick="speakText('Hi mom, this is how I sound.','דוגמה')">🎧</button>
    </div>`;
  }

  html += `</div>`;
  return html;
}

// ─── Weather chip in day hero ───────────────────────────────────────────────

function renderWeatherChip(w) {
  if (!w) return '';
  if (w.outOfRange) {
    return `<div class="weather-chip out-of-range">
      <span class="weather-ico">🌤️</span>
      <span class="weather-text">תחזית תטען קרוב יותר לתאריך (עד 16 ימים מראש)</span>
    </div>`;
  }
  const icon = (typeof weatherEmoji === 'function') ? weatherEmoji(w.code) : '🌤️';
  const label = (typeof weatherShortHe === 'function') ? weatherShortHe(w.code) : '';
  const rainy = (typeof isRainyForecast === 'function') ? isRainyForecast(w) : null;
  const cls = rainy === true ? 'weather-chip rainy' : rainy === false ? 'weather-chip dry' : 'weather-chip';
  return `<div class="${cls}">
    <span class="weather-ico">${icon}</span>
    <span class="weather-text ltr">${Math.round(w.tmax)}°/${Math.round(w.tmin)}°F · ${w.precipProb}% ${label}</span>
  </div>`;
}

// ─── Route picker (shown only for days with dry/wet branches, e.g. Day 14) ──

function dayHasRouteBranches(day) {
  return (day.schedule || []).some(r => r.route === 'dry' || r.route === 'wet');
}

function renderRoutePicker(day, weather) {
  if (!dayHasRouteBranches(day)) return '';
  const pref = (state.dayRoute || {})[day.dayNumber] || 'auto';
  const eff = (typeof effectiveRoute === 'function') ? effectiveRoute(day) : 'dry';
  const rainy = (typeof isRainyForecast === 'function') ? isRainyForecast(weather) : null;

  let suggestion = '';
  if (rainy === true) {
    suggestion = `התחזית מראה גשם (${weather ? weather.precipProb : '?'}%) — הומלץ <b>OPTION 2</b> (כביש סלול).`;
  } else if (rainy === false) {
    suggestion = `התחזית יבשה — הומלץ <b>OPTION 1</b> (כביש עפר נופי).`;
  } else {
    suggestion = `התחזית טרם נטענה. בחרי לפי הידוע לך.`;
  }

  return `<div class="route-picker">
    <div class="route-title">📍 שני נתיבים היום — איזה לוקחים?</div>
    <div class="route-suggest">${suggestion}</div>
    <div class="route-buttons">
      <button class="route-btn ${pref==='auto'?'active':''}" onclick="setDayRoute(${day.dayNumber},'auto')">🤖 לפי תחזית <span class="route-active-label">${pref==='auto' ? `(פעיל: ${eff==='dry'?'יבש':'גשום'})` : ''}</span></button>
      <button class="route-btn ${pref==='dry'?'active':''}" onclick="setDayRoute(${day.dayNumber},'dry')">☀️ יבש — Cottonwood Canyon</button>
      <button class="route-btn ${pref==='wet'?'active':''}" onclick="setDayRoute(${day.dayNumber},'wet')">🌧️ גשום — כביש סלול</button>
    </div>
  </div>`;
}

