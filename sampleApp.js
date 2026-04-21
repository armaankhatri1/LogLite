const fs = require('fs');
const path = require('path');

const logPath = path.join(__dirname, 'logs', 'app.log');

// simple random logs
const logs = [
  'INFO: User logged in',
  'INFO: Page loaded',
  'WARN: Slow response detected',
  'ERROR: Failed login attempt',
  'ERROR: Database connection failed'
];

// append random logs
for (let i = 0; i < 20; i++) {
  const randomLog = logs[Math.floor(Math.random() * logs.length)];
  fs.appendFileSync(logPath, randomLog + '\n');
}

console.log('Logs generated');