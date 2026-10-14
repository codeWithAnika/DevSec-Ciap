/**
 * DevSecOps Online Examination Portal - Frontend Application Logic
 * Student: Talavadekar Anika Vinit (124BTCS1036)
 * Topic: Equivalence Class and Special Value Testing
 */

(function () {
  'use strict';

  // Application State
  const state = {
    step: 'registration', // 'registration' | 'examination' | 'results'
    student: {
      name: '',
      email: '',
      studentId: ''
    },
    userAnswers: {},
    startTime: null,
    endTime: null,
    scoreResult: null
  };

  // DOM Elements Cache
  const elements = {
    // Views
    registrationView: document.getElementById('registration-view'),
    examView: document.getElementById('exam-view'),
    resultsView: document.getElementById('results-view'),

    // Registration Form
    regForm: document.getElementById('registration-form'),
    fullNameInput: document.getElementById('full-name'),
    emailInput: document.getElementById('email-address'),
    studentIdInput: document.getElementById('student-id'),
    nameError: document.getElementById('full-name-error'),
    emailError: document.getElementById('email-error'),
    studentIdError: document.getElementById('student-id-error'),

    // Exam View Elements
    examStudentBadge: document.getElementById('exam-student-badge'),
    questionsContainer: document.getElementById('questions-container'),
    examProgressText: document.getElementById('exam-progress-text'),
    examProgressBar: document.getElementById('exam-progress-bar'),
    examAlertBanner: document.getElementById('exam-alert-banner'),
    examForm: document.getElementById('exam-form'),

    // Results Elements
    resultStudentBadge: document.getElementById('result-student-badge'),
    scoreBadge: document.getElementById('score-badge'),
    scorePercentage: document.getElementById('score-percentage'),
    scoreSummaryText: document.getElementById('score-summary-text'),
    scoreStatusPill: document.getElementById('score-status-pill'),
    timeTakenText: document.getElementById('time-taken-text'),
    detailedReviewContainer: document.getElementById('detailed-review-container'),
    btnRetake: document.getElementById('btn-retake-exam'),
    btnNewStudent: document.getElementById('btn-new-student')
  };

  /**
   * Initializes application listeners and view states
   */
  function init() {
    setupRegistrationListeners();
    setupExamListeners();
    setupResultsListeners();
    showView('registration');
  }

  /**
   * Switches visible view with accessibility focus management
   * @param {'registration'|'examination'|'results'} viewName
   */
  function showView(viewName) {
    state.step = viewName;

    elements.registrationView.classList.toggle('active', viewName === 'registration');
    elements.examView.classList.toggle('active', viewName === 'examination');
    elements.resultsView.classList.toggle('active', viewName === 'results');

    // Scroll to top of window on view change
    window.scrollTo({ top: 0, behavior: 'smooth' });

    if (viewName === 'registration') {
      elements.fullNameInput.focus();
    } else if (viewName === 'examination') {
      const firstRadio = elements.questionsContainer.querySelector('input[type="radio"]');
      if (firstRadio) firstRadio.focus();
    } else if (viewName === 'results') {
      elements.btnRetake.focus();
    }
  }

  /**
   * Real-time and blur input validation helper
   */
  function validateField(fieldName) {
    let result;
    if (fieldName === 'name') {
      result = Validator.validateFullName(elements.fullNameInput.value);
      setFieldError(elements.fullNameInput, elements.nameError, result.error);
    } else if (fieldName === 'email') {
      result = Validator.validateEmail(elements.emailInput.value);
      setFieldError(elements.emailInput, elements.emailError, result.error);
    } else if (fieldName === 'studentId') {
      result = Validator.validateStudentID(elements.studentIdInput.value);
      setFieldError(elements.studentIdInput, elements.studentIdError, result.error);
    }
    return result ? result.isValid : false;
  }

  function setFieldError(inputElement, errorElement, errorMessage) {
    if (errorMessage) {
      inputElement.classList.add('input-invalid');
      inputElement.classList.remove('input-valid');
      inputElement.setAttribute('aria-invalid', 'true');
      errorElement.textContent = errorMessage;
      errorElement.classList.add('visible');
    } else {
      inputElement.classList.remove('input-invalid');
      inputElement.classList.add('input-valid');
      inputElement.setAttribute('aria-invalid', 'false');
      errorElement.textContent = '';
      errorElement.classList.remove('visible');
    }
  }

  function clearFieldError(inputElement, errorElement) {
    inputElement.classList.remove('input-invalid', 'input-valid');
    inputElement.removeAttribute('aria-invalid');
    errorElement.textContent = '';
    errorElement.classList.remove('visible');
  }

  /**
   * Set up event listeners for Student Registration
   */
  function setupRegistrationListeners() {
    // Blur validation
    elements.fullNameInput.addEventListener('blur', () => validateField('name'));
    elements.emailInput.addEventListener('blur', () => validateField('email'));
    elements.studentIdInput.addEventListener('blur', () => validateField('studentId'));

    // Input clearing on typing when invalid
    elements.fullNameInput.addEventListener('input', () => {
      if (elements.fullNameInput.classList.contains('input-invalid')) {
        validateField('name');
      }
    });
    elements.emailInput.addEventListener('input', () => {
      if (elements.emailInput.classList.contains('input-invalid')) {
        validateField('email');
      }
    });
    elements.studentIdInput.addEventListener('input', () => {
      if (elements.studentIdInput.classList.contains('input-invalid')) {
        validateField('studentId');
      }
    });

    // Form submit
    elements.regForm.addEventListener('submit', function (e) {
      e.preventDefault();

      const formData = {
        name: elements.fullNameInput.value,
        email: elements.emailInput.value,
        studentId: elements.studentIdInput.value
      };

      const validation = Validator.validateRegistration(formData);

      setFieldError(elements.fullNameInput, elements.nameError, validation.errors.name);
      setFieldError(elements.emailInput, elements.emailError, validation.errors.email);
      setFieldError(elements.studentIdInput, elements.studentIdError, validation.errors.studentId);

      if (!validation.isValid) {
        // Focus first invalid field
        if (validation.errors.name) {
          elements.fullNameInput.focus();
        } else if (validation.errors.email) {
          elements.emailInput.focus();
        } else if (validation.errors.studentId) {
          elements.studentIdInput.focus();
        }
        return;
      }

      // Valid: store student state and proceed to exam
      state.student = {
        name: validation.values.name,
        email: validation.values.email,
        studentId: validation.values.studentId
      };
      state.userAnswers = {};
      state.startTime = new Date();

      startExamSession();
    });
  }

  /**
   * Starts examination view and renders question list
   */
  function startExamSession() {
    elements.examStudentBadge.textContent = `${state.student.name} (${state.student.studentId})`;
    elements.examAlertBanner.classList.remove('visible');
    elements.examAlertBanner.textContent = '';
    renderQuestions();
    updateExamProgress();
    showView('examination');
  }

  /**
   * Dynamically renders questions from QuestionBank
   */
  function renderQuestions() {
    elements.questionsContainer.innerHTML = '';

    QuestionBank.forEach((q, qIndex) => {
      const card = document.createElement('fieldset');
      card.className = 'question-card';
      card.id = `question-card-${qIndex}`;

      const legend = document.createElement('legend');
      legend.className = 'question-header';
      legend.innerHTML = `
        <span class="question-number">Question ${qIndex + 1} of ${QuestionBank.length}</span>
        <span class="question-point">1 Point</span>
      `;
      card.appendChild(legend);

      const questionText = document.createElement('p');
      questionText.className = 'question-text';
      questionText.textContent = q.question;
      card.appendChild(questionText);

      const optionsList = document.createElement('div');
      optionsList.className = 'options-group';
      optionsList.setAttribute('role', 'radiogroup');
      optionsList.setAttribute('aria-label', `Question ${qIndex + 1} answer options`);

      q.options.forEach((optText, optIndex) => {
        const optionId = `q${qIndex}_opt${optIndex}`;
        const optionLabel = document.createElement('label');
        optionLabel.className = 'option-label';
        optionLabel.setAttribute('for', optionId);

        const radioInput = document.createElement('input');
        radioInput.type = 'radio';
        radioInput.name = `question_${qIndex}`;
        radioInput.id = optionId;
        radioInput.value = optIndex;
        radioInput.checked = state.userAnswers[qIndex] === optIndex;

        radioInput.addEventListener('change', () => {
          handleOptionSelection(qIndex, optIndex, card);
        });

        const customRadio = document.createElement('span');
        customRadio.className = 'custom-radio';

        const textSpan = document.createElement('span');
        textSpan.className = 'option-text';
        textSpan.textContent = optText;

        optionLabel.appendChild(radioInput);
        optionLabel.appendChild(customRadio);
        optionLabel.appendChild(textSpan);
        optionsList.appendChild(optionLabel);
      });

      card.appendChild(optionsList);
      elements.questionsContainer.appendChild(card);
    });
  }

  /**
   * Handles question option selection
   */
  function handleOptionSelection(qIndex, optIndex, cardElement) {
    state.userAnswers[qIndex] = optIndex;
    cardElement.classList.remove('question-missing');
    updateExamProgress();

    // Check if alert banner was showing missing questions, clear if all answered
    const validation = Validator.validateExamSubmission(state.userAnswers, QuestionBank.length);
    if (validation.isValid) {
      elements.examAlertBanner.classList.remove('visible');
      elements.examAlertBanner.textContent = '';
    }
  }

  /**
   * Updates answer progress bar and text
   */
  function updateExamProgress() {
    const answered = Object.keys(state.userAnswers).length;
    const total = QuestionBank.length;
    const pct = Math.round((answered / total) * 100);

    elements.examProgressText.textContent = `Progress: ${answered} of ${total} answered (${pct}%)`;
    elements.examProgressBar.style.width = `${pct}%`;
    elements.examProgressBar.setAttribute('aria-valuenow', pct);
  }

  /**
   * Sets up examination submission listeners
   */
  function setupExamListeners() {
    elements.examForm.addEventListener('submit', function (e) {
      e.preventDefault();

      const validation = Validator.validateExamSubmission(state.userAnswers, QuestionBank.length);

      if (!validation.isValid) {
        // Highlight unanswered questions
        elements.examAlertBanner.textContent = validation.error;
        elements.examAlertBanner.classList.add('visible');

        validation.missingQuestions.forEach(qNum => {
          const card = document.getElementById(`question-card-${qNum - 1}`);
          if (card) {
            card.classList.add('question-missing');
          }
        });

        // Scroll to the first missing question
        if (validation.missingQuestions.length > 0) {
          const firstMissingIndex = validation.missingQuestions[0] - 1;
          const firstMissingCard = document.getElementById(`question-card-${firstMissingIndex}`);
          if (firstMissingCard) {
            firstMissingCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
            const firstRadio = firstMissingCard.querySelector('input[type="radio"]');
            if (firstRadio) firstRadio.focus();
          }
        }
        return;
      }

      // Valid: Calculate score and show results
      state.endTime = new Date();
      state.scoreResult = Validator.calculateScore(state.userAnswers, QuestionBank);
      displayResults();
    });
  }

  /**
   * Displays test results, score summary, and detailed review
   */
  function displayResults() {
    const res = state.scoreResult;
    const diffSeconds = Math.max(1, Math.round((state.endTime - state.startTime) / 1000));
    const minutes = Math.floor(diffSeconds / 60);
    const seconds = diffSeconds % 60;
    const timeFormatted = minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;

    // Student Badge
    elements.resultStudentBadge.innerHTML = `
      <strong>${escapeHtml(state.student.name)}</strong> (${escapeHtml(state.student.studentId)}) &bull; 
      <span>${escapeHtml(state.student.email)}</span>
    `;

    // Score Badge & Pill
    elements.scorePercentage.textContent = `${res.scorePercentage}%`;
    elements.scoreSummaryText.textContent = `You scored ${res.correctCount} out of ${res.totalQuestions} questions correctly.`;
    elements.timeTakenText.textContent = `Time elapsed: ${timeFormatted}`;

    if (res.isPassed) {
      elements.scoreStatusPill.textContent = 'PASSED';
      elements.scoreStatusPill.className = 'status-pill status-pass';
      elements.scoreBadge.className = 'score-card score-pass';
    } else {
      elements.scoreStatusPill.textContent = 'NEEDS IMPROVEMENT';
      elements.scoreStatusPill.className = 'status-pill status-fail';
      elements.scoreBadge.className = 'score-card score-fail';
    }

    // Detailed Review
    elements.detailedReviewContainer.innerHTML = '';
    res.review.forEach(item => {
      const reviewCard = document.createElement('div');
      reviewCard.className = `review-card ${item.isCorrect ? 'review-correct' : 'review-incorrect'}`;

      const statusTag = item.isCorrect
        ? '<span class="review-tag tag-correct">&#10004; Correct</span>'
        : '<span class="review-tag tag-incorrect">&#10008; Incorrect</span>';

      reviewCard.innerHTML = `
        <div class="review-header">
          <span class="review-number">Question ${item.questionNumber}</span>
          ${statusTag}
        </div>
        <p class="review-question-text">${escapeHtml(item.questionText)}</p>
        <div class="review-answers">
          <div class="user-answer ${item.isCorrect ? 'ans-correct' : 'ans-incorrect'}">
            <strong>Your Answer:</strong> ${escapeHtml(item.selectedOptionText)}
          </div>
          ${!item.isCorrect ? `
          <div class="correct-answer">
            <strong>Correct Answer:</strong> ${escapeHtml(item.correctOptionText)}
          </div>` : ''}
        </div>
        <div class="review-explanation">
          <strong>Explanation:</strong> ${escapeHtml(item.explanation)}
        </div>
      `;

      elements.detailedReviewContainer.appendChild(reviewCard);
    });

    showView('results');
  }

  /**
   * Sets up results restart / retake listeners
   */
  function setupResultsListeners() {
    // Retake exam with same student info
    elements.btnRetake.addEventListener('click', () => {
      state.userAnswers = {};
      state.startTime = new Date();
      state.endTime = null;
      state.scoreResult = null;
      startExamSession();
    });

    // New student attempt
    elements.btnNewStudent.addEventListener('click', () => {
      state.student = { name: '', email: '', studentId: '' };
      state.userAnswers = {};
      state.startTime = null;
      state.endTime = null;
      state.scoreResult = null;

      elements.regForm.reset();
      clearFieldError(elements.fullNameInput, elements.nameError);
      clearFieldError(elements.emailInput, elements.emailError);
      clearFieldError(elements.studentIdInput, elements.studentIdError);

      showView('registration');
    });
  }

  /**
   * Sanitizes string to prevent HTML injection in results view
   */
  function escapeHtml(str) {
    if (typeof str !== 'string') return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // Run on DOM load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
