// === Rendering Engine — Clean & Confident ===
// Designed for an anxious mom who needs reassurance

function render() {
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
    const hasErr = d.stops.some(s => s.audit.status === 'error' && !removedStops[s.id]);
    let cls = 'day-chip';
    if (active) cls += ' active';
    if (dp.pct === 100 && dp.total > 0) cls += ' all-done';
    else if (dp.checked > 0) cls += ' has-progress';
    if (hasErr) cls += ' has-errors';
    picker += `<button class="${cls}" onclick="goToDay(${d.dayNumber})">${d.dayNumber}</button>`;
  }
  document.getElementById('dayPicker').innerHTML = picker;
  requestAnimationFrame(() => {
    const c = document.querySelector('.day-chip.active');
    if (c) c.scrollIntoView({ behavior: 'instant', block: 'nearest', inline: 'center' });
  });

  // Nav buttons
  const pb = document.getElementById('prevBtn'), nb = document.getElementById('nextBtn');
  pb.disabled = idx === 0;
  nb.disabled = idx === days.length - 1;
  pb.textContent = idx === 0 ? '' : `◀ ${UI.day} ${days[idx - 1].dayNumber}`;
  nb.textContent = idx === days.length - 1 ? `🎉 ${UI.tripComplete}` : `${UI.day} ${days[idx + 1].dayNumber} ▶`;

  // Main content
  let h = '';

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
  const errStops = stops.filter(s => s.audit.status === 'error');
  const warnStops = stops.filter(s => s.audit.status === 'warning');
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
        for (const iss of s.audit.issues) {
          h += `<div class="day-issue-detail">• ${iss}</div>`;
        }
        if (s.audit.suggestedCoords) {
          const sc = s.audit.suggestedCoords;
          const d = s.coordinates ? Math.round(haversine(s.coordinates.lat, s.coordinates.lng, sc.lat, sc.lng)) : '?';
          h += `<div class="day-issue-fix">💡 הקואורדינטות הנוכחיות רחוקות ${d} מייל מהמיקום הנכון. לחצי על התחנה למטה כדי לתקן.</div>`;
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
        for (const iss of s.audit.issues) {
          h += `<div class="day-issue-detail">• ${iss}</div>`;
        }
        h += `</div>`;
      }
      h += `</div>`;
    }
    h += `</div>`;
  }

  // Day hero
  h += `<div class="day-hero">
    <h2 class="ltr">${day.title || `Day ${day.dayNumber}`}</h2>
    ${day.titleHe ? `<div class="day-he">${day.titleHe}</div>` : ''}
    <div class="day-date">${formatDateHe(day.date)}</div>
    ${day.comments ? `<div class="day-comment">${day.comments}</div>` : ''}
  </div>`;

  // Listen button
  h += `<div class="listen-card">
    <h3>🎧 ${UI.whatToday}</h3>
    <button class="listen-btn" onclick="playDailyBriefing(${day.dayNumber})">
      <span class="play-icon">▶</span>
      ${UI.listenSummary}
    </button>
  </div>`;

  // Route map
  const withCoords = stops.filter(s => getStopCoords(s));
  if (withCoords.length >= 2) {
    h += `<div class="map-wrap"><div class="map-container" id="routeMap-${day.dayNumber}"></div></div>`;
  }

  // Hotel
  if (day.hotel) {
    const ht = day.hotel, hc = ht.coordinates;
    h += `<div class="hotel-card">
      <div class="hotel-label">🏨 ${UI.hotelTonight}</div>
      <div class="hotel-name">${ht.name}</div>
      ${ht.address ? `<div class="hotel-addr">${ht.address}</div>` : ''}
      <div class="hotel-actions">
        ${ht.phone ? `<a class="act-btn green" href="${phoneUrl(ht.phone)}">📞 ${UI.call}</a>` : ''}
        ${hc ? `<a class="act-btn blue" href="${mapsNavUrl(hc)}" target="_blank">📍 ${UI.navigate}</a>` : ''}
        ${ht.bookingLink ? `<a class="act-btn outline" href="${ht.bookingLink}" target="_blank">🔗 ${UI.booking}</a>` : ''}
      </div>
    </div>`;
  }

  // Stops
  if (stops.length > 0) {
    h += `<div class="section-label">☀️ ${UI.todayPlan} · ${stops.length} ${UI.stops}</div>`;
    stops.forEach((s, i) => {
      const nextStop = i < stops.length - 1 ? stops[i + 1] : null;
      h += renderStop(s, nextStop, i);
      if (nextStop) h += renderDirCard(s, nextStop);
    });
  } else {
    h += `<div class="empty"><div class="big-icon">🏖️</div><p>${UI.noStops}</p></div>`;
  }

  document.getElementById('app').innerHTML = h;

  // Init maps
  requestAnimationFrame(() => {
    if (withCoords.length >= 2) initRouteMap(`routeMap-${day.dayNumber}`, stops);
    stops.forEach(s => {
      if (state.expanded[s.id] && getStopCoords(s)) {
        const nextCoords = s._nextStop ? getStopCoords(s._nextStop) : null;
        if (nextCoords) {
          // Show route from this stop to next stop
          initRouteSegmentMap(`stopMap-${s.id}`, s, s._nextStop);
        } else {
          // Last stop: just show the pin
          initStopMap(`stopMap-${s.id}`, getStopCoords(s), s.name);
        }
      }
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

function renderStop(s, nextStop, index) {
  const checked = state.checked[s.id];
  const expanded = state.expanded[s.id];
  const coords = getStopCoords(s);
  const nextCoords = nextStop ? getStopCoords(nextStop) : null;
  const hasIssues = s.audit.issues.length > 0;

  // Navigate button always opens with a route (to next stop), not an empty pin
  let navUrl = '#';
  let navLabel = UI.navigate;
  if (coords && nextCoords) {
    navUrl = mapsDirUrl(coords, nextCoords);
    navLabel = `📍 נווטי ל${nextStop.name.substring(0, 20)}`;
  } else if (coords) {
    navUrl = mapsNavUrl(coords);
    navLabel = `📍 ${UI.navigate}`;
  }

  let cls = 'stop-card';
  if (checked) cls += ' checked';
  if (s.audit.status === 'error') cls += ' has-error';
  else if (s.audit.status === 'warning') cls += ' has-warning';

  const delay = Math.min((index || 0) * 40, 300);
  let h = `<div class="${cls}" style="animation-delay:${delay}ms">
    <div class="stop-row">
      <button class="stop-check ${checked ? 'done' : ''}" onclick="toggleCheck('${s.id}')">${checked ? '✓' : ''}</button>
      <div class="stop-body">
        <span class="stop-name-text ltr">${s.emoji} ${s.name}</span>
        ${s.tip ? `<div class="stop-meta">${s.tip}</div>` : ''}
        ${s.difficulty ? `<div class="stop-meta">${s.difficulty}</div>` : ''}
        ${hasIssues ? `<div class="audit-chip ${s.audit.status}">${s.audit.status === 'error' ? '❌' : '⚠️'} ${s.audit.status === 'error' ? UI.error : UI.warning}</div>` : ''}
        <div class="stop-actions">
          <button class="stop-btn listen" onclick="toggleExpanded('${s.id}')">
            🎧 ${expanded ? UI.close : UI.tellMeMore}
          </button>
          ${coords ? `<a class="stop-btn navigate" href="${navUrl}" target="_blank">${navLabel}</a>` : ''}
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
  const cls = s.audit.status === 'error' ? 'error-box' : 'warning-box';
  let h = `<div class="audit-box ${cls}">`;
  for (const issue of s.audit.issues) {
    const icon = s.audit.status === 'error' ? '❌' : '⚠️';
    h += `<div class="issue-row"><span class="issue-icon">${icon}</span><span>${issue}</span></div>`;
  }
  if (s.coordinates) {
    h += `<div class="coords-box">📍 ${s.coordinates.lat.toFixed(4)}, ${s.coordinates.lng.toFixed(4)}`;
    if (s.audit.suggestedCoords) {
      const sc = s.audit.suggestedCoords;
      const d = haversine(s.coordinates.lat, s.coordinates.lng, sc.lat, sc.lng);
      h += `<br>💡 מוצע: ${sc.lat}, ${sc.lng} (${Math.round(d)} מייל הפרש)`;
    }
    h += `</div>`;
  }
  h += `<div class="fix-btns">`;
  if (s.audit.suggestedCoords) {
    const sc = s.audit.suggestedCoords;
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
      <a class="maps-link" href="${mapsDirUrl(fc, tc)}" target="_blank">🗺️ ${UI.openInMaps}</a>
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
    for (const s of day.stops) {
      if (s.audit.issues.length > 0 && !removedStops[s.id]) issues.push({ day, s });
    }
  }
  const errs = issues.filter(i => i.s.audit.status === 'error');
  const warns = issues.filter(i => i.s.audit.status === 'warning');

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
    h += `<div class="audit-entry ${stop.audit.status}">
      <div class="audit-entry-head">
        <span class="audit-entry-name">${stop.name}</span>
        <span class="audit-entry-day">${UI.day} ${day.dayNumber}</span>
      </div>
      <div style="font-size:14px;color:var(--text-secondary);line-height:1.6;">`;
    for (const iss of stop.audit.issues) {
      h += `<div class="issue-row"><span class="issue-icon">${stop.audit.status === 'error' ? '❌' : '⚠️'}</span><span>${iss}</span></div>`;
    }
    if (stop.coordinates) {
      h += `<div class="coords-box">📍 (${stop.coordinates.lat.toFixed(4)}, ${stop.coordinates.lng.toFixed(4)})`;
      if (stop.audit.suggestedCoords) {
        const sc = stop.audit.suggestedCoords;
        const d = haversine(stop.coordinates.lat, stop.coordinates.lng, sc.lat, sc.lng);
        h += `<br>💡 Suggested: (${sc.lat}, ${sc.lng}) — ${Math.round(d)} mi off`;
      }
      h += `</div>`;
    }
    h += `<div class="fix-btns">`;
    if (stop.audit.suggestedCoords) {
      const sc = stop.audit.suggestedCoords;
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
