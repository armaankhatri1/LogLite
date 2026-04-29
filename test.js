/* ─── LogLite Test Suite (#27) ────────────────────────────────
 *
 * Lightweight test runner — no external test framework needed.
 * Run: node test.js
 * ──────────────────────────────────────────────────────────── */

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const parseLogs = require('./parser');
const { parseLine, groupRecurringIssues, detectSecurityPatterns } = parseLogs;

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    passed++;
    console.log(`  ✓ ${name}`);
  } catch (err) {
    failed++;
    console.log(`  ✗ ${name}`);
    console.log(`    ${err.message}`);
  }
}

// ─── parseLine: Console-format logs ──────────────────────────
console.log('\n▸ parseLine – console format');

test('parses INFO line', () => {
  const result = parseLine('INFO: User logged in');
  assert.strictEqual(result.severity, 'info');
  assert.strictEqual(result.message, 'User logged in');
});

test('parses WARN line', () => {
  const result = parseLine('WARN: Slow response detected');
  assert.strictEqual(result.severity, 'warn');
});

test('parses ERROR line', () => {
  const result = parseLine('ERROR: Database connection failed');
  assert.strictEqual(result.severity, 'error');
  assert.strictEqual(result.message, 'Database connection failed');
});

test('parses unknown line as unknown severity', () => {
  const result = parseLine('Something unexpected happened');
  assert.strictEqual(result.severity, 'unknown');
});

test('handles empty string gracefully', () => {
  const result = parseLine('');
  assert.strictEqual(result.severity, 'unknown');
});

// ─── parseLine: JSON-format logs (Winston) ───────────────────
console.log('\n▸ parseLine – JSON format');

test('parses JSON log with level and message', () => {
  const line = JSON.stringify({ level: 'error', message: 'DB timeout', timestamp: '2025-01-01T00:00:00Z' });
  const result = parseLine(line);
  assert.strictEqual(result.severity, 'error');
  assert.strictEqual(result.message, 'DB timeout');
  assert.strictEqual(result.timestamp, '2025-01-01T00:00:00Z');
});

test('normalizes "warning" to "warn"', () => {
  const line = JSON.stringify({ level: 'warning', message: 'Low disk' });
  const result = parseLine(line);
  assert.strictEqual(result.severity, 'warn');
});

test('normalizes "information" to "info"', () => {
  const line = JSON.stringify({ level: 'information', message: 'Started' });
  const result = parseLine(line);
  assert.strictEqual(result.severity, 'info');
});

// ─── groupRecurringIssues ────────────────────────────────────
console.log('\n▸ groupRecurringIssues');

test('groups repeated warnings', () => {
  const entries = [
    { severity: 'warn', message: 'Slow query', timestamp: null },
    { severity: 'warn', message: 'Slow query', timestamp: null },
    { severity: 'warn', message: 'Slow query', timestamp: null },
    { severity: 'info', message: 'OK', timestamp: null }
  ];
  const issues = groupRecurringIssues(entries);
  assert.strictEqual(issues.length, 1);
  assert.strictEqual(issues[0].count, 3);
  assert.strictEqual(issues[0].message, 'Slow query');
});

test('ignores info-level entries', () => {
  const entries = [
    { severity: 'info', message: 'Page loaded', timestamp: null },
    { severity: 'info', message: 'Page loaded', timestamp: null }
  ];
  const issues = groupRecurringIssues(entries);
  assert.strictEqual(issues.length, 0);
});

test('filters out non-recurring entries (count=1)', () => {
  const entries = [
    { severity: 'error', message: 'One-off failure', timestamp: null }
  ];
  const issues = groupRecurringIssues(entries);
  assert.strictEqual(issues.length, 0);
});

// ─── detectSecurityPatterns ──────────────────────────────────
console.log('\n▸ detectSecurityPatterns');

test('detects repeated authentication failures', () => {
  const entries = Array.from({ length: 5 }, () => ({
    severity: 'error',
    message: 'Failed login attempt',
    timestamp: null
  }));
  const result = detectSecurityPatterns(entries, 3);
  assert.strictEqual(result.alertCount, 1);
  assert.strictEqual(result.repeatedFailures[0].category, 'authentication_failure');
});

test('detects repeated service failures', () => {
  const entries = Array.from({ length: 4 }, () => ({
    severity: 'error',
    message: 'Database connection failed',
    timestamp: null
  }));
  const result = detectSecurityPatterns(entries, 3);
  assert.strictEqual(result.alertCount, 1);
  assert.strictEqual(result.repeatedFailures[0].category, 'service_failure');
});

test('does not alert below threshold', () => {
  const entries = [
    { severity: 'error', message: 'Failed login attempt', timestamp: null },
    { severity: 'error', message: 'Failed login attempt', timestamp: null }
  ];
  const result = detectSecurityPatterns(entries, 3);
  assert.strictEqual(result.alertCount, 0);
});

test('counts total security events correctly', () => {
  const entries = [
    { severity: 'error', message: 'Failed login attempt', timestamp: null },
    { severity: 'error', message: 'Database connection failed', timestamp: null },
    { severity: 'info', message: 'Page loaded', timestamp: null }
  ];
  const result = detectSecurityPatterns(entries);
  assert.strictEqual(result.totalSecurityEvents, 2);
});

// ─── parseLogs (integration) ─────────────────────────────────
console.log('\n▸ parseLogs – integration');

test('returns correct structure for existing log file', () => {
  const result = parseLogs();
  assert.ok(typeof result.totalLogs === 'number');
  assert.ok(typeof result.info === 'number');
  assert.ok(typeof result.warn === 'number');
  assert.ok(typeof result.error === 'number');
  assert.ok(Array.isArray(result.entries));
  assert.ok(Array.isArray(result.recurringIssues));
  assert.ok(Array.isArray(result.securityAlerts));
  assert.ok(typeof result.securitySummary === 'object');
});

test('handles non-existent log file gracefully', () => {
  const result = parseLogs('/tmp/nonexistent_log.log');
  assert.strictEqual(result.totalLogs, 0);
  assert.strictEqual(result.entries.length, 0);
});

// ─── Input Validation (edge cases) ──────────────────────────
console.log('\n▸ Edge cases & validation');

test('parseLine handles line with only whitespace', () => {
  const result = parseLine('   ');
  assert.strictEqual(result.severity, 'unknown');
});

test('parseLine handles malformed JSON', () => {
  const result = parseLine('{ broken json }');
  assert.strictEqual(result.severity, 'unknown');
});

test('groupRecurringIssues handles empty array', () => {
  const issues = groupRecurringIssues([]);
  assert.strictEqual(issues.length, 0);
});

test('detectSecurityPatterns handles empty array', () => {
  const result = detectSecurityPatterns([]);
  assert.strictEqual(result.totalSecurityEvents, 0);
  assert.strictEqual(result.alertCount, 0);
});

// ─── Summary ─────────────────────────────────────────────────
console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
console.log(`  Results: ${passed} passed, ${failed} failed`);
console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);

process.exit(failed > 0 ? 1 : 0);
