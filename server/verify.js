import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { runAllVerificationSuites } from './testSuiteRunner.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Execute all 6 comprehensive verification suites
const report = await runAllVerificationSuites();

console.log('================================================================================');
console.log(' NEX STORE FULL-STACK AUTOMATED VERIFICATION & INTEGRATION TEST REPORT');
console.log('================================================================================');

for (const suite of report.suites) {
  console.log(`\n[${suite.status}] ${suite.title} (${suite.passedCount}/${suite.totalCount} passed • ${suite.durationMs}ms)`);
  for (const testCase of suite.cases) {
    const icon = testCase.status === 'PASSED' ? '  ✔' : '  ✖';
    console.log(`${icon} ${testCase.name} (${testCase.durationMs}ms)`);
    console.log(`      ↳ ${testCase.detail}`);
  }
}

// Verify PWA Assets, Animated Splash Screen, Favicon & Strict Anti-Piracy Copyright Notice
const publicDir = path.resolve(__dirname, '../public');
assert.ok(fs.existsSync(path.join(publicDir, 'manifest.json')), 'public/manifest.json must exist');
assert.ok(fs.existsSync(path.join(publicDir, 'sw.js')), 'public/sw.js must exist');
assert.ok(fs.existsSync(path.join(publicDir, 'favicon.svg')), 'public/favicon.svg must exist');
assert.ok(fs.existsSync(path.join(publicDir, 'splash-bg.svg')), 'public/splash-bg.svg must exist');

const indexHtml = fs.readFileSync(path.resolve(__dirname, '../index.html'), 'utf8');
assert.ok(indexHtml.includes('DO NOT SHARE, REDISTRIBUTE, OR PIRATE'), 'index.html must include anti-piracy notice');

assert.equal(report.totalFailed, 0, `Expected 0 failed tests, found ${report.totalFailed}`);

console.log('\n================================================================================');
console.log(
  `✅ ALL ${report.totalPassed}/${report.totalTests} VERIFICATION ASSERTIONS ACROSS ${report.totalSuites} SUITES PASSED (${report.durationMs}ms)`
);
console.log('================================================================================\n');
