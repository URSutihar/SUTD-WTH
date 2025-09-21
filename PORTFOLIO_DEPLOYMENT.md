# Deployment Guide for sutihar.com/projects/sonrelags

This guide will help you deploy the Jetlag Planner application as a subdirectory on your portfolio website.

## 🚀 Quick Deployment Steps

### 1. Backend Deployment (Required First)

Since your frontend needs to connect to a backend API, deploy the backend first:

#### Option A: Render (Recommended - Free Tier Available)
1. Go to [render.com](https://render.com) and sign up
2. Click "New" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Root Directory**: `backend`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `python start.py`
   - **Environment**: Python 3
5. Add Environment Variables:
   ```
   SUPABASE_URL=your_supabase_url
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   GEMINI_API_KEY=your_gemini_api_key
   WEATHERAPI_KEY=your_weatherapi_key
   BACKEND_PORT=8000
   HOST=0.0.0.0
   ENVIRONMENT=production
   ```
6. Deploy and note the URL (e.g., `https://jetlag-api.onrender.com`)

#### Option B: Railway
1. Go to [railway.app](https://railway.app)
2. Connect GitHub repository
3. Select backend folder
4. Add environment variables
5. Deploy automatically

### 2. Database Setup (Supabase)

1. **Create Supabase Project**:
   - Go to [supabase.com](https://supabase.com)
   - Create new project
   - Note URL and API keys

2. **Run Database Schema**:
   - Go to SQL Editor in Supabase dashboard
   - Copy and run contents of `backend/schema.sql`

3. **Configure Google OAuth**:
   - Go to Authentication → Providers
   - Enable Google provider
   - Add redirect URL: `https://sutihar.com/projects/sonrelags`

### 3. Frontend Deployment (Vercel)

#### Method 1: Deploy as Subdirectory (Recommended)

1. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Configure for portfolio deployment"
   git push origin main
   ```

2. **Deploy via Vercel CLI**:
   ```bash
   npm i -g vercel
   cd /Users/urs/Desktop/SUTD-WTH
   vercel
   ```
   - Follow prompts
   - Set root directory to project root
   - Configure environment variables

3. **Configure in Vercel Dashboard**:
   - Go to your project in Vercel dashboard
   - Go to Settings → Environment Variables
   - Add:
     ```
     VITE_SUPABASE_URL=your_supabase_url
     VITE_SUPABASE_ANON_KEY=your_anon_key
     VITE_API_URL=https://your-backend-url.onrender.com
     VITE_PWA_APP_ID=com.jetlagify.mobile
     VITE_GOOGLE_OAUTH_REDIRECT_URL=https://sutihar.com/projects/sonrelags
     ```

4. **Configure Custom Domain**:
   - In Vercel dashboard, go to Settings → Domains
   - Add `sutihar.com`
   - Configure DNS records as instructed

5. **Set up Rewrites**:
   - The `vercel.json` file is already configured
   - Routes `/projects/sonrelags/*` to your frontend

#### Method 2: Deploy Frontend Separately

If you prefer to deploy frontend separately:

1. **Build Frontend**:
   ```bash
   cd frontend
   npm run build
   ```

2. **Deploy to Vercel**:
   - Create new Vercel project
   - Set root directory to `frontend`
   - Deploy with environment variables

3. **Configure Subdirectory**:
   - Use Vercel's rewrites feature
   - Map `/projects/sonrelags` to your frontend URL

### 4. Update CORS Settings

Update your backend CORS configuration to allow your domain:

```python
# In backend/main.py, update CORS origins:
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",  # Development
        "https://sutihar.com",    # Production
        "https://your-vercel-url.vercel.app"  # Vercel preview
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## 🔧 Environment Variables Summary

### Frontend (Vercel)
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_API_URL=https://your-backend-url.onrender.com
VITE_PWA_APP_ID=com.jetlagify.mobile
VITE_GOOGLE_OAUTH_REDIRECT_URL=https://sutihar.com/projects/sonrelags
```

### Backend (Render/Railway)
```
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
GEMINI_API_KEY=your_gemini_api_key
WEATHERAPI_KEY=your_weatherapi_key
BACKEND_PORT=8000
HOST=0.0.0.0
ENVIRONMENT=production
```

## 🧪 Testing Deployment

1. **Test Frontend**: Visit `https://sutihar.com/projects/sonrelags`
2. **Test Authentication**: Try Google OAuth login
3. **Test API**: Create a test trip and generate a plan
4. **Test PWA**: Install as mobile app

## 🚨 Troubleshooting

### Common Issues:

1. **CORS Errors**:
   - Check backend CORS configuration
   - Verify frontend URL is in allowed origins

2. **404 on Refresh**:
   - Ensure Vercel rewrites are configured
   - Check `vercel.json` routing rules

3. **Environment Variables**:
   - Verify all variables are set in Vercel dashboard
   - Check variable names match exactly

4. **Database Connection**:
   - Verify Supabase URL and keys
   - Check database schema is applied

### Debug Steps:

1. Check Vercel function logs
2. Check browser console for errors
3. Test API endpoints directly
4. Verify environment variables

## 📱 PWA Configuration

The app is configured as a PWA and will be installable at:
`https://sutihar.com/projects/sonrelags`

## 🔒 Security Notes

- Never commit API keys to repository
- Use environment variables for all secrets
- Enable HTTPS in production
- Configure proper CORS policies

## 📞 Support

If you encounter issues:
1. Check Vercel deployment logs
2. Verify all environment variables
3. Test components individually
4. Check browser console for errors

Your Jetlag Planner will be live at `sutihar.com/projects/sonrelags` once deployed!
