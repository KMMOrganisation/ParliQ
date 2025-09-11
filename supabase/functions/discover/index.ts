// Supabase Edge Function: discover
// Discovers latest videos from YouTube channels for ParliQ

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
    console.log('🔍 Discover function called:', req.method, req.url)
    
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

    const { channelIds, since } = body
    if (!channelIds || !Array.isArray(channelIds)) {
      console.log('❌ Missing or invalid channelIds parameter')
      return new Response(
        JSON.stringify({ error: 'Missing or invalid channelIds parameter' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    console.log('🔍 Discovering videos for channels:', channelIds)
    console.log('📅 Since:', since)

    // TODO: Add YouTube Data API integration
    // TODO: Add channel video discovery
    // TODO: Add database storage
    
    // For now, return a basic success response
    const response = {
      ok: true,
      videoIds: [], // Will be populated with discovered video IDs
      channelsProcessed: channelIds.length,
      since: since,
      timestamp: new Date().toISOString()
    }

    console.log('✅ Discover function completed successfully')
    
    return new Response(
      JSON.stringify(response),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('❌ Discover function error:', error)
    
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