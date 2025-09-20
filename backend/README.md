# JetLag Coach Backend

A FastAPI-based backend service for the JetLag Coach application that provides chronobiology-based jet-lag and shift-work plans.

## Features

- **Authentication**: Google OAuth integration with JWT tokens
- **Trip Management**: Create, read, update, and delete travel plans
- **AI Plan Generation**: Gemini AI integration for personalized chronobiology plans
- **Push Notifications**: Web push notification system with background scheduling
- **Wearable Integration**: Webhook endpoints for health data ingestion
- **Weather Integration**: Weather API proxy for location-based recommendations

## Tech Stack

- **FastAPI**: Modern, fast web framework for building APIs
- **PostgreSQL**: Primary database
- **Redis**: Caching and background job queue
- **Celery**: Background task processing
- **SQLAlchemy**: ORM for database operations
- **Alembic**: Database migrations
- **Pytest**: Testing framework

## Setup

### Prerequisites

- Python 3.10+
- PostgreSQL
- Redis
- Google OAuth credentials
- Gemini API key

### Installation

1. Clone the repository and navigate to the backend directory:
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

4. Copy the environment file and configure:
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

6. Start Redis (if not already running):
```bash
redis-server
```

7. Start the application:
```bash
uvicorn app.main:app --reload
```

The API will be available at `http://localhost:8000`

## API Documentation

Once the server is running, you can access:
- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`
- **OpenAPI JSON**: `http://localhost:8000/openapi.json`

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `REDIS_URL` | Redis connection string | Yes |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | Yes |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret | Yes |
| `GEMINI_API_KEY` | Google Gemini API key | Yes |
| `WEATHER_API_KEY` | OpenWeatherMap API key | No |
| `JWT_SECRET` | Secret key for JWT tokens | Yes |
| `FRONTEND_BASE_URL` | Frontend application URL | Yes |
| `WEB_PUSH_VAPID_PUBLIC_KEY` | VAPID public key for push notifications | No |
| `WEB_PUSH_VAPID_PRIVATE_KEY` | VAPID private key for push notifications | No |

## Testing

Run the test suite:
```bash
pytest
```

Run tests with coverage:
```bash
pytest --cov=app
```

## Database Migrations

Create a new migration:
```bash
alembic revision --autogenerate -m "Description of changes"
```

Apply migrations:
```bash
alembic upgrade head
```

## Background Tasks

The application uses Celery for background task processing. To run the Celery worker:

```bash
celery -A app.services.scheduler worker --loglevel=info
```

## API Endpoints

### Authentication
- `POST /api/v1/auth/google` - Authenticate with Google OAuth

### Trips
- `POST /api/v1/trips` - Create a new trip
- `GET /api/v1/trips` - Get all user trips
- `GET /api/v1/trips/{trip_id}` - Get specific trip
- `PUT /api/v1/trips/{trip_id}` - Update trip
- `DELETE /api/v1/trips/{trip_id}` - Delete trip

### Plans
- `POST /api/v1/plans/trips/{trip_id}/generate-plan` - Generate chronobiology plan
- `GET /api/v1/plans/trips/{trip_id}/plan` - Get generated plan

### Notifications
- `POST /api/v1/notifications/subscribe` - Subscribe to push notifications
- `GET /api/v1/notifications` - Get user notifications
- `POST /api/v1/notifications` - Create notification
- `DELETE /api/v1/notifications/{notification_id}` - Delete notification

### Wearables
- `POST /api/v1/wearable/webhook` - Receive wearable data
- `GET /api/v1/wearable` - Get wearable data
- `GET /api/v1/wearable/summary` - Get wearable data summary

## Development

### Code Structure

```
app/
├── api/                 # API routes
│   └── v1/
│       └── routes/      # Route handlers
├── core/               # Core functionality
│   ├── config.py       # Configuration
│   └── security.py     # Authentication & security
├── db/                 # Database
│   ├── session.py      # Database session
│   └── migrations/     # Alembic migrations
├── models/             # SQLAlchemy models
├── schemas/            # Pydantic schemas
├── services/           # Business logic
└── main.py            # FastAPI application
```

### Adding New Features

1. Create database models in `app/models/`
2. Create Pydantic schemas in `app/schemas/`
3. Add API routes in `app/api/v1/routes/`
4. Implement business logic in `app/services/`
5. Add tests in `tests/`
6. Create database migration if needed

## Deployment

The application can be deployed to various platforms:

- **Docker**: Use the provided Dockerfile
- **Railway**: Deploy directly from GitHub
- **Heroku**: Use the Procfile
- **AWS/GCP**: Use container services

Make sure to set all required environment variables in your deployment environment.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Run the test suite
6. Submit a pull request

## License

This project is licensed under the MIT License.
