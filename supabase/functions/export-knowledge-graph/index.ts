// Supabase Edge Function: export-knowledge-graph
// Exports the knowledge graph as Turtle/TTL format

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
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Fetch all data
    const [videosResult, sentencesResult, entitiesResult] = await Promise.all([
      supabase.from('videos').select('*'),
      supabase.from('transcript_sentences').select('*'),
      supabase.from('entities').select('*')
    ])

    if (videosResult.error) throw videosResult.error
    if (sentencesResult.error) throw sentencesResult.error
    if (entitiesResult.error) throw entitiesResult.error

    const videos = videosResult.data || []
    const sentences = sentencesResult.data || []
    const entities = entitiesResult.data || []

    // Generate Turtle/TTL content
    const turtle = generateTurtle(videos, sentences, entities)
    
    return new Response(
      JSON.stringify({ turtle }),
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

function generateTurtle(videos: any[], sentences: any[], entities: any[]): string {
  const prefixes = `@prefix pol: <http://politics.kg/ontology#> .
@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .
@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .
@prefix dct: <http://purl.org/dc/terms/> .

# ParliQ Knowledge Graph
# Generated: ${new Date().toISOString()}
# Videos: ${videos.length}
# Sentences: ${sentences.length}
# Entities: ${entities.length}

`

  let content = prefixes

  // Add videos
  for (const video of videos) {
    const videoUri = `<http://politics.kg/video/${video.id}>`
    const channelUri = `<http://politics.kg/channel/${video.channel_id}>`
    
    content += `
# Video: ${video.title}
${videoUri} a pol:Video ;
    dct:title "${escapeString(video.title)}" ;
    dct:description "${escapeString(video.description || '')}" ;
    pol:duration ${video.duration} ;
    dct:created "${video.published_at}"^^xsd:dateTime ;
    pol:url "${video.url}" ;
    pol:publishedBy ${channelUri} .

${channelUri} a pol:Channel ;
    rdfs:label "${escapeString(video.channel)}" .
`
  }

  // Add transcript sentences
  for (const sentence of sentences) {
    const sentenceUri = `<http://politics.kg/sentence/${sentence.id}>`
    const videoUri = `<http://politics.kg/video/${sentence.video_id}>`
    
    content += `
${sentenceUri} a pol:TranscriptSentence ;
    pol:text "${escapeString(sentence.text)}" ;
    pol:startTime ${sentence.start_time} ;
    pol:endTime ${sentence.end_time} ;
    pol:sequence ${sentence.sequence} ;
    pol:partOf ${videoUri} .
`
  }

  // Add entities
  for (const entity of entities) {
    const entityUri = `<http://politics.kg/entity/${entity.id}>`
    const videoUri = `<http://politics.kg/video/${entity.video_id}>`
    
    content += `
${entityUri} a pol:${entity.type} ;
    rdfs:label "${escapeString(entity.text)}" ;
    pol:startTime ${entity.start_time} ;
    pol:endTime ${entity.end_time} ;
    pol:confidence ${entity.confidence} ;
    pol:context "${escapeString(entity.context || '')}" ;
    pol:extractedFrom ${videoUri} .
`
  }

  return content
}

function escapeString(str: string): string {
  return str
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r')
    .replace(/\t/g, '\\t')
}