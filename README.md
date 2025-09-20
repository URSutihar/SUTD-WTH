# Jetlag Planner

A full-stack web app that turns chronobiology into a simple, personalized, step-by-step plan to prevent or fix jet lag (also supports shift work).

## 🌟 Features

- **AI-Powered Planning**: Personalized circadian plans using Google Gemini
- **Interactive Checklists**: Track progress with daily checklists
- **Weather Integration**: Real-time weather data for optimal light exposure
- **Ambient Environment**: Calming sounds and lighting controls
- **Reminder System**: In-app reminders and calendar export (ICS)
- **PWA Support**: Install as a mobile app
- **Medical Safety**: Comprehensive disclaimers and safety warnings

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   External      │
│   (React)       │◄──►│   (FastAPI)     │◄──►│   Services      │
│                 │    │                 │    │                 │
│ • Trip Planning │    │ • AI Planning   │    │ • Google Gemini │
│ • Checklists    │    │ • Weather API   │    │ • WeatherAPI    │
│ • Reminders     │    │ • Database      │    │ • Supabase      │
│ • PWA           │    │ • Auth          │    │ • Google OAuth  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🚀 Quick Start

### Prerequisites

1. **Node.js 16+** and **Python 3.8+**
2. **Supabase Project** - Create at [supabase.com](https://supabase.com)
3. **Google AI Studio API Key** - Get at [aistudio.google.com](https://aistudio.google.com/)
4. **WeatherAPI Key** - Get at [weatherapi.com](https://weatherapi.com)

### 1. Clone and Setup

```bash
git clone <repository-url>
cd SUTD-WTH
```

### 2. Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# Edit .env with your API keys
```

### 3. Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env
# Edit .env with your Supabase credentials
```

### 4. Database Setup

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Run the SQL from `backend/schema.sql`

### 5. Configure Google OAuth

1. In Supabase dashboard, go to Authentication > Providers
2. Enable Google provider
3. Add your Google OAuth credentials
4. Set redirect URL to `http://localhost:5173`

### 6. Start Development Servers

**Terminal 1 (Backend)**:
```bash
cd backend
python start.py
```

**Terminal 2 (Frontend)**:
```bash
cd frontend
npm run dev
```

Visit `http://localhost:5173` to see the app!

## 📁 Project Structure

```
SUTD-WTH/
├── frontend/                 # React frontend
│   ├── src/
│   │   ├── components/      # UI components
│   │   ├── pages/          # Page components
│   │   ├── contexts/       # React contexts
│   │   ├── lib/            # Utilities
│   │   └── utils/          # Helper functions
│   ├── public/             # Static assets
│   └── package.json
├── backend/                 # FastAPI backend
│   ├── models/             # Pydantic models
│   ├── services/           # Business logic
│   ├── routes/             # API endpoints
│   ├── schema.sql          # Database schema
│   └── requirements.txt
└── README.md
```

## 🔧 Environment Variables

### Frontend (.env)
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_API_URL=http://localhost:8000
VITE_PWA_APP_ID=com.jetlagify.mobile
VITE_GOOGLE_OAUTH_REDIRECT_URL=http://localhost:5173
```

### Backend (.env)
```env
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
GEMINI_API_KEY=your_gemini_api_key
WEATHERAPI_KEY=your_weatherapi_key
BACKEND_PORT=8000
```

## 🧪 Testing

### Test the API
```bash
cd backend
python test_sample.py
```

This generates sample data for testing the `/generate-plan` endpoint.

### Manual Testing
1. Start both servers
2. Sign in with Google
3. Create a new trip
4. View the generated schedule
5. Test checklist functionality

## 📱 PWA Features

The app can be installed as a mobile app:
- **Install**: Look for "Add to Home Screen" in your browser
- **Offline**: Basic functionality works offline
- **Notifications**: In-app reminders (no push notifications)

## 🏥 Medical Disclaimer

⚠️ **IMPORTANT**: This app provides guidance only. Always consult a physician before:
- Taking melatonin or other supplements
- Making major changes to sleep medication
- Following any medical recommendations

The app is not a substitute for professional medical advice.

## 🚀 Deployment

### Frontend (Static Hosting)
```bash
cd frontend
npm run build
# Deploy dist/ folder to Vercel, Netlify, etc.
```

### Backend (Cloud Platform)
```bash
cd backend
# Deploy to Render, Fly.io, Railway, etc.
```

### Database
- Use Supabase hosted PostgreSQL
- Configure production environment variables
- Set up proper CORS for production domains

## 🔍 API Documentation

Once running, visit:
- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`

## 🛠️ Development

### Available Scripts

**Frontend**:
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

**Backend**:
- `python start.py` - Start development server
- `uvicorn main:app --reload` - Alternative start command

### Code Structure

- **Frontend**: React with functional components and hooks
- **Backend**: FastAPI with Pydantic models
- **Database**: Supabase with Row Level Security
- **AI**: Google Gemini for plan generation
- **Weather**: WeatherAPI for destination data

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is part of the Jetlag Planner application.

## 🆘 Support

For issues and questions:
1. Check the troubleshooting sections in individual READMEs
2. Review the API documentation
3. Check browser console for errors
4. Verify environment variables are set correctly
