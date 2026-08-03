# GT7 Tuning Helper - Requirements Specification

## Functional Requirements

### FR1: Cloud Sync System
- **FR1.1**: Users can save car setups to Firebase cloud storage
- **FR1.2**: Users can load previously saved setups from the cloud
- **FR1.3**: Setups sync automatically across devices when user is authenticated
- **FR1.4**: Conflict resolution for simultaneous edits (last-write-wins with notification)

### FR2: Community Sharing Platform
- **FR2.1**: Users can publish their setups to a community gallery
- **FR2.2**: Users can browse community setups by car, track, or tuning style
- **FR2.3**: Users can search and filter community setups
- **FR2.4**: Users can download and apply community setups to their garage
- **FR2.5**: Rating and commenting system for community setups

### FR3: Google Drive Integration
- **FR3.1**: OAuth 2.0 authentication with Google Drive API
- **FR3.2**: Export setups as JSON files to user's Google Drive
- **FR3.3**: Import setups from Google Drive
- **FR3.4**: Automatic backup option to Google Drive

### FR4: AI-Powered Tuning Assistance
- **FR4.1**: Chat interface with AI Race Engineer (Gemini-powered)
- **FR4.2**: Contextual tuning recommendations based on:
  - Car specifications
  - Track characteristics
  - Driving style preferences
  - Lap time data
- **FR4.3**: NVIDIA Nemotron integration for advanced reasoning
- **FR4.4**: Explainable AI - show reasoning behind recommendations

### FR5: Setup Comparison Tool
- **FR5.1**: Side-by-side comparison of up to 4 setups
- **FR5.2**: Visual diff highlighting parameter differences
- **FR5.3**: Merge functionality to combine best elements from multiple setups
- **FR5.4**: Historical comparison with previous versions

### FR6: Lap Time Dashboard
- **FR6.1**: Record and store lap times linked to specific setups
- **FR6.2**: Visualize lap time trends over time (charts/graphs)
- **FR6.3**: Sector time analysis
- **FR6.4**: Correlation analysis between setup changes and lap time improvements
- **FR6.5**: Personal best tracking and notifications

## Non-Functional Requirements

### NFR1: Performance
- **NFR1.1**: Page load time < 3 seconds on 3G connection
- **NFR1.2**: AI response time < 5 seconds for tuning recommendations
- **NFR1.3**: Smooth 60fps animations in UI interactions

### NFR2: Security
- **NFR2.1**: Secure OAuth token storage (httpOnly cookies)
- **NFR2.2**: API key protection via server-side environment variables
- **NFR2.3**: Input validation and sanitization on all user inputs
- **NFR2.4**: Rate limiting on API endpoints

### NFR3: Reliability
- **NFR3.1**: 99.9% uptime for cloud sync service
- **NFR3.2**: Automatic retry with exponential backoff for failed API calls
- **NFR3.3**: Graceful degradation when AI services are unavailable

### NFR4: Usability
- **NFR4.1**: Intuitive UI requiring minimal learning curve
- **NFR4.2**: Responsive design supporting desktop and tablet
- **NFR4.3**: Accessibility compliance (WCAG 2.1 AA)
- **NFR4.4**: Clear error messages and recovery guidance

### NFR5: Maintainability
- **NFR5.1**: TypeScript strict mode for type safety
- **NFR5.2**: Component-based architecture with clear separation of concerns
- **NFR5.3**: Comprehensive logging for debugging
- **NFR5.4**: Automated testing coverage > 80%

## Technical Requirements

### TR1: Frontend Architecture
- **TR1.1**: React 19 with functional components and hooks
- **TR1.2**: Vite for fast development builds and optimized production builds
- **TR1.3**: Tailwind CSS v4 for utility-first styling
- **TR1.4**: Motion library for animations
- **TR1.5**: Recharts for data visualization

### TR2: Backend Architecture
- **TR2.1**: Express.js server for API endpoints
- **TR2.2**: Server-side rendering capability for SEO (optional future)
- **TR2.3**: RESTful API design for frontend-backend communication
- **TR2.4**: WebSocket support for real-time features (future consideration)

### TR3: Data Storage
- **TR3.1**: Firebase Realtime Database or Firestore for user data
- **TR3.2**: LocalStorage for offline caching
- **TR3.3**: Structured JSON schema for car setup data

### TR4: AI Integration
- **TR4.1**: Google Generative AI SDK for Gemini models
- **TR4.2**: NVIDIA API integration for Nemotron models
- **TR4.3**: Prompt engineering for consistent, accurate responses
- **TR4.4**: Response caching for common queries

### TR5: Third-Party Integrations
- **TR5.1**: Google OAuth 2.0 for authentication
- **TR5.2**: Google Drive API v3 for file operations
- **TR5.3**: Firebase SDK for cloud services

## Acceptance Criteria

### Phase 1 MVP
- [ ] User can create and save a car setup locally
- [ ] User can authenticate with Firebase
- [ ] User can sync setups to cloud
- [ ] Basic AI chat interface functional with Gemini
- [ ] Setup comparison tool shows 2 setups side-by-side
- [ ] Lap time entry and basic display

### Phase 2 Enhancement
- [ ] Community sharing gallery with search/filter
- [ ] Google Drive export/import
- [ ] Advanced lap time analytics with charts
- [ ] NVIDIA Nemotron integration
- [ ] Multi-setup comparison (up to 4)

### Phase 3 Polish
- [ ] Rating and comments for community setups
- [ ] Advanced AI features (setup optimization suggestions)
- [ ] Mobile-responsive design
- [ ] Performance optimizations
- [ ] Comprehensive testing suite

## Constraints

1. **API Costs**: Gemini and NVIDIA API usage must be monitored and optimized
2. **Firebase Limits**: Free tier limitations on database reads/writes
3. **Browser Support**: Modern browsers only (Chrome, Firefox, Safari, Edge - last 2 versions)
4. **Gran Turismo 7 Data**: No direct game integration; manual data entry required
5. **Privacy**: User data must not be shared without explicit consent

## Out of Scope (v1.0)

- Direct telemetry import from game
- Multiplayer collaboration on setups
- Video replay analysis
- Predictive lap time simulation
- Native mobile apps
