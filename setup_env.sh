#!/bin/bash

# Set environment variables for Vercel deployment
echo "Setting up environment variables for Jetlag Planner..."

# Supabase Configuration
vercel env add VITE_SUPABASE_URL production <<< "https://zwcrvvntxbijupiehnyk.supabase.co"
vercel env add VITE_SUPABASE_ANON_KEY production <<< "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp3Y3J2dm50eGJpanVwaWVobnlrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg0MjcxOTYsImV4cCI6MjA3NDAwMzE5Nn0.KQo-o8Zaw2yZFE878kKp8RastbnooctqAAbcUztaT8U"

# Backend API URL (same domain, subdirectory)
vercel env add VITE_API_URL production <<< "https://jetlag-planner-ar2ilz25w-ursutihars-projects.vercel.app/api"

# PWA Configuration
vercel env add VITE_PWA_APP_ID production <<< "com.jetlagify.mobile"

# Google OAuth Redirect URL
vercel env add VITE_GOOGLE_OAUTH_REDIRECT_URL production <<< "https://jetlag-planner-ar2ilz25w-ursutihars-projects.vercel.app"

# Backend environment variables
vercel env add SUPABASE_URL production <<< "https://zwcrvvntxbijupiehnyk.supabase.co"
vercel env add SUPABASE_SERVICE_ROLE_KEY production <<< "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp3Y3J2dm50eGJpanVwaWVobnlrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODQyNzE5NiwiZXhwIjoyMDc0MDAzMTk2fQ.YPDCKZWaH3WbXRCXj9nw_U8ucMf5R0eUC3VwO13DjrU"

echo "Environment variables configured successfully!"
