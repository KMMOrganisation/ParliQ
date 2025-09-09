# ParliQ — "Understand Parliament, one question at a time."

A conversational interface for exploring UK parliamentary discourse through an AI-powered knowledge graph. Ask questions about politicians, policies, parties, and political events, and get answers grounded in real transcript data with source citations.

## Features

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

### Frontend (This Repository)
- React + TypeScript + Tailwind CSS
- Chat-only interface for querying the knowledge graph
- Accessible dark-mode design
- Citation display with YouTube timestamp links

### Backend (Required)
The frontend expects a backend API with the following endpoints:

#### Required API Endpoints

```
POST /api/chat
- Body: { message: string, history: ChatMessage[] }
- Returns: ChatMessage with citations

GET /api/status  
- Returns: { status: string, videosIngested: number, entitiesExtracted: number }

GET /api/export/knowledge-graph.ttl
- Returns: Complete knowledge graph in Turtle format

POST /api/sparql (Optional)
- Body: SPARQL query string
- Returns: Query results
```

#### Expected Data Flow
1. Backend ingests YouTube videos (URLs provided separately)
2. Backend processes transcripts → extracts entities → builds RDF triples
3. Frontend chat queries backend with user questions
4. Backend uses RAG (SPARQL + text search) to find relevant information
5. Backend returns answers with citations including video timestamps

## Setup

### Prerequisites
- Node.js 18+
- Backend API running (see API requirements above)

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

### Environment Variables

Create a `.env` file:

```env
# Backend API base URL
VITE_API_BASE_URL=http://localhost:3001/api

# Optional: Enable debug mode
VITE_DEBUG=true
```

## Usage

1. **Start with Examples**: Click example chips for common topics or type your own question
2. **Ask Questions**: Type natural language questions about UK Parliament and politics
3. **Explore Further**: Use follow-up suggestion chips to dive deeper into topics
4. **View Citations**: Click citation links to jump to specific YouTube timestamps with sentence-level precision
5. **Export Data**: Download the knowledge graph as Turtle format
6. **Clear History**: Reset the conversation at any time

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