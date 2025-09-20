# Jetlag Planner - Deployment Guide

This guide covers deploying the Jetlag Planner application to production.

## 🏗️ Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Database      │
│   (Static)      │◄──►│   (API Server)  │◄──►│   (Supabase)    │
│                 │    │                 │    │                 │
│ • Vercel/Netlify│    │ • Render/Fly    │    │ • Supabase      │
│ • CDN           │    │ • Load Balancer │    │ • PostgreSQL    │
│ • PWA           │    │ • Auto-scaling  │    │ • Real-time     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🚀 Deployment Steps

### 1. Database Setup (Supabase)

1. **Create Production Project**:
   - Go to [supabase.com](https://supabase.com)
   - Create a new project
   - Note down the URL and service role key

2. **Run Database Schema**:
   - Go to SQL Editor in Supabase dashboard
   - Copy and run the contents of `backend/schema.sql`

3. **Configure Authentication**:
   - Go to Authentication > Providers
   - Enable Google OAuth
   - Add production redirect URLs

### 2. Backend Deployment

#### Option A: Render (Recommended)

1. **Create Render Account**:
   - Sign up at [render.com](https://render.com)

2. **Create Web Service**:
   - Connect your GitHub repository
   - Set build command: `pip install -r requirements.txt`
   - Set start command: `python start.py`
   - Set root directory: `backend`

3. **Environment Variables**:
   ```
   SUPABASE_URL=your_production_supabase_url
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   GEMINI_API_KEY=your_gemini_api_key
   WEATHERAPI_KEY=your_weatherapi_key
   BACKEND_PORT=8000
   HOST=0.0.0.0
   ENVIRONMENT=production
   ```

4. **Deploy**:
   - Click "Create Web Service"
   - Wait for deployment to complete
   - Note the production URL

#### Option B: Fly.io

1. **Install Fly CLI**:
   ```bash
   curl -L https://fly.io/install.sh | sh
   ```

2. **Login and Initialize**:
   ```bash
   fly auth login
   cd backend
   fly launch
   ```

3. **Set Environment Variables**:
   ```bash
   fly secrets set SUPABASE_URL=your_url
   fly secrets set SUPABASE_SERVICE_ROLE_KEY=your_key
   fly secrets set GEMINI_API_KEY=your_key
   fly secrets set WEATHERAPI_KEY=your_key
   ```

4. **Deploy**:
   ```bash
   fly deploy
   ```

#### Option C: Railway

1. **Connect Repository**:
   - Go to [railway.app](https://railway.app)
   - Connect your GitHub repository

2. **Configure Service**:
   - Select the backend folder
   - Set environment variables
   - Deploy automatically

### 3. Frontend Deployment

#### Option A: Vercel (Recommended)

1. **Create Vercel Account**:
   - Sign up at [vercel.com](https://vercel.com)

2. **Import Project**:
   - Connect your GitHub repository
   - Set root directory to `frontend`
   - Framework preset: Vite

3. **Environment Variables**:
   ```
   VITE_SUPABASE_URL=your_production_supabase_url
   VITE_SUPABASE_ANON_KEY=your_anon_key
   VITE_API_URL=https://your-backend-url.com
   VITE_PWA_APP_ID=com.jetlagify.mobile
   VITE_GOOGLE_OAUTH_REDIRECT_URL=https://your-frontend-url.com
   ```

4. **Deploy**:
   - Click "Deploy"
   - Wait for build to complete
   - Note the production URL

#### Option B: Netlify

1. **Create Netlify Account**:
   - Sign up at [netlify.com](https://netlify.com)

2. **Build Settings**:
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Root directory: `frontend`

3. **Environment Variables**:
   - Go to Site settings > Environment variables
   - Add all VITE_ variables

4. **Deploy**:
   - Connect repository
   - Deploy automatically

#### Option C: GitHub Pages

1. **Build Locally**:
   ```bash
   cd frontend
   npm run build
   ```

2. **Deploy to GitHub Pages**:
   ```bash
   npm install -g gh-pages
   gh-pages -d dist
   ```

3. **Configure**:
   - Set base URL in `vite.config.js`
   - Update environment variables

### 4. Domain Configuration

1. **Custom Domain** (Optional):
   - Add custom domain in Vercel/Netlify
   - Configure DNS records
   - Update redirect URLs in Supabase

2. **SSL Certificate**:
   - Automatically handled by hosting providers
   - Ensure HTTPS is enabled

## 🔧 Production Configuration

### Backend Configuration

1. **CORS Settings**:
   ```python
   # In main.py
   app.add_middleware(
       CORSMiddleware,
       allow_origins=["https://your-frontend-domain.com"],
       allow_credentials=True,
       allow_methods=["*"],
       allow_headers=["*"],
   )
   ```

2. **Environment Variables**:
   - Set all required environment variables
   - Use secure secret management
   - Never commit secrets to repository

3. **Monitoring**:
   - Set up health checks
   - Configure logging
   - Monitor API performance

### Frontend Configuration

1. **Environment Variables**:
   - Update all VITE_ variables for production
   - Use production API URLs
   - Configure PWA settings

2. **PWA Configuration**:
   - Update manifest.json for production
   - Configure service worker
   - Test offline functionality

3. **Performance**:
   - Enable compression
   - Configure CDN
   - Optimize images

## 🧪 Testing Production

### 1. Health Checks

**Backend**:
```bash
curl https://your-backend-url.com/api/v1/health
```

**Frontend**:
- Visit the production URL
- Check browser console for errors
- Test all major features

### 2. Authentication Test

1. Visit production frontend
2. Click "Sign in with Google"
3. Complete OAuth flow
4. Verify user profile creation

### 3. API Integration Test

1. Create a test trip
2. Generate a plan
3. Test checklist functionality
4. Verify data persistence

### 4. PWA Test

1. Install app on mobile device
2. Test offline functionality
3. Verify push notifications (if implemented)
4. Check app icon and splash screen

## 📊 Monitoring and Maintenance

### 1. Backend Monitoring

- **Uptime**: Monitor API availability
- **Performance**: Track response times
- **Errors**: Log and alert on errors
- **Usage**: Monitor API usage and costs

### 2. Database Monitoring

- **Supabase Dashboard**: Monitor database performance
- **Queries**: Track slow queries
- **Storage**: Monitor database size
- **Backups**: Verify backup schedules

### 3. Frontend Monitoring

- **Analytics**: Track user behavior
- **Performance**: Monitor Core Web Vitals
- **Errors**: Track JavaScript errors
- **Usage**: Monitor PWA usage

## 🔒 Security Considerations

### 1. API Security

- **Rate Limiting**: Implement rate limiting
- **Input Validation**: Validate all inputs
- **CORS**: Restrict to production domains
- **HTTPS**: Ensure all traffic is encrypted

### 2. Database Security

- **RLS**: Row Level Security enabled
- **API Keys**: Secure key management
- **Access Control**: Limit database access
- **Backups**: Encrypt database backups

### 3. Frontend Security

- **CSP**: Content Security Policy
- **HTTPS**: Force HTTPS redirects
- **Environment Variables**: Secure client-side variables
- **Dependencies**: Keep dependencies updated

## 🚨 Troubleshooting

### Common Issues

1. **CORS Errors**:
   - Check backend CORS configuration
   - Verify frontend URL is allowed

2. **Authentication Issues**:
   - Verify Google OAuth configuration
   - Check redirect URLs in Supabase

3. **API Errors**:
   - Check backend logs
   - Verify environment variables
   - Test API endpoints directly

4. **Database Errors**:
   - Check Supabase dashboard
   - Verify RLS policies
   - Check database connection

### Debug Steps

1. **Check Logs**:
   - Backend: Check hosting provider logs
   - Frontend: Check browser console
   - Database: Check Supabase logs

2. **Test Components**:
   - Test API endpoints individually
   - Test frontend components in isolation
   - Test database queries directly

3. **Environment Verification**:
   - Verify all environment variables
   - Check API key validity
   - Verify database connection

## 📈 Scaling Considerations

### Backend Scaling

- **Horizontal Scaling**: Add more backend instances
- **Load Balancing**: Distribute traffic
- **Caching**: Implement Redis caching
- **CDN**: Use CDN for static assets

### Database Scaling

- **Connection Pooling**: Optimize database connections
- **Read Replicas**: Add read replicas
- **Indexing**: Optimize database indexes
- **Partitioning**: Partition large tables

### Frontend Scaling

- **CDN**: Use global CDN
- **Caching**: Implement aggressive caching
- **Code Splitting**: Optimize bundle sizes
- **Lazy Loading**: Load components on demand

## 📞 Support

For deployment issues:

1. Check hosting provider documentation
2. Review application logs
3. Test in staging environment first
4. Contact hosting provider support

Remember to keep your API keys secure and never commit them to version control!
