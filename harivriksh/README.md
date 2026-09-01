# 🌿 HariVriksh — MERN Stack Rooftop Farming Platform (v3 — Complete)

Full-stack production-ready app. Grow pesticide-free food on your rooftop using household containers — powered by real AI.

## ✨ Features at a Glance

**Core:** Plant Encyclopedia (15 plants), Container Matcher, Soil Guide, My Garden Tracker, Reminders, Community Forum, Dashboard

**AI (Claude by Anthropic):**
- `/api/ai/chat` — Kisaan Mitra floating chatbot (live plant DB context, multi-turn)
- `/api/ai/diagnose` — Plant Doctor: symptoms → PROBLEM / CAUSE / FIX / PREVENT
- `/api/ai/recommend` — Personalized plant picks by city, sun, container, season
- `/api/ai/quick-tip` — Daily farming tip

**Weather:** Open-Meteo (free, no key) — real-time + 5-day forecast + farming advice for 20 Indian cities

**Image Upload:** multer — profile, garden, community photos (5MB, jpg/png/gif/webp)

**Notifications:** In-app bell, unread badge, mark read, auto-poll

**Stats API:** Personal dashboard stats + platform-wide public stats

## 🚀 Quick Start

### 1. Install
```bash
cd backend && npm install
cd ../frontend && npm install
```

### 2. Configure backend/.env
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/harivriksh
JWT_SECRET=your_long_random_secret
JWT_EXPIRE=7d
CLIENT_URL=http://localhost:3000
ANTHROPIC_API_KEY=sk-ant-...   # Get free at console.anthropic.com (optional)
```

### 3. Run
```bash
# Terminal 1
cd backend && npm run dev

# Terminal 2
cd frontend && npm start
```

Open http://localhost:3000 — DB auto-seeds 15 plants + 6 containers on first run ✅

> App works fully without Anthropic key — AI pages just show a helpful error message.

## 📁 Structure (54 files)

```
harivriksh/
├── backend/
│   ├── data/plants_dataset.json     ← FREE dataset: 15 Indian plants, full growing data
│   ├── models/                      ← User, Plant, Garden, Post, Reminder, Notification
│   ├── routes/
│   │   ├── ai.js                    ← Claude: chat, diagnose, recommend, quick-tip
│   │   ├── weather.js               ← Open-Meteo free weather
│   │   ├── upload.js                ← multer image upload
│   │   ├── notifications.js         ← In-app notification system
│   │   ├── stats.js                 ← Dashboard + public stats
│   │   └── [auth, plants, gardens, posts, reminders, soil, containers].js
│   ├── middleware/auth.js            ← JWT protect + optionalAuth
│   ├── uploads/                     ← Uploaded images
│   ├── seedData.js                  ← Loads from plants_dataset.json
│   └── server.js                    ← Express, 12 routes registered
│
└── frontend/src/
    ├── components/
    │   ├── AIChatbot.js             ← Floating Kisaan Mitra (every page)
    │   ├── NotificationBell.js      ← Dropdown notifications
    │   └── [Navbar, Footer, PlantCard].js
    ├── pages/                       ← 14 pages
    │   ├── DashboardPage.js         ← Stats + weather + tasks + quick actions
    │   ├── AIDoctorPage.js          ← Diagnose + AI recommendations
    │   └── [Home, Plants, PlantDetail, Matcher, Soil, Community, Post, Garden, Reminders, Login, Register, Profile].js
    └── utils/api.js                 ← 30+ Axios API functions
```

## 🔌 Key API Endpoints

```
POST /api/auth/register|login          Auth
GET  /api/plants                       Browse plants (filter: category, difficulty, search)
POST /api/plants/match                 Container matching
GET  /api/gardens/my                   My garden
POST /api/gardens/my/containers        Add container
GET  /api/posts                        Community forum
POST /api/ai/chat                      Kisaan Mitra AI chatbot
POST /api/ai/diagnose                  Plant doctor
POST /api/ai/recommend                 Plant recommendations
GET  /api/weather?city=delhi           Free weather (Open-Meteo)
POST /api/upload/image                 Image upload
GET  /api/notifications                In-app notifications
GET  /api/stats/dashboard              Personal dashboard stats
GET  /api/health                       Health check
```

## 🌱 Plant Dataset (15 plants)

Mint · Tomato · Chilli · Spinach · Marigold · Coriander · Lemon · Basil · Bottle Gourd · Fenugreek · Brinjal · Okra · Curry Leaf · Rose · Aloe Vera

Each plant has: soil mix, fertilizer schedule (weekly), growing steps, common problems + organic fixes, compatible containers, benefits, seasons, difficulty.

## 🔧 Tech Stack

Backend: Node.js 18 · Express · MongoDB · Mongoose · JWT · bcryptjs · multer
Frontend: React 18 · React Router v6 · Axios · React Hot Toast · Custom CSS (Fraunces + Outfit fonts)
AI: Claude claude-sonnet-4-20250514 (Anthropic) — uses native fetch (Node 18 built-in)
Weather: Open-Meteo — completely free, no key needed

## 🚀 Deploy

- **Backend:** Railway or Render (free tier) — set env vars, push, done
- **Frontend:** Vercel — set `REACT_APP_API_URL=https://your-backend-url/api`
- **Database:** MongoDB Atlas M0 (free forever)
