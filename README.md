<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# GT7 Tuning Helper

Gran Turismo 7 car setup helper with cloud sync, community sharing, and Google Drive export.

View this app in AI Studio: https://ai.studio/apps/035d17f3-708c-4186-a75f-0f23d48f06ed

## Features

- **Cloud Sync**: Save and sync your car setups to the cloud
- **Community Sharing**: Share and browse community-created setups
- **Google Drive Export**: Export your setups directly to Google Drive
- **AI-Powered Assistance**: Get tuning recommendations from Gemini AI
- **Setup Comparison**: Compare different car setups side by side
- **Lap Time Dashboard**: Track and analyze your lap times

## Prerequisites

- Node.js (v18 or higher recommended)
- npm or yarn
- A Gemini API key (for AI features)
- NVIDIA API key (for NVIDIA Nemotron reasoning models)

## Run Locally

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment variables:**
   
   Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local` and set the following:
   - `GEMINI_API_KEY`: Your Gemini API key for AI features
   - `APP_URL`: The URL where your app is hosted (optional for local development)
   - `NVIDIA_API_KEY`: Your NVIDIA API key for accessing Nemotron models

3. **Run the development server:**
   ```bash
   npm run dev
   ```

4. **Open your browser** and navigate to the URL shown in the terminal (typically `http://localhost:5173`)

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start the development server with hot reload |
| `npm run build` | Build the app for production |
| `npm run start` | Start the production server |
| `npm run clean` | Remove build artifacts |
| `npm run lint` | Run TypeScript type checking |

## Project Structure

```
├── src/
│   ├── App.tsx              # Main application component
│   ├── main.tsx             # Application entry point
│   ├── constants.ts         # App constants and configurations
│   ├── types.ts             # TypeScript type definitions
│   ├── googleSync.ts        # Google Drive synchronization logic
│   └── components/          # React components
│       ├── CommunitySharing.tsx    # Community setup sharing
│       ├── LapTimeDashboard.tsx    # Lap time tracking UI
│       ├── OAuthAndSync.tsx        # OAuth and cloud sync
│       ├── RaceEngineerChat.tsx    # AI chat interface
│       ├── SetupComparer.tsx       # Setup comparison tool
│       └── TuningDetails.tsx       # Detailed tuning interface
├── server.ts                # Express backend server
├── vite.config.ts           # Vite configuration
├── tsconfig.json            # TypeScript configuration
└── package.json             # Project dependencies
```

## Technology Stack

- **Frontend**: React 19, TypeScript, Vite
- **Styling**: Tailwind CSS, Motion (animations), Lucide React (icons)
- **Backend**: Express.js, tsx
- **AI**: Google Generative AI (Gemini), NVIDIA Nemotron
- **Cloud**: Firebase, Google APIs
- **Data Visualization**: Recharts

## Deployment

This app is designed to run on Google AI Studio and can be deployed to Cloud Run.

### Deploy to Production

1. Build the application:
   ```bash
   npm run build
   ```

2. The built files will be in the `dist/` directory

3. Deploy using your preferred method (Cloud Run, Vercel, etc.)

## Secrets Configuration

When deploying, ensure the following secrets are configured:

- `GEMINI_API_KEY`: Required for Gemini AI API calls
- `APP_URL`: The URL where your app is hosted
- `NVIDIA_API_KEY`: Required for NVIDIA Nemotron models

## License

This project is private and not licensed for public distribution.

## Support

For issues or questions, please visit the [AI Studio app page](https://ai.studio/apps/035d17f3-708c-4186-a75f-0f23d48f06ed).
