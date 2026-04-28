function setText(id, value) {
  document.getElementById(id).textContent = value;
}

function appendCell(row, value) {
  const cell = document.createElement('td');
  cell.textContent = value || 'N/A';
  row.appendChild(cell);
}

function renderRecurringIssues(issues) {
  const tableBody = document.getElementById('recurringIssuesBody');
  tableBody.innerHTML = '';

  if (!issues || issues.length === 0) {
    const row = document.createElement('tr');
    const cell = document.createElement('td');
    cell.colSpan = 5;
    cell.textContent = 'No recurring warnings or errors found.';
    row.appendChild(cell);
    tableBody.appendChild(row);
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

async function loadLogData() {
  const res = await fetch('/api/logs');
  const data = await res.json();

  setText('totalLogs', data.totalLogs);
  setText('infoCount', data.info);
  setText('warnCount', data.warn);
  setText('errorCount', data.error);
  setText('unknownCount', data.unknown || 0);

  renderRecurringIssues(data.recurringIssues);
}

// load on page start
loadLogData();
