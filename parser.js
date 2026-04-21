const fs = require('fs');
const path = require('path');

function parseLogs() {
  const logPath = path.join(__dirname, 'logs', 'app.log');

  // if no log file yet
  if (!fs.existsSync(logPath)) {
    return { totalLogs: 0, info: 0, warn: 0, error: 0 };
  }

  const lines = fs.readFileSync(logPath, 'utf-8').split('\n').filter(Boolean);

  let info = 0;
  let warn = 0;
  let error = 0;

  lines.forEach(line => {
    if (line.includes('INFO')) info++;
    if (line.includes('WARN')) warn++;
    if (line.includes('ERROR')) error++;
  });

  return {
    totalLogs: lines.length,
    info,
    warn,
    error
  };
}

module.exports = parseLogs;