# GT7 Tuning Helper - Project Context

## Project Overview
A Gran Turismo 7 car setup tuning helper application with cloud sync, community sharing, and AI-powered assistance.

## Core Features
1. **Cloud Sync** - Save and sync car setups to Firebase
2. **Community Sharing** - Browse and share community-created setups
3. **Google Drive Export** - Export setups directly to Google Drive
4. **AI-Powered Assistance** - Get tuning recommendations from Gemini AI and NVIDIA Nemotron
5. **Setup Comparison** - Compare different car setups side by side
6. **Lap Time Dashboard** - Track and analyze lap times

## Technology Stack
- **Frontend**: React 19, TypeScript, Vite
- **Styling**: Tailwind CSS v4, Motion (animations), Lucide React (icons)
- **Backend**: Express.js, tsx
- **AI Integration**: Google Generative AI (Gemini), NVIDIA Nemotron
- **Cloud Services**: Firebase, Google APIs (Drive, OAuth)
- **Data Visualization**: Recharts
- **Utilities**: date-fns, clsx, tailwind-merge, uuid

## Current Project State
- ✅ Project structure established
- ✅ Main components created:
  - App.tsx (main application)
  - server.ts (Express backend)
  - CommunitySharing.tsx
  - LapTimeDashboard.tsx
  - OAuthAndSync.tsx
  - RaceEngineerChat.tsx
  - SetupComparer.tsx
  - TuningDetails.tsx
- ✅ Configuration files in place (vite.config.ts, tsconfig.json, package.json)
- ✅ Firebase applet config present
- ⚠️ Needs environment variable configuration (.env.local from .env.example)
- ⚠️ Needs dependency installation (npm install)
- ⚠️ Needs testing strategy implementation
- ⚠️ Needs deployment configuration

## Key Dependencies
```json
{
  "@google/genai": "^2.4.0",
  "firebase": "^12.16.0",
  "googleapis": "^173.0.0",
  "react": "^19.0.1",
  "express": "^4.21.2",
  "vite": "^6.2.3"
}
```

## Required API Keys
- GEMINI_API_KEY - For Gemini AI features
- NVIDIA_API_KEY - For NVIDIA Nemotron reasoning models
- APP_URL - Application hosting URL (for OAuth callbacks)

## Target Deployment
- Google AI Studio
- Cloud Run compatible

## Development Commands
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run clean` - Remove build artifacts
- `npm run lint` - TypeScript type checking
