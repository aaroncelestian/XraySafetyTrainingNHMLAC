// Training state management
let currentSection = 1;
const totalTrainingSections = 12;
const totalSections = 13; // 12 training sections + quiz
let userEmail = '';
let startTime = null;
let quizPassed = false;
const sectionKcPassed = {}; // knowledge checks completed per section
let finalChecklistComplete = false;

const kcFeedback = {
    1: { a: 'Correct — soft lab X-rays deposit energy efficiently in tissue.' },
    2: { a: 'Correct — the Horiba XGT-7200 is the cabinet micro-XRF.' },
    3: { c: 'Correct — about 70% of damage is indirect via free radicals.' },
    4: { a: 'Correct — extremity limit is typically 50 rem/year.' },
    5: { c: 'Correct — ANSI N43.2 requires at least two independent interlocks.' },
    6: { c: 'Correct — never open with X-rays generating; confirm safe state first.' },
    7: { a: 'Correct — inverse square law: double distance → 25% intensity.' },
    8: { c: 'Correct — treat as an emergency and notify the RSO.' },
    9: { a: 'Correct — capture who, instrument, time, settings, access state, duration, witnesses.' },
    10: { c: 'Correct — ANSI N43.2 covers XRD/XRF analysis equipment safety.' },
    11: { a: 'Correct — mounting and centering are the highest-risk moments on the RAPID.' }
};

const loginSection = document.getElementById('login-section');
const trainingContent = document.getElementById('training-content');
const completionSection = document.getElementById('completion-section');
const loginForm = document.getElementById('login-form');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const completeBtn = document.getElementById('complete-btn');
const progressFill = document.getElementById('progress');
const currentSectionSpan = document.getElementById('current-section');
const totalSectionsSpan = document.getElementById('total-sections');

document.addEventListener('DOMContentLoaded', () => {
    totalSectionsSpan.textContent = totalTrainingSections;
    loadTrainingData();
    initKnowledgeChecks();
    initScenarioToggles();
    initInstrumentTabs();
    initFinalChecklist();
    initTheme();
    updateNextButtonState();
});

loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    userEmail = document.getElementById('user-email').value;
    startTime = new Date();

    loginSection.classList.add('hidden');
    trainingContent.classList.remove('hidden');

    showSection(1);
});

prevBtn.addEventListener('click', () => {
    if (currentSection > 1) {
        currentSection--;
        showSection(currentSection);
    }
});

nextBtn.addEventListener('click', () => {
    if (!canAdvanceFrom(currentSection)) {
        return;
    }
    if (currentSection < totalSections) {
        currentSection++;
        showSection(currentSection);
    }
});

completeBtn.addEventListener('click', () => {
    completeTraining();
});

function showSection(sectionNum) {
    for (let i = 1; i <= totalTrainingSections; i++) {
        document.getElementById(`section-${i}`).classList.add('hidden');
    }
    document.getElementById('quiz-section').classList.add('hidden');

    const progressTextEl = document.querySelector('.progress-text');
    if (sectionNum === totalSections) {
        document.getElementById('quiz-section').classList.remove('hidden');
        if (progressTextEl) {
            progressTextEl.innerHTML = 'Final Assessment Quiz';
        }
    } else {
        document.getElementById(`section-${sectionNum}`).classList.remove('hidden');
        if (progressTextEl) {
            progressTextEl.innerHTML = `Section <span id="current-section">${sectionNum}</span> of <span id="total-sections">${totalTrainingSections}</span>`;
        }
    }

    const progressPercent = (sectionNum / totalSections) * 100;
    progressFill.style.width = progressPercent + '%';

    if (sectionNum === 1) {
        prevBtn.classList.add('hidden');
    } else {
        prevBtn.classList.remove('hidden');
    }

    if (sectionNum === totalSections) {
        nextBtn.classList.add('hidden');
        if (quizPassed) {
            completeBtn.classList.remove('hidden');
        } else {
            completeBtn.classList.add('hidden');
        }
    } else {
        nextBtn.classList.remove('hidden');
        completeBtn.classList.add('hidden');
    }

    updateNextButtonState();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function canAdvanceFrom(sectionNum) {
    if (sectionNum === totalSections) return false;

    // Section 12: final checklist gate
    if (sectionNum === 12) {
        if (!finalChecklistComplete) {
            alert('Please complete all checklist items before continuing to the quiz.');
            return false;
        }
        return true;
    }

    // Knowledge check gate for sections that have one
    const kc = document.querySelector(`#section-${sectionNum} .knowledge-check`);
    if (kc && !sectionKcPassed[sectionNum]) {
        alert('Please answer the knowledge check correctly before continuing.');
        return false;
    }
    return true;
}

function updateNextButtonState() {
    if (currentSection >= totalSections) {
        nextBtn.disabled = false;
        return;
    }

    if (currentSection === 12) {
        nextBtn.disabled = !finalChecklistComplete;
        nextBtn.title = finalChecklistComplete ? '' : 'Complete the checklist to continue';
        return;
    }

    const kc = document.querySelector(`#section-${currentSection} .knowledge-check`);
    if (kc) {
        nextBtn.disabled = !sectionKcPassed[currentSection];
        nextBtn.title = sectionKcPassed[currentSection] ? '' : 'Answer the knowledge check to continue';
    } else {
        nextBtn.disabled = false;
        nextBtn.title = '';
    }
}

function initKnowledgeChecks() {
    document.querySelectorAll('.knowledge-check').forEach((kc) => {
        const section = kc.dataset.section;
        const correct = kc.dataset.correct;
        const feedbackEl = kc.querySelector('.kc-feedback');

        kc.querySelectorAll('input[type="radio"]').forEach((input) => {
            input.addEventListener('change', () => {
                const value = input.value;
                feedbackEl.classList.remove('hidden');

                if (value === correct) {
                    sectionKcPassed[section] = true;
                    const msg = (kcFeedback[section] && kcFeedback[section][correct]) || 'Correct!';
                    feedbackEl.innerHTML = `<div class="success-box">${msg}</div>`;
                } else {
                    sectionKcPassed[section] = false;
                    feedbackEl.innerHTML = `<div class="danger-box">Not quite — review this section and try again.</div>`;
                }
                updateNextButtonState();
            });
        });
    });
}

function initScenarioToggles() {
    document.querySelectorAll('.scenario-toggle').forEach((btn) => {
        btn.addEventListener('click', () => {
            const answer = btn.parentElement.querySelector('.scenario-answer');
            const isHidden = answer.classList.contains('hidden');
            answer.classList.toggle('hidden');
            btn.textContent = isHidden ? 'Hide analysis' : 'Reveal analysis';
        });
    });
}

function initInstrumentTabs() {
    const buttons = document.querySelectorAll('.tab-btn');
    buttons.forEach((btn) => {
        btn.addEventListener('click', () => {
            const tab = btn.dataset.tab;
            buttons.forEach((b) => b.classList.remove('active'));
            btn.classList.add('active');

            document.querySelectorAll('.tab-panel').forEach((panel) => {
                panel.classList.add('hidden');
                panel.classList.remove('active');
            });
            const panel = document.getElementById(`tab-${tab}`);
            if (panel) {
                panel.classList.remove('hidden');
                panel.classList.add('active');
            }
        });
    });
}

function initFinalChecklist() {
    const checks = document.querySelectorAll('.final-check');
    const status = document.getElementById('checklist-status');

    const refresh = () => {
        finalChecklistComplete = checks.length > 0 && Array.from(checks).every((c) => c.checked);
        if (status) {
            status.textContent = finalChecklistComplete
                ? 'Checklist complete — you may proceed to the quiz.'
                : 'Complete all items above to continue.';
            status.classList.toggle('complete', finalChecklistComplete);
        }
        updateNextButtonState();
    };

    checks.forEach((c) => c.addEventListener('change', refresh));
    refresh();
}

let lastCompletionDate = null;
let lastValidThrough = null;
let lastTrainingRecord = null;
let completionGateActive = false;
let recordAcknowledged = false;

const MINSCI_EMAIL = 'minsci@nhm.org';

function completeTraining() {
    const completionDate = new Date();
    const nextTrainingDate = new Date(completionDate);
    nextTrainingDate.setFullYear(nextTrainingDate.getFullYear() + 2);
    lastCompletionDate = completionDate;
    lastValidThrough = nextTrainingDate;

    const trainingRecord = {
        email: userEmail,
        completionDate: completionDate.toISOString(),
        nextTrainingDue: nextTrainingDate.toISOString(),
        validThrough: nextTrainingDate.toISOString(),
        startTime: startTime.toISOString(),
        duration: Math.round((completionDate - startTime) / 1000 / 60),
        instruments: ['Rigaku R-AXIS RAPID', 'Proto AXRD', 'Horiba XGT-7200'],
        module: 'NHMLAC X-Ray Operator Safety Training',
        validityYears: 2
    };
    lastTrainingRecord = trainingRecord;

    saveTrainingRecord(trainingRecord);

    trainingContent.classList.add('hidden');
    completionSection.classList.remove('hidden');

    const completedText = formatDate(completionDate);
    const validText = formatDateShort(nextTrainingDate);

    document.getElementById('completion-email').textContent = userEmail;
    document.getElementById('completion-date').textContent = completedText;
    document.getElementById('next-training-date').textContent = validText;

    document.getElementById('cert-name').textContent = userEmail;
    document.getElementById('cert-completed').textContent = completedText;
    document.getElementById('cert-valid').textContent = validText;

    updateMinsciMailtoLink();
    enableCompletionLeaveGate();

    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function saveTrainingRecord(record) {
    let trainingData = JSON.parse(localStorage.getItem('xrayTrainingData') || '[]');
    trainingData.push(record);
    localStorage.setItem('xrayTrainingData', JSON.stringify(trainingData));
    generateJSONFile(trainingData);
}

function loadTrainingData() {
    const data = JSON.parse(localStorage.getItem('xrayTrainingData') || '[]');
    console.log('Loaded training records:', data.length);
}

function generateJSONFile(data) {
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    window.trainingDataURL = url;
}

document.getElementById('download-cert-btn').addEventListener('click', () => {
    downloadJsonRecord();
});

document.getElementById('download-ics-btn').addEventListener('click', downloadRetrainingIcs);
document.getElementById('print-cert-btn').addEventListener('click', printCertificate);

const emailMinsciBtn = document.getElementById('email-minsci-btn');
if (emailMinsciBtn) {
    emailMinsciBtn.addEventListener('click', emailRecordToMinsci);
}

const recordAck = document.getElementById('record-sent-ack');
if (recordAck) {
    recordAck.addEventListener('change', () => {
        recordAcknowledged = recordAck.checked;
    });
}

function buildMinsciMailto() {
    const completedText = lastCompletionDate ? formatDate(lastCompletionDate) : '';
    const validText = lastValidThrough ? formatDateShort(lastValidThrough) : '';
    const subject = 'X-Ray Operator Safety Training Completion';
    const body = [
        'Hello,',
        '',
        'I have completed the NHMLAC X-Ray Operator Safety Training (Rigaku R-AXIS RAPID, Proto AXRD, Horiba XGT-7200).',
        '',
        `Trainee email: ${userEmail || ''}`,
        `Completion date: ${completedText}`,
        `Valid through: ${validText}`,
        '',
        'Please find my certificate (.html) and JSON training record attached.',
        '',
        'Thank you.'
    ].join('\n');

    return `mailto:${MINSCI_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

function updateMinsciMailtoLink() {
    const link = document.getElementById('minsci-mailto-link');
    if (link) {
        link.href = buildMinsciMailto();
        link.textContent = MINSCI_EMAIL;
    }
}

function triggerDownload(filename, blob) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function downloadJsonRecord() {
    const trainingData = JSON.parse(localStorage.getItem('xrayTrainingData') || '[]');
    const latest = lastTrainingRecord || trainingData[trainingData.length - 1] || {};
    const payload = lastTrainingRecord || trainingData;
    const jsonStr = JSON.stringify(payload, null, 2);
    const stamp = formatDateForFilename(lastCompletionDate || new Date());
    const nameHint = (userEmail || latest.email || 'trainee').replace(/[^a-zA-Z0-9._@-]/g, '_');
    triggerDownload(`xray-training-record-${nameHint}-${stamp}.json`, new Blob([jsonStr], { type: 'application/json' }));
}

function buildCertificateHtml() {
    const completedText = lastCompletionDate ? formatDate(lastCompletionDate) : '—';
    const validText = lastValidThrough ? formatDateShort(lastValidThrough) : '—';
    const name = userEmail || '—';
    return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>X-Ray Operator Safety Training Certificate — ${name}</title>
<style>
  body { font-family: Georgia, serif; color: #1c2430; max-width: 760px; margin: 40px auto; padding: 24px; }
  .border { border: 2px solid #1a2f45; padding: 40px; position: relative; }
  .border:before { content: ""; position: absolute; inset: 10px; border: 1px solid #1f5c57; pointer-events: none; }
  .org { text-transform: uppercase; letter-spacing: 0.12em; font-size: 12px; color: #5a6573; font-family: sans-serif; }
  .label { color: #1f5c57; margin-top: 12px; }
  h1 { font-size: 28px; margin: 8px 0 12px; }
  .name { font-size: 24px; font-weight: bold; border-bottom: 1px solid #c9d2dc; display: inline-block; min-width: 60%; padding-bottom: 6px; margin: 12px 0; }
  .meta { display: flex; justify-content: space-between; gap: 16px; margin-top: 28px; font-family: sans-serif; font-size: 14px; }
  .meta span { display: block; text-transform: uppercase; letter-spacing: 0.08em; font-size: 11px; color: #5a6573; }
  .foot { margin-top: 24px; font-size: 12px; color: #5a6573; font-family: sans-serif; }
</style>
</head>
<body>
  <div class="border">
    <p class="org">Natural History Museum of Los Angeles County</p>
    <p class="label">Certificate of Completion</p>
    <h1>X-Ray Operator Safety Training</h1>
    <p>Rigaku R-AXIS RAPID · Proto AXRD · Horiba XGT-7200</p>
    <p>This certifies that</p>
    <p class="name">${name}</p>
    <p>has successfully completed operator safety training for analytical X-ray diffraction and fluorescence instruments, including the final assessment at 100%.</p>
    <div class="meta">
      <div><span>Completed</span>${completedText}</div>
      <div><span>Valid through</span>${validText}</div>
      <div><span>Validity period</span>2 years from completion</div>
    </div>
    <p class="foot">Based on ANSI N43.2 and institutional radiation safety policy. Authorization to operate remains subject to RSO approval. Please email this certificate with your JSON record to minsci@nhm.org.</p>
  </div>
</body>
</html>`;
}

function downloadCertificateFile() {
    const stamp = formatDateForFilename(lastCompletionDate || new Date());
    const nameHint = (userEmail || 'trainee').replace(/[^a-zA-Z0-9._@-]/g, '_');
    triggerDownload(
        `xray-training-certificate-${nameHint}-${stamp}.html`,
        new Blob([buildCertificateHtml()], { type: 'text/html;charset=utf-8' })
    );
}

function emailRecordToMinsci() {
    if (!lastTrainingRecord && !userEmail) {
        alert('Complete training first, then email your record.');
        return;
    }
    downloadCertificateFile();
    setTimeout(() => {
        downloadJsonRecord();
        setTimeout(() => {
            // Avoid leave-page warning when opening the mail client
            const wasActive = completionGateActive;
            completionGateActive = false;
            window.location.href = buildMinsciMailto();
            setTimeout(() => {
                completionGateActive = wasActive;
            }, 1500);
            alert(
                'Your certificate and JSON record were downloaded.\n\n' +
                'Your email app should open to minsci@nhm.org with subject and body filled in.\n\n' +
                'Important: browsers cannot auto-attach files — please attach the two downloaded files before sending.'
            );
        }, 400);
    }, 400);
}

function enableCompletionLeaveGate() {
    completionGateActive = true;
    recordAcknowledged = false;
    const ack = document.getElementById('record-sent-ack');
    if (ack) ack.checked = false;
}

window.addEventListener('beforeunload', (e) => {
    if (!completionGateActive || recordAcknowledged) return;
    e.preventDefault();
    e.returnValue = 'Have you downloaded your training record or emailed minsci@nhm.org?';
    return e.returnValue;
});

function formatDateShort(date) {
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

function pad2(n) {
    return String(n).padStart(2, '0');
}

function toIcsDate(date) {
    return (
        date.getUTCFullYear() +
        pad2(date.getUTCMonth() + 1) +
        pad2(date.getUTCDate()) +
        'T' +
        pad2(date.getUTCHours()) +
        pad2(date.getUTCMinutes()) +
        pad2(date.getUTCSeconds()) +
        'Z'
    );
}

function downloadRetrainingIcs() {
    if (!lastValidThrough) {
        alert('Complete training first to generate a calendar reminder.');
        return;
    }

    const start = new Date(lastValidThrough);
    start.setHours(9, 0, 0, 0);
    const end = new Date(start);
    end.setHours(10, 0, 0, 0);

    const uid = `xray-retrain-${start.getTime()}@nhmlac`;
    const stamp = toIcsDate(new Date());
    const dtStart = toIcsDate(start);
    const dtEnd = toIcsDate(end);
    const completedNote = lastCompletionDate ? formatDateShort(lastCompletionDate) : 'N/A';

    const ics = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//NHMLAC//X-Ray Operator Safety Training//EN',
        'CALSCALE:GREGORIAN',
        'METHOD:PUBLISH',
        'BEGIN:VEVENT',
        `UID:${uid}`,
        `DTSTAMP:${stamp}`,
        `DTSTART:${dtStart}`,
        `DTEND:${dtEnd}`,
        'SUMMARY:NHMLAC X-Ray Operator Safety Retraining Due',
        `DESCRIPTION:X-Ray Operator Safety Training expires / retraining due. Original completion: ${completedNote}. Instruments: Rigaku R-AXIS RAPID, Proto AXRD, Horiba XGT-7200. Complete the training module again before operating.`,
        'LOCATION:NHMLAC X-ray Lab',
        'BEGIN:VALARM',
        'TRIGGER:-P30D',
        'ACTION:DISPLAY',
        'DESCRIPTION:Reminder: X-ray operator retraining due in 30 days',
        'END:VALARM',
        'BEGIN:VALARM',
        'TRIGGER:-P7D',
        'ACTION:DISPLAY',
        'DESCRIPTION:Reminder: X-ray operator retraining due in 7 days',
        'END:VALARM',
        'END:VEVENT',
        'END:VCALENDAR'
    ].join('\r\n');

    const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `xray-retraining-reminder-${formatDateForFilename(lastValidThrough)}.ics`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function printCertificate() {
    window.print();
}

function initTheme() {
    const stored = localStorage.getItem('xrayTrainingTheme');
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const theme = stored || (prefersDark ? 'dark' : 'light');
    applyTheme(theme);

    const toggle = document.getElementById('theme-toggle');
    if (toggle && !toggle.dataset.bound) {
        toggle.dataset.bound = '1';
        toggle.addEventListener('click', (e) => {
            e.preventDefault();
            const current = document.documentElement.getAttribute('data-theme') || 'light';
            const next = current === 'dark' ? 'light' : 'dark';
            applyTheme(next);
            localStorage.setItem('xrayTrainingTheme', next);
        });
    }
}

function applyTheme(theme) {
    const next = theme === 'dark' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', next);
    document.body && document.body.setAttribute('data-theme', next);
    const label = document.getElementById('theme-toggle-label');
    if (label) {
        label.textContent = next === 'dark' ? 'Light mode' : 'Dark mode';
    }
}

// Theme can init as soon as the toggle exists (script is at end of body)
initTheme();

function formatDate(date) {
    const options = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    return date.toLocaleDateString('en-US', options);
}

function formatDateForFilename(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

window.viewAllTrainingRecords = function () {
    const data = JSON.parse(localStorage.getItem('xrayTrainingData') || '[]');
    console.table(data);
    return data;
};

window.downloadAllRecords = function () {
    const trainingData = JSON.parse(localStorage.getItem('xrayTrainingData') || '[]');
    const jsonStr = JSON.stringify(trainingData, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `xray-training-records-${formatDateForFilename(new Date())}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    console.log(`Downloaded ${trainingData.length} training records`);
};

window.findUsersNeedingRefresher = function () {
    const data = JSON.parse(localStorage.getItem('xrayTrainingData') || '[]');
    const now = new Date();

    const needsRefresher = data.filter((record) => {
        const nextDue = new Date(record.nextTrainingDue);
        return nextDue <= now;
    });

    console.log(`${needsRefresher.length} users need refresher training:`);
    console.table(needsRefresher);

    return needsRefresher;
};

window.clearAllTrainingData = function () {
    if (confirm('Are you sure you want to delete ALL training records? This cannot be undone.')) {
        localStorage.removeItem('xrayTrainingData');
        console.log('All training data cleared');
    }
};

// ============================================================================
// QUIZ FUNCTIONALITY
// ============================================================================

const quizAnswers = {
    q1: {
        correct: 'd',
        feedback: {
            a: 'Incorrect. 3.6 seconds is roughly the time to deliver a lethal dose (~500 rem), not the annual limit. Review Section 2.',
            b: 'Incorrect. Far too long — the primary beam is extremely intense. Review Section 2.',
            c: 'Incorrect. This is 10× too long. Review Section 2.',
            d: 'Correct! A typical 40 kV, 40 mA Cu tube can deliver ~5 rem in approximately 0.036 seconds at the exit port.'
        }
    },
    q2: {
        correct: 'a',
        feedback: {
            a: 'Correct! ANSI N43.2 requires a minimum of two independent interlocks.',
            b: 'Incorrect. A single interlock lacks redundancy. ANSI N43.2 requires at least two. Review Section 5.',
            c: 'Incorrect. More can help, but the minimum is two. Review Section 5.',
            d: 'Incorrect. Four exceeds the minimum. Review Section 5.'
        }
    },
    q3: {
        correct: 'c',
        feedback: {
            a: 'Incorrect. ALARA = As Low As Reasonably Achievable. Review Section 3.',
            b: 'Incorrect. Review Section 3.',
            c: 'Correct! ALARA means As Low As Reasonably Achievable.',
            d: 'Incorrect. ALARA is optimization, not merely meeting limits. Review Section 3.'
        }
    },
    q4: {
        correct: 'd',
        feedback: {
            a: 'Incorrect. Inverse square law — doubling distance → 1/4 intensity. Review Section 7.',
            b: 'Incorrect. That would be roughly tripling distance. Review Section 7.',
            c: 'Incorrect. That would be quadrupling distance. Review Section 7.',
            d: 'Correct! Doubling distance reduces intensity to 25%.'
        }
    },
    q5: {
        correct: 'a',
        feedback: {
            a: 'Correct! Extremity limit is typically 50 rem (500 mSv) per year.',
            b: 'Incorrect. 5 rem is the whole-body effective dose limit. Review Section 4.',
            c: 'Incorrect. 15 rem is typically the lens-of-eye limit. Review Section 4.',
            d: 'Incorrect. That exceeds the usual extremity limit. Review Section 4.'
        }
    },
    q6: {
        correct: 'c',
        feedback: {
            a: 'Incorrect. Direct damage is ~30%. Review Section 3.',
            b: 'Incorrect. Review Section 3.',
            c: 'Correct! Indirect free-radical damage is ~70%.',
            d: 'Incorrect. Review Section 3.'
        }
    },
    q7: {
        correct: 'a',
        feedback: {
            a: 'Correct! It is never acceptable to bypass or defeat safety interlocks.',
            b: 'Incorrect. Never bypass interlocks. Review Section 5.',
            c: 'Incorrect. Alignment must never require defeating interlocks. Review Sections 5–7.',
            d: 'Incorrect. Even with RSO present, operators must not defeat interlocks. Review Section 5.'
        }
    },
    q8: {
        correct: 'd',
        feedback: {
            a: 'Incorrect. 2 Gy is transient erythema. Review Section 3.',
            b: 'Incorrect. 10 Gy is dry desquamation. Review Section 3.',
            c: 'Incorrect. 15 Gy is moist desquamation. Review Section 3.',
            d: 'Correct! Main erythema threshold is about 6 Gy.'
        }
    },
    q9: {
        correct: 'a',
        feedback: {
            a: 'Correct! Functional interlock tests: quarterly (with daily visual checks).',
            b: 'Incorrect. Daily visual checks yes; functional tests are less frequent. Review Section 5.',
            c: 'Incorrect. Review Section 5.',
            d: 'Incorrect. Annual comprehensive inspections exist, but functional tests are quarterly. Review Section 5.'
        }
    },
    q10: {
        correct: 'd',
        feedback: {
            a: 'Incorrect. Enclosed systems should do far better. Review Section 3.',
            b: 'Incorrect. Even 100 mrem suggests investigation. Review Section 3.',
            c: 'Incorrect. That indicates a safety problem. Review Section 3.',
            d: 'Correct! Operator dose should be effectively zero (&lt;10 mrem/year).'
        }
    },
    q11: {
        correct: 'a',
        feedback: {
            a: 'Correct! Horiba XGT-7200 is the cabinet micro-XRF.',
            b: 'Incorrect. RAPID is single-crystal XRD. Review Section 2.',
            c: 'Incorrect. AXRD is powder XRD. Review Section 2.',
            d: 'Incorrect. This lab training covers enclosed systems, not handheld open-beam XRF. Review Section 2.'
        }
    },
    q12: {
        correct: 'c',
        feedback: {
            a: 'Incorrect. Logbook work is not the high-risk step. Review Sections 2 and 6.',
            b: 'Incorrect. Collection with enclosure closed is designed to be safe. Review Section 6.',
            c: 'Correct! Mounting and centering are the highest-risk moments on the RAPID.',
            d: 'Incorrect. Review Sections 2 and 6.'
        }
    },
    q13: {
        correct: 'd',
        feedback: {
            a: 'Incorrect. Never open the chamber during acquisition. Review Sections 2 and 6.',
            b: 'Incorrect. Interlocks must remain active. Review Section 5.',
            c: 'Incorrect. Dosimetry follows RSO requirements. Review Section 10.',
            d: 'Correct! Vacuum mode is for sample care; radiation rules still fully apply.'
        }
    },
    q14: {
        correct: 'c',
        feedback: {
            a: 'Incorrect. Status lights are critical safety indicators. Review Sections 2 and 5.',
            b: 'Incorrect. Review Section 6.',
            c: 'Correct! Use X-RAY ON / SHUTTER OPEN status before opening the enclosure.',
            d: 'Incorrect. Never defeat interlocks. Review Section 5.'
        }
    },
    q15: {
        correct: 'a',
        feedback: {
            a: 'Correct! Power down, restrict access, notify RSO, and document.',
            b: 'Incorrect. Stop immediately — do not finish the run. Review Section 9.',
            c: 'Incorrect. Never tape or defeat safety systems. Review Section 8.',
            d: 'Incorrect. A reboot is not an emergency response. Review Section 9.'
        }
    }
};

document.getElementById('submit-quiz-btn').addEventListener('click', () => {
    submitQuiz();
});

document.getElementById('retake-quiz-btn').addEventListener('click', () => {
    retakeQuiz();
});

function submitQuiz() {
    let score = 0;
    const totalQuestions = 15;
    let allAnswered = true;

    document.querySelectorAll('#quiz-questions .quiz-feedback').forEach((el) => {
        el.classList.add('hidden');
        el.innerHTML = '';
    });

    for (let i = 1; i <= totalQuestions; i++) {
        const questionName = `q${i}`;
        const selectedAnswer = document.querySelector(`input[name="${questionName}"]:checked`);

        if (!selectedAnswer) {
            allAnswered = false;
            continue;
        }

        const userAnswer = selectedAnswer.value;
        const correctAnswer = quizAnswers[questionName].correct;
        const feedbackDiv = document.querySelector(`#quiz-questions [data-question="${i}"] .quiz-feedback`);

        if (userAnswer === correctAnswer) {
            score++;
            feedbackDiv.innerHTML = `<div class="success-box">${quizAnswers[questionName].feedback[userAnswer]}</div>`;
        } else {
            feedbackDiv.innerHTML = `<div class="danger-box">${quizAnswers[questionName].feedback[userAnswer]}</div>`;
        }

        feedbackDiv.classList.remove('hidden');
    }

    if (!allAnswered) {
        alert('Please answer all questions before submitting.');
        return;
    }

    const percentage = (score / totalQuestions) * 100;
    const resultsDiv = document.getElementById('quiz-results');
    const scoreDiv = document.getElementById('quiz-score');
    const retakeBtn = document.getElementById('retake-quiz-btn');
    const submitBtn = document.getElementById('submit-quiz-btn');

    resultsDiv.classList.remove('hidden');

    if (percentage === 100) {
        scoreDiv.innerHTML = `
            <div class="success-box">
                <h4>Congratulations! You Passed!</h4>
                <p><strong>Score: ${score}/${totalQuestions} (${percentage}%)</strong></p>
                <p>You have successfully completed the X-Ray Operator Safety Training quiz. Click "Complete Training" below to receive your certificate.</p>
            </div>
        `;
        quizPassed = true;
        submitBtn.classList.add('hidden');
        retakeBtn.classList.add('hidden');
        completeBtn.classList.remove('hidden');
    } else {
        scoreDiv.innerHTML = `
            <div class="warning-box">
                <h4>Quiz Not Passed</h4>
                <p><strong>Score: ${score}/${totalQuestions} (${percentage}%)</strong></p>
                <p>You must score 100% to complete the training. Review the feedback above and try again.</p>
            </div>
        `;
        quizPassed = false;
        submitBtn.classList.add('hidden');
        retakeBtn.classList.remove('hidden');
        completeBtn.classList.add('hidden');
    }

    resultsDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function retakeQuiz() {
    document.querySelectorAll('#quiz-questions input[type="radio"]').forEach((input) => {
        input.checked = false;
    });

    document.querySelectorAll('#quiz-questions .quiz-feedback').forEach((el) => {
        el.classList.add('hidden');
        el.innerHTML = '';
    });

    document.getElementById('quiz-results').classList.add('hidden');
    document.getElementById('quiz-score').innerHTML = '';

    document.getElementById('submit-quiz-btn').classList.remove('hidden');
    document.getElementById('retake-quiz-btn').classList.add('hidden');

    quizPassed = false;

    document.getElementById('quiz-section').scrollIntoView({ behavior: 'smooth' });
}
