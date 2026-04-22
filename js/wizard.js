// === Audit Wizard — Gentle guided review for mom ===
// One issue at a time. She sees it, understands it, decides.

const WIZARD_KEY = 'canyon_trip_wizard_decisions';
let wizardDecisions = {};
let wizardIssues = [];
let wizardIndex = 0;
let wizardActive = false;

function loadWizardDecisions() {
  try {
    const d = localStorage.getItem(WIZARD_KEY);
    if (d) wizardDecisions = JSON.parse(d);
  } catch(e) {}
}
function saveWizardDecisions() {
  try { localStorage.setItem(WIZARD_KEY, JSON.stringify(wizardDecisions)); } catch(e) {}
}

// Build the list of issues that still need review
function buildWizardIssues() {
  const issues = [];
  for (const day of TRIP_DATA.days) {
    for (const s of day.stops) {
      if (s.audit.status === 'error' && !removedStops[s.id] && !wizardDecisions[s.id]) {
        issues.push({ day, stop: s });
      }
    }
  }
  return issues;
}

// Hebrew explanations for each error — gentle, blame ChatGPT, reassure mom
function getWizardExplanation(stop) {
  const name = stop.name;
  const issues = stop.audit.issues;
  const issueText = issues.join(' ');

  // No coordinates + doesn't exist
  if (issueText.includes('No such trail') || issueText.includes('does not exist') || issueText.includes('Cannot be found')) {
    return {
      icon: '🤖',
      title: `"${name}" — המקום הזה לא קיים`,
      explain: `כשתכננת את הטיול, ChatGPT המציא את המקום הזה. זה קורה לפעמים — הוא ממציא שמות שנשמעים אמיתיים אבל לא קיימים במציאות. אל דאגה, הטיול שלך מדהים גם בלי התחנה הזו!`,
      suggestion: 'remove',
      suggestionText: 'מומלץ להסיר — המקום לא קיים',
    };
  }

  // Wrong coordinates (far off)
  if (issueText.includes('mi off') || issueText.includes('wrong coordinates') || issueText.includes('Does not belong')) {
    const hasSuggested = !!stop.audit.suggestedCoords;
    return {
      icon: '📍',
      title: `"${name}" — הקואורדינטות לא נכונות`,
      explain: `ChatGPT נתן קואורדינטות שמצביעות על מקום אחר לגמרי, רחוק מהמסלול שלך.${hasSuggested ? ' מצאנו את המיקום הנכון ואפשר לתקן.' : ' לצערנו לא מצאנו את המיקום הנכון.'}`,
      suggestion: hasSuggested ? 'fix' : 'remove',
      suggestionText: hasSuggested ? 'מומלץ לתקן את המיקום' : 'מומלץ להסיר — לא נמצא מיקום נכון',
    };
  }

  // Missing coordinates
  if (issueText.includes('missing') || issueText.includes('No coordinates')) {
    return {
      icon: '❓',
      title: `"${name}" — חסרות קואורדינטות`,
      explain: `לא הצלחנו למצוא את המיקום המדויק של התחנה הזו. בלי קואורדינטות, הניווט לא יעבוד.`,
      suggestion: 'remove',
      suggestionText: 'מומלץ להסיר — לא ניתן לנווט',
    };
  }

  // Confused place (wrong association)
  if (issueText.includes('Confused') || issueText.includes('not') || issueText.includes('UTAH')) {
    return {
      icon: '🔄',
      title: `"${name}" — בלבול במיקום`,
      explain: `ChatGPT בילבל בין מקומות. ${issues[0]}`,
      suggestion: stop.audit.suggestedCoords ? 'fix' : 'remove',
      suggestionText: stop.audit.suggestedCoords ? 'מומלץ לתקן את המיקום' : 'מומלץ להסיר',
    };
  }

  // Fallback
  return {
    icon: '⚠️',
    title: `"${name}" — נמצאה בעיה`,
    explain: issues.map(i => `• ${i}`).join('\n'),
    suggestion: stop.audit.suggestedCoords ? 'fix' : 'remove',
    suggestionText: stop.audit.suggestedCoords ? 'מומלץ לתקן' : 'מומלץ להסיר',
  };
}

function startWizard() {
  loadWizardDecisions();
  wizardIssues = buildWizardIssues();
  wizardIndex = 0;
  wizardActive = true;

  if (wizardIssues.length === 0) {
    renderWizardComplete();
    return;
  }
  renderWizardStep();
}

function renderWizardStep() {
  const item = wizardIssues[wizardIndex];
  if (!item) { renderWizardComplete(); return; }

  const { stop, day } = item;
  const info = getWizardExplanation(stop);
  const total = wizardIssues.length;
  const current = wizardIndex + 1;
  const pct = Math.round((wizardIndex / total) * 100);
  const coords = stop.coordinates;
  const suggested = stop.audit.suggestedCoords;

  let h = `<div class="wizard-overlay">
    <div class="wizard-container">

      <!-- Progress -->
      <div class="wizard-progress">
        <div class="wizard-progress-bar" style="width:${pct}%"></div>
      </div>
      <div class="wizard-progress-text">${current} מתוך ${total}</div>

      <!-- Close -->
      <button class="wizard-close" onclick="closeWizard()" aria-label="סגור">✕</button>

      <!-- Content -->
      <div class="wizard-content">
        <div class="wizard-icon">${info.icon}</div>
        <h2 class="wizard-title">${info.title}</h2>
        <div class="wizard-day">יום ${day.dayNumber}${day.titleHe ? ` — ${day.titleHe}` : ''}</div>

        <div class="wizard-explain">${info.explain}</div>

        <div class="wizard-recommendation">
          <div class="wizard-rec-label">💡 ההמלצה שלנו:</div>
          <div class="wizard-rec-text">${info.suggestionText}</div>
        </div>`;

  // Show coordinates info if relevant
  if (coords && suggested) {
    const dist = haversine(coords.lat, coords.lng, suggested.lat, suggested.lng);
    h += `<div class="wizard-coords">
      <div class="wizard-coords-row">
        <span class="wizard-coords-label">📍 עכשיו:</span>
        <span class="wizard-coords-val ltr">${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}</span>
      </div>
      <div class="wizard-coords-row">
        <span class="wizard-coords-label">✅ נכון:</span>
        <span class="wizard-coords-val ltr">${suggested.lat.toFixed(4)}, ${suggested.lng.toFixed(4)}</span>
      </div>
      <div class="wizard-coords-dist">${Math.round(dist)} מייל הפרש</div>
    </div>`;
  }

  h += `</div>

      <!-- Actions -->
      <div class="wizard-actions">`;

  if (info.suggestion === 'fix' && suggested) {
    h += `<button class="wizard-btn wizard-btn-fix" onclick="wizardFix('${stop.id}', ${suggested.lat}, ${suggested.lng})">
      ✅ תקני את המיקום
    </button>`;
  }

  h += `<button class="wizard-btn wizard-btn-remove" onclick="wizardRemove('${stop.id}')">
      🗑️ הסירי מהטיול
    </button>
    <button class="wizard-btn wizard-btn-keep" onclick="wizardKeep('${stop.id}')">
      🤷 השאירי בינתיים
    </button>
  </div>

    </div>
  </div>`;

  let el = document.getElementById('wizardRoot');
  if (!el) { el = document.createElement('div'); el.id = 'wizardRoot'; document.body.appendChild(el); }
  el.innerHTML = h;
}

function renderWizardComplete() {
  const reviewed = Object.keys(wizardDecisions).length;
  const removed = Object.values(wizardDecisions).filter(d => d === 'removed').length;
  const fixed = Object.values(wizardDecisions).filter(d => d === 'fixed').length;
  const kept = Object.values(wizardDecisions).filter(d => d === 'kept').length;

  let h = `<div class="wizard-overlay">
    <div class="wizard-container">
      <div class="wizard-content" style="text-align:center;">
        <div class="wizard-icon">🎉</div>
        <h2 class="wizard-title">סיימנו!</h2>
        <div class="wizard-explain" style="text-align:center;">
          בדקנו את כל הבעיות במסלול.<br>
          הטיול שלך עכשיו מדויק ומוכן!
        </div>
        <div class="wizard-stats">
          ${fixed > 0 ? `<div class="wizard-stat wizard-stat-fix">✅ ${fixed} תוקנו</div>` : ''}
          ${removed > 0 ? `<div class="wizard-stat wizard-stat-remove">🗑️ ${removed} הוסרו</div>` : ''}
          ${kept > 0 ? `<div class="wizard-stat wizard-stat-keep">🤷 ${kept} נשארו</div>` : ''}
        </div>
        <div class="wizard-explain" style="text-align:center;margin-top:16px;">
          את מטיילת מדהימה! הטיול שלך מושלם 🌟
        </div>
        <button class="wizard-btn wizard-btn-fix" onclick="closeWizard()" style="margin-top:20px;">
          🎉 יופי, בואי נמשיך!
        </button>
      </div>
    </div>
  </div>`;

  let el = document.getElementById('wizardRoot');
  if (!el) { el = document.createElement('div'); el.id = 'wizardRoot'; document.body.appendChild(el); }
  el.innerHTML = h;
}

function wizardFix(stopId, lat, lng) {
  applyCoordFix(stopId, lat, lng);
  wizardDecisions[stopId] = 'fixed';
  saveWizardDecisions();
  wizardIndex++;
  renderWizardStep();
}

function wizardRemove(stopId) {
  removeStop(stopId);
  wizardDecisions[stopId] = 'removed';
  saveWizardDecisions();
  wizardIndex++;
  renderWizardStep();
}

function wizardKeep(stopId) {
  wizardDecisions[stopId] = 'kept';
  saveWizardDecisions();
  wizardIndex++;
  renderWizardStep();
}

function closeWizard() {
  wizardActive = false;
  const el = document.getElementById('wizardRoot');
  if (el) el.innerHTML = '';
  render();
}

// Reset wizard (for re-review)
function resetWizard() {
  wizardDecisions = {};
  saveWizardDecisions();
}

loadWizardDecisions();
