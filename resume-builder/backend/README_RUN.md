# Resume Builder - How to Run

## 1) Start MongoDB
Your backend requires MongoDB on:
- `mongodb://localhost:27017`

If you see `MongooseServerSelectionError: connect ECONNREFUSED ... 27017`, then MongoDB isn’t running.

## 2) Configure GPT-5 env vars
Create `resume-builder/backend/.env` (or set env vars) with at least:
- `MONGODB_URI=mongodb://localhost:27017/resume-builder`
- `GPT5_API_KEY=...`

Optional:
- `GPT5_API_URL=https://api.openai.com/v1/responses`
- `GPT5_MODEL=gpt-5`

## 3) Install dependencies
From this folder:
- `resume-builder/backend`
Run:
- `npm install`

## 4) Start the backend
Run:
- `node server.js`

Backend should log:
- `🚀 Server running on port 5000`

## 5) Test ATS optimization endpoint
From a tool like Postman/curl:
- `POST http://localhost:5000/api/ats-optimize`

Body example:
```json
{
  "jobDescription": "...",
  "resumeData": {
    "personalInfo": {"fullName": "Test"},
    "summary": "...",
    "experience": [],
    "education": [],
    "skills": ["JavaScript", "React"]
  }
}
```

