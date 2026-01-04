# Document Tracker System

A web app for organizing documents through their lifecycle with status tracking, reminders, guided docs, and AI-assisted summaries.

## Contents
- Overview and stack
- Architecture and structure
- Features
- Statuses
- Prerequisites
- Setup (backend, frontend, AI service)
- Run and health checks
- Environment variables
- Troubleshooting
- Documentation links

## Features
- Document upload, edit, delete with metadata (category, expiry)
- Status tracking with visual indicators
- Guided procedures by category
- Reminders for expiry/renewal with configurable lead time
- AI summaries, key points, suggested actions
- Role-based access (admin, user, reviewer)

## Statuses
- Submitted → In Progress → Approved
- Expiring and Expired for lifecycle tracking

## Technology Stack
- Frontend: React 18, JavaScript (ES6+), CSS
- Backend: Node.js 16+, Express, MongoDB, JWT
- AI Module: Python 3.8+, Flask, spaCy/Transformers
- Tooling: Git, Postman

## Architecture
```
Browser (React) → Express API → MongoDB
					  ↘ AI Service (Flask)
```

## Project Structure
```
document-tracker-system/
├── frontend/              # React UI (components, pages, styles, context)
├── backend/               # Express API (routes, controllers, models, middleware, utils)
├── ai-module/             # Flask service (summarizer, models, scripts, data)
├── docs/                  # API, setup, requirements, development guides
└── README.md
```

## Prerequisites
- Node.js v16+ and npm
- Python v3.8+
- MongoDB (local or Atlas)
- Git

## Setup

### Backend
```bash
cd backend
npm install
```
Create backend `.env`:
```
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/document-tracker
JWT_SECRET=your_jwt_secret_key
CORS_ORIGIN=http://localhost:3000
AI_SERVICE_URL=http://localhost:5001
```
Run:
```bash
npm run dev
```
API defaults to http://localhost:5000

### Frontend
```bash
cd frontend
npm install
npm start
```
App defaults to http://localhost:3000

### AI Module
```bash
cd ai-module
python -m venv venv
venv\Scripts\activate      # Windows
# source venv/bin/activate  # macOS/Linux
pip install -r requirements.txt
```
Create ai-module `.env`:
```
FLASK_ENV=development
AI_SERVICE_PORT=5001
```
Run:
```bash
python app.py
```
Service defaults to http://localhost:5001

## Run All Services
- Open three terminals and start backend, frontend, and AI module as above; or
- From root with concurrently installed globally:
```bash
npm install -g concurrently
npm run dev
```

## Environment Variables
- Backend: PORT, NODE_ENV, MONGODB_URI, JWT_SECRET, CORS_ORIGIN, AI_SERVICE_URL
- AI Module: FLASK_ENV, AI_SERVICE_PORT
- Frontend: add REACT_APP_* keys if you need to expose API URLs

## Health Checks
- Backend: `curl http://localhost:5000/api/health`
- Frontend: open http://localhost:3000
- AI Module: `curl http://localhost:5001/health`

## Troubleshooting
- Ports in use: free with `netstat -ano | findstr :5000` then `taskkill /PID <PID> /F`
- MongoDB connection errors: verify service/URI/firewall
- Node modules missing: `rm -rf node_modules package-lock.json && npm install` (inside backend)
- Python venv issues: recreate venv and reinstall requirements

## Documentation
- Requirements and specs: docs/REQUIREMENTS.md
- Setup guide (detailed): docs/SETUP.md
- Development guide: docs/DEVELOPMENT.md
- API reference: docs/API.md

## License
MIT
