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
    1: { b: 'Correct — soft lab X-rays deposit energy efficiently in tissue.' },
    2: { c: 'Correct — the Horiba XGT-7200 is the cabinet micro-XRF.' },
    3: { b: 'Correct — about 70% of damage is indirect via free radicals.' },
    4: { c: 'Correct — extremity limit is typically 50 rem/year.' },
    5: { b: 'Correct — ANSI N43.2 requires at least two independent interlocks.' },
    6: { a: 'Correct — never open with X-rays generating; confirm safe state first.' },
    7: { b: 'Correct — inverse square law: double distance → 25% intensity.' },
    8: { b: 'Correct — treat as an emergency and notify the RSO.' },
    9: { c: 'Correct — capture who, instrument, time, settings, access state, duration, witnesses.' },
    10: { a: 'Correct — ANSI N43.2 covers XRD/XRF analysis equipment safety.' },
    11: { b: 'Correct — mounting and centering are the highest-risk moments on the RAPID.' }
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

function completeTraining() {
    const completionDate = new Date();
    const nextTrainingDate = new Date(completionDate);
    nextTrainingDate.setFullYear(nextTrainingDate.getFullYear() + 2);

    const trainingRecord = {
        email: userEmail,
        completionDate: completionDate.toISOString(),
        nextTrainingDue: nextTrainingDate.toISOString(),
        startTime: startTime.toISOString(),
        duration: Math.round((completionDate - startTime) / 1000 / 60),
        instruments: ['Rigaku R-AXIS RAPID', 'Proto AXRD', 'Horiba XGT-7200'],
        module: 'NHMLAC X-Ray Operator Safety Training'
    };

    saveTrainingRecord(trainingRecord);

    trainingContent.classList.add('hidden');
    completionSection.classList.remove('hidden');

    document.getElementById('completion-email').textContent = userEmail;
    document.getElementById('completion-date').textContent = formatDate(completionDate);
    document.getElementById('next-training-date').textContent = formatDate(nextTrainingDate);

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
});

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
        correct: 'b',
        feedback: {
            a: 'Incorrect. 3.6 seconds is roughly the time to deliver a lethal dose (~500 rem), not the annual limit. Review Section 2.',
            b: 'Correct! A typical 40 kV, 40 mA Cu tube can deliver ~5 rem in approximately 0.036 seconds at the exit port.',
            c: 'Incorrect. Far too long — the primary beam is extremely intense. Review Section 2.',
            d: 'Incorrect. This is 10× too long. Review Section 2.'
        }
    },
    q2: {
        correct: 'b',
        feedback: {
            a: 'Incorrect. A single interlock lacks redundancy. ANSI N43.2 requires at least two. Review Section 5.',
            b: 'Correct! ANSI N43.2 requires a minimum of two independent interlocks.',
            c: 'Incorrect. More can help, but the minimum is two. Review Section 5.',
            d: 'Incorrect. Four exceeds the minimum. Review Section 5.'
        }
    },
    q3: {
        correct: 'b',
        feedback: {
            a: 'Incorrect. ALARA = As Low As Reasonably Achievable. Review Section 3.',
            b: 'Correct! ALARA means As Low As Reasonably Achievable.',
            c: 'Incorrect. Review Section 3.',
            d: 'Incorrect. ALARA is optimization, not merely meeting limits. Review Section 3.'
        }
    },
    q4: {
        correct: 'b',
        feedback: {
            a: 'Incorrect. Inverse square law — doubling distance → 1/4 intensity. Review Section 7.',
            b: 'Correct! Doubling distance reduces intensity to 25%.',
            c: 'Incorrect. That would be roughly tripling distance. Review Section 7.',
            d: 'Incorrect. That would be quadrupling distance. Review Section 7.'
        }
    },
    q5: {
        correct: 'c',
        feedback: {
            a: 'Incorrect. 5 rem is the whole-body effective dose limit. Review Section 4.',
            b: 'Incorrect. 15 rem is typically the lens-of-eye limit. Review Section 4.',
            c: 'Correct! Extremity limit is typically 50 rem (500 mSv) per year.',
            d: 'Incorrect. That exceeds the usual extremity limit. Review Section 4.'
        }
    },
    q6: {
        correct: 'b',
        feedback: {
            a: 'Incorrect. Direct damage is ~30%. Review Section 3.',
            b: 'Correct! Indirect free-radical damage is ~70%.',
            c: 'Incorrect. Review Section 3.',
            d: 'Incorrect. Review Section 3.'
        }
    },
    q7: {
        correct: 'd',
        feedback: {
            a: 'Incorrect. Never bypass interlocks. Review Section 5.',
            b: 'Incorrect. Alignment must never require defeating interlocks. Review Sections 5–7.',
            c: 'Incorrect. Even with RSO present, operators must not defeat interlocks. Review Section 5.',
            d: 'Correct! It is never acceptable to bypass or defeat safety interlocks.'
        }
    },
    q8: {
        correct: 'b',
        feedback: {
            a: 'Incorrect. 2 Gy is transient erythema. Review Section 3.',
            b: 'Correct! Main erythema threshold is about 6 Gy.',
            c: 'Incorrect. 10 Gy is dry desquamation. Review Section 3.',
            d: 'Incorrect. 15 Gy is moist desquamation. Review Section 3.'
        }
    },
    q9: {
        correct: 'c',
        feedback: {
            a: 'Incorrect. Daily visual checks yes; functional tests are less frequent. Review Section 5.',
            b: 'Incorrect. Review Section 5.',
            c: 'Correct! Functional interlock tests: quarterly (with daily visual checks).',
            d: 'Incorrect. Annual comprehensive inspections exist, but functional tests are quarterly. Review Section 5.'
        }
    },
    q10: {
        correct: 'c',
        feedback: {
            a: 'Incorrect. Enclosed systems should do far better. Review Section 3.',
            b: 'Incorrect. Even 100 mrem suggests investigation. Review Section 3.',
            c: 'Correct! Operator dose should be effectively zero (&lt;10 mrem/year).',
            d: 'Incorrect. That indicates a safety problem. Review Section 3.'
        }
    },
    q11: {
        correct: 'c',
        feedback: {
            a: 'Incorrect. RAPID is single-crystal XRD. Review Section 2.',
            b: 'Incorrect. AXRD is powder XRD. Review Section 2.',
            c: 'Correct! Horiba XGT-7200 is the cabinet micro-XRF.',
            d: 'Incorrect. This lab training covers enclosed systems, not handheld open-beam XRF. Review Section 2.'
        }
    },
    q12: {
        correct: 'b',
        feedback: {
            a: 'Incorrect. Logbook work is not the high-risk step. Review Sections 2 and 6.',
            b: 'Correct! Mounting and centering are the highest-risk moments on the RAPID.',
            c: 'Incorrect. Collection with enclosure closed is designed to be safe. Review Section 6.',
            d: 'Incorrect. Review Sections 2 and 6.'
        }
    },
    q13: {
        correct: 'b',
        feedback: {
            a: 'Incorrect. Never open the chamber during acquisition. Review Sections 2 and 6.',
            b: 'Correct! Vacuum mode is for sample care; radiation rules still fully apply.',
            c: 'Incorrect. Interlocks must remain active. Review Section 5.',
            d: 'Incorrect. Dosimetry follows RSO requirements. Review Section 10.'
        }
    },
    q14: {
        correct: 'b',
        feedback: {
            a: 'Incorrect. Status lights are critical safety indicators. Review Sections 2 and 5.',
            b: 'Correct! Use X-RAY ON / SHUTTER OPEN status before opening the enclosure.',
            c: 'Incorrect. Review Section 6.',
            d: 'Incorrect. Never defeat interlocks. Review Section 5.'
        }
    },
    q15: {
        correct: 'b',
        feedback: {
            a: 'Incorrect. Stop immediately — do not finish the run. Review Section 9.',
            b: 'Correct! Power down, restrict access, notify RSO, and document.',
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
