#!/usr/bin/env python3
"""
Startup script for the Jetlag Planner backend
"""

import os
import uvicorn
from dotenv import load_dotenv

def main():
    # Load environment variables
    load_dotenv()
    
    # Get configuration
    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("BACKEND_PORT", 8000))
    reload = os.getenv("ENVIRONMENT", "development") == "development"
    
    print(f"Starting Jetlag Planner API on {host}:{port}")
    print(f"Environment: {os.getenv('ENVIRONMENT', 'development')}")
    print(f"Reload: {reload}")
    
    # Start the server
    uvicorn.run(
        "main:app",
        host=host,
        port=port,
        reload=reload,
        log_level="info"
    )

if __name__ == "__main__":
    main()
