# ParliQ Setup Guide

ParliQ is now running in **demo mode**. To get full functionality with YouTube video processing, follow these steps:

## 🚀 Quick Start (Demo Mode)

The current deployment works but shows demo responses. You can:
- ✅ See the ParliQ interface
- ✅ Try example questions (gets demo responses)
- ✅ Export demo knowledge graph
- ✅ Test all UI features

## 🔧 Full Setup (Production Mode)

### 1. Supabase Project Setup

1. **Create Supabase Project** at [supabase.com](https://supabase.com)
2. **Get your credentials** from Settings → API:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
3. **Update Netlify environment variables** with these values

### 2. Database Schema

Run this SQL in your Supabase SQL Editor:

```sql
-- Copy and paste the entire contents of supabase/schema.sql
```

### 3. Deploy Edge Functions

Install Supabase CLI and deploy the functions:

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref YOUR_PROJECT_REF

# Deploy all Edge Functions
supabase functions deploy ingest-video
supabase functions deploy chat
supabase functions deploy discover-videos
supabase functions deploy export-knowledge-graph
```

### 4. Add API Keys to Supabase

In your Supabase dashboard, go to Settings → Edge Functions → Environment Variables:

```
YOUTUBE_API_KEY=your_youtube_api_key_here
GEMINI_API_KEY=your_gemini_api_key_here
```

**Get API Keys:**
- **YouTube API**: [Google Cloud Console](https://console.developers.google.com/) → Enable YouTube Data API v3
- **Gemini API**: [Google AI Studio](https://makersuite.google.com/app/apikey)

### 5. Test the Setup

Once deployed:
1. **Ask a question** in ParliQ - should get real AI responses
2. **Try video ingestion** (when you add that feature back)
3. **Export knowledge graph** - should contain real data

## 🔍 Troubleshooting

### "Demo Mode" Responses
- **Cause**: Edge Functions not deployed or API keys missing
- **Fix**: Complete steps 3-4 above

### Database Errors
- **Cause**: Schema not created
- **Fix**: Run the SQL from `supabase/schema.sql`

### Function Deployment Errors
- **Cause**: Supabase CLI not linked to project
- **Fix**: Run `supabase link --project-ref YOUR_PROJECT_REF`

## 📁 File Structure

```
supabase/
├── schema.sql              # Database schema
└── functions/
    ├── ingest-video/       # Video processing
    ├── chat/              # AI chat responses
    ├── discover-videos/   # Channel discovery
    └── export-knowledge-graph/ # TTL export
```

## 🎯 What You Get

After full setup:
- **Real YouTube video processing**
- **AI-powered parliamentary Q&A**
- **Sentence-level video citations**
- **Entity extraction (MPs, parties, policies)**
- **Knowledge graph export**
- **Secure, server-side API handling**

## 🆘 Need Help?

1. Check Supabase Edge Function logs in your dashboard
2. Verify API keys are set in Supabase environment
3. Ensure database schema is properly created
4. Test Edge Functions individually in Supabase dashboard

The system is designed to be secure and scalable - all sensitive operations happen server-side in Supabase!