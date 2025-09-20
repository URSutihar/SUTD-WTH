import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch, MagicMock

from app.main import app

client = TestClient(app)


class TestAuth:
    def test_health_check(self):
        """Test health check endpoint"""
        response = client.get("/health")
        assert response.status_code == 200
        assert response.json() == {"status": "healthy"}
    
    def test_root_endpoint(self):
        """Test root endpoint"""
        response = client.get("/")
        assert response.status_code == 200
        data = response.json()
        assert data["message"] == "JetLag Coach API"
        assert data["version"] == "1.0.0"
    
    @patch('app.api.v1.routes.auth.verify_google_token')
    def test_google_auth_success(self, mock_verify_token):
        """Test successful Google authentication"""
        mock_verify_token.return_value = {
            'email': 'test@example.com',
            'name': 'Test User',
            'google_id': 'test_google_id'
        }
        
        response = client.post("/api/v1/auth/google", json={"code": "test_code"})
        assert response.status_code == 200
        
        data = response.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"
        assert data["user"]["email"] == "test@example.com"
        assert data["user"]["name"] == "Test User"
    
    @patch('app.api.v1.routes.auth.verify_google_token')
    def test_google_auth_failure(self, mock_verify_token):
        """Test Google authentication failure"""
        mock_verify_token.side_effect = Exception("Invalid token")
        
        response = client.post("/api/v1/auth/google", json={"code": "invalid_code"})
        assert response.status_code == 401
        assert "Authentication failed" in response.json()["detail"]
    
    def test_get_user_without_auth(self):
        """Test getting user info without authentication"""
        response = client.get("/api/v1/user")
        assert response.status_code == 403  # No authorization header
    
    def test_get_user_with_invalid_token(self):
        """Test getting user info with invalid token"""
        headers = {"Authorization": "Bearer invalid_token"}
        response = client.get("/api/v1/user", headers=headers)
        assert response.status_code == 401
