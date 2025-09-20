# JetLag Coach Frontend

A React-based frontend application for the JetLag Coach service that provides personalized chronobiology-based jet-lag and shift-work plans.

## Features

- **Modern UI**: Built with React 18, TypeScript, and Tailwind CSS
- **PWA Support**: Progressive Web App with offline capabilities
- **Authentication**: Google OAuth integration
- **Trip Planning**: Interactive trip planner with timezone validation
- **Plan Visualization**: Beautiful chronobiology plan preview with interactive checklists
- **Push Notifications**: Web push notifications for reminders
- **Dark Mode**: Light/dark theme support
- **Responsive Design**: Mobile-first design that works on all devices

## Tech Stack

- **React 18**: Modern React with hooks and concurrent features
- **TypeScript**: Type-safe development
- **Vite**: Fast build tool and development server
- **Tailwind CSS**: Utility-first CSS framework
- **React Router**: Client-side routing
- **TanStack Query**: Server state management
- **LocalForage**: Offline data persistence
- **Workbox**: Service worker and PWA features
- **date-fns**: Date manipulation utilities

## Setup

### Prerequisites

- Node.js 18+
- npm or yarn
- Backend API running (see backend README)

### Installation

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Copy the environment file and configure:
```bash
cp env.example .env
# Edit .env with your actual values
```

4. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_API_BASE_URL` | Backend API URL | Yes |
| `VITE_GOOGLE_CLIENT_ID` | Google OAuth client ID | Yes |
| `VITE_WEB_PUSH_VAPID_PUBLIC_KEY` | VAPID public key for push notifications | No |
| `VITE_WEATHER_API_KEY` | OpenWeatherMap API key | No |

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run test` - Run tests
- `npm run test:ui` - Run tests with UI
- `npm run test:coverage` - Run tests with coverage

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Auth/           # Authentication components
│   ├── Layout/         # Layout components
│   ├── TripPlannerForm/ # Trip planning form
│   ├── ChronoPlanPreview/ # Plan visualization
│   └── DayChecklist/   # Interactive checklist
├── context/            # React context providers
├── hooks/              # Custom React hooks
├── pages/              # Page components
├── services/           # API and external services
├── lib/                # Utility functions
└── types/              # TypeScript type definitions
```

## Key Components

### TripPlannerForm
Interactive form for creating new trips with:
- Location search with autocomplete
- Timezone validation
- Flight time input
- User preference selection

### ChronoPlanPreview
Visualizes the generated chronobiology plan with:
- Day-by-day timeline
- Action categorization
- Progress tracking
- Interactive elements

### DayChecklist
Interactive checklist for daily activities with:
- Mark as complete functionality
- Snooze options
- Progress indicators
- Status tracking

## PWA Features

The application is a Progressive Web App with:
- **Offline Support**: Caches resources and API responses
- **Install Prompt**: Can be installed on mobile devices
- **Push Notifications**: Web push notifications for reminders
- **Background Sync**: Syncs data when connection is restored

## Authentication

Uses Google OAuth for authentication:
1. User clicks "Sign in with Google"
2. Redirects to Google OAuth
3. Returns authorization code
4. Backend exchanges code for user info
5. Frontend receives JWT token
6. Token stored in LocalForage for persistence

## State Management

- **TanStack Query**: Server state (API calls, caching)
- **React Context**: Global app state (auth, theme, trips)
- **LocalForage**: Persistent local storage
- **React Hook Form**: Form state management

## Styling

Uses Tailwind CSS with:
- Custom design system
- Dark mode support
- Responsive breakpoints
- Component-based styling
- Accessibility features

## Testing

- **Vitest**: Test runner
- **React Testing Library**: Component testing
- **Jest DOM**: DOM testing utilities
- **User Event**: User interaction testing

## Deployment

The frontend can be deployed to:
- **Vercel**: Recommended for Vite apps
- **Netlify**: Static site hosting
- **GitHub Pages**: Free hosting for public repos
- **AWS S3**: Static website hosting

### Build for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Development

### Adding New Features

1. Create components in appropriate directories
2. Add types in `src/types/`
3. Create services in `src/services/`
4. Add tests in `__tests__/`
5. Update documentation

### Code Style

- Use TypeScript for all new code
- Follow React best practices
- Use Tailwind CSS for styling
- Write tests for new features
- Use semantic commit messages

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Run the test suite
6. Submit a pull request

## License

This project is licensed under the MIT License.
