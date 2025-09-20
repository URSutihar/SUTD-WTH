# JetLag Coach

A full-stack application that converts chronobiology into step-by-step, personalized jet-lag and shift-work plans. Built with modern web technologies and AI-powered plan generation.

## 🌟 Features

- **AI-Powered Plans**: Uses Google Gemini AI to generate personalized chronobiology plans
- **Google OAuth**: Secure authentication with Google accounts
- **Progressive Web App**: Works offline with push notifications
- **Timezone Intelligence**: Smart timezone handling and conversion
- **Interactive Checklists**: Track your progress with daily action items
- **Weather Integration**: Weather-aware light exposure recommendations
- **Wearable Integration**: Webhook support for health data ingestion
- **Dark Mode**: Beautiful light and dark themes
- **Mobile-First**: Responsive design that works on all devices

## 🏗️ Architecture

### Backend (FastAPI + Python)
- **FastAPI**: Modern, fast web framework for building APIs
- **PostgreSQL**: Primary database with SQLAlchemy ORM
- **Redis**: Caching and background job queue
- **Celery**: Background task processing for notifications
- **Google Gemini AI**: Plan generation and chronobiology analysis
- **Google OAuth**: Authentication and user management
- **Web Push**: Notification delivery system

### Frontend (React + TypeScript)
- **React 18**: Modern React with hooks and concurrent features
- **TypeScript**: Type-safe development
- **Vite**: Fast build tool and development server
- **Tailwind CSS**: Utility-first CSS framework
- **TanStack Query**: Server state management
- **PWA**: Progressive Web App with offline support

## 🚀 Quick Start

### Prerequisites

- Python 3.11+
- Node.js 18+
- PostgreSQL
- Redis
- Google OAuth credentials
- Gemini API key

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Set up environment variables:
```bash
cp env.example .env
# Edit .env with your actual values
```

5. Set up the database:
```bash
# Create database
createdb jetlag_coach

# Run migrations
alembic upgrade head
```

6. Start Redis:
```bash
redis-server
```

7. Start the backend:
```bash
uvicorn app.main:app --reload
```

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp env.example .env
# Edit .env with your actual values
```

4. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## 🔧 Environment Variables

### Backend
```bash
DATABASE_URL=postgresql://user:password@localhost/jetlag_coach
REDIS_URL=redis://localhost:6379
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GEMINI_API_KEY=your_gemini_api_key
WEATHER_API_KEY=your_weather_api_key
JWT_SECRET=your-secret-key-change-in-production
FRONTEND_BASE_URL=http://localhost:3000
WEB_PUSH_VAPID_PUBLIC_KEY=your_vapid_public_key
WEB_PUSH_VAPID_PRIVATE_KEY=your_vapid_private_key
```

### Frontend
```bash
VITE_API_BASE_URL=http://localhost:8000
VITE_GOOGLE_CLIENT_ID=your_google_client_id
VITE_WEB_PUSH_VAPID_PUBLIC_KEY=your_vapid_public_key
VITE_WEATHER_API_KEY=your_weather_api_key
```

## 📱 Usage

1. **Sign In**: Use Google OAuth to authenticate
2. **Plan Trip**: Enter your travel details (origin, destination, flight times)
3. **Generate Plan**: AI creates a personalized chronobiology plan
4. **Follow Plan**: Use the interactive checklist to track daily activities
5. **Get Reminders**: Receive push notifications for scheduled activities

## 🧪 Testing

### Backend Tests
```bash
cd backend
pytest --cov=app --cov-report=html
```

### Frontend Tests
```bash
cd frontend
npm run test:coverage
```

## 🐳 Docker

### Development
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f
```

### Production
```bash
# Build images
docker build -t jetlag-coach-backend ./backend
docker build -t jetlag-coach-frontend ./frontend

# Run containers
docker run -d -p 8000:8000 jetlag-coach-backend
docker run -d -p 3000:3000 jetlag-coach-frontend
```

## 🚀 Deployment

### Backend
- **Railway**: Deploy directly from GitHub
- **Heroku**: Use the Procfile
- **AWS/GCP**: Use container services
- **Docker**: Use the provided Dockerfile

### Frontend
- **Vercel**: Recommended for Vite apps
- **Netlify**: Static site hosting
- **GitHub Pages**: Free hosting for public repos

## 📊 API Documentation

Once the backend is running, you can access:
- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`
- **OpenAPI JSON**: `http://localhost:8000/openapi.json`

## 🔒 Security

- JWT-based authentication
- Google OAuth integration
- Environment variable configuration
- Input validation and sanitization
- CORS protection
- Rate limiting (recommended for production)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Run the test suite
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## ⚠️ Medical Disclaimer

This app provides general guidance, not medical advice. Consult a healthcare professional before using melatonin or making significant changes to sleep or medication routines.

## 🆘 Support

- **Issues**: [GitHub Issues](https://github.com/your-username/jetlag-coach/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-username/jetlag-coach/discussions)
- **Email**: support@jetlagcoach.com

## 🙏 Acknowledgments

- Google Gemini AI for plan generation
- The chronobiology research community
- Open source contributors and maintainers