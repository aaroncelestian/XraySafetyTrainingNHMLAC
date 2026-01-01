// Training state management
let currentSection = 1;
const totalSections = 11; // 10 training sections + 1 quiz section
let userEmail = '';
let startTime = null;
let quizPassed = false;

// DOM elements
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

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    totalSectionsSpan.textContent = totalSections;
    loadTrainingData();
});

// Handle login form submission
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    userEmail = document.getElementById('user-email').value;
    startTime = new Date();
    
    loginSection.classList.add('hidden');
    trainingContent.classList.remove('hidden');
    
    showSection(1);
});

// Navigation handlers
prevBtn.addEventListener('click', () => {
    if (currentSection > 1) {
        currentSection--;
        showSection(currentSection);
    }
});

nextBtn.addEventListener('click', () => {
    if (currentSection < totalSections) {
        currentSection++;
        showSection(currentSection);
    }
});

completeBtn.addEventListener('click', () => {
    completeTraining();
});

// Show specific section
function showSection(sectionNum) {
    // Hide all sections
    for (let i = 1; i <= 10; i++) {
        document.getElementById(`section-${i}`).classList.add('hidden');
    }
    document.getElementById('quiz-section').classList.add('hidden');
    
    // Show current section
    if (sectionNum === 11) {
        document.getElementById('quiz-section').classList.remove('hidden');
    } else {
        document.getElementById(`section-${sectionNum}`).classList.remove('hidden');
    }
    
    // Update progress
    currentSectionSpan.textContent = sectionNum;
    const progressPercent = (sectionNum / totalSections) * 100;
    progressFill.style.width = progressPercent + '%';
    
    // Update navigation buttons
    if (sectionNum === 1) {
        prevBtn.classList.add('hidden');
    } else {
        prevBtn.classList.remove('hidden');
    }
    
    if (sectionNum === totalSections) {
        nextBtn.classList.add('hidden');
        // Only show complete button if quiz is passed
        if (quizPassed) {
            completeBtn.classList.remove('hidden');
        } else {
            completeBtn.classList.add('hidden');
        }
    } else {
        nextBtn.classList.remove('hidden');
        completeBtn.classList.add('hidden');
    }
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Complete training and save data
function completeTraining() {
    const completionDate = new Date();
    const nextTrainingDate = new Date(completionDate);
    nextTrainingDate.setFullYear(nextTrainingDate.getFullYear() + 2);
    
    const trainingRecord = {
        email: userEmail,
        completionDate: completionDate.toISOString(),
        nextTrainingDue: nextTrainingDate.toISOString(),
        startTime: startTime.toISOString(),
        duration: Math.round((completionDate - startTime) / 1000 / 60) // minutes
    };
    
    // Save to localStorage (simulating server storage)
    saveTrainingRecord(trainingRecord);
    
    // Show completion screen
    trainingContent.classList.add('hidden');
    completionSection.classList.remove('hidden');
    
    document.getElementById('completion-email').textContent = userEmail;
    document.getElementById('completion-date').textContent = formatDate(completionDate);
    document.getElementById('next-training-date').textContent = formatDate(nextTrainingDate);
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Save training record to localStorage and generate JSON file
function saveTrainingRecord(record) {
    let trainingData = JSON.parse(localStorage.getItem('xrayTrainingData') || '[]');
    trainingData.push(record);
    localStorage.setItem('xrayTrainingData', JSON.stringify(trainingData));
    
    // Also trigger download of updated JSON file
    generateJSONFile(trainingData);
}

// Load existing training data
function loadTrainingData() {
    const data = JSON.parse(localStorage.getItem('xrayTrainingData') || '[]');
    console.log('Loaded training records:', data.length);
}

// Generate and download JSON file
function generateJSONFile(data) {
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    // Store the URL for download button
    window.trainingDataURL = url;
}

// Download certificate/completion record
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

// Utility function to format date
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

// Utility function to format date for filename
function formatDateForFilename(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// Admin function to view all training records (accessible via browser console)
window.viewAllTrainingRecords = function() {
    const data = JSON.parse(localStorage.getItem('xrayTrainingData') || '[]');
    console.table(data);
    return data;
};

// Admin function to download all training records (accessible via browser console)
window.downloadAllRecords = function() {
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

// Admin function to find users needing refresher training
window.findUsersNeedingRefresher = function() {
    const data = JSON.parse(localStorage.getItem('xrayTrainingData') || '[]');
    const now = new Date();
    
    const needsRefresher = data.filter(record => {
        const nextDue = new Date(record.nextTrainingDue);
        return nextDue <= now;
    });
    
    console.log(`${needsRefresher.length} users need refresher training:`);
    console.table(needsRefresher);
    
    return needsRefresher;
};

// Admin function to clear all training data (use with caution)
window.clearAllTrainingData = function() {
    if (confirm('Are you sure you want to delete ALL training records? This cannot be undone.')) {
        localStorage.removeItem('xrayTrainingData');
        console.log('All training data cleared');
    }
};

// ============================================================================
// QUIZ FUNCTIONALITY
// ============================================================================

// Quiz answers and feedback
const quizAnswers = {
    q1: {
        correct: 'b',
        feedback: {
            a: 'Incorrect. 3.6 seconds is the time to deliver a lethal dose (500 rem), not the annual limit. Review Section 2 on dose rate characteristics.',
            b: 'Correct! A typical 40 kV, 40 mA Cu tube delivers the annual occupational limit (5 rem) in approximately 0.036 seconds.',
            c: 'Incorrect. This is far too long. The primary beam is extremely intense. Review Section 2 on quantitative hazard assessment.',
            d: 'Incorrect. This is 10 times too long. Review Section 2 on dose rate characteristics for the correct calculation.'
        }
    },
    q2: {
        correct: 'b',
        feedback: {
            a: 'Incorrect. A single interlock does not provide adequate redundancy. ANSI N43.2 requires at least TWO independent interlocks. Review Section 5.',
            b: 'Correct! ANSI N43.2 requires a minimum of TWO independent interlocks for personnel safety to ensure redundancy.',
            c: 'Incorrect. While more interlocks provide additional safety, the minimum requirement is two. Review Section 5 on interlock requirements.',
            d: 'Incorrect. Four interlocks exceed the minimum requirement. Review Section 5 on ANSI N43.2 standards.'
        }
    },
    q3: {
        correct: 'b',
        feedback: {
            a: 'Incorrect. ALARA stands for "As Low As Reasonably Achievable." Review Section 3 on the ALARA principle.',
            b: 'Correct! ALARA stands for "As Low As Reasonably Achievable" - a fundamental principle of radiation protection.',
            c: 'Incorrect. This is not the correct acronym. Review Section 3 on radiation protection principles.',
            d: 'Incorrect. ALARA is about optimization, not just meeting limits. Review Section 3 on the ALARA principle.'
        }
    },
    q4: {
        correct: 'b',
        feedback: {
            a: 'Incorrect. This would be true for linear attenuation, but radiation follows the inverse square law. Review Section 7 on the distance principle.',
            b: 'Correct! According to the inverse square law, doubling the distance reduces intensity to 1/4 (25%). The formula is I(r) = I₀ × (r₀/r)².',
            c: 'Incorrect. This would be the result of tripling the distance, not doubling. Review Section 7 on inverse square law calculations.',
            d: 'Incorrect. This would be the result of quadrupling the distance. Review Section 7 on the inverse square law.'
        }
    },
    q5: {
        correct: 'c',
        feedback: {
            a: 'Incorrect. 5 rem is the annual limit for total effective dose (whole body), not extremities. Review Section 4 on dose limits.',
            b: 'Incorrect. 15 rem is the annual limit for the lens of the eye. Review Section 4 on DOE 10 CFR 835 dose limits.',
            c: 'Correct! The annual occupational dose limit for extremities (hands and feet) is 50 rem (500 mSv) according to DOE 10 CFR 835.',
            d: 'Incorrect. This exceeds the regulatory limit. Review Section 4 on dose limits for different body parts.'
        }
    },
    q6: {
        correct: 'b',
        feedback: {
            a: 'Incorrect. Direct DNA damage accounts for only about 30% of total damage. Review Section 3 on mechanisms of radiation damage.',
            b: 'Correct! Indirect damage from free radicals (formed by water radiolysis) accounts for approximately 70% of total biological damage from X-rays.',
            c: 'Incorrect. While protein damage occurs, it is not the primary mechanism. Review Section 3 on direct vs. indirect damage.',
            d: 'Incorrect. Cell membrane disruption is not the primary damage mechanism. Review Section 3 on radiation damage mechanisms.'
        }
    },
    q7: {
        correct: 'd',
        feedback: {
            a: 'Incorrect. Bypassing interlocks is NEVER acceptable, even during maintenance. Review Section 5 on the critical importance of interlocks.',
            b: 'Incorrect. Proper alignment procedures should never require defeating interlocks. Review Section 5 and Section 7 on alignment safety.',
            c: 'Incorrect. Even with RSO supervision, bypassing interlocks is strictly prohibited. Review Section 5 on interlock requirements.',
            d: 'Correct! It is NEVER acceptable to bypass or defeat safety interlocks under any circumstances. This is a critical safety rule.'
        }
    },
    q8: {
        correct: 'b',
        feedback: {
            a: 'Incorrect. 2 Gy is the threshold for transient erythema, not main erythema. Review Section 3 on deterministic effects.',
            b: 'Correct! The threshold dose for main erythema (skin reddening) is 6 Gy (600 rad), typically appearing 7-14 days after exposure.',
            c: 'Incorrect. 10 Gy is the threshold for dry desquamation, which is more severe than erythema. Review Section 3 on skin effects.',
            d: 'Incorrect. 15 Gy is the threshold for moist desquamation. Review Section 3 on acute dose thresholds for skin.'
        }
    },
    q9: {
        correct: 'c',
        feedback: {
            a: 'Incorrect. Daily visual inspections are recommended, but functional tests are performed less frequently. Review Section 5 on interlock testing.',
            b: 'Incorrect. Weekly testing is not the standard frequency. Review Section 5 on interlock testing protocol.',
            c: 'Correct! Interlock functional tests should be performed quarterly according to best practices, with daily visual inspections.',
            d: 'Incorrect. Annual testing is too infrequent for functional tests, though comprehensive inspections are done annually. Review Section 5.'
        }
    },
    q10: {
        correct: 'c',
        feedback: {
            a: 'Incorrect. While less than 1 rem is good, properly functioning systems should achieve much lower doses. Review Section 3 on ALARA.',
            b: 'Incorrect. Even 100 mrem suggests potential issues with a properly enclosed system. Review Section 3 on expected operator doses.',
            c: 'Correct! For properly functioning, enclosed XRD/XRF systems, operator doses should be effectively zero (less than 10 mrem/year). Any measurable dose indicates potential safety system degradation.',
            d: 'Incorrect. This level of dose indicates a problem with the safety systems. Review Section 3 on expected doses from enclosed systems.'
        }
    }
};

// Submit quiz button handler
document.getElementById('submit-quiz-btn').addEventListener('click', () => {
    submitQuiz();
});

// Retake quiz button handler
document.getElementById('retake-quiz-btn').addEventListener('click', () => {
    retakeQuiz();
});

// Submit and grade quiz
function submitQuiz() {
    let score = 0;
    let totalQuestions = 10;
    let allAnswered = true;
    
    // Clear previous feedback
    document.querySelectorAll('.quiz-feedback').forEach(el => {
        el.classList.add('hidden');
        el.innerHTML = '';
    });
    
    // Check each question
    for (let i = 1; i <= totalQuestions; i++) {
        const questionName = `q${i}`;
        const selectedAnswer = document.querySelector(`input[name="${questionName}"]:checked`);
        
        if (!selectedAnswer) {
            allAnswered = false;
            continue;
        }
        
        const userAnswer = selectedAnswer.value;
        const correctAnswer = quizAnswers[questionName].correct;
        const feedbackDiv = document.querySelector(`[data-question="${i}"] .quiz-feedback`);
        
        if (userAnswer === correctAnswer) {
            score++;
            feedbackDiv.innerHTML = `<div class="success-box">${quizAnswers[questionName].feedback[userAnswer]}</div>`;
        } else {
            feedbackDiv.innerHTML = `<div class="danger-box">${quizAnswers[questionName].feedback[userAnswer]}</div>`;
        }
        
        feedbackDiv.classList.remove('hidden');
    }
    
    // Check if all questions answered
    if (!allAnswered) {
        alert('Please answer all questions before submitting.');
        return;
    }
    
    // Display results
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
                <p>You have successfully completed the X-Ray Safety Training quiz. Click "Complete Training" below to receive your certificate.</p>
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
                <p>You must score 100% to complete the training. Please review the feedback above for incorrect answers and try again.</p>
            </div>
        `;
        quizPassed = false;
        submitBtn.classList.add('hidden');
        retakeBtn.classList.remove('hidden');
        completeBtn.classList.add('hidden');
    }
    
    // Scroll to results
    resultsDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// Retake quiz - reset all answers and feedback
function retakeQuiz() {
    // Clear all radio button selections
    document.querySelectorAll('input[type="radio"]').forEach(input => {
        input.checked = false;
    });
    
    // Hide all feedback
    document.querySelectorAll('.quiz-feedback').forEach(el => {
        el.classList.add('hidden');
        el.innerHTML = '';
    });
    
    // Hide results
    document.getElementById('quiz-results').classList.add('hidden');
    document.getElementById('quiz-score').innerHTML = '';
    
    // Show submit button, hide retake button
    document.getElementById('submit-quiz-btn').classList.remove('hidden');
    document.getElementById('retake-quiz-btn').classList.add('hidden');
    
    // Reset quiz passed flag
    quizPassed = false;
    
    // Scroll to top of quiz
    document.getElementById('quiz-section').scrollIntoView({ behavior: 'smooth' });
}
