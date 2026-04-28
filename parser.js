const fs = require('fs');
const path = require('path');

const LOG_PATH = path.join(__dirname, 'logs', 'app.log');
const SEVERITIES = ['info', 'warn', 'error', 'unknown'];
const ISSUE_LEVELS = new Set(['warn', 'error']);

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

function parseLogs(logPath = LOG_PATH) {
  if (!fs.existsSync(logPath)) {
    const emptyCounts = createEmptyCounts();
  
    return {
      totalLogs: 0,
      ...emptyCounts,
      severityCounts: emptyCounts,
      entries: [],
      recurringIssues: []
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

  return {
    totalLogs: entries.length,
    ...severityCounts,
    severityCounts,
    entries,
    recurringIssues
  };
}

module.exports = parseLogs;
module.exports.parseLine = parseLine;
module.exports.groupRecurringIssues = groupRecurringIssues;
