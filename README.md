# 🧠 MindMate - AI-Powered Mental Wellness Platform

> A comprehensive mental wellness platform combining AI therapy, mood tracking, cognitive games, and community support.

[![Status](https://img.shields.io/badge/status-production%20ready-brightgreen)]()
[![WCAG](https://img.shields.io/badge/WCAG-2.1%20AA-blue)]()
[![License](https://img.shields.io/badge/license-MIT-green)]()

---

## 🚀 Quick Start

### Prerequisites

- Node.js (v18+)
- Python (v3.9+)
- Supabase Account
- Gemini API Key

### Installation

```bash
# 1. Clone the repository
git clone <repository-url>
cd MindMateWeb

# 2. Backend Setup
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
# Configure .env file

# 3. Frontend Setup
cd ../frontend
npm install
# Configure .env.local file

# 4. Run the application
# Option A: Use run scripts
.\run.bat  # Windows
./run.sh   # macOS/Linux

# Option B: Manual start
# Terminal 1: cd backend && python main.py
# Terminal 2: cd frontend && npm run dev
```

### Access

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

📖 **Detailed Guide**: See [QUICK_START_GUIDE.md](QUICK_START_GUIDE.md)

---

## ✨ Features

### 🎭 Core Features

- **AI Therapy Sessions** - Powered by Google Gemini AI with conversation memory
- **Private Journal** - Encrypted journaling with PIN protection
- **FeelHear** - Voice emotion analysis using AI
- **FeelFlow** - Mood tracking with beautiful visualizations
- **Brain Gym** - Cognitive games for mental fitness
- **Symphony** - Global emotional map and community support
- **Content Library** - Curated mental wellness resources
- **Digital Wellness** - Screen time monitoring and insights
- **Wellness Plan** - Personalized goal tracking dashboard

### 🎨 User Experience

- ✅ Beautiful soft lavender theme with dark mode
- ✅ Fully responsive design (mobile, tablet, desktop)
- ✅ WCAG 2.1 AA accessibility compliant
- ✅ Keyboard navigation support
- ✅ Screen reader compatible
- ✅ Smooth animations with reduced motion support

### 🔒 Security & Privacy

- ✅ End-to-end encryption for sensitive data
- ✅ JWT authentication with Supabase
- ✅ Rate limiting and CORS protection
- ✅ Security headers and HTTPS ready
- ✅ PIN-protected journal entries
- ✅ No data sharing with third parties

---

## 🏗️ Architecture

### Tech Stack

**Frontend**:
- Next.js 14 (React 18)
- TypeScript
- Tailwind CSS
- Framer Motion
- Supabase Client

**Backend**:
- FastAPI (Python)
- Supabase (PostgreSQL)
- Google Gemini AI
- JWT Authentication
- Rate Limiting

**Infrastructure**:
- Supabase (Database, Auth, Storage)
- Vercel (Frontend Hosting)
- Railway/Render (Backend Hosting)

### Project Structure

```
MindMateWeb/
├── backend/              # FastAPI backend
│   ├── routers/         # API endpoints
│   ├── services/        # Business logic
│   ├── middleware/      # Security & logging
│   └── main.py          # Application entry
├── frontend/            # Next.js frontend
│   ├── app/            # Pages & routes
│   ├── components/     # React components
│   ├── lib/            # Utilities & API
│   └── styles/         # CSS & themes
└── docs/               # Documentation
```

---

## 📚 Documentation

| Document | Description |
|----------|-------------|
| [QUICK_START_GUIDE.md](QUICK_START_GUIDE.md) | Get started in 5 minutes |
| [SETUP_GUIDE.md](SETUP_GUIDE.md) | Detailed setup instructions |
| [PROJECT_STATUS.md](PROJECT_STATUS.md) | Current project status |
| [PROJECT_OVERVIEW.md](PROJECT_OVERVIEW.md) | Architecture & design |
| [ACCESSIBILITY_IMPLEMENTATION.md](ACCESSIBILITY_IMPLEMENTATION.md) | Accessibility features |
| [frontend/ACCESSIBILITY.md](frontend/ACCESSIBILITY.md) | User accessibility guide |
| [backend/README.md](backend/README.md) | Backend documentation |
| [frontend/README.md](frontend/README.md) | Frontend documentation |

---

## 🎯 API Endpoints

All endpoints are documented at `/docs` when running the backend.

### Main Routes

- **Authentication**: `/api/auth/*` - Login, register, OAuth
- **Therapy**: `/api/therapy/*` - AI therapy sessions
- **Journal**: `/api/journal/*` - Private journaling
- **Emotions**: `/api/emotion/*` - Emotion tracking
- **FeelHear**: `/api/feelhear/*` - Voice analysis
- **FeelFlow**: `/api/feelflow/*` - Mood tracking
- **Brain Gym**: `/api/braingym/*` - Cognitive games
- **Symphony**: `/api/symphony/*` - Community map
- **Content**: `/api/content/*` - Wellness library
- **Wellness**: `/api/digital-wellness/*` - Digital wellness

---

## 🧪 Testing

### Run Tests

```bash
# Backend tests
cd backend
pytest

# Frontend tests
cd frontend
npm test

# Accessibility audit
# Open browser console at localhost:3000
window.a11y.runAll()
```

### Health Check

```bash
curl http://localhost:8000/health
```

Expected response:
```json
{
  "status": "healthy",
  "version": "1.0.0",
  "database": "connected"
}
```

---

## 🔧 Configuration

### Backend Environment Variables

Create `backend/.env`:

```env
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
SUPABASE_ANON_KEY=your_anon_key
GEMINI_API_KEY=your_gemini_api_key
SECRET_KEY=your_secret_key
ENCRYPTION_KEY=your_encryption_key
ALLOWED_ORIGINS=http://localhost:3000
```

### Frontend Environment Variables

Create `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

---

## 🎨 Features Showcase

### Therapy Sessions
AI-powered therapy with conversation memory, crisis detection, and personalized responses.

### Journal
Private, encrypted journaling with PIN protection, mood tagging, and export functionality.

### FeelHear
Voice emotion analysis using AI to detect emotions from speech patterns.

### FeelFlow
Beautiful mood tracking with charts, trends, and insights over time.

### Brain Gym
Cognitive games including memory match, pattern recognition, and reaction time tests.

### Symphony
Global emotional map showing community emotions with anonymous posting.

---

## 🌟 Accessibility

MindMate is fully accessible and meets WCAG 2.1 AA standards:

- ✅ Keyboard navigation (Tab, Enter, Escape)
- ✅ Screen reader support (NVDA, JAWS, VoiceOver)
- ✅ Color contrast (4.5:1 minimum)
- ✅ Focus indicators on all interactive elements
- ✅ ARIA labels and semantic HTML
- ✅ Reduced motion support
- ✅ Skip links and landmarks

**Keyboard Shortcuts**: Press `Ctrl+/` to view all shortcuts

---

## 🐛 Troubleshooting

### Common Issues

**Port Already in Use**:
```bash
# Kill process on port 8000 or 3000
# Windows: netstat -ano | findstr :8000
# macOS/Linux: lsof -ti:8000 | xargs kill -9
```

**Module Not Found**:
```bash
# Backend: pip install -r requirements.txt --force-reinstall
# Frontend: rm -rf node_modules && npm install
```

**Database Connection Error**:
- Verify Supabase credentials in `.env`
- Check if Supabase project is active
- Ensure database schema is applied

See [QUICK_START_GUIDE.md](QUICK_START_GUIDE.md#troubleshooting) for more solutions.

---

## 📊 Project Status

✅ **All TODOs resolved**  
✅ **No errors detected**  
✅ **All APIs functional**  
✅ **All pages accessible**  
✅ **Full accessibility compliance**  
✅ **Complete documentation**  
✅ **Production ready**

See [PROJECT_STATUS.md](PROJECT_STATUS.md) for detailed status.

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 🙏 Acknowledgments

- **Google Gemini AI** - For AI-powered therapy and analysis
- **Supabase** - For database and authentication
- **Next.js** - For the amazing React framework
- **FastAPI** - For the high-performance backend
- **Tailwind CSS** - For beautiful styling
- **Framer Motion** - For smooth animations

---

## 📞 Support

- **Documentation**: See docs folder
- **Issues**: Open a GitHub issue
- **Email**: support@mindmate.app

---

## 🎉 Get Started Now!

```bash
# Quick start
git clone <repository-url>
cd MindMateWeb
.\run.bat  # Windows
./run.sh   # macOS/Linux
```

Visit http://localhost:3000 and start your mental wellness journey!

---

**Made with ❤️ for mental wellness**
