/**
 * JUnit XML Test Runner and Report Generator
 * Integrates Node.js built-in test runner with junit-report-builder
 * Generates Jenkins-compatible test-results/junit.xml without altering original tests
 */

const builder = require('junit-report-builder');
const path = require('node:path');
const fs = require('node:fs');
const { run } = require('node:test');
const { spec } = require('node:test/reporters');

async function runTestsAndGenerateReport() {
  const testResultsDir = path.resolve('test-results');
  if (!fs.existsSync(testResultsDir)) {
    fs.mkdirSync(testResultsDir, { recursive: true });
  }

  const files = [
    path.resolve('tests/validator.test.js'),
    path.resolve('tests/exam.test.js'),
    path.resolve('tests/http.test.js')
  ];

  const stream = run({ files });

  // Pipe human-readable output to terminal
  stream.compose(new spec()).pipe(process.stdout);

  const suiteMap = new Map();
  let currentSuiteName = 'Default Test Suite';
  let hasFailures = false;

  stream.on('test:start', (t) => {
    if (t.nesting === 0) {
      currentSuiteName = t.name;
    }
  });

  stream.on('test:pass', (t) => {
    if (t.nesting > 0) {
      let suite = suiteMap.get(currentSuiteName);
      if (!suite) {
        suite = builder.testSuite().name(currentSuiteName);
        suiteMap.set(currentSuiteName, suite);
      }
      suite.testCase()
        .className(currentSuiteName)
        .name(t.name)
        .time((t.details?.duration_ms || 0) / 1000);
    }
  });

  stream.on('test:fail', (t) => {
    hasFailures = true;
    if (t.nesting > 0) {
      let suite = suiteMap.get(currentSuiteName);
      if (!suite) {
        suite = builder.testSuite().name(currentSuiteName);
        suiteMap.set(currentSuiteName, suite);
      }
      const tc = suite.testCase()
        .className(currentSuiteName)
        .name(t.name)
        .time((t.details?.duration_ms || 0) / 1000);
      const errMsg = t.details?.error?.message || 'Test assertion failure';
      const stack = t.details?.error?.stack || errMsg;
      tc.failure(errMsg);
      tc.standardError(stack);
    }
  });

  await new Promise((resolve) => stream.on('end', resolve));

  const xmlPath = path.join(testResultsDir, 'junit.xml');
  builder.writeTo(xmlPath);
  console.log(`\n[JUnit Report] Report successfully generated at: ${xmlPath}`);

  if (hasFailures) {
    process.exit(1);
  }
}

runTestsAndGenerateReport().catch((err) => {
  console.error('Execution error generating JUnit test report:', err);
  process.exit(1);
});
