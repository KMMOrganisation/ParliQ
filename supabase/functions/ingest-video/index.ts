// Supabase Edge Function: ingest-video
// Deploy this to your Supabase project

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { urlOrId } = await req.json()
    
    // Extract video ID from URL or use as-is
    const videoId = extractVideoId(urlOrId)
    
    // Get API keys from environment
    const youtubeApiKey = Deno.env.get('YOUTUBE_API_KEY')
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY')
    
    if (!youtubeApiKey) {
      throw new Error('YouTube API key not configured')
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // 1. Fetch video metadata from YouTube API
    const videoResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&part=snippet,contentDetails&key=${youtubeApiKey}`
    )
    
    if (!videoResponse.ok) {
      throw new Error(`YouTube API error: ${videoResponse.statusText}`)
    }
    
    const videoData = await videoResponse.json()
    
    if (!videoData.items || videoData.items.length === 0) {
      throw new Error('Video not found')
    }
    
    const video = videoData.items[0]
    const snippet = video.snippet
    const contentDetails = video.contentDetails
    
    // Parse duration
    const duration = parseDuration(contentDetails.duration)
    
    // 2. Fetch transcript using youtube-transcript equivalent
    const transcript = await fetchTranscript(videoId)
    
    // 3. Extract entities (basic pattern matching or AI)
    const entities = geminiApiKey 
      ? await extractEntitiesWithAI(transcript, snippet, geminiApiKey)
      : extractEntitiesBasic(transcript)
    
    // 4. Store in database
    // Insert video
    const { error: videoError } = await supabase
      .from('videos')
      .upsert({
        id: videoId,
        title: snippet.title,
        description: snippet.description || '',
        channel: snippet.channelTitle,
        channel_id: snippet.channelId,
        published_at: snippet.publishedAt,
        duration: duration,
        url: `https://www.youtube.com/watch?v=${videoId}`,
        thumbnail_url: snippet.thumbnails?.high?.url || snippet.thumbnails?.default?.url
      })
    
    if (videoError) throw videoError
    
    // Insert transcript sentences
    const sentences = transcript.map((segment, index) => ({
      video_id: videoId,
      text: segment.text,
      start_time: segment.start,
      end_time: segment.end,
      sequence: index
    }))
    
    const { error: transcriptError } = await supabase
      .from('transcript_sentences')
      .delete()
      .eq('video_id', videoId) // Clear existing
    
    const { error: insertError } = await supabase
      .from('transcript_sentences')
      .insert(sentences)
    
    if (insertError) throw insertError
    
    // Insert entities
    if (entities.length > 0) {
      const { error: entitiesError } = await supabase
        .from('entities')
        .delete()
        .eq('video_id', videoId) // Clear existing
        
      const { error: entitiesInsertError } = await supabase
        .from('entities')
        .insert(entities.map(entity => ({
          video_id: videoId,
          type: entity.type,
          text: entity.text,
          start_time: entity.startTime,
          end_time: entity.endTime,
          confidence: entity.confidence,
          context: entity.context
        })))
        
      if (entitiesInsertError) throw entitiesInsertError
    }
    
    // Return processed data
    return new Response(
      JSON.stringify({
        videoId,
        sentences: transcript.map(s => ({ text: s.text, start: s.start }))
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )
    
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    )
  }
})

function extractVideoId(urlOrId: string): string {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/v\/([^&\n?#]+)/
  ]

  for (const pattern of patterns) {
    const match = urlOrId.match(pattern)
    if (match) return match[1]
  }
  
  // If no pattern matches, assume it's already a video ID
  return urlOrId
}

function parseDuration(isoDuration: string): number {
  const match = isoDuration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/)
  if (!match) return 0
  
  const hours = parseInt(match[1] || '0')
  const minutes = parseInt(match[2] || '0')
  const seconds = parseInt(match[3] || '0')
  
  return hours * 3600 + minutes * 60 + seconds
}

async function fetchTranscript(videoId: string) {
  // This is a simplified version - you'll need to implement transcript fetching
  // You can use the youtube-transcript npm package logic or YouTube's API
  
  // For now, return a placeholder - you'll need to implement this
  // based on your preferred transcript extraction method
  
  try {
    // Option 1: Use YouTube's official transcript API (if available)
    // Option 2: Use youtube-transcript package logic ported to Deno
    // Option 3: Use a third-party service
    
    // Placeholder implementation
    return [
      { text: "This is a sample transcript segment.", start: 0, end: 5 },
      { text: "You need to implement actual transcript fetching.", start: 5, end: 10 }
    ]
  } catch (error) {
    throw new Error(`Failed to fetch transcript: ${error.message}`)
  }
}

function extractEntitiesBasic(transcript: any[]) {
  const entities: any[] = []
  
  // Basic pattern matching for UK political entities
  const patterns = {
    Person: [
      /\b(Mr|Mrs|Ms|Dr|Sir|Dame|Lord|Lady)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\b/g,
      /\b(Prime Minister|Chancellor|Secretary of State|Minister)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\b/g
    ],
    Party: [
      /\b(Conservative|Labour|Liberal Democrat|SNP|Plaid Cymru|Green|UKIP|Brexit Party)\b/gi,
      /\b(Tory|Tories)\b/gi
    ],
    Policy: [
      /\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+(Bill|Act|Policy|Strategy|Programme)\b/g,
      /\bNHS|National Health Service\b/gi
    ]
  }
  
  transcript.forEach(segment => {
    Object.entries(patterns).forEach(([type, patternList]) => {
      patternList.forEach(pattern => {
        let match
        while ((match = pattern.exec(segment.text)) !== null) {
          entities.push({
            type,
            text: match[0],
            startTime: segment.start,
            endTime: segment.end,
            confidence: 0.7,
            context: segment.text
          })
        }
      })
    })
  })
  
  return entities
}

async function extractEntitiesWithAI(transcript: any[], snippet: any, geminiApiKey: string) {
  // Implement AI entity extraction using Gemini API
  // This would be similar to your existing implementation
  
  try {
    const fullText = transcript.map(seg => seg.text).join(' ')
    
    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': geminiApiKey
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `Analyze this UK parliamentary transcript and extract entities. Return JSON array with objects containing:
            - type: "Person", "Party", "Policy", "Location", "Event", or "Quote"
            - text: the entity text
            - startTime: approximate start time in seconds
            - endTime: approximate end time in seconds  
            - confidence: 0-1 confidence score
            - context: surrounding context

            Focus on UK political entities: MPs, ministers, political parties, policies, bills, constituencies, etc.

            Transcript: "${fullText.substring(0, 8000)}"
            
            Video: "${snippet.title}" by ${snippet.channelTitle}`
          }]
        }]
      })
    })
    
    const data = await response.json()
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text
    
    if (text) {
      const entities = JSON.parse(text)
      return entities.filter((entity: any) => 
        entity.type && entity.text && 
        typeof entity.startTime === 'number' && 
        typeof entity.endTime === 'number'
      )
    }
  } catch (error) {
    console.warn('AI entity extraction failed, falling back to basic extraction')
  }
  
  return extractEntitiesBasic(transcript)
}