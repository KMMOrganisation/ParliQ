# ParliQ — "Understand Parliament, one question at a time."

A conversational interface for exploring UK parliamentary discourse through an AI-powered knowledge graph. Ask questions about politicians, policies, parties, and political events, and get answers grounded in real transcript data with source citations.

## Features

- **Built-in Video Ingestion**: Direct YouTube video and channel processing with transcript extraction
- **AI Entity Extraction**: Automatic identification of MPs, parties, policies, and political entities
- **Real-time RDF Generation**: Converts video content to knowledge graph triples on-the-fly
- **Conversational Q&A**: Natural language interface powered by AI with warm, teacher-like tone
- **Intro Greeting**: Welcoming message explaining ParliQ's capabilities when chat is empty
- **Example Prompt Chips**: One-click access to common topics (Education, NHS/Healthcare, Homelessness, World Politics)
- **Follow-up Suggestions**: Contextual chips after each response for deeper exploration
- **Source Citations**: Every answer includes precise sentence-level citations with YouTube timestamps
- **Knowledge Graph Export**: Download the complete knowledge graph as Turtle (.ttl)
- **Accessible Design**: WCAG 2.2 AA compliant with dark mode and mobile optimization
- **Disclaimer Banner**: Persistent notice about the tool's scope and limitations
- **Guardrails**: Polite refusal of legal/voting advice with resource cards to official sources
- **Real-time Status**: Live updates on ingested videos and extracted entities
- **Mobile Optimized**: Sticky input, horizontal scrolling chips, and 44px+ tap targets

## Architecture

### Integrated System (This Repository)
- **Frontend**: React + TypeScript + Tailwind CSS chat interface
- **Video Processing**: Built-in YouTube transcript extraction and entity recognition
- **Knowledge Graph**: Real-time RDF generation and storage using N3.js
- **AI Integration**: Google Gemini for advanced entity extraction (optional)
- **Accessible Design**: WCAG 2.2 AA compliant dark-mode interface

### Video Ingestion Pipeline
ParliQ includes built-in video processing capabilities:

#### Data Flow
1. **User adds YouTube URL** through the "Add Videos" interface
2. **System extracts metadata** using YouTube Data API v3
3. **Transcript extraction** using youtube-transcript library
4. **AI entity extraction** identifies MPs, parties, policies, locations, events
5. **RDF generation** converts data to knowledge graph triples
6. **Real-time integration** makes content immediately searchable

#### Supported Content
- **Individual Videos**: `youtube.com/watch?v=VIDEO_ID`
- **Channels**: `youtube.com/@channel` or `youtube.com/channel/CHANNEL_ID`
- **Short URLs**: `youtu.be/VIDEO_ID`

#### Entity Types Extracted
- **People**: MPs, Ministers, Committee Chairs
- **Parties**: Conservative, Labour, Liberal Democrat, SNP, etc.
- **Policies**: Bills, Acts, Policy proposals
- **Locations**: Constituencies, regions, countries
- **Events**: Debates, votes, committee sessions
- **Quotes**: Direct statements with precise timestamps

## Setup

### Prerequisites
- Node.js 18+
- Backend API running (see API requirements above)

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/parliq.git
cd parliq

# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Add your API keys to .env file
# VITE_YOUTUBE_API_KEY=your_youtube_api_key_here
# VITE_GEMINI_API_KEY=your_gemini_api_key_here

# Start development server
npm run dev

# Build for production
npm run build
```

### Environment Variables

Create a `.env` file (see `.env.example`):

```env
# YouTube Data API v3 (Required for video ingestion)
VITE_YOUTUBE_API_KEY=your_youtube_api_key_here

# Google Gemini API (Optional - enables AI entity extraction)
VITE_GEMINI_API_KEY=your_gemini_api_key_here

# Backend API base URL (Optional - for external backend integration)
VITE_API_BASE_URL=http://localhost:3001/api

# Debug mode (Optional)
VITE_DEBUG=false
```

#### API Key Setup

**⚠️ Important for Public Repositories**: Never commit API keys to your code. Use environment variables.

1. **YouTube API Key** (Required)
   - Get from [Google Cloud Console](https://console.developers.google.com/)
   - Enable YouTube Data API v3
   - Create credentials → API Key
   - Add to environment variables as `VITE_YOUTUBE_API_KEY`

2. **Gemini API Key** (Optional)
   - Get from [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Enables AI entity extraction (falls back to pattern matching without it)
   - Add to environment variables as `VITE_GEMINI_API_KEY`

#### Deployment on Netlify

1. **Fork/Clone** this repository
2. **Connect to Netlify** via GitHub/GitLab
3. **Add Environment Variables** in Site Settings → Environment Variables:
   ```
   VITE_YOUTUBE_API_KEY = your_youtube_api_key_here
   VITE_GEMINI_API_KEY = your_gemini_api_key_here
   ```
4. **Deploy** - Netlify will automatically build and deploy

The `netlify.toml` file is included with proper build settings and security headers.

## Usage

1. **Add Content**: Click "Add Videos" to ingest YouTube videos or channels
2. **Start with Examples**: Click example chips for common topics or type your own question
3. **Ask Questions**: Type natural language questions about UK Parliament and politics
4. **Explore Further**: Use follow-up suggestion chips to dive deeper into topics
5. **View Citations**: Click citation links to jump to specific YouTube timestamps with sentence-level precision
6. **Export Data**: Download the complete knowledge graph as Turtle format
7. **Clear History**: Reset the conversation at any time

### User Interface Features

- **Intro Greeting**: When starting fresh, ParliQ introduces itself and explains its capabilities
- **Example Chips**: Quick-start buttons for Education, NHS/Healthcare, Homelessness, and World Politics
- **Follow-up Suggestions**: After each response, get 3-5 contextual suggestions for related questions
- **Disclaimer Banner**: Always-visible notice about the tool's scope and limitations
- **Guardrails**: Questions about legal advice or voting guidance are politely redirected to official resources
- **Mobile Friendly**: Horizontal scrolling chips, sticky input, and optimized touch targets

### Example Questions

- "What are the latest discussions about education policy in Parliament?"
- "What has been said about NHS and healthcare in recent parliamentary debates?"
- "What are MPs saying about homelessness and housing policy?"
- "What are the recent parliamentary discussions about international relations?"
- "What do different political parties say about climate change?"

## Accessibility Features

### WCAG 2.2 AA Compliance
- ✅ Skip links for keyboard navigation
- ✅ Proper focus management and visible focus indicators
- ✅ High contrast colors (4.5:1 minimum ratio)
- ✅ Screen reader compatible with ARIA labels
- ✅ Keyboard navigation for all interactive elements
- ✅ Respects `prefers-reduced-motion` settings
- ✅ Large touch targets (44px minimum)
- ✅ Semantic HTML structure

### Testing Accessibility
```bash
# Install axe-core for automated testing
npm install -D @axe-core/react

# Run accessibility audit
npm run test:a11y
```

## Data Model

### Chat Message
```typescript
interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  citations?: Citation[];
  timestamp: Date;
}
```

### Citation
```typescript
interface Citation {
  videoId: string;
  title: string;
  timestamp: number;  // seconds - sentence-level precision
  text: string;       // quoted text from transcript
  url: string;        // YouTube URL
  channel: string;
}
```

### Follow-up Chip
```typescript
interface FollowUpChip {
  id: string;
  label: string;      // Display text
  query: string;      // Full query to send
}
```

## Backend Integration

> **📹 Sample Data**: See [data/sample-videos.md](./data/sample-videos.md) for example YouTube URLs to ingest for testing and demonstration.

The frontend is designed to work with a backend that:

1. **Ingests YouTube Videos**: Processes URLs to extract transcripts and metadata
2. **Builds Knowledge Graph**: Converts transcripts to RDF using politics ontology
3. **Provides RAG**: Combines SPARQL queries with text search for accurate answers
4. **Returns Citations**: Includes source attribution with timestamps

### Expected Ontology
```turtle
@prefix pol: <http://politics.kg/ontology#> .
@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .

# Entity Types
pol:Person, pol:Party, pol:Policy, pol:Location, pol:Event, pol:Quote

# Relations  
pol:saidBy, pol:aboutTopic, pol:affiliatedWith, pol:occurredOn, 
pol:mentionedWith, pol:sourceOf
```

## Development

### Project Structure
```
src/
├── components/
│   └── Chat/
│       └── ChatInterface.tsx    # Main chat component
├── hooks/
│   ├── useChat.ts              # Chat state management
│   └── useSystemStatus.ts      # System status polling
├── services/
│   └── api.ts                  # Backend API client
├── types/
│   └── index.ts                # TypeScript definitions
└── App.tsx                     # Root component
```

### Key Components

- **ChatInterface**: Main chat UI with message history and input
- **useChat**: Hook for managing chat state and API calls
- **useSystemStatus**: Hook for polling system status
- **ApiService**: Client for backend API communication

## Deployment

### Build
```bash
npm run build
```

### Environment Setup
- Set `VITE_API_BASE_URL` to your backend API URL
- Ensure CORS is configured on backend for your domain
- Configure proper CSP headers for security

### Performance
- Messages are virtualized for large chat histories
- Citations are lazy-loaded
- API calls include proper error handling and retries

## Development Log

All development changes are tracked in [KIRO_UPDATES.md](./KIRO_UPDATES.md), including:
- Timestamps for each change
- Files modified
- Commit messages
- Detailed explanations of what changed and why

## Contributing

1. Follow accessibility guidelines (WCAG 2.2 AA)
2. Test with keyboard navigation and screen readers
3. Maintain TypeScript strict mode
4. Use semantic HTML and proper ARIA labels
5. Test on mobile devices and various screen sizes
6. Update KIRO_UPDATES.md for significant changes

## License

MIT License - see LICENSE file for details.