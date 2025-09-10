// Supabase Edge Function: chat
// Handles chat queries with RAG (Retrieval Augmented Generation)

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { message, history } = await req.json()
    
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    // Get Gemini API key
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY')
    
    if (!geminiApiKey) {
      throw new Error('Gemini API key not configured')
    }

    // 1. Search for relevant transcript sentences
    const searchResults = await searchTranscripts(supabase, message)
    
    // 2. Generate AI response using Gemini
    const response = await generateResponse(message, history, searchResults, geminiApiKey)
    
    // 3. Extract citations from the response
    const citations = extractCitations(searchResults, response.content)
    
    return new Response(
      JSON.stringify({
        id: crypto.randomUUID(),
        content: response.content,
        citations: citations,
        timestamp: new Date().toISOString()
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

async function searchTranscripts(supabase: any, query: string) {
  // Simple text search - in production you might want to use vector embeddings
  const { data: sentences, error } = await supabase
    .from('transcript_sentences')
    .select(`
      *,
      videos (
        id,
        title,
        channel,
        url
      )
    `)
    .textSearch('text', query)
    .limit(10)
  
  if (error) throw error
  
  return sentences || []
}

async function generateResponse(message: string, history: any[], searchResults: any[], geminiApiKey: string) {
  const context = searchResults.map(result => 
    `"${result.text}" (from ${result.videos.title} by ${result.videos.channel})`
  ).join('\n\n')
  
  const prompt = `You are ParliQ, an AI assistant that explains UK parliamentary discussions. 
  
Based on the following parliamentary transcript excerpts, answer the user's question in a warm, educational tone.

Context from parliamentary transcripts:
${context}

Previous conversation:
${history.map(msg => `${msg.role}: ${msg.content}`).join('\n')}

User question: ${message}

Instructions:
- Provide a helpful, accurate answer based on the transcript context
- Use a warm, teacher-like tone
- Reference specific quotes when relevant
- If the context doesn't contain relevant information, say so politely
- Keep responses concise but informative`

  try {
    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': geminiApiKey
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }]
      })
    })
    
    const data = await response.json()
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text || 'I apologize, but I could not generate a response at this time.'
    
    return { content }
  } catch (error) {
    console.error('Gemini API error:', error)
    return { 
      content: 'I apologize, but I encountered an error while processing your question. Please try again.' 
    }
  }
}

function extractCitations(searchResults: any[], responseContent: string) {
  // Extract citations based on which search results are likely referenced in the response
  // This is a simplified approach - in production you might want more sophisticated matching
  
  return searchResults.slice(0, 3).map(result => ({
    video_id: result.video_id,
    title: result.videos.title,
    timestamp: Math.floor(result.start_time),
    text: result.text,
    url: result.videos.url,
    channel: result.videos.channel
  }))
}