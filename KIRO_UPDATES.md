# ParliQ Development Log

This file tracks all changes made to the ParliQ project by Kiro AI assistant.

## Change History

### 2025-09-09T16:45:28+01:00 – Implemented real YouTube data processing without API dependencies

**Files changed:**
- src/data/parliamentaryVideos.ts (created)
- src/services/transcriptProcessor.ts (created)
- src/services/api.ts
- ADD_YOUR_VIDEOS.md (created)
- README.md

**Commit messages:**
- feat(data): add real YouTube video processing system
- feat(processor): create transcript processor for hardcoded videos
- feat(api): integrate real parliamentary data into chat responses
- docs: create guide for adding real YouTube URLs
- refactor: remove dependency on external APIs for immediate functionality

**Details:**
- **Real data processing**: System now works with actual YouTube videos you provide
- **No API keys needed**: Hardcode 5-10 YouTube URLs directly in the code
- **Immediate functionality**: Works out-of-the-box with real parliamentary content
- **Smart search**: Searches through actual video transcripts for relevant content
- **Real citations**: Provides precise timestamps linking to actual video moments
- **Knowledge graph export**: Generates TTL from real parliamentary data
- **Topic-aware responses**: Tailors responses based on actual video content
- **Simple setup**: Just replace example URLs with real UK Parliament videos

**User Experience:**
- ✅ Add 5-10 real YouTube URLs to `parliamentaryVideos.ts`
- ✅ Get real parliamentary responses immediately
- ✅ Click citations to jump to actual video moments
- ✅ Export real knowledge graph data
- ✅ No complex backend setup required

**Architecture:**
```
UI → ApiService → TranscriptProcessor → Real YouTube Data
```

**Linked issue/PR:** Real YouTube data integration without API dependencies

### 2025-09-09T16:35:12+01:00 – Simplified architecture by removing confusing ParliQApi abstraction

**Files changed:**
- src/services/api.ts
- src/services/videoIngestion.ts
- src/services/parliQApi.ts (deleted)

**Commit messages:**
- refactor: remove unnecessary ParliQApi abstraction layer
- simplify: make ApiService directly call Supabase functions
- cleanup: eliminate confusing double abstraction

**Details:**
- **Removed ParliQApi**: Eliminated unnecessary abstraction layer that was confusing
- **Simplified ApiService**: Now directly calls Supabase functions instead of going through ParliQApi
- **Cleaner architecture**: Direct path from UI → ApiService → Supabase (no middle layer)
- **Same functionality**: All features work exactly the same, just simpler code
- **Better maintainability**: Fewer files and clearer data flow

**Architecture Now:**
```
UI Components → ApiService → Supabase Edge Functions
```

**Before (confusing):**
```
UI Components → ApiService → ParliQApi → Supabase Edge Functions
```

**Linked issue/PR:** Simplify architecture and remove confusion

### 2025-09-09T16:28:45+01:00 – Added demo mode and setup guide for immediate deployment

**Files changed:**
- src/services/parliQApi.ts
- SETUP_GUIDE.md (created)
- README.md

**Commit messages:**
- feat(demo): add demo mode fallbacks for immediate deployment
- docs: create comprehensive setup guide
- feat(ux): provide helpful setup instructions in demo responses

**Details:**
- **Demo mode functionality**: ParliQ now works immediately after deployment with demo responses
- **Graceful fallbacks**: When Edge Functions aren't deployed, shows helpful setup instructions
- **Setup guide**: Comprehensive SETUP_GUIDE.md with step-by-step instructions
- **Immediate deployment**: Users can deploy to Netlify and see working interface right away
- **Clear next steps**: Demo responses explain exactly what needs to be set up for full functionality
- **Production readiness**: Once setup is complete, switches automatically to full functionality

**User Experience:**
- ✅ Deploy immediately and see working ParliQ interface
- ✅ Get clear instructions on how to enable full features
- ✅ No broken states or confusing error messages
- ✅ Smooth transition from demo to production mode

**Linked issue/PR:** Demo mode for immediate deployment

### 2025-09-09T16:15:33+01:00 – Complete Supabase migration for secure API handling

**Files changed:**
- .env.example
- package.json
- src/lib/supabase.ts (created)
- src/services/parliQApi.ts (created)
- src/services/api.ts
- src/services/videoIngestion.ts
- src/vite-env.d.ts
- netlify.toml
- README.md
- supabase/schema.sql (created)
- supabase/functions/ingest-video/index.ts (created)
- supabase/functions/chat/index.ts (created)
- supabase/functions/discover-videos/index.ts (created)
- supabase/functions/export-knowledge-graph/index.ts (created)

**Commit messages:**
- feat(security): migrate to Supabase-only architecture
- feat(backend): create Supabase Edge Functions for video processing
- feat(api): implement secure ParliQApi client
- refactor: remove all direct Google API calls from browser
- feat(database): add comprehensive Supabase schema
- security: update CSP to only allow Supabase connections
- docs: update README for secure deployment model

**Details:**
- **Complete security overhaul**: Removed all Google API keys from browser environment
- **Supabase-only communication**: Browser now only calls *.supabase.co endpoints
- **Server-side processing**: YouTube API and Gemini calls moved to Edge Functions
- **Secure video ingestion**: All transcript extraction and AI processing happens server-side
- **Database schema**: Complete PostgreSQL schema for videos, transcripts, entities, and RDF triples
- **Edge Functions**: Four functions handle ingest-video, chat, discover-videos, and export-knowledge-graph
- **Updated environment**: Only VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY needed in browser
- **CSP security**: Content Security Policy updated to block direct Google API access
- **API abstraction**: New ParliQApi provides clean interface to Supabase functions
- **Maintained UX**: All existing UI/UX, tone, disclaimer, and features preserved
- **Knowledge graph export**: TTL export now generated server-side from database

**Security Benefits:**
- ✅ No API keys exposed to browser or public repository
- ✅ All sensitive operations happen server-side
- ✅ Network requests only go to Supabase (*.supabase.co)
- ✅ Safe for public deployment and open source

**Linked issue/PR:** Supabase migration for secure API handling

### 2025-09-09T15:42:18+01:00 – Made disclaimer less prominent and more integrated

**Files changed:**
- src/components/Chat/ChatInterface.tsx

**Commit messages:**
- feat(ui): integrate disclaimer as subtle note in intro section
- refactor: remove prominent warning banner for better UX

**Details:**
- Removed prominent amber warning banner from top of interface
- Integrated disclaimer as small, subtle note within the intro section
- Changed tone from alarming warning to gentle informational note
- Maintained accessibility and legal compliance while improving user experience
- Reduced visual clutter and made interface more welcoming
- Kept disclaimer content but made it less intimidating for users

**Linked issue/PR:** Make disclaimer less alarming and more integrated

### 2025-09-09T15:35:22+01:00 – Removed admin buttons for end-user interface

**Files changed:**
- src/components/Chat/ChatInterface.tsx
- src/App.tsx

**Commit messages:**
- feat(ui): remove admin buttons from user interface
- refactor: clean up unused imports and props

**Details:**
- Removed "Add Videos", "Export TTL", and "Clear" buttons from header
- Cleaned up unused imports (Plus, Youtube, RotateCcw, Download icons)
- Removed unused props and functions from ChatInterface component
- Simplified App.tsx by removing knowledge graph and export functionality
- Streamlined interface to focus purely on conversational experience
- Maintains clean, user-focused interface without administrative controls

**Linked issue/PR:** Remove admin buttons for end users

### 2025-09-09T15:28:15+01:00 – Added secure deployment configuration for Netlify

**Files changed:**
- src/vite-env.d.ts (created)
- src/services/videoIngestion.ts
- src/components/VideoIngestion/VideoIngestionPanel.tsx
- netlify.toml (created)
- .gitignore (created)
- .env.example
- README.md

**Commit messages:**
- feat(security): add proper environment variable handling for public repos
- feat(deploy): add Netlify configuration with security headers
- fix(types): add Vite environment types for TypeScript
- chore: add comprehensive .gitignore for security
- docs: update README with secure deployment instructions

**Details:**
- Fixed environment variable access for Vite/TypeScript compatibility
- Added proper TypeScript types for import.meta.env
- Created Netlify deployment configuration with security headers and redirects
- Updated API key setup instructions to emphasize security for public repositories
- Added comprehensive .gitignore to prevent accidental API key commits
- Updated .env.example with security warnings and clear instructions
- Added specific Netlify deployment steps in README
- Removed unused imports and fixed TypeScript issues
- Enhanced setup instructions for both local development and cloud deployment

**Linked issue/PR:** Secure deployment configuration for public repository

### 2025-09-09T15:15:42+01:00 – Implemented built-in video ingestion system

**Files changed:**
- package.json
- src/types/video.ts (created)
- src/services/videoIngestion.ts (created)
- src/components/VideoIngestion/VideoIngestionPanel.tsx (created)
- src/hooks/useKnowledgeGraph.ts (created)
- src/components/Chat/ChatInterface.tsx
- src/App.tsx
- src/types/index.ts
- .env.example (created)
- README.md
- data/sample-videos.md (deleted)

**Commit messages:**
- feat(ingestion): add YouTube video processing pipeline
- feat(ui): add video ingestion panel with progress tracking
- feat(kg): implement local knowledge graph management
- feat(rdf): add real-time RDF generation from video content
- feat(ai): integrate Gemini API for entity extraction
- chore: add environment configuration template
- docs: update README for integrated video processing system

**Details:**
- Built complete video ingestion pipeline directly into ParliQ frontend
- Added YouTube Data API v3 integration for video metadata extraction
- Implemented transcript extraction using youtube-transcript library
- Created AI-powered entity extraction with Google Gemini API (optional)
- Added real-time RDF/Turtle generation using N3.js library
- Built comprehensive video ingestion UI with progress tracking
- Integrated local knowledge graph storage and management
- Added support for individual videos, channels, and playlists
- Created entity extraction for MPs, parties, policies, locations, events, quotes
- Implemented sentence-level timestamp precision for citations
- Added comprehensive error handling and fallback mechanisms
- Updated architecture from backend-dependent to integrated system
- Removed dependency on external backend for core functionality

**Linked issue/PR:** Built-in video ingestion implementation

### 2025-09-09T14:52:18+01:00 – Added sample video data specification

**Files changed:** 
- data/sample-videos.md (created)
- README.md

**Commit messages:**
- feat(data): add sample YouTube video specification
- docs: update README with video data setup guidance

**Details:**
- Created data/sample-videos.md template for YouTube URLs that backend should ingest
- Structured by topic categories (Education, NHS/Healthcare, Housing, International Relations)
- Included data quality requirements and backend integration guidance
- Updated README with clear pointers to video data setup process
- Provides framework for content team to add actual parliamentary video URLs

**Linked issue/PR:** Video data specification request

### 2025-09-09T14:45:12+01:00 – Complete ParliQ feature implementation

**Files changed:** 
- package.json
- README.md
- src/types/index.ts
- src/components/Chat/ChatInterface.tsx
- src/components/Chat/ExampleChips.tsx (created)
- src/components/Chat/FollowUpChips.tsx (created)
- src/components/Chat/DisclaimerBanner.tsx (created)
- src/components/Chat/ResourceCards.tsx (created)
- src/hooks/useChat.ts
- src/services/api.ts
- src/utils/guardrails.ts (created)
- src/utils/followUpSuggestions.ts (created)
- src/App.tsx
- src/index.css

**Commit messages:**
- feat: rebrand to ParliQ with new tagline
- feat(chat): add intro greeting and example chips
- feat(ui): add follow-up suggestion chips
- feat(ui): add persistent disclaimer banner
- feat(guardrails): add legal/voting advice detection and resource cards
- feat(citations): request sentence-level precision from backend
- feat(mobile): improve mobile UX with sticky input and scrolling chips
- feat(tone): implement warm, teacher-like messaging throughout
- chore: update README with comprehensive feature documentation

**Details:**
- Rebranded from "UK Politics Knowledge Graph" to "ParliQ" with tagline "Understand Parliament, one question at a time"
- Added welcoming intro greeting when chat is empty explaining ParliQ's capabilities
- Implemented example prompt chips for Education, NHS/Healthcare, Homelessness, World Politics
- Created contextual follow-up suggestion system with 3-5 chips after each assistant response
- Added persistent accessibility-compliant disclaimer banner about tool scope
- Implemented guardrails to detect legal/voting advice requests and redirect to official resources
- Enhanced citation system to request sentence-level precision from backend API
- Improved mobile experience with horizontal scrolling chips, sticky input, and 44px+ tap targets
- Updated tone throughout to be warm, professional, and teacher-like
- Comprehensive README update documenting all new features and usage patterns

**Linked issue/PR:** Complete ParliQ enhancement request

### 2025-09-09T14:22:31+01:00 – Initial ParliQ feature extension

**Files changed:** KIRO_UPDATES.md (created)

**Commit messages:**
- chore: create development activity log

**Details:**
- Created KIRO_UPDATES.md to track all development changes
- Established format for logging changes with timestamps, files, and details
- Preparing for systematic implementation of ParliQ features

**Linked issue/PR:** Initial setup