# Jetlag Planner Frontend

React-based frontend for the Jetlag Planner application that provides personalized circadian plans to prevent or fix jet lag.

## Features

- **Personalized Planning**: AI-generated circadian plans based on chronobiology
- **Interactive Checklists**: Track progress with daily checklists
- **Weather Integration**: Real-time weather data for optimal light exposure
- **Ambient Environment**: Calming sounds and lighting controls
- **Reminder System**: In-app reminders and calendar export
- **PWA Support**: Progressive Web App with offline capabilities
- **Mobile-First**: Responsive design optimized for mobile devices

## Tech Stack

- **React 18**: Modern React with hooks and functional components
- **Vite**: Fast build tool and development server
- **Tailwind CSS**: Utility-first CSS framework
- **React Router**: Client-side routing
- **Supabase**: Authentication and real-time database
- **PWA**: Progressive Web App capabilities

## Setup

### Prerequisites

1. Node.js 16+ and npm
2. Supabase project with Google OAuth configured
3. Backend API running (see backend README)

### Installation

1. **Navigate to frontend directory**:
   ```bash
   cd frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   ```bash
   cp .env.example .env
   # Edit .env with your actual values
   ```

4. **Start development server**:
   ```bash
   npm run dev
   ```

The app will be available at `http://localhost:5173`

### Environment Variables

Create a `.env` file with the following variables:

```env
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
VITE_API_URL=http://localhost:8000
VITE_PWA_APP_ID=com.jetlagify.mobile
VITE_GOOGLE_OAUTH_REDIRECT_URL=http://localhost:5173
```

## Project Structure

```
frontend/
├── public/
│   ├── manifest.json          # PWA manifest
│   └── icon-*.png            # App icons
├── src/
│   ├── components/           # Reusable UI components
│   │   ├── Layout.jsx        # Main layout wrapper
│   │   ├── ScheduleTimeline.jsx
│   │   ├── DailyChecklist.jsx
│   │   ├── WeatherWidget.jsx
│   │   ├── ReminderScheduler.jsx
│   │   └── MusicPlayer.jsx
│   ├── contexts/             # React contexts
│   │   └── AuthContext.jsx   # Authentication context
│   ├── pages/                # Page components
│   │   ├── Login.jsx
│   │   ├── Home.jsx
│   │   ├── TripPlanner.jsx
│   │   ├── TripView.jsx
│   │   ├── TripHistory.jsx
│   │   ├── Profile.jsx
│   │   └── Legal.jsx
│   ├── lib/                  # Utility libraries
│   │   ├── supabase.js       # Supabase client
│   │   └── api.js            # API client
│   ├── utils/                # Utility functions
│   │   └── timezones.js      # Timezone data
│   ├── hooks/                # Custom React hooks
│   ├── App.jsx               # Main app component
│   ├── main.jsx              # App entry point
│   └── index.css             # Global styles
├── tailwind.config.js        # Tailwind configuration
├── postcss.config.js         # PostCSS configuration
├── vite.config.js            # Vite configuration
└── package.json
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Key Components

### Authentication
- **AuthContext**: Manages user authentication state
- **Google OAuth**: Sign in with Google via Supabase
- **User Profiles**: Automatic profile creation on sign-in

### Trip Planning
- **TripForm**: Comprehensive form for trip details
- **Timezone Validation**: Validates timezone selections
- **Layover Support**: Handles multiple layovers
- **Real-time Validation**: Client-side form validation

### Schedule Display
- **ScheduleTimeline**: Expandable timeline view
- **DailyChecklist**: Interactive progress tracking
- **Action Types**: Color-coded action categories
- **Priority Indicators**: Visual priority levels

### Weather Integration
- **WeatherWidget**: Real-time weather display
- **Sunrise/Sunset**: Local sun times
- **Light Recommendations**: Weather-based tips

### Ambient Environment
- **MusicPlayer**: Calming sound options
- **Ambient Lighting**: Color and brightness controls
- **Visual Effects**: On-screen lighting preview

### Reminders
- **In-App Reminders**: setTimeout-based notifications
- **Calendar Export**: ICS file generation
- **Scheduling**: Smart reminder timing

## Styling

The app uses Tailwind CSS with custom configuration:

- **Custom Colors**: Jetlag-themed color palette
- **Responsive Design**: Mobile-first approach
- **Component Classes**: Reusable utility classes
- **Dark Mode**: System preference support

## PWA Features

- **Manifest**: App installation support
- **Service Worker**: Offline capabilities
- **App Icons**: Multiple icon sizes
- **Splash Screen**: Custom splash screen

## State Management

- **React Context**: Global state management
- **Local State**: Component-level state
- **Supabase**: Real-time data synchronization
- **API Client**: Centralized API calls

## Error Handling

- **Global Error Boundary**: Catches React errors
- **API Error Handling**: User-friendly error messages
- **Validation Errors**: Form validation feedback
- **Network Errors**: Offline state handling

## Performance

- **Code Splitting**: Lazy loading of routes
- **Image Optimization**: Optimized images
- **Bundle Analysis**: Webpack bundle analyzer
- **Caching**: Efficient data caching

## Testing

### Manual Testing
1. Start both frontend and backend
2. Sign in with Google
3. Create a new trip
4. View generated schedule
5. Test checklist functionality
6. Test reminders and calendar export

### Browser Testing
- Chrome (recommended)
- Firefox
- Safari
- Edge

## Deployment

### Build for Production
```bash
npm run build
```

### Deploy to Static Host
The built files in `dist/` can be deployed to:
- **Vercel**: `vercel --prod`
- **Netlify**: Drag and drop `dist/` folder
- **GitHub Pages**: Push to `gh-pages` branch
- **AWS S3**: Upload to S3 bucket

### Environment Configuration
Update environment variables for production:
- `VITE_API_URL`: Production backend URL
- `VITE_GOOGLE_OAUTH_REDIRECT_URL`: Production redirect URL

## Browser Support

- **Modern Browsers**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **Mobile Browsers**: iOS Safari 14+, Chrome Mobile 90+
- **PWA Support**: Chrome, Edge, Safari (iOS)

## Accessibility

- **Keyboard Navigation**: Full keyboard support
- **Screen Readers**: ARIA labels and roles
- **Color Contrast**: WCAG AA compliant
- **Focus Management**: Visible focus indicators

## Security

- **Environment Variables**: Secure API key handling
- **CORS**: Configured for backend communication
- **HTTPS**: Required for PWA features
- **Content Security Policy**: XSS protection

## Troubleshooting

### Common Issues

1. **CORS Errors**: Check backend CORS configuration
2. **Authentication Issues**: Verify Supabase configuration
3. **API Errors**: Check backend server status
4. **Build Errors**: Clear node_modules and reinstall

### Debug Mode
Enable debug logging:
```javascript
localStorage.setItem('debug', 'jetlag:*')
```

## Contributing

1. Follow React best practices
2. Use functional components and hooks
3. Add PropTypes or TypeScript
4. Write meaningful commit messages
5. Test on multiple devices

## License

This project is part of the Jetlag Planner application.