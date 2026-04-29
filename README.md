# LogLite

LogLite is a lightweight Node.js-based log analysis and visualization tool.  
It generates logs, parses them, and displays operational metrics in a simple dashboard.

---

## 🚀 Features

- Generate sample logs (INFO, WARN, ERROR)
- Parse logs and classify by severity
- View log metrics on a local dashboard
- Simple backend API using Express
- Frontend UI to display results

---

## 🛠️ Tech Stack

- Node.js
- Express.js
- Winston (for logging comparison)
- HTML / JavaScript

---

## 📁 Project Structure

LogLite/
logs/
public/
index.html
script.js
styles.css
sampleApp.js
parser.js
server.js
package.json

---

## Architecture Diagram

<img width="504" height="450" alt="loglite_architecture" src="https://github.com/user-attachments/assets/17d162cc-5d0b-4f0a-8b61-e5aceb845641" />

---

## ⚙️ Setup Instructions

### 1. Clone the repository

git clone https://github.com/armaankhatri1/LogLite.git  
cd LogLite

---

### 2. Install dependencies

npm install

---

### 3. Generate logs (choose a mode)

#### Console Logging

Run:

node sampleApp.js console

- Logs are printed in plain text format  
- Example:

INFO: User logged in  
ERROR: Failed login attempt  

- Unstructured and mainly used for debugging  
- Logs are manually written to file  

---

#### Winston Logging

Run:

node sampleApp.js winston

- Logs are written in structured JSON format  
- Example:

{"level":"info","message":"User logged in","timestamp":"..."}

- Persistent and structured  
- Better suited for monitoring and DevOps systems  

---

### 4. Start the servers

node run dev

This will begin the frontend and backend

---

### 5. Open the application

http://localhost:3000

## 🔄 How It Works

1. `sampleApp.js` generates logs  
2. Logs are stored in `logs/app.log`  
3. `parser.js` reads and analyzes logs  
4. `server.js` exposes data via `/api/logs`  
5. Frontend fetches data and displays it  

---

## 📊 Example API Endpoint

http://localhost:3000/api/logs

Returns:

```json
{
  "totalLogs": 20,
  "info": 10,
  "warn": 5,
  "error": 5
}
