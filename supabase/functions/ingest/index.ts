// Supabase Edge Function: ingest
// Processes YouTube videos for ParliQ - extracts transcripts and metadata

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

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
    console.log('🎬 Ingest function called:', req.method, req.url)
    
    // Only accept POST requests
    if (req.method !== 'POST') {
      console.log('❌ Method not allowed:', req.method)
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { 
          status: 405, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Parse request body
    const body = await req.json()
    console.log('📝 Request body:', body)

    const { urlOrId } = body
    if (!urlOrId) {
      console.log('❌ Missing urlOrId parameter')
      return new Response(
        JSON.stringify({ error: 'Missing urlOrId parameter' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    console.log('🔍 Processing video:', urlOrId)

    // Extract video ID from URL if needed
    const videoId = extractVideoId(urlOrId)
    console.log('📹 Video ID:', videoId)

    // TODO: Add YouTube API integration
    // TODO: Add transcript extraction
    // TODO: Add database storage
    
    // For now, return a basic success response
    const response = {
      ok: true,
      videoId: videoId,
      message: 'Video processing initiated',
      sentences: [], // Will be populated with actual transcript data
      timestamp: new Date().toISOString()
    }

    console.log('✅ Ingest function completed successfully')
    
    return new Response(
      JSON.stringify(response),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('❌ Ingest function error:', error)
    
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        message: error.message,
        timestamp: new Date().toISOString()
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})

/**
 * Extract YouTube video ID from URL or return as-is if already an ID
 */
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