/**
 * DevSecOps Online Examination System - Input Validator & Business Logic
 * Student: Talavadekar Anika Vinit (124BTCS1036)
 * Topic: Equivalence Class and Special Value Testing
 */

const Validator = {
  /**
   * Validation boundary constants
   */
  BOUNDARIES: {
    NAME_MIN_LENGTH: 3,
    NAME_MAX_LENGTH: 50,
    EMAIL_MAX_LENGTH: 100,
    STUDENT_ID_MIN_LENGTH: 6,
    STUDENT_ID_MAX_LENGTH: 15,
    PASSING_PERCENTAGE: 60
  },

  /**
   * Validates Full Name
   * Equivalence classes:
   * - Valid: 3-50 chars, alphabetic letters with single spaces, hyphens, or apostrophes
   * - Invalid: null/undefined/non-string, empty string, whitespace only, length < 3, length > 50,
   *            contains numbers, contains special symbols/scripts
   * @param {any} name
   * @returns {{ isValid: boolean, error: string | null, value: string }}
   */
  validateFullName(name) {
    if (name === null || name === undefined || typeof name !== 'string') {
      return { isValid: false, error: 'Full name is required and must be text.', value: '' };
    }

    const trimmed = name.trim();

    if (trimmed.length === 0) {
      return { isValid: false, error: 'Full name cannot be empty or whitespace only.', value: '' };
    }

    if (trimmed.length < this.BOUNDARIES.NAME_MIN_LENGTH) {
      return {
        isValid: false,
        error: `Full name must be at least ${this.BOUNDARIES.NAME_MIN_LENGTH} characters long.`,
        value: trimmed
      };
    }

    if (trimmed.length > this.BOUNDARIES.NAME_MAX_LENGTH) {
      return {
        isValid: false,
        error: `Full name cannot exceed ${this.BOUNDARIES.NAME_MAX_LENGTH} characters.`,
        value: trimmed
      };
    }

    // Only letters (including accented), spaces, hyphens, and apostrophes allowed
    const nameRegex = /^[A-Za-zÀ-ÖØ-öø-ÿ]+(?:[' -][A-Za-zÀ-ÖØ-öø-ÿ]+)*$/;
    if (!nameRegex.test(trimmed)) {
      return {
        isValid: false,
        error: 'Full name can only contain letters, spaces, hyphens, and apostrophes (no numbers or special symbols).',
        value: trimmed
      };
    }

    return { isValid: true, error: null, value: trimmed };
  },

  /**
   * Validates Email Address
   * Equivalence classes:
   * - Valid: Valid email format (user@domain.tld), length <= 100 chars
   * - Invalid: null/undefined, empty, whitespace only, length > 100, missing @, missing domain, missing TLD, invalid characters
   * @param {any} email
   * @returns {{ isValid: boolean, error: string | null, value: string }}
   */
  validateEmail(email) {
    if (email === null || email === undefined || typeof email !== 'string') {
      return { isValid: false, error: 'Email address is required.', value: '' };
    }

    const trimmed = email.trim();

    if (trimmed.length === 0) {
      return { isValid: false, error: 'Email address cannot be empty.', value: '' };
    }

    if (trimmed.length > this.BOUNDARIES.EMAIL_MAX_LENGTH) {
      return {
        isValid: false,
        error: `Email address cannot exceed ${this.BOUNDARIES.EMAIL_MAX_LENGTH} characters.`,
        value: trimmed
      };
    }

    // Standard RFC 5322 compatible regex for email validation
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
    if (!emailRegex.test(trimmed)) {
      return {
        isValid: false,
        error: 'Please enter a valid email address (e.g., student@domain.edu).',
        value: trimmed
      };
    }

    return { isValid: true, error: null, value: trimmed.toLowerCase() };
  },

  /**
   * Validates Student ID
   * Equivalence classes:
   * - Valid: 6-15 alphanumeric characters (e.g., 124BTCS1036)
   * - Invalid: null/undefined, empty, whitespace only, length < 6, length > 15, contains spaces, contains special characters
   * @param {any} studentId
   * @returns {{ isValid: boolean, error: string | null, value: string }}
   */
  validateStudentID(studentId) {
    if (studentId === null || studentId === undefined || typeof studentId !== 'string') {
      return { isValid: false, error: 'Student ID is required.', value: '' };
    }

    const trimmed = studentId.trim();

    if (trimmed.length === 0) {
      return { isValid: false, error: 'Student ID cannot be empty or whitespace only.', value: '' };
    }

    if (trimmed.length < this.BOUNDARIES.STUDENT_ID_MIN_LENGTH) {
      return {
        isValid: false,
        error: `Student ID must be at least ${this.BOUNDARIES.STUDENT_ID_MIN_LENGTH} characters long.`,
        value: trimmed
      };
    }

    if (trimmed.length > this.BOUNDARIES.STUDENT_ID_MAX_LENGTH) {
      return {
        isValid: false,
        error: `Student ID cannot exceed ${this.BOUNDARIES.STUDENT_ID_MAX_LENGTH} characters.`,
        value: trimmed
      };
    }

    // Alphanumeric characters only
    const idRegex = /^[A-Za-z0-9]+$/;
    if (!idRegex.test(trimmed)) {
      return {
        isValid: false,
        error: 'Student ID must contain only alphanumeric characters (letters and numbers).',
        value: trimmed
      };
    }

    return { isValid: true, error: null, value: trimmed.toUpperCase() };
  },

  /**
   * Validates Complete Student Registration Form
   * @param {{ name: any, email: any, studentId: any }} formData
   * @returns {{ isValid: boolean, errors: { name: string|null, email: string|null, studentId: string|null }, values: { name: string, email: string, studentId: string } }}
   */
  validateRegistration(formData) {
    const nameResult = this.validateFullName(formData ? formData.name : undefined);
    const emailResult = this.validateEmail(formData ? formData.email : undefined);
    const idResult = this.validateStudentID(formData ? formData.studentId : undefined);

    const isValid = nameResult.isValid && emailResult.isValid && idResult.isValid;

    return {
      isValid,
      errors: {
        name: nameResult.error,
        email: emailResult.error,
        studentId: idResult.error
      },
      values: {
        name: nameResult.value,
        email: emailResult.value,
        studentId: idResult.value
      }
    };
  },

  /**
   * Validates Examination Answers Submission
   * Ensures every question has an answer selected before submission
   * @param {Object.<number, number>} answers - Map of question index to selected option index
   * @param {number} totalQuestions - Expected number of questions
   * @returns {{ isValid: boolean, missingQuestions: number[], error: string | null }}
   */
  validateExamSubmission(answers, totalQuestions) {
    if (!answers || typeof answers !== 'object' || typeof totalQuestions !== 'number' || totalQuestions <= 0) {
      return {
        isValid: false,
        missingQuestions: Array.from({ length: totalQuestions || 0 }, (_, i) => i + 1),
        error: 'Invalid exam state or submission payload.'
      };
    }

    const missing = [];
    for (let i = 0; i < totalQuestions; i++) {
      if (answers[i] === undefined || answers[i] === null || answers[i] === '') {
        missing.push(i + 1); // 1-based question number for student feedback
      }
    }

    if (missing.length > 0) {
      return {
        isValid: false,
        missingQuestions: missing,
        error: `Please answer all questions before submitting. Unanswered question(s): ${missing.join(', ')}.`
      };
    }

    return {
      isValid: true,
      missingQuestions: [],
      error: null
    };
  },

  /**
   * Calculates Examination Score and Review Details
   * @param {Object.<number, number>} userAnswers - Map of question index to selected option index
   * @param {Array<{ id: number, question: string, options: string[], correctOption: number, explanation: string }>} questions
   * @returns {{ totalQuestions: number, answeredCount: number, correctCount: number, incorrectCount: number, scorePercentage: number, isPassed: boolean, review: Array }}
   */
  calculateScore(userAnswers, questions) {
    if (!Array.isArray(questions) || questions.length === 0) {
      return {
        totalQuestions: 0,
        answeredCount: 0,
        correctCount: 0,
        incorrectCount: 0,
        scorePercentage: 0,
        isPassed: false,
        review: []
      };
    }

    const totalQuestions = questions.length;
    let correctCount = 0;
    let answeredCount = 0;

    const review = questions.map((q, index) => {
      const selectedOption = userAnswers && userAnswers[index] !== undefined ? userAnswers[index] : null;
      const hasAnswered = selectedOption !== null && selectedOption !== '';
      if (hasAnswered) answeredCount++;

      const isCorrect = hasAnswered && selectedOption === q.correctOption;
      if (isCorrect) correctCount++;

      return {
        questionNumber: index + 1,
        questionId: q.id,
        questionText: q.question,
        options: q.options,
        selectedOptionIndex: selectedOption,
        selectedOptionText: hasAnswered ? q.options[selectedOption] : 'Not Answered',
        correctOptionIndex: q.correctOption,
        correctOptionText: q.options[q.correctOption],
        isCorrect: isCorrect,
        explanation: q.explanation
      };
    });

    const incorrectCount = totalQuestions - correctCount;
    const scorePercentage = Math.round((correctCount / totalQuestions) * 100);
    const isPassed = scorePercentage >= this.BOUNDARIES.PASSING_PERCENTAGE;

    return {
      totalQuestions,
      answeredCount,
      correctCount,
      incorrectCount,
      scorePercentage,
      isPassed,
      passingBenchmark: this.BOUNDARIES.PASSING_PERCENTAGE,
      review
    };
  }
};

// Universal module export for browser & Node.js test environments
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Validator;
} else if (typeof window !== 'undefined') {
  window.Validator = Validator;
}
