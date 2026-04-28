const fs = require('fs');
const path = require('path');

const LOG_PATH = path.join(__dirname, 'logs', 'app.log');
const SEVERITIES = ['info', 'warn', 'error', 'unknown'];
const ISSUE_LEVELS = new Set(['warn', 'error']);
const SECURITY_ALERT_THRESHOLD = 3;

const SECURITY_FAILURE_PATTERNS = [
  {
    type: 'authentication_failure',
    label: 'Repeated authentication failures',
    regex: /\b(failed login|login failed|authentication failed|invalid password|invalid credentials)\b/i
  },
  {
    type: 'authorization_failure',
    label: 'Repeated authorization failures',
    regex: /\b(unauthorized|forbidden|access denied|permission denied)\b/i
  },
  {
    type: 'service_failure',
    label: 'Repeated service failures',
    regex: /\b(database connection failed|connection failed|request failed|timeout|failed to connect)\b/i
  }
];

function createEmptyCounts() {
  return {
    info: 0,
    warn: 0,
    error: 0,
    unknown: 0
  };
}

function normalizeSeverity(level) {
  if (!level || typeof level !== 'string') {
    return 'unknown';
  }

  const normalized = level.trim().toLowerCase();

  if (normalized === 'information') {
    return 'info';
  }

  if (normalized === 'warning') {
    return 'warn';
  }

  if (SEVERITIES.includes(normalized)) {
    return normalized;
  }

  return 'unknown';
}

function parseJsonLog(line) {
  try {
    const log = JSON.parse(line);
    const severity = normalizeSeverity(log.level);

    return {
      severity,
      message: typeof log.message === 'string' ? log.message.trim() : line.trim(),
      timestamp: log.timestamp || null,
      raw: line
    };
  } catch {
    return null;
  }
}

function parseConsoleLog(line) {
  const match = line.match(/^\s*(INFO|WARN|WARNING|ERROR)\s*:?\s*(.*)$/i);

  if (!match) {
    return {
      severity: 'unknown',
      message: line.trim(),
      timestamp: null,
      raw: line
    };
  }

  return {
    severity: normalizeSeverity(match[1]),
    message: match[2].trim(),
    timestamp: null,
    raw: line
  };
}

function parseLine(line) {
  return parseJsonLog(line) || parseConsoleLog(line);
}

function groupRecurringIssues(entries) {
  const groupedIssues = new Map();

  for (const entry of entries) {
    if (!ISSUE_LEVELS.has(entry.severity)) {
      continue;
    }

    const message = entry.message || 'No message provided';
    const key = `${entry.severity}:${message.toLowerCase()}`;

    if (!groupedIssues.has(key)) {
      groupedIssues.set(key, {
        severity: entry.severity.toUpperCase(),
        message,
        count: 0,
        firstSeen: entry.timestamp,
        lastSeen: entry.timestamp
      });
    }

    const issue = groupedIssues.get(key);
    issue.count += 1;

    if (!issue.firstSeen && entry.timestamp) {
      issue.firstSeen = entry.timestamp;
    }

    if (entry.timestamp) {
      issue.lastSeen = entry.timestamp;
    }
  }

  return Array.from(groupedIssues.values())
    .filter(issue => issue.count > 1)
    .sort((a, b) => b.count - a.count || a.severity.localeCompare(b.severity));
}

function getMatchingSecurityPattern(message) {
  if (!message || typeof message !== 'string') {
    return null;
  }

  return SECURITY_FAILURE_PATTERNS.find(pattern => pattern.regex.test(message)) || null;
}

function detectSecurityPatterns(entries, threshold = SECURITY_ALERT_THRESHOLD) {
  const groupedFailures = new Map();
  let totalSecurityEvents = 0;

  for (const entry of entries) {
    const pattern = getMatchingSecurityPattern(entry.message);

    if (!pattern) {
      continue;
    }

    totalSecurityEvents += 1;

    const message = entry.message || 'No message provided';
    const key = `${pattern.type}:${message.toLowerCase()}`;

    if (!groupedFailures.has(key)) {
      groupedFailures.set(key, {
        type: 'REPEATED_FAILURE',
        category: pattern.type,
        description: pattern.label,
        severity: entry.severity.toUpperCase(),
        message,
        count: 0,
        threshold,
        firstSeen: entry.timestamp,
        lastSeen: entry.timestamp
      });
    }

    const alert = groupedFailures.get(key);
    alert.count += 1;

    if (!alert.firstSeen && entry.timestamp) {
      alert.firstSeen = entry.timestamp;
    }

    if (entry.timestamp) {
      alert.lastSeen = entry.timestamp;
    }
  }

  const repeatedFailures = Array.from(groupedFailures.values())
    .filter(alert => alert.count >= threshold)
    .sort((a, b) => b.count - a.count || a.category.localeCompare(b.category));

  return {
    totalSecurityEvents,
    threshold,
    alertCount: repeatedFailures.length,
    repeatedFailures
  };
}

function parseLogs(logPath = LOG_PATH) {
  if (!fs.existsSync(logPath)) {
    const emptyCounts = createEmptyCounts();

    return {
      totalLogs: 0,
      ...emptyCounts,
      severityCounts: emptyCounts,
      entries: [],
      recurringIssues: [],
      securityAlerts: [],
      securitySummary: {
        totalSecurityEvents: 0,
        threshold: SECURITY_ALERT_THRESHOLD,
        alertCount: 0
      }
    };
  }

  const lines = fs.readFileSync(logPath, 'utf-8')
    .split('\n')
    .map(line => line.trim())
    .filter(Boolean);

  const severityCounts = createEmptyCounts();
  const entries = lines.map(parseLine);

  for (const entry of entries) {
    severityCounts[entry.severity] += 1;
  }

  const recurringIssues = groupRecurringIssues(entries);
  const securitySummary = detectSecurityPatterns(entries);

  return {
    totalLogs: entries.length,
    ...severityCounts,
    severityCounts,
    entries,
    recurringIssues,
    securityAlerts: securitySummary.repeatedFailures,
    securitySummary
  };
}

module.exports = parseLogs;
module.exports.parseLine = parseLine;
module.exports.groupRecurringIssues = groupRecurringIssues;
module.exports.detectSecurityPatterns = detectSecurityPatterns;
