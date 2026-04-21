const fs = require('fs');
const path = require('path');

function parseLogs() {
  const logPath = path.join(__dirname, 'logs', 'app.log');

  // if no log file yet
  if (!fs.existsSync(logPath)) {
    return { totalLogs: 0, info: 0, warn: 0, error: 0 };
  }

  const lines = fs.readFileSync(logPath, 'utf-8')
    .split('\n')
    .filter(line => line.trim() !== '');

  let info = 0;
  let warn = 0;
  let error = 0;

  lines.forEach(line => {
    // try parsing as JSON (Winston)
    try {
      const log = JSON.parse(line);

      if (log.level === 'info') info++;
      else if (log.level === 'warn') warn++;
      else if (log.level === 'error') error++;
    } catch {
      // fallback for console-style logs
      if (line.includes('INFO')) info++;
      else if (line.includes('WARN')) warn++;
      else if (line.includes('ERROR')) error++;
    }
  });

  return {
    totalLogs: lines.length,
    info,
    warn,
    error
  };
}

module.exports = parseLogs;