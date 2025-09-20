# Jetlag Planner Backend

FastAPI backend for the Jetlag Planner application that generates personalized circadian plans using AI.

## Features

- **AI-Powered Planning**: Uses Google Gemini to generate personalized jet lag plans
- **Weather Integration**: Fetches weather data for optimal light exposure recommendations
- **Database Integration**: Stores trips, schedules, and user data in Supabase
- **RESTful API**: Clean API endpoints for frontend integration
- **Medical Safety**: Includes disclaimers and safety warnings for medications

## Tech Stack

- **FastAPI**: Modern, fast web framework for building APIs
- **Supabase**: PostgreSQL database with real-time capabilities
- **Google Gemini**: AI model for generating circadian plans
- **WeatherAPI**: Weather data for destination-specific recommendations
- **Pydantic**: Data validation and serialization

## Setup

### Prerequisites

1. Python 3.8+
2. Supabase project
3. Google AI Studio API key
4. WeatherAPI key

### Installation

1. **Clone and navigate to backend directory**:
   ```bash
   cd backend
   ```

2. **Create virtual environment**:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables**:
   ```bash
   cp .env.example .env
   # Edit .env with your actual API keys
   ```

5. **Set up Supabase database**:
   - Run the SQL schema in `schema.sql` in your Supabase SQL editor
   - Configure Google OAuth in Supabase Auth settings

### Environment Variables

Create a `.env` file with the following variables:

```env
SUPABASE_URL=your_supabase_url_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
GEMINI_API_KEY=your_gemini_api_key_here
WEATHERAPI_KEY=your_weatherapi_key_here
BACKEND_PORT=8000
HOST=0.0.0.0
ENVIRONMENT=development
```

### Running the Server

**Development mode**:
```bash
python start.py
# or
uvicorn main:app --reload
```

**Production mode**:
```bash
ENVIRONMENT=production python start.py
```

The API will be available at `http://localhost:8000`

## API Documentation

Once the server is running, visit:
- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`

## API Endpoints

### Health Check
- `GET /api/v1/health` - Check API status

### Trips
- `POST /api/v1/trips` - Create a new trip
- `GET /api/v1/trips?user_id={id}` - Get user's trips
- `GET /api/v1/trips/{trip_id}` - Get specific trip

### Plans
- `POST /api/v1/generate-plan` - Generate AI-powered jet lag plan

### Checklist
- `POST /api/v1/checklist/mark` - Mark action as complete/incomplete

### Weather
- `GET /api/v1/weather?q={city}` - Get weather by city
- `GET /api/v1/weather?lat={lat}&lon={lon}` - Get weather by coordinates
- `GET /api/v1/weather/sunrise-sunset?city={city}` - Get sunrise/sunset times

## Testing

### Sample Request

Use the provided test script to generate sample data:

```bash
python test_sample.py
```

This will output a sample JSON request for the `/generate-plan` endpoint.

### Manual Testing

1. Start the server
2. Use the sample JSON from `test_sample.py`
3. Send POST request to `http://localhost:8000/api/v1/generate-plan`

### Example cURL Request

```bash
curl -X POST "http://localhost:8000/api/v1/generate-plan" \
  -H "Content-Type: application/json" \
  -d '{
    "user": {
      "id": "test-user-123",
      "email": "test@example.com",
      "chronotype": "evening",
      "sleep_baseline": {
        "bedtime": "23:30",
        "waketime": "07:30",
        "typical_duration_minutes": 480
      }
    },
    "trip": {
      "user_id": "test-user-123",
      "origin": "Singapore",
      "origin_timezone": "Asia/Singapore",
      "destination": "Los Angeles",
      "destination_timezone": "America/Los_Angeles",
      "departure_utc": "2025-10-01T02:00:00Z",
      "arrival_utc": "2025-10-01T18:00:00Z",
      "flight_duration_minutes": 900,
      "layovers": []
    },
    "preferences": {
      "max_caffeine_mg": 200,
      "melatonin_preference_mg": 1.0,
      "avoid_medications": false
    }
  }'
```

## Database Schema

The application uses the following main tables:

- **users**: User profiles and preferences
- **trips**: Trip information and metadata
- **schedules**: AI-generated circadian plans
- **actions**: Individual checklist items
- **reminders**: Scheduled reminders
- **wearable_data**: Optional wearable device data

See `schema.sql` for the complete database schema.

## Error Handling

The API includes comprehensive error handling:

- **400 Bad Request**: Invalid input data
- **404 Not Found**: Resource not found
- **500 Internal Server Error**: Server-side errors

All errors return JSON responses with descriptive messages.

## Security

- **CORS**: Configured for frontend domains
- **RLS**: Row Level Security enabled on all tables
- **API Keys**: Stored securely in environment variables
- **Input Validation**: Pydantic models validate all inputs

## Deployment

### Environment Setup

1. Set `ENVIRONMENT=production`
2. Configure production database URL
3. Set secure API keys
4. Configure CORS for production domains

### Docker (Optional)

```dockerfile
FROM python:3.9-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .
EXPOSE 8000

CMD ["python", "start.py"]
```

### Cloud Deployment

The backend can be deployed to:
- **Render**: Easy deployment with automatic scaling
- **Fly.io**: Global deployment with edge computing
- **Railway**: Simple deployment with database integration
- **AWS/GCP/Azure**: For enterprise deployments

## Monitoring

- Health check endpoint for monitoring
- Structured logging for debugging
- Error tracking and reporting
- Performance metrics

## Contributing

1. Follow PEP 8 style guidelines
2. Add type hints to all functions
3. Include docstrings for all public methods
4. Write tests for new features
5. Update documentation

## License

This project is part of the Jetlag Planner application.
