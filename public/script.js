function setText(id, value) {
  document.getElementById(id).textContent = value;
}

function appendCell(row, value) {
  const cell = document.createElement('td');
  cell.textContent = value || 'N/A';
  row.appendChild(cell);
}

function renderEmptyRow(tableBody, colspan, message) {
  const row = document.createElement('tr');
  const cell = document.createElement('td');
  cell.colSpan = colspan;
  cell.textContent = message;
  row.appendChild(cell);
  tableBody.appendChild(row);
}

function renderRecurringIssues(issues) {
  const tableBody = document.getElementById('recurringIssuesBody');
  tableBody.innerHTML = '';

  if (!issues || issues.length === 0) {
    renderEmptyRow(tableBody, 5, 'No recurring warnings or errors found.');
    return;
  }

  for (const issue of issues) {
    const row = document.createElement('tr');

    appendCell(row, issue.severity);
    appendCell(row, issue.message);
    appendCell(row, issue.count);
    appendCell(row, issue.firstSeen);
    appendCell(row, issue.lastSeen);

    tableBody.appendChild(row);
  }
}

function renderSecurityAlerts(alerts) {
  const tableBody = document.getElementById('securityAlertsBody');
  tableBody.innerHTML = '';

  if (!alerts || alerts.length === 0) {
    renderEmptyRow(tableBody, 6, 'No repeated security failures found.');
    return;
  }

  for (const alert of alerts) {
    const row = document.createElement('tr');

    appendCell(row, alert.category);
    appendCell(row, alert.description);
    appendCell(row, alert.message);
    appendCell(row, alert.count);
    appendCell(row, alert.firstSeen);
    appendCell(row, alert.lastSeen);

    tableBody.appendChild(row);
  }
}

async function loadLogData() {
  const res = await fetch('/api/logs');
  const data = await res.json();
  const securitySummary = data.securitySummary || {};

  setText('totalLogs', data.totalLogs);
  setText('infoCount', data.info);
  setText('warnCount', data.warn);
  setText('errorCount', data.error);
  setText('unknownCount', data.unknown || 0);
  setText('securityEventCount', securitySummary.totalSecurityEvents || 0);
  setText('securityAlertCount', securitySummary.alertCount || 0);
  setText('securityThreshold', securitySummary.threshold || 0);

  renderSecurityAlerts(data.securityAlerts);
  renderRecurringIssues(data.recurringIssues);
}

// load on page start
loadLogData();
