# Equivalence Class & Special Value Testing Documentation

**Student Name:** Talavadekar Anika Vinit  
**Student ID:** 124BTCS1036  
**Course:** DevSecOps Lab  
**Course Outcome:** CO5  
**Sustainable Development Goal:** UN SDG 4 — Quality Education  
**Microproject Topic:** Equivalence Class and Special Value Testing of an Online Examination System  

---

## 1. Testing Methodology Overview

Software testing is an integral practice in DevSecOps to validate input sanitization, functional stability, and data integrity before deployment into production environments. In alignment with **UN SDG 4 (Quality Education)**, assessment platforms must be robust, fair, and reliable against corrupted or edge-case student inputs.

### 1.1 Equivalence Class Partitioning (ECP)
Equivalence Partitioning is a black-box test design technique that divides the input domain of a software component into partitions of equivalent data from which test cases can be derived. An equivalence class consists of a set of valid or invalid states such that if one condition in a partition passes (or fails), all other conditions in that partition are expected to behave identically:
- **Valid Equivalence Classes (VEC):** Inputs that conform to application specifications and must be accepted.
- **Invalid Equivalence Classes (IEC):** Inputs that violate constraints and must be rejected with informative error messages.

### 1.2 Boundary Value Analysis (BVA)
Defects cluster disproportionately at the boundaries of input partitions rather than at the center. BVA tests the extremes:
- Exactly at the boundary ($Min$, $Max$)
- Immediately outside the boundary ($Min - 1$, $Max + 1$)
- Nominal typical values inside the boundary

### 1.3 Special Value Testing (SVT)
Special Value Testing probes edge-case conditions, exceptional inputs, and typical injection patterns:
- Null / undefined / missing parameters
- Empty strings (`""`) and whitespace-only sequences (`"   "`)
- Malformed syntax (missing delimiters, rogue characters)
- Script tags and SQL-like metacharacters (`<script>`, `' OR 1=1`)

---

## 2. Specification & Partition Boundaries

| Parameter / Field | Valid Range / Specification | Valid Equivalence Class (VEC) | Invalid Equivalence Class (IEC) | Boundary Values Evaluated |
| :--- | :--- | :--- | :--- | :--- |
| **Full Name** | 3–50 chars, alphabetic letters, single spaces, hyphens, apostrophes | VEC-NAME-1: Length 3–50, alphabetic | IEC-NAME-1: Length < 3<br>IEC-NAME-2: Length > 50<br>IEC-NAME-3: Contains numbers/symbols<br>IEC-NAME-4: Empty/whitespace | 2 (Min-1), 3 (Min), 50 (Max), 51 (Max+1) |
| **Email Address** | 1–100 chars, RFC 5322 compatible syntax (`user@domain.tld`) | VEC-EMAIL-1: Standard email syntax $\le 100$ chars | IEC-EMAIL-1: Missing `@`<br>IEC-EMAIL-2: Missing domain/TLD<br>IEC-EMAIL-3: Length > 100<br>IEC-EMAIL-4: Empty/whitespace | 100 chars (Max), 101 chars (Max+1) |
| **Student ID** | 6–15 alphanumeric chars (A–Z, 0–9) | VEC-ID-1: 6–15 alphanumeric chars | IEC-ID-1: Length < 6<br>IEC-ID-2: Length > 15<br>IEC-ID-3: Non-alphanumeric chars / spaces | 5 (Min-1), 6 (Min), 15 (Max), 16 (Max+1) |
| **Exam Submission** | All 6 questions answered | VEC-SUB-1: Exactly 6/6 questions selected | IEC-SUB-1: 0/6 answered (empty)<br>IEC-SUB-2: 1–5/6 answered (partial) | 0 answers, 3 answers, 6 answers |
| **Scoring Benchmark** | Passing threshold $\ge 60\%$ (4 out of 6 correct) | VEC-SCR-1: Score $\ge 60\%$ (PASS) | IEC-SCR-1: Score $< 60\%$ (NEEDS IMPROVEMENT) | 3/6 (50% - Fail), 4/6 (67% - Pass), 6/6 (100% - Pass) |

---

## 3. Systematic Test Cases Execution Matrix

All test cases listed below have been executed and verified using the automated Node.js test runner (`node --test tests/*.test.js`) and verified interactively via the portal interface.

| Test Case ID | Requirement / Field | Equivalence Class / Special Value | Test Input | Preconditions | Test Steps | Expected Result | Actual Result | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **TC-NAME-01** | Full Name | Valid Equivalence Class (VEC) | `"Anika Talavadekar"` | Registration form rendered | 1. Enter input<br>2. Trigger validation | Name accepted; `isValid: true`; no error message. | Accepted, `isValid: true`, error: `null`. | **PASS** |
| **TC-NAME-02** | Full Name | Valid Equivalence Class (Hyphens/Apostrophes) | `"Mary-Jane O'Connor"` | Registration form rendered | 1. Enter input<br>2. Trigger validation | Name accepted; `isValid: true`. | Accepted, `isValid: true`, error: `null`. | **PASS** |
| **TC-NAME-03** | Full Name | Boundary Value ($Min = 3$) | `"Ali"` | Registration form rendered | 1. Enter input<br>2. Trigger validation | Name accepted; length = 3 meets minimum requirement. | Accepted, `isValid: true`, error: `null`. | **PASS** |
| **TC-NAME-04** | Full Name | Boundary Value ($Min - 1 = 2$) | `"Al"` | Registration form rendered | 1. Enter input<br>2. Trigger validation | Rejected; error: "Full name must be at least 3 characters long." | Rejected; exact expected error returned. | **PASS** |
| **TC-NAME-05** | Full Name | Boundary Value ($Max = 50$) | `"A"` repeated 50 times | Registration form rendered | 1. Enter input<br>2. Trigger validation | Name accepted; length = 50 meets maximum boundary. | Accepted, `isValid: true`, error: `null`. | **PASS** |
| **TC-NAME-06** | Full Name | Boundary Value ($Max + 1 = 51$) | `"A"` repeated 51 times | Registration form rendered | 1. Enter input<br>2. Trigger validation | Rejected; error: "Full name cannot exceed 50 characters." | Rejected; exact expected error returned. | **PASS** |
| **TC-NAME-07** | Full Name | Special Value (Empty String) | `""` | Registration form rendered | 1. Leave input empty<br>2. Submit form | Rejected; error: "Full name cannot be empty or whitespace only." | Rejected; validation flag set to invalid. | **PASS** |
| **TC-NAME-08** | Full Name | Special Value (Whitespace-only) | `"     "` | Registration form rendered | 1. Enter 5 spaces<br>2. Submit form | Rejected; trimmed length = 0; error displayed. | Rejected; whitespace trimmed and rejected. | **PASS** |
| **TC-NAME-09** | Full Name | Special Value (Null / Undefined) | `null`, `undefined` | Registration form rendered | 1. Pass null/undefined to validator | Graceful rejection without throwing uncaught runtime exceptions. | Handled safely; returned `isValid: false`. | **PASS** |
| **TC-NAME-10** | Full Name | Special Value (Numeric & Script Injection) | `"John123"`, `"Robert<script>"` | Registration form rendered | 1. Enter numeric/symbolic input<br>2. Trigger validation | Rejected; error: "Full name can only contain letters, spaces, hyphens, and apostrophes". | Rejected; sanitized and blocked. | **PASS** |
| **TC-EMAIL-01** | Email Address | Valid Equivalence Class (VEC) | `"anika.talavadekar24@sakec.ac.in"` | Registration form rendered | 1. Enter valid email<br>2. Trigger validation | Email accepted; lowercase normalized. | Accepted, `isValid: true`, normalized. | **PASS** |
| **TC-EMAIL-02** | Email Address | Invalid Equivalence Class (Missing `@`) | `"anika.talavadekar.sakec.ac.in"` | Registration form rendered | 1. Enter email without `@`<br>2. Trigger validation | Rejected; error: "Please enter a valid email address". | Rejected; validation flag set to invalid. | **PASS** |
| **TC-EMAIL-03** | Email Address | Invalid Equivalence Class (Missing Domain/TLD) | `"student@"` | Registration form rendered | 1. Enter partial email<br>2. Trigger validation | Rejected; error: "Please enter a valid email address". | Rejected; validation flag set to invalid. | **PASS** |
| **TC-EMAIL-04** | Email Address | Special Value (Empty & Whitespace) | `"   "` | Registration form rendered | 1. Enter whitespace<br>2. Trigger validation | Rejected; error: "Email address cannot be empty." | Rejected; empty state identified. | **PASS** |
| **TC-EMAIL-05** | Email Address | Boundary Value ($Max + 1 > 100$) | 90 chars + `"@example.com"` (102 chars) | Registration form rendered | 1. Enter 102 chars email<br>2. Trigger validation | Rejected; error: "Email address cannot exceed 100 characters." | Rejected; length restriction enforced. | **PASS** |
| **TC-ID-01** | Student ID | Valid Equivalence Class (Alphanumeric) | `"124BTCS1036"` | Registration form rendered | 1. Enter valid college ID<br>2. Trigger validation | Accepted; uppercase normalized; `isValid: true`. | Accepted, `isValid: true`, value: `"124BTCS1036"`. | **PASS** |
| **TC-ID-02** | Student ID | Boundary Value ($Min = 6$) | `"AB1234"` | Registration form rendered | 1. Enter 6-char ID<br>2. Trigger validation | Accepted; length = 6 satisfies minimum boundary. | Accepted, `isValid: true`. | **PASS** |
| **TC-ID-03** | Student ID | Boundary Value ($Min - 1 = 5$) | `"AB123"` | Registration form rendered | 1. Enter 5-char ID<br>2. Trigger validation | Rejected; error: "Student ID must be at least 6 characters long." | Rejected; boundary error triggered. | **PASS** |
| **TC-ID-04** | Student ID | Boundary Value ($Max = 15$) | `"1234567890ABCDE"` | Registration form rendered | 1. Enter 15-char ID<br>2. Trigger validation | Accepted; length = 15 satisfies maximum boundary. | Accepted, `isValid: true`. | **PASS** |
| **TC-ID-05** | Student ID | Boundary Value ($Max + 1 = 16$) | `"1234567890ABCDEF"` | Registration form rendered | 1. Enter 16-char ID<br>2. Trigger validation | Rejected; error: "Student ID cannot exceed 15 characters." | Rejected; boundary error triggered. | **PASS** |
| **TC-ID-06** | Student ID | Invalid Equivalence Class (Special Characters) | `"124#BTCS!1036"` | Registration form rendered | 1. Enter ID with `#` and `!`<br>2. Trigger validation | Rejected; error: "Student ID must contain only alphanumeric characters". | Rejected; special characters blocked. | **PASS** |
| **TC-ID-07** | Student ID | Special Value (Internal Whitespace) | `"124 BTCS"` | Registration form rendered | 1. Enter ID with space<br>2. Trigger validation | Rejected; spaces are non-alphanumeric. | Rejected; space violation caught. | **PASS** |
| **TC-SUBMIT-01**| Exam Submission | Invalid Equivalence Class (Empty Submission) | `{}` (0 answered) | Candidate on exam view | 1. Do not answer questions<br>2. Click Submit | Submission blocked; banner displays missing questions: 1, 2, 3, 4, 5, 6; scroll to Q1. | Submission blocked; all 6 marked missing; banner alerted. | **PASS** |
| **TC-SUBMIT-02**| Exam Submission | Invalid Equivalence Class (Partial Submission) | `{ 0: 1, 1: 1, 2: 2 }` (3/6 answered) | Candidate on exam view | 1. Answer Q1, Q2, Q3<br>2. Leave Q4, Q5, Q6 empty<br>3. Click Submit | Submission blocked; banner alerts: "Unanswered question(s): 4, 5, 6"; scroll to Q4. | Submission blocked; missing list [4, 5, 6] identified. | **PASS** |
| **TC-SUBMIT-03**| Exam Submission | Valid Equivalence Class (Complete Submission) | All 6 questions answered | Candidate on exam view | 1. Select answer for all 6 questions<br>2. Click Submit | Submission accepted; score calculated; transition to Results view. | Accepted; transitions smoothly to results. | **PASS** |
| **TC-SUBMIT-04**| Exam Submission | Special Value (Null / Malformed State) | `null`, `undefined` | Candidate on exam view | 1. Submit invalid payload | Graceful rejection; error: "Invalid exam state or submission payload." | Rejected gracefully without uncaught exceptions. | **PASS** |
| **TC-SCORE-01** | Scoring Engine | Equivalence Class (100% Perfect Score) | All 6 correct options | Examination submitted | 1. Grade submission | Score = 6/6 (100%); Status = PASSED; all review cards green. | Correct: 6/6, 100%, `isPassed: true`. | **PASS** |
| **TC-SCORE-02** | Scoring Engine | Equivalence Class (0% Score) | All 6 incorrect options | Examination submitted | 1. Grade submission | Score = 0/6 (0%); Status = NEEDS IMPROVEMENT; all review cards red. | Correct: 0/6, 0%, `isPassed: false`. | **PASS** |
| **TC-SCORE-03** | Scoring Engine | Boundary Value (Passing Benchmark: 67%) | 4 correct, 2 incorrect | Examination submitted | 1. Grade submission | Score = 4/6 (67%); $\ge 60\%$ passing threshold; Status = PASSED. | Correct: 4/6, 67%, `isPassed: true`. | **PASS** |
| **TC-SCORE-04** | Scoring Engine | Boundary Value (Failing Benchmark: 50%) | 3 correct, 3 incorrect | Examination submitted | 1. Grade submission | Score = 3/6 (50%); $< 60\%$ passing threshold; Status = NEEDS IMPROVEMENT. | Correct: 3/6, 50%, `isPassed: false`. | **PASS** |
| **TC-RESTART-01**| Exam Lifecycle | Retake Examination (Same Candidate) | Click "Retake Examination" | Results view displayed | 1. Click Retake button | Resets answer state; preserves candidate info; opens exam at Q1. | State reset; candidate preserved; exam reopened. | **PASS** |
| **TC-RESTART-02**| Exam Lifecycle | Register New Candidate | Click "Register New Candidate" | Results view displayed | 1. Click New Candidate button | Resets all state and form inputs; clears errors; opens registration view. | Full state cleared; registration view focused. | **PASS** |

---

## 4. Execution Evidence & Verification Summary

- **Total Test Cases Defined:** 31
- **Total Test Cases Executed:** 31
- **Passed:** 31
- **Failed:** 0
- **Test Framework:** Node.js Built-in Test Runner (`node:test`, `node:assert/strict`)
- **Execution Command:** `node --test tests/validator.test.js tests/exam.test.js`
- **Duration:** 135.59 ms
- **Automated Verification Status:** Verified on Node.js v24.16.0 (Windows 11)

---

## 5. Security Limitations & DevSecOps Shift-Left Context

> [!IMPORTANT]
> **Client-Side Validation Security Advisory:**  
> The equivalence class validation rules in this prototype run within the client's web browser JavaScript engine (`src/js/validator.js`). In a production DevSecOps environment:
> 1. Client-side validation is solely an **accessibility and user experience (UX) enhancement**, offering immediate feedback.
> 2. An adversarial student can bypass client-side checks completely by:
>    - Disabling JavaScript in browser settings.
>    - Intercepting and altering network payloads using developer tools or web proxies (OWASP ZAP, Burp Suite).
>    - Issuing direct HTTP POST requests with manipulated answers directly to API endpoints.
> 3. **DevSecOps Countermeasure:** In subsequent CIAP microproject phases, server-side validation, secure HTTP-only JWT session authentication, server-managed timer tokens, and tamper-evident database persistence will be integrated into the automated CI/CD pipeline.
