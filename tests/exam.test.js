/**
 * Automated Unit Tests for Examination Submission, Scoring & Lifecycle
 * Built with Node.js built-in test runner (node:test)
 * Student: Talavadekar Anika Vinit (124BTCS1036)
 */

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const Validator = require('../src/js/validator.js');
const QuestionBank = require('../src/js/questions.js');

describe('Examination Submission Validation - Equivalence Classes', () => {
  const totalQuestions = QuestionBank.length; // 6 questions

  it('TC-SUBMIT-01: Empty examination submission (0 questions answered)', () => {
    const emptyAnswers = {};
    const res = Validator.validateExamSubmission(emptyAnswers, totalQuestions);
    assert.equal(res.isValid, false);
    assert.equal(res.missingQuestions.length, 6);
    assert.deepEqual(res.missingQuestions, [1, 2, 3, 4, 5, 6]);
    assert.match(res.error, /Please answer all questions before submitting/);
  });

  it('TC-SUBMIT-02: Partially completed examination (e.g. 3 of 6 answered)', () => {
    const partialAnswers = { 0: 1, 1: 1, 2: 2 }; // Questions 1, 2, 3 answered; 4, 5, 6 missing
    const res = Validator.validateExamSubmission(partialAnswers, totalQuestions);
    assert.equal(res.isValid, false);
    assert.equal(res.missingQuestions.length, 3);
    assert.deepEqual(res.missingQuestions, [4, 5, 6]);
    assert.match(res.error, /Unanswered question\(s\): 4, 5, 6/);
  });

  it('TC-SUBMIT-03: Fully completed examination (all 6 answered)', () => {
    const fullAnswers = { 0: 1, 1: 1, 2: 2, 3: 1, 4: 1, 5: 2 };
    const res = Validator.validateExamSubmission(fullAnswers, totalQuestions);
    assert.equal(res.isValid, true);
    assert.equal(res.missingQuestions.length, 0);
    assert.equal(res.error, null);
  });

  it('TC-SUBMIT-04: Special value - null, undefined, or invalid answers object', () => {
    const resNull = Validator.validateExamSubmission(null, totalQuestions);
    assert.equal(resNull.isValid, false);

    const resUndef = Validator.validateExamSubmission(undefined, totalQuestions);
    assert.equal(resUndef.isValid, false);
  });

  it('TC-SUBMIT-05: Boundary/Special value - Option index 0 is valid and counted as answered', () => {
    const zeroIndexedAnswers = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    const res = Validator.validateExamSubmission(zeroIndexedAnswers, totalQuestions);
    assert.equal(res.isValid, true);
    assert.equal(res.missingQuestions.length, 0);
    assert.equal(res.error, null);
  });

  it('TC-SUBMIT-06: Special value - Empty string or whitespace answers are flagged as missing', () => {
    const stringAnswers = { 0: 0, 1: '', 2: '   ', 3: 1, 4: 1, 5: 1 };
    const res = Validator.validateExamSubmission(stringAnswers, totalQuestions);
    assert.equal(res.isValid, false);
    assert.deepEqual(res.missingQuestions, [2, 3]);
    assert.match(res.error, /Unanswered question\(s\): 2, 3/);
  });
});

describe('Examination Scoring Logic - Equivalence Classes & Accuracy', () => {
  it('TC-SCORE-01: 100% Score - All answers correct', () => {
    // Correct answers: Q1:1, Q2:1, Q3:2, Q4:1, Q5:1, Q6:2
    const perfectAnswers = { 0: 1, 1: 1, 2: 2, 3: 1, 4: 1, 5: 2 };
    const score = Validator.calculateScore(perfectAnswers, QuestionBank);

    assert.equal(score.totalQuestions, 6);
    assert.equal(score.correctCount, 6);
    assert.equal(score.incorrectCount, 0);
    assert.equal(score.scorePercentage, 100);
    assert.equal(score.isPassed, true);
    assert.equal(score.review.every(r => r.isCorrect), true);
  });

  it('TC-SCORE-02: 0% Score - All answers incorrect', () => {
    // Incorrect choices
    const wrongAnswers = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    const score = Validator.calculateScore(wrongAnswers, QuestionBank);

    assert.equal(score.totalQuestions, 6);
    assert.equal(score.correctCount, 0);
    assert.equal(score.incorrectCount, 6);
    assert.equal(score.scorePercentage, 0);
    assert.equal(score.isPassed, false);
    assert.equal(score.review.every(r => !r.isCorrect), true);
  });

  it('TC-SCORE-03: Partial score - Exactly passing benchmark (4 of 6 = 67% >= 60%)', () => {
    // 4 correct (Q1, Q2, Q3, Q4) and 2 wrong (Q5, Q6)
    const passAnswers = { 0: 1, 1: 1, 2: 2, 3: 1, 4: 0, 5: 0 };
    const score = Validator.calculateScore(passAnswers, QuestionBank);

    assert.equal(score.correctCount, 4);
    assert.equal(score.incorrectCount, 2);
    assert.equal(score.scorePercentage, 67); // 4/6 = 66.67% rounded to 67%
    assert.equal(score.isPassed, true);
  });

  it('TC-SCORE-04: Partial score - Just below passing benchmark (3 of 6 = 50% < 60%)', () => {
    // 3 correct, 3 wrong
    const failAnswers = { 0: 1, 1: 1, 2: 2, 3: 0, 4: 0, 5: 0 };
    const score = Validator.calculateScore(failAnswers, QuestionBank);

    assert.equal(score.correctCount, 3);
    assert.equal(score.incorrectCount, 3);
    assert.equal(score.scorePercentage, 50);
    assert.equal(score.isPassed, false);
  });

  it('TC-SCORE-05: Review generation integrity (explanations and answer mappings)', () => {
    const mixedAnswers = { 0: 1, 1: 0 }; // Q1 correct, Q2 wrong
    const score = Validator.calculateScore(mixedAnswers, QuestionBank);

    const q1Review = score.review[0];
    assert.equal(q1Review.questionNumber, 1);
    assert.equal(q1Review.isCorrect, true);
    assert.equal(q1Review.selectedOptionText, QuestionBank[0].options[1]);
    assert.equal(typeof q1Review.explanation, 'string');

    const q2Review = score.review[1];
    assert.equal(q2Review.questionNumber, 2);
    assert.equal(q2Review.isCorrect, false);
    assert.equal(q2Review.selectedOptionText, QuestionBank[1].options[0]);
    assert.equal(q2Review.correctOptionText, QuestionBank[1].options[1]);
  });

  it('TC-SCORE-06: Boundary/Special value - Option index 0 is correctly recognized as answered and scored', () => {
    const mockQuestions = [
      { id: 101, question: 'Sample Q1', options: ['Alpha', 'Beta'], correctOption: 0, explanation: 'Alpha is correct' },
      { id: 102, question: 'Sample Q2', options: ['Gamma', 'Delta'], correctOption: 1, explanation: 'Delta is correct' }
    ];
    // Candidate chooses option 0 for Q1 (correct) and option 0 for Q2 (incorrect)
    const answers = { 0: 0, 1: 0 };
    const score = Validator.calculateScore(answers, mockQuestions);

    assert.equal(score.totalQuestions, 2);
    assert.equal(score.answeredCount, 2);
    assert.equal(score.correctCount, 1);
    assert.equal(score.incorrectCount, 1);
    assert.equal(score.scorePercentage, 50);

    assert.equal(score.review[0].isCorrect, true);
    assert.equal(score.review[0].selectedOptionIndex, 0);
    assert.equal(score.review[0].selectedOptionText, 'Alpha');

    assert.equal(score.review[1].isCorrect, false);
    assert.equal(score.review[1].selectedOptionIndex, 0);
    assert.equal(score.review[1].selectedOptionText, 'Gamma');
  });

  it('TC-SCORE-07: Special value - Empty string, whitespace, and null answers are marked Not Answered', () => {
    const mockQuestions = [
      { id: 101, question: 'Sample Q1', options: ['A', 'B'], correctOption: 0, explanation: 'Exp 1' },
      { id: 102, question: 'Sample Q2', options: ['C', 'D'], correctOption: 1, explanation: 'Exp 2' },
      { id: 103, question: 'Sample Q3', options: ['E', 'F'], correctOption: 0, explanation: 'Exp 3' }
    ];
    const answers = { 0: '', 1: '   ', 2: null };
    const score = Validator.calculateScore(answers, mockQuestions);

    assert.equal(score.answeredCount, 0);
    assert.equal(score.correctCount, 0);
    assert.equal(score.incorrectCount, 3);
    assert.equal(score.scorePercentage, 0);
    assert.equal(score.review[0].selectedOptionText, 'Not Answered');
    assert.equal(score.review[1].selectedOptionText, 'Not Answered');
    assert.equal(score.review[2].selectedOptionText, 'Not Answered');
  });
});
