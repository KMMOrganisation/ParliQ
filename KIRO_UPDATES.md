# ParliQ Development Log

This file tracks all changes made to the ParliQ project by Kiro AI assistant.

## Change History

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