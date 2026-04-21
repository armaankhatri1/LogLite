async function loadLogData() {
  const res = await fetch('/api/logs');
  const data = await res.json();

  document.getElementById('totalLogs').textContent = data.totalLogs;
  document.getElementById('infoCount').textContent = data.info;
  document.getElementById('warnCount').textContent = data.warn;
  document.getElementById('errorCount').textContent = data.error;
}

// load on page start
loadLogData();