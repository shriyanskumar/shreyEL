# Project Setup Guide

## Prerequisites
- Node.js (v16+)
- Python (v3.8+)
- MongoDB (local or cloud instance)
- Git

## Installation Steps

### 1. Clone Repository
```bash
git clone <repository-url>
cd document-tracker-system
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create `.env` file:
```
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/document-tracker
JWT_SECRET=your_jwt_secret_key
CORS_ORIGIN=http://localhost:3000
AI_SERVICE_URL=http://localhost:5001
```

Start backend:
```bash
npm run dev
```

Backend runs on `http://localhost:5000`

---

### 3. Frontend Setup

```bash
cd frontend
npm install
```

Start frontend:
```bash
npm start
```

Frontend runs on `http://localhost:3000`

---

### 4. AI Module Setup

```bash
cd ai-module
python -m venv venv

# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

pip install -r requirements.txt
```

Create `.env` file:
```
FLASK_ENV=development
AI_SERVICE_PORT=5001
```

Start AI service:
```bash
python app.py
```

AI Module runs on `http://localhost:5001`

---

## Running All Services

### Option 1: Terminal Tabs
Open 3 terminals and run each service in its own terminal.

### Option 2: Concurrently (Root Directory)
```bash
npm install concurrently -g
npm run dev
```

---

## MongoDB Setup

### Local MongoDB
```bash
# Start MongoDB service
mongod

# In another terminal, connect:
mongo
```

### Cloud MongoDB (MongoDB Atlas)
1. Create cluster at https://www.mongodb.com/cloud/atlas
2. Update MONGODB_URI in backend `.env`:
```
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/document-tracker
```

---

## Verify Installation

1. **Backend Health Check**
   ```bash
   curl http://localhost:5000/api/health
   ```

2. **Frontend**
   - Visit http://localhost:3000

3. **AI Module Health Check**
   ```bash
   curl http://localhost:5001/health
   ```

---

## Troubleshooting

### Port Already in Use
Change port in `.env` or kill process:
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# macOS/Linux
lsof -i :5000
kill -9 <PID>
```

### MongoDB Connection Error
- Verify MongoDB service is running
- Check connection string in `.env`
- Ensure firewall allows connections

### Module Not Found (Backend)
```bash
cd backend
rm -rf node_modules package-lock.json
npm install
```

### Python Venv Issues
```bash
# Delete and recreate venv
rm -rf ai-module/venv
cd ai-module
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

---

## Next Steps

1. Implement authentication endpoints in `backend/src/routes/auth.js`
2. Create React components in `frontend/src/components/`
3. Build out business logic in backend controllers
4. Configure email reminders in `backend/src/utils/`
5. Train/fine-tune AI models for better summaries

---

## Project Structure Reference

```
document-tracker-system/
├── backend/               # Node.js/Express API
│   ├── src/
│   │   ├── routes/       # API endpoints
│   │   ├── models/       # MongoDB schemas
│   │   ├── controllers/  # Business logic
│   │   └── middleware/   # Auth, errors
│   ├── package.json
│   └── .env.example
├── frontend/              # React.js UI
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── pages/        # Page components
│   │   └── styles/       # CSS (Rogue theme)
│   └── package.json
├── ai-module/             # Python NLP
│   ├── summarizer.py     # Core logic
│   ├── app.py            # Flask server
│   └── requirements.txt
└── docs/                  # Documentation
```
