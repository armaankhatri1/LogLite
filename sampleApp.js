const fs = require('fs');
const path = require('path');
const winston = require('winston');

const logPath = path.join(__dirname, 'logs', 'app.log');

// clear log file each run 
fs.writeFileSync(logPath, '');

// create winston logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: logPath })
  ]
});

// get mode from command line
const mode = process.argv[2] || 'console';

// sample messages
const logs = [
  { level: 'info', message: 'User logged in' },
  { level: 'info', message: 'Page loaded' },
  { level: 'warn', message: 'Slow response detected' },
  { level: 'error', message: 'Failed login attempt' },
  { level: 'error', message: 'Database connection failed' }
];

console.log(`Running in ${mode.toUpperCase()} mode...\n`);

// generate logs
for (let i = 0; i < 20; i++) {
  const log = logs[Math.floor(Math.random() * logs.length)];

  if (mode === 'console') {
    // console logging
    console.log(`${log.level.toUpperCase()}: ${log.message}`);

    // also write to file manually so parser still works
    fs.appendFileSync(logPath, `${log.level.toUpperCase()}: ${log.message}\n`);
  }

  else if (mode === 'winston') {
    // winston logging
    logger.log({
      level: log.level,
      message: log.message
    });
  }
}

console.log('\nLogs generated.');