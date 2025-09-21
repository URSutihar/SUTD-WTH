import sys
import os

# Add the backend directory to the Python path
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'backend'))

# Import the real FastAPI app from your backend
from main import app

# Export the app as a Vercel function handler
handler = app
