// Supabase Edge Function: discover-videos
// Discovers latest videos from specified YouTube channels

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { channelIds, since } = await req.json()
    
    const youtubeApiKey = Deno.env.get('YOUTUBE_API_KEY')
    
    if (!youtubeApiKey) {
      throw new Error('YouTube API key not configured')
    }

    const videos = []
    
    // Fetch videos from each channel
    for (const channelId of channelIds) {
      try {
        let searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&type=video&order=date&maxResults=10&key=${youtubeApiKey}`
        
        if (since) {
          searchUrl += `&publishedAfter=${since}`
        }
        
        const response = await fetch(searchUrl)
        
        if (!response.ok) {
          console.error(`YouTube API error for channel ${channelId}:`, response.statusText)
          continue
        }
        
        const data = await response.json()
        
        if (data.items) {
          for (const item of data.items) {
            // Get detailed video info including duration
            const videoResponse = await fetch(
              `https://www.googleapis.com/youtube/v3/videos?id=${item.id.videoId}&part=contentDetails&key=${youtubeApiKey}`
            )
            
            if (videoResponse.ok) {
              const videoData = await videoResponse.json()
              const duration = videoData.items?.[0]?.contentDetails?.duration
              
              videos.push({
                videoId: item.id.videoId,
                title: item.snippet.title,
                publishedAt: item.snippet.publishedAt,
                duration: parseDuration(duration || 'PT0S')
              })
            }
          }
        }
      } catch (error) {
        console.error(`Error fetching videos for channel ${channelId}:`, error)
      }
    }
    
    return new Response(
      JSON.stringify({ videos }),
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

function parseDuration(isoDuration: string): number {
  const match = isoDuration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/)
  if (!match) return 0
  
  const hours = parseInt(match[1] || '0')
  const minutes = parseInt(match[2] || '0')
  const seconds = parseInt(match[3] || '0')
  
  return hours * 3600 + minutes * 60 + seconds
}