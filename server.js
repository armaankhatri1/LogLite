const express = require('express');
const path = require('path');
const parseLogs = require('./parser');

const app = express();
const PORT = process.env.PORT || 3001;

// ─── Security Headers Middleware (#25) ───────────────────────────────
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  res.removeHeader('X-Powered-By');
  next();
});

// ─── JSON Body Parser ────────────────────────────────────────────────
app.use(express.json({ limit: '1mb' }));

// ─── Health Check Endpoint ───────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// ─── Logs API with Input Validation (#25) ────────────────────────────
app.get('/api/logs', (req, res, next) => {
  try {
    // validate optional query params
    const allowedParams = ['severity', 'limit'];
    const unknownParams = Object.keys(req.query).filter(k => !allowedParams.includes(k));

    if (unknownParams.length > 0) {
      return res.status(400).json({
        error: 'Bad Request',
        message: `Unknown query parameter(s): ${unknownParams.join(', ')}`,
        allowed: allowedParams
      });
    }

    if (req.query.severity) {
      const validSeverities = ['info', 'warn', 'error', 'unknown'];
      const severity = req.query.severity.toLowerCase();
      if (!validSeverities.includes(severity)) {
        return res.status(400).json({
          error: 'Bad Request',
          message: `Invalid severity: "${req.query.severity}". Must be one of: ${validSeverities.join(', ')}`
        });
      }
    }

    if (req.query.limit) {
      const limit = Number(req.query.limit);
      if (!Number.isInteger(limit) || limit < 1 || limit > 10000) {
        return res.status(400).json({
          error: 'Bad Request',
          message: 'Limit must be an integer between 1 and 10000.'
        });
      }
    }

    const data = parseLogs();

    // apply optional severity filter
    if (req.query.severity) {
      const sev = req.query.severity.toLowerCase();
      data.entries = data.entries.filter(e => e.severity === sev);
      data.totalLogs = data.entries.length;
    }

    // apply optional limit
    if (req.query.limit) {
      data.entries = data.entries.slice(0, Number(req.query.limit));
    }

    res.json(data);
  } catch (err) {
    next(err);
  }
});

// ─── 404 Handler ─────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.path} does not exist.`
  });
});

// ─── Global Error Handler (#25) ──────────────────────────────────────
app.use((err, req, res, _next) => {
  console.error(`[ERROR] ${new Date().toISOString()} — ${err.message}`);
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'production'
      ? 'An unexpected error occurred.'
      : err.message
  });
});

// ─── Start Server ────────────────────────────────────────────────────
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`LogLite API server running at http://localhost:${PORT}`);
  });
}

module.exports = app;
