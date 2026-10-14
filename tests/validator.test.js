/**
 * Automated Unit Tests for Validator: Equivalence Class & Special Value Testing
 * Built with Node.js built-in test runner (node:test)
 * Student: Talavadekar Anika Vinit (124BTCS1036)
 */

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const Validator = require('../src/js/validator.js');

describe('Full Name Validation - Equivalence Class & Boundary Value Testing', () => {
  // Valid Equivalence Class
  it('TC-NAME-01: Valid full name within standard boundaries (Anika Talavadekar)', () => {
    const res = Validator.validateFullName('Anika Talavadekar');
    assert.equal(res.isValid, true);
    assert.equal(res.error, null);
    assert.equal(res.value, 'Anika Talavadekar');
  });

  it('TC-NAME-02: Valid full name with allowed characters (hyphen and apostrophe: Mary-Jane O\'Connor)', () => {
    const res = Validator.validateFullName("Mary-Jane O'Connor");
    assert.equal(res.isValid, true);
    assert.equal(res.error, null);
  });

  // Boundary Values for Name (Min = 3, Max = 50)
  it('TC-NAME-03: Boundary value - Exactly minimum length (3 chars: "Ali")', () => {
    const res = Validator.validateFullName('Ali');
    assert.equal(res.isValid, true);
    assert.equal(res.error, null);
  });

  it('TC-NAME-04: Boundary value - Just below minimum length (2 chars: "Al")', () => {
    const res = Validator.validateFullName('Al');
    assert.equal(res.isValid, false);
    assert.match(res.error, /at least 3 characters/);
  });

  it('TC-NAME-05: Boundary value - Exactly maximum length (50 chars)', () => {
    const name50 = 'A'.repeat(50);
    const res = Validator.validateFullName(name50);
    assert.equal(res.isValid, true);
    assert.equal(res.error, null);
  });

  it('TC-NAME-06: Boundary value - Just above maximum length (51 chars)', () => {
    const name51 = 'A'.repeat(51);
    const res = Validator.validateFullName(name51);
    assert.equal(res.isValid, false);
    assert.match(res.error, /cannot exceed 50 characters/);
  });

  // Special Values for Name
  it('TC-NAME-07: Special value - Empty string', () => {
    const res = Validator.validateFullName('');
    assert.equal(res.isValid, false);
    assert.match(res.error, /cannot be empty/);
  });

  it('TC-NAME-08: Special value - Whitespace-only string ("   ")', () => {
    const res = Validator.validateFullName('     ');
    assert.equal(res.isValid, false);
    assert.match(res.error, /cannot be empty or whitespace/);
  });

  it('TC-NAME-09: Special value - Null and Undefined', () => {
    const resNull = Validator.validateFullName(null);
    assert.equal(resNull.isValid, false);
    const resUndef = Validator.validateFullName(undefined);
    assert.equal(resUndef.isValid, false);
  });

  it('TC-NAME-10: Special value - Numeric and symbol injections ("John123", "Robert<script>")', () => {
    const resNum = Validator.validateFullName('John123');
    assert.equal(resNum.isValid, false);
    assert.match(resNum.error, /can only contain letters/);

    const resScript = Validator.validateFullName('Robert<script>');
    assert.equal(resScript.isValid, false);
    assert.match(resScript.error, /can only contain letters/);
  });
});

describe('Email Address Validation - Equivalence Class & Boundary Value Testing', () => {
  it('TC-EMAIL-01: Valid standard email (anika.talavadekar24@sakec.ac.in)', () => {
    const res = Validator.validateEmail('anika.talavadekar24@sakec.ac.in');
    assert.equal(res.isValid, true);
    assert.equal(res.error, null);
    assert.equal(res.value, 'anika.talavadekar24@sakec.ac.in');
  });

  it('TC-EMAIL-02: Invalid equivalence class - Missing @ symbol', () => {
    const res = Validator.validateEmail('anika.talavadekar.sakec.ac.in');
    assert.equal(res.isValid, false);
    assert.match(res.error, /valid email address/);
  });

  it('TC-EMAIL-03: Invalid equivalence class - Missing domain / TLD (student@)', () => {
    const res = Validator.validateEmail('student@');
    assert.equal(res.isValid, false);
    assert.match(res.error, /valid email address/);
  });

  it('TC-EMAIL-04: Special value - Empty string and whitespace-only', () => {
    const res = Validator.validateEmail('   ');
    assert.equal(res.isValid, false);
    assert.match(res.error, /cannot be empty/);
  });

  it('TC-EMAIL-05: Boundary value - Exceeding maximum allowed length (101 chars)', () => {
    const longEmail = 'a'.repeat(90) + '@example.com'; // > 100 chars
    const res = Validator.validateEmail(longEmail);
    assert.equal(res.isValid, false);
    assert.match(res.error, /cannot exceed 100 characters/);
  });
});

describe('Student ID Validation - Equivalence Class & Boundary Value Testing', () => {
  it('TC-ID-01: Valid equivalence class - Standard alphanumeric ID (124BTCS1036)', () => {
    const res = Validator.validateStudentID('124BTCS1036');
    assert.equal(res.isValid, true);
    assert.equal(res.error, null);
    assert.equal(res.value, '124BTCS1036');
  });

  it('TC-ID-02: Boundary value - Exactly minimum length (6 chars: "AB1234")', () => {
    const res = Validator.validateStudentID('AB1234');
    assert.equal(res.isValid, true);
    assert.equal(res.value, 'AB1234');
  });

  it('TC-ID-03: Boundary value - Just below minimum length (5 chars: "AB123")', () => {
    const res = Validator.validateStudentID('AB123');
    assert.equal(res.isValid, false);
    assert.match(res.error, /at least 6 characters/);
  });

  it('TC-ID-04: Boundary value - Exactly maximum length (15 chars: "1234567890ABCDE")', () => {
    const res = Validator.validateStudentID('1234567890ABCDE');
    assert.equal(res.isValid, true);
    assert.equal(res.value, '1234567890ABCDE');
  });

  it('TC-ID-05: Boundary value - Just above maximum length (16 chars: "1234567890ABCDEF")', () => {
    const res = Validator.validateStudentID('1234567890ABCDEF');
    assert.equal(res.isValid, false);
    assert.match(res.error, /cannot exceed 15 characters/);
  });

  it('TC-ID-06: Invalid equivalence class - Special symbols (124#BTCS!1036)', () => {
    const res = Validator.validateStudentID('124#BTCS!1036');
    assert.equal(res.isValid, false);
    assert.match(res.error, /alphanumeric characters/);
  });

  it('TC-ID-07: Special value - Whitespace inside or empty ("124 BTCS")', () => {
    const res = Validator.validateStudentID('124 BTCS');
    assert.equal(res.isValid, false);
    assert.match(res.error, /alphanumeric characters/);
  });
});
