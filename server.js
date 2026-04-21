const express = require('express');
const path = require('path');
const parseLogs = require('./parser');

const app = express();
const PORT = 3000;

// serve frontend files
app.use(express.static(path.join(__dirname, 'public')));

// API route to get log data
app.get('/api/logs', (req, res) => {
  const data = parseLogs();
  res.json(data);
});

// start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});