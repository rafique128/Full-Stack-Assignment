# ⚡ NexusPulse AI — Event Lead Manager & Intelligence Radar

> A high-touch, AI-powered event lead management platform built to capture, analyze, and convert leads met at tech conferences, trade shows, and business summits.

![NexusPulse AI Banner](https://img.shields.io/badge/Status-Production%20Ready-success?style=for-the-badge)
![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![React](https://img.shields.io/badge/Frontend-React%2019-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![SQLite](https://img.shields.io/badge/Database-SQLite-003B57?style=for-the-badge&logo=sqlite&logoColor=white)

---

## 🎯 Executive Overview

Networking at business events moves fast: booth scribbles, business cards, and fleeting discussions often get lost in chaotic spreadsheets. **NexusPulse AI** solves this by turning chaotic event interactions into structured deal flow:

1. **Capture Hands-Free**: Voice-dictate notes or paste unstructured business cards / OCR scans into the **AI Quick Scribe** window.
2. **AI Synthesis**: Automatically generates executive takeaways, sentiment score, and recommended next actions.
3. **Multi-Tone Follow-Up Studio**: Crafts custom email drafts, LinkedIn connection pitches, and WhatsApp messages in 4 distinct communication styles.
4. **Interactive Deal Cockpit**: Switch seamlessly between a high-velocity **Kanban Pipeline Board** and a high-density **Search & Filter Table**.

---

## 🚀 Key Architectural & Design Decisions

### 1. Backend: Python FastAPI & SQLite
- **Why FastAPI?** Blazing fast performance, native async support, automated OpenAPI documentation (`/docs`), and robust type validation via Pydantic.
- **Why SQLite?** Zero-maintenance, single-file ACID persistence (`leads.db`). Requires zero Docker/PostgreSQL configuration overhead while ensuring full database durability and painless local/cloud deployment.

### 2. Frontend: React with Bespoke Obsidian Glass Design System
- **Why not generic UI frameworks?** Generic component libraries often produce bland, cookie-cutter admin tables. NexusPulse was engineered with a custom **Dark Obsidian Glassmorphic** theme (`#07090e`), glowing neon telemetry borders (`#6366f1`, `#06b6d4`), responsive layout, and zero external icon bloat using native inline SVG vectors.
- **Dual Perspective**:
  - **Kanban Board**: Drag/click deals across 5 pipeline stages (*New Met*, *Follow-up Pending*, *In Conversation*, *Meeting Scheduled*, *Closed Won*).
  - **Data Table View**: High-density scanning, sorting, direct `mailto:` triggers, and quick status switching.

### 3. Resilient Hybrid AI Engine
- **Dual Mode AI Pipeline**:
  - **External LLM Mode**: If an `OPENAI_API_KEY` or `GEMINI_API_KEY` is provided, calls state-of-the-art models for generative reasoning.
  - **Deterministic Semantic NLP Fallback**: If no API key is present or when working offline at a convention center with poor Wi-Fi, an intelligent rule-based heuristic extractor automatically analyzes intent, extracts topics (e.g., *Enterprise Security, AI Integration, Cloud Scale*), assigns lead priority (*Hot 🔥, Warm ⚡, Cool ❄️*), and crafts personalized multi-channel outreach drafts.

---

## 🌟 Core Features

- [x] **Full Lead Lifecycle (CRUD)**: Add, edit, update stage, and delete event leads.
- [x] **Real-Time Search & Multi-Axis Filtering**: Instant query across names, companies, notes, and events; filter by event, priority, and pipeline stage.
- [x] **AI Quick Scribe & Card Scanner**: Paste raw booth notes or scanned cards -> AI extracts Name, Company, Email, Phone, Event, and Priority.
- [x] **Web Speech Voice Dictation**: Hands-free booth interaction note capture directly in the modal via the Web Speech API.
- [x] **AI Follow-up Studio**:
  - 4 Tones: *Warm & Professional*, *Executive Strategic*, *Casual Coffee*, *Direct Value Pitch*.
  - Multi-Channel: Email (with 1-click `mailto:` launch), LinkedIn InMail, and WhatsApp quick ping.
  - 1-Click Copy with animated visual confirmation.
- [x] **Executive Takeaways & Sentiment**: Auto-summarizes booth scribbles into bulleted action items.
- [x] **Pipeline Analytics**: Real-time velocity KPI cards (Total Leads, Hot Deals, Top Event Anchor, Follow-Up Completion %).
- [x] **Export to CSV**: Instant export of all event records with AI summaries.
- [x] **1-Click Demo Seed**: Instantly pre-populates realistic conference leads (SaaStr, TechCrunch Disrupt, Web Summit, AWS Summit, GITEX).

---

## 🛠️ Project Structure

```text
my-app/
├── backend/
│   ├── database.py       # SQLite connection, CRUD queries, and aggregation stats
│   ├── ai_service.py     # AI summarization, multi-tone drafts, and note extraction
│   ├── main.py           # FastAPI REST endpoints, CORS, CSV export, seed routes
│   └── leads.db          # Auto-generated SQLite database
├── src/
│   ├── components/
│   │   ├── Header.js         # Navigation, logo badge, quick action triggers
│   │   ├── StatsCards.js     # Glowing holographic telemetry metrics
│   │   ├── FilterBar.js      # Search, event/status/priority filters, view toggle
│   │   ├── KanbanBoard.js    # 5-stage interactive pipeline board
│   │   ├── TableView.js      # High-density data grid with direct mail triggers
│   │   ├── LeadModal.js      # Capture/edit lead with Web Speech voice dictation
│   │   ├── QuickScanModal.js # AI card scanner with laser animation
│   │   └── AIDrawer.js       # AI Follow-up Studio (Email, LinkedIn, WhatsApp)
│   ├── api.js                # Frontend API client
│   ├── Icons.js              # Standalone zero-dependency SVG vector icon set
│   ├── index.css             # Obsidian Glass UI design system
│   └── App.js                # Main application state orchestration
├── public/
│   └── index.html            # Web entry point with metadata
└── README.md
```

---

## ⚡ Quickstart Guide

### Prerequisites
- **Python 3.10+** (Python 3.14 verified)
- **Node.js 18+** & **npm**

### Step 1: Start the FastAPI Backend
Open a terminal in the project directory:
```bash
cd backend
python -m pip install fastapi uvicorn
python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```
The backend API will be live at:
- **API URL**: `http://127.0.0.1:8000`
- **Interactive Swagger Docs**: `http://127.0.0.1:8000/docs`

*(Optional: Set `OPENAI_API_KEY="sk-..."` in your environment to activate external LLM mode; otherwise, built-in NLP handles everything seamlessly).*

### Step 2: Start the React Frontend
In a second terminal:
```bash
npm start
```
The application will launch automatically in your browser at `http://localhost:3000`.

---

## 📡 API Endpoint Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/leads` | Retrieve leads (supports `?search=`, `?status=`, `?event=`, `?priority=`) |
| `POST` | `/api/leads` | Create a new lead (auto-generates AI summary & follow-up) |
| `GET` | `/api/leads/{id}` | Fetch a single lead by ID |
| `PUT` | `/api/leads/{id}` | Update existing lead attributes or pipeline status |
| `DELETE` | `/api/leads/{id}` | Remove a lead from the database |
| `GET` | `/api/stats` | Aggregate metrics (counts, status breakdown, event rankings) |
| `POST` | `/api/ai/summarize` | Generate AI executive summary & key takeaways |
| `POST` | `/api/ai/draft-followup` | Draft tailored outreach across Email, LinkedIn, WhatsApp |
| `POST` | `/api/ai/extract-card` | Parse unstructured card/note text into structured lead JSON |
| `POST` | `/api/seed` | Seed realistic multi-event demo leads |
| `GET` | `/api/export` | Download full database as a CSV file |

---

## 🚢 Production Deployment

### Option A: Cloud Deploy (Render / Railway / Fly.io)
1. Push this repository to GitHub.
2. Link the repository on [Render](https://render.com) or [Railway](https://railway.app).
3. Set the start command to: `uvicorn backend.main:app --host 0.0.0.0 --port $PORT`
4. Build the React app (`npm run build`) and serve static files directly or via Vercel/Netlify pointing to the backend URL (`REACT_APP_API_URL`).

---

## 🏆 Evaluation Alignment

| Requirement | Implementation in NexusPulse AI |
|---|---|
| **Add, edit, delete, search, filter** | Implemented in full. Real-time search across all text fields + 3 simultaneous filter dimensions (Status, Event, Priority). |
| **Store lead fields in database** | Persistent SQLite database storing Name, Company, Email, Phone, Event, Notes, Status, Priority, Tags, and AI fields. |
| **AI Summarize & Follow-up Draft** | Multi-channel AI studio (Email with `mailto:` launcher, LinkedIn InMail, WhatsApp ping) in 4 distinct tones + bulleted takeaways. |
| **Unique & Responsive UI** | Custom Obsidian Glass aesthetic, dual Kanban pipeline and Data Table modes, scanning laser animation, and Web Speech API voice capture. |
| **Documentation & Quality** | Comprehensive README, zero-dependency SVG system, clean REST API with Swagger docs, and complete error handling. |
