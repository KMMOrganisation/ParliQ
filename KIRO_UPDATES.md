# ParliQ Development Log

This file tracks all changes made to the ParliQ project by Kiro AI assistant.

## Change History

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