# ParliQ Enhancement Tasks

## Project Branding
- [x] **Project name & tagline**: Changed to "ParliQ — Understand Parliament, one question at a time"
- [x] **Update package.json**: Changed name from "vite-react-typescript-starter" to "parliq"
- [x] **Update README.md**: Updated title and description with new branding

## Core Features Implementation

### 1. Intro Greeting
- [x] **Empty chat greeting**: Shows "Hi! I'm ParliQ, your AI guide to what's happening in UK Parliament. I'll summarise debates and link you straight to the moments in video. Ask me anything."
- [x] **Replace old suggested questions**: Removed hardcoded question grid
- [x] **Warm, teacher-like tone**: Implemented throughout interface

### 2. Example Prompt Chips
- [x] **Create ExampleChips component**: `src/components/Chat/ExampleChips.tsx`
- [x] **Four topic chips**: Education · NHS/Healthcare · Homelessness · World Politics
- [x] **Auto-fill and send**: Clicking chips sends query immediately
- [x] **Keyboard accessible**: Proper ARIA labels and focus management
- [x] **Mobile responsive**: Horizontal scroll with proper touch targets

### 3. Follow-up Suggestion Chips
- [x] **Create FollowUpChips component**: `src/components/Chat/FollowUpChips.tsx`
- [x] **Generate contextual suggestions**: 3-5 chips based on query/response content
- [x] **Show after assistant responses**: Only on latest message
- [x] **Mobile horizontal scroll**: Proper scrolling behavior
- [x] **Contextual logic**: Topic-based, time-based, and party-based suggestions

### 4. Disclaimer Banner
- [x] **Create DisclaimerBanner component**: `src/components/Chat/DisclaimerBanner.tsx`
- [x] **Persistent banner**: "This tool explains parliamentary discussions. It does not provide legal support or voting advice."
- [x] **Accessible implementation**: Proper ARIA roles and semantic HTML
- [x] **Visual design**: Amber warning colors with icon

### 5. Guardrail for Legal/Voting Advice
- [x] **Create guardrails utility**: `src/utils/guardrails.ts`
- [x] **Detection logic**: Keywords for legal advice and voting guidance
- [x] **Polite refusal message**: Warm, educational tone
- [x] **Resource cards**: Links to Electoral Commission, Citizens Advice, GOV.UK, Parliament.uk
- [x] **Create ResourceCards component**: `src/components/Chat/ResourceCards.tsx`

### 6. Timestamp Precision
- [x] **API enhancement**: Request `citationPrecision: 'sentence'` in chat calls
- [x] **Citation logic**: Aim for sentence-level alignment
- [x] **Link to earliest start time**: For sentence-level precision
- [x] **Updated API service**: Enhanced `src/services/api.ts`

### 7. Mobile Improvements
- [x] **Horizontal scrolling chips**: Both example and follow-up chips
- [x] **Sticky input**: Bottom-positioned with safe area support
- [x] **Large tap targets**: Minimum 44px for all interactive elements
- [x] **Mobile CSS**: Enhanced `src/index.css` with mobile optimizations
- [x] **Touch-friendly design**: Proper spacing and sizing

### 8. Tone Adjustments
- [x] **Warm, teacher-like messaging**: Throughout all components
- [x] **Updated placeholder text**: "Ask about Parliament, policies, MPs, or specific debates..."
- [x] **Helper text**: "I'll explain parliamentary discussions with precise video citations."
- [x] **Error messages**: Supportive and educational tone

## Technical Implementation

### Type Definitions
- [x] **Enhanced types**: Added `ExampleChip`, `FollowUpChip`, `ResourceCard` interfaces
- [x] **ChatMessage extension**: Added `isGuardrailResponse` flag
- [x] **Updated exports**: All new types properly exported

### Component Architecture
- [x] **ExampleChips**: Standalone component with accessibility
- [x] **FollowUpChips**: Context-aware suggestion system
- [x] **DisclaimerBanner**: Persistent accessibility-compliant banner
- [x] **ResourceCards**: Official resource links with icons
- [x] **Enhanced ChatInterface**: Integrated all new components

### State Management
- [x] **Enhanced useChat hook**: Added follow-up suggestions state
- [x] **Guardrail handling**: Integrated detection and response logic
- [x] **Suggestion generation**: Context-aware follow-up creation
- [x] **App.tsx updates**: Pass through new props

### Styling & Accessibility
- [x] **Mobile CSS**: Horizontal scrolling, safe areas, tap targets
- [x] **Scrollbar styling**: Custom thin scrollbars for chip containers
- [x] **Focus management**: Proper focus indicators and keyboard navigation
- [x] **ARIA labels**: Comprehensive accessibility markup
- [x] **High contrast support**: Existing accessibility features maintained

## Documentation & Tracking

### Activity Log
- [x] **Create KIRO_UPDATES.md**: Comprehensive change tracking
- [x] **Timestamp entries**: ISO 8601 format with Europe/London timezone
- [x] **File change tracking**: Complete list of modified files
- [x] **Commit message format**: Conventional commits
- [x] **Detailed explanations**: What changed and why

### README Updates
- [x] **Feature documentation**: Comprehensive feature list
- [x] **Usage instructions**: Updated with new UI elements
- [x] **Example questions**: Updated to match new chips
- [x] **Development log section**: Link to KIRO_UPDATES.md
- [x] **Mobile features**: Documented mobile optimizations
- [x] **Accessibility features**: Updated accessibility section

### Kiro Configuration
- [x] **MCP settings**: `.kiro/settings/mcp.json` with filesystem and git servers
- [x] **Steering rules**: `.kiro/steering/parliq-development.md` with comprehensive guidelines
- [x] **Development standards**: TypeScript, accessibility, and code quality rules

## Acceptance Criteria Verification

- [x] **Empty chat shows intro + example chips**: ✅ Implemented
- [x] **Chips send queries**: ✅ Auto-fill and send functionality
- [x] **Answers include precise timestamped citations**: ✅ Sentence-level precision requested
- [x] **Follow-up chips render after answers**: ✅ Context-aware suggestions
- [x] **Mobile chip scrolling**: ✅ Horizontal scroll implemented
- [x] **Disclaimer always visible**: ✅ Persistent banner
- [x] **Legal/voting queries trigger refusal + resources**: ✅ Guardrails implemented
- [x] **Mobile: sticky input**: ✅ Bottom-positioned with safe area
- [x] **Mobile: tap targets ≥44px**: ✅ CSS ensures minimum sizes
- [x] **Tone is warm, professional, neutral**: ✅ Teacher-like messaging throughout
- [x] **KIRO_UPDATES.md reflects all edits**: ✅ Comprehensive tracking

## Status: ✅ COMPLETE

All requested features have been successfully implemented according to the specifications. The ParliQ enhancement is ready for testing and deployment.