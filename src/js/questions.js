/**
 * ExamFlow - Core Assessment Question Bank
 * Standardized assessment items and detailed explanations
 */

const QuestionBank = [
  {
    id: 1,
    question: "What is the primary objective of Equivalence Class Partitioning in black-box software testing?",
    options: [
      "To test every possible single input value across the entire infinite input space",
      "To divide the input domain into partitions where all members are assumed to be processed similarly, reducing redundant test cases",
      "To examine the internal source code paths and branches using debugger tools",
      "To measure network throughput and server latency under extreme concurrency"
    ],
    correctOption: 1,
    explanation: "Equivalence Class Partitioning (ECP) divides the input data into valid and invalid classes. Any value within a class is assumed to produce the same test outcome as another value in the same class, maximizing test coverage while minimizing redundant tests."
  },
  {
    id: 2,
    question: "In Boundary Value Analysis (BVA), for an input field accepting strings between 3 and 50 characters, which set of lengths represents boundary values?",
    options: [
      "10, 25, 30, and 45 characters",
      "2, 3, 50, and 51 characters",
      "0, 100, 500, and 1000 characters",
      "Only 3 and 50 characters, ignoring adjacent values"
    ],
    correctOption: 1,
    explanation: "Boundary Value Analysis tests values at the extreme ends of equivalence classes and immediately beyond them: just below minimum (2), minimum (3), maximum (50), and just above maximum (51)."
  },
  {
    id: 3,
    question: "What does the 'Shift-Left' paradigm represent in DevSecOps practices?",
    options: [
      "Postponing all security audits until after deployment to production",
      "Moving operations infrastructure exclusively to on-premise hardware",
      "Integrating automated security scans, quality tests, and compliance checks earlier into the developer workflow and CI pipeline",
      "Shifting development responsibility away from engineers directly to end-users"
    ],
    correctOption: 2,
    explanation: "'Shift-Left' means moving security, automated testing, and validation checks earlier into the software development lifecycle (SDLC) — from design and coding to automated CI builds — detecting vulnerabilities and defects before production deployment."
  },
  {
    id: 4,
    question: "Which of the following test scenarios represents 'Special Value Testing' for an online examination submission form?",
    options: [
      "Submitting typical names like 'Alice' or 'Bob'",
      "Submitting an input containing null bytes, empty strings, whitespace-only, extreme lengths, or script tag characters",
      "Choosing option B on every question in the examination",
      "Running the test suite on three different desktop monitors"
    ],
    correctOption: 1,
    explanation: "Special Value Testing focuses on inputs with unique characteristics or known vulnerability profiles such as empty strings, whitespace, null/undefined payloads, extreme data sizes, and special syntax characters (like script tags or SQL metacharacters)."
  },
  {
    id: 5,
    question: "Why can client-side validation alone NOT be relied upon for security in an online examination system?",
    options: [
      "Because client-side validation only works on Chrome browsers",
      "Because client-side code runs in the user's browser environment and can be disabled, bypassed, or tampered with via browser tools or direct HTTP requests",
      "Because JavaScript cannot validate text lengths or regular expressions",
      "Because client-side validation requires a paid third-party enterprise license"
    ],
    correctOption: 1,
    explanation: "Client-side validation provides immediate user feedback and improves UX, but an attacker or student can easily bypass it by modifying DOM elements, disabling JavaScript, or sending direct POST requests with curl/Postman. Server-side validation and secure session tokens are mandatory for security."
  },
  {
    id: 6,
    question: "How does robust automated testing support UN Sustainable Development Goal 4 (SDG 4: Quality Education) in digital learning platforms?",
    options: [
      "By charging higher registration fees for online certification exams",
      "By replacing all human instructors with automated grading scripts",
      "By ensuring educational portals are fair, reliable, accessible to diverse learners, and free from grading anomalies or system downtime",
      "By restricting online examination access only to high-speed fiber internet connections"
    ],
    correctOption: 2,
    explanation: "SDG 4 focuses on inclusive, equitable, and quality education. Automated testing ensures assessment platforms accurately score submissions, prevent data loss during exam submission, handle diverse inputs smoothly, and maintain platform accessibility for all learners."
  }
];

// Universal export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = QuestionBank;
} else if (typeof window !== 'undefined') {
  window.QuestionBank = QuestionBank;
}
