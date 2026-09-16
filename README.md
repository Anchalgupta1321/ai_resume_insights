# 🤖 Enterprise AI Resume Insights & ATS Platform

[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/Frontend-React_18_+_Vite-61DAFB?logo=react&logoColor=black)](https://vitejs.dev)
[![Groq AI](https://img.shields.io/badge/AI_Engine-Groq_Compound_Llama3-F55036?logo=fastapi&logoColor=white)](https://groq.com)
[![Render](https://img.shields.io/badge/Deploy-Render_Free_Tier-46E3B7?logo=render&logoColor=black)](https://render.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

An enterprise-grade, high-contrast AI recruitment and applicant tracking platform (ATS) styled with a permanent **Emerald Green & Crisp White** design system. Powered by ultra-fast **Groq AI Engine** and **Google Gemini**, offering end-to-end resume parsing, tailored interview kit generation, candidate copilot chat, personalized outreach email composition, authenticity scoring, multi-role mobility, interactive Kanban pipeline, and multi-sheet Excel reporting.

---

## ✨ 7 Enterprise Core Capabilities

1. 🎙️ **AI Tailored Interview Kit Generator**: Generates Technical, Behavioral, and Gap Probing questions with **Expected 5/5 Rubrics**, interviewer tips, 1–5 live score rating, notes box, and printable cheat sheet.
2. 💬 **AI Resume & Talent Pool Copilot**: Interactive conversational drawer with resume citations, suggested follow-ups, and natural language Q&A for candidate deep-dives and pool analytics.
3. ✉️ **1-Click Candidate Outreach Composer**: Automated personalized email generator with 4 recruiter templates (*Interview Invite*, *Phone Screen*, *Feedback Rejection*, *Offer Summary*) and `mailto:` launcher.
4. 🚩 **Resume Authenticity & Anomaly Radar**: Automatic **Authenticity Index** (0–100%), **Metric Impact Score** (quantifying measurable KPIs), and **Buzzword Density Index**.
5. 🔄 **Multi-Role Talent Recycling**: Re-evaluates candidates against alternative benchmark roles (Backend, Data Engineering, ML, Fullstack, PM) with transferable skill maps.
6. 📋 **Interactive Kanban Hiring Pipeline (ATS)**: ATS board across 6 recruitment stages (*Screened*, *Technical Round*, *Manager / Final*, *Offer Extended*, *Hired*, *Archived*) with local storage persistence.
7. 📄 **In-App Parsed PDF Text & Highlights Inspector**: Integrated tab inside candidate drawer to inspect raw extracted text from resumes alongside AI evaluation metrics.

---

## 🏗️ Architecture

```
resume-analyzer/
├── backend/
│   ├── app/
│   │   ├── api/routes.py          # FastAPI REST API endpoints
│   │   ├── services/
│   │   │   ├── analyzer.py        # Groq/Gemini AI parsing & PDF text extraction
│   │   │   ├── drive_service.py   # Google Drive folder sync service
│   │   │   └── excel_generator.py # Formatted multi-sheet Excel generator
│   │   ├── models/schemas.py      # Pydantic data validation models
│   │   ├── config.py              # Environment settings
│   │   └── main.py                # App entrypoint, CORS, static fallback
│   ├── requirements.txt           # Python backend dependencies
│   └── Dockerfile                 # Backend container
├── frontend/
│   ├── src/
│   │   ├── components/            # Sidebar, Header, CandidateDrawer, InterviewKitModal, OutreachModal, CopilotDrawer, DriveModal
│   │   ├── screens/               # DashboardScreen, ScreenerScreen, PipelineScreen, CandidatesScreen, CompareScreen, AnalyticsScreen, ReportsScreen, SettingsScreen
│   │   ├── App.jsx                # Main Application state & workflow
│   │   └── index.css              # Emerald Green & Crisp White high-contrast UI
│   ├── package.json
│   ├── vite.config.js
│   ├── Dockerfile
│   └── nginx.conf
├── render.yaml                    # 1-Click Render Cloud Deployment Blueprint
├── docker-compose.yml             # Fullstack container deployment
├── run_app.py                     # 1-command local dev launcher
├── start_dev.bat                  # Windows batch launcher
├── .env.example                   # Environment configuration template
└── README.md
```

---

## 🚀 Quick Start (Local Setup)

### 1. Configure Environment
Copy `.env.example` to `.env` and configure your API key:
```bash
cp .env.example .env
```
In `.env`:
```ini
GROQ_API_KEY=gsk_...
DEFAULT_AI_PROVIDER=groq
AI_MODEL=groq/compound-mini
```

### 2. Launch the Full-Stack Application
Run the launcher script:
```bash
python run_app.py
```
*(Or double-click `start_dev.bat` on Windows)*

- 🌐 **Frontend Dashboard**: [http://localhost:5173](http://localhost:5173)
- 🔌 **Backend API / Swagger UI**: [http://localhost:8000/docs](http://localhost:8000/docs)

---

## ☁️ Deploy to Render (Free Plan)

You can deploy the full application for **FREE on Render** as a single unified service:

### Option 1: 1-Click Blueprint (`render.yaml`)
1. Push this repository to your GitHub account.
2. Go to [Render Dashboard](https://dashboard.render.com/) -> **New +** -> **Blueprint**.
3. Connect your GitHub repository.
4. Render will automatically detect `render.yaml`.
5. Enter your `GROQ_API_KEY` in the environment variable prompt and click **Apply**.

### Option 2: Manual Web Service on Render
1. Go to [Render Dashboard](https://dashboard.render.com/) -> **New +** -> **Web Service**.
2. Select your repository.
3. Set the following settings:
   - **Environment**: `Python 3`
   - **Build Command**: `cd frontend && npm install && npm run build && cd .. && pip install -r backend/requirements.txt`
   - **Start Command**: `uvicorn backend.app.main:app --host 0.0.0.0 --port $PORT`
4. In **Environment Variables**, add:
   - `GROQ_API_KEY` = `your_groq_api_key`
   - `DEFAULT_AI_PROVIDER` = `groq`
   - `AI_MODEL` = `groq/compound-mini`
   - `PYTHON_VERSION` = `3.11.0`
5. Click **Create Web Service**. Your app will be live at `https://your-app-name.onrender.com`!

---

## 👩‍💻 Author

**Anchal Gupta**  
📍 Bengaluru, Karnataka – 560064  
📧 [2022anchal.g@vidyashilp.edu.in](mailto:2022anchal.g@vidyashilp.edu.in)  
🔗 [LinkedIn Profile](https://www.linkedin.com/in/anchal-gupta-71436b254/)

---

## 🪪 License

This project is licensed under the **MIT License**.

