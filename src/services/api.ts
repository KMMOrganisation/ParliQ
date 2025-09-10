import { ChatMessage } from '../types';
import { supabase } from '../lib/supabase';
import { v4 as uuidv4 } from 'uuid';

export class ApiService {
  static async chatQuery(message: string, history: ChatMessage[]): Promise<ChatMessage> {
    try {
      // Convert ChatMessage history to simple format for Supabase function
      const apiHistory = history.map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      const { data, error } = await supabase.functions.invoke('chat', {
        body: { message, history: apiHistory }
      });

      if (error) {
        throw new Error(`Chat failed: ${error.message}`);
      }

      return {
        id: data.id,
        role: 'assistant',
        content: data.content,
        citations: data.citations?.map((citation: any) => ({
          videoId: citation.video_id,
          title: citation.title,
          timestamp: citation.timestamp,
          text: citation.text,
          url: citation.url,
          channel: citation.channel
        })),
        timestamp: new Date(data.timestamp)
      };
    } catch (error) {
      console.error('Failed to send message:', error);
      
      // Fallback response when Edge Functions aren't deployed yet
      return {
        id: uuidv4(),
        role: 'assistant',
        content: `I'm ParliQ, your AI guide to UK Parliament! 

I'm currently being set up with Supabase Edge Functions to provide secure, server-side processing of parliamentary videos and transcripts.

To get me fully working, you'll need to:

1. **Deploy the Supabase Edge Functions** from the \`supabase/functions/\` directory
2. **Run the database schema** from \`supabase/schema.sql\`
3. **Add your YouTube and Gemini API keys** to the Supabase environment

Once that's done, I'll be able to:
- Process YouTube videos of parliamentary debates
- Extract transcripts with sentence-level precision
- Identify political entities (MPs, parties, policies)
- Answer questions with precise video citations
- Export knowledge graphs as TTL files

For now, I'm running in demo mode. Check the README for full setup instructions!`,
        citations: [],
        timestamp: new Date()
      };
    }
  }

  static async getSystemStatus(): Promise<{ status: string; videosIngested: number; entitiesExtracted: number }> {
    try {
      const [videosResult, entitiesResult] = await Promise.all([
        supabase.from('videos').select('id', { count: 'exact', head: true }),
        supabase.from('entities').select('id', { count: 'exact', head: true })
      ]);

      return {
        status: 'active',
        videosIngested: videosResult.count || 0,
        entitiesExtracted: entitiesResult.count || 0
      };
    } catch (error) {
      console.error('Failed to get system status:', error);
      return { status: 'error', videosIngested: 0, entitiesExtracted: 0 };
    }
  }

  static async exportKnowledgeGraph(): Promise<string> {
    try {
      const { data, error } = await supabase.functions.invoke('export-knowledge-graph');

      if (error) {
        throw new Error(`Export failed: ${error.message}`);
      }

      return data.turtle || '';
    } catch (error) {
      console.error('Failed to export knowledge graph:', error);
      
      // Fallback TTL when Edge Functions aren't deployed yet
      return `@prefix pol: <http://politics.kg/ontology#> .
@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .
@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .
@prefix dct: <http://purl.org/dc/terms/> .

# ParliQ Knowledge Graph (Demo Mode)
# Generated: ${new Date().toISOString()}
# 
# This is a demo export. To get real data:
# 1. Deploy Supabase Edge Functions
# 2. Run database schema
# 3. Ingest parliamentary videos
# 
# Then this export will contain actual parliamentary transcripts,
# entities, and knowledge graph triples.

<http://politics.kg/demo> a pol:DemoGraph ;
    rdfs:label "ParliQ Demo Knowledge Graph" ;
    dct:created "${new Date().toISOString()}"^^xsd:dateTime ;
    rdfs:comment "Deploy Edge Functions to populate with real parliamentary data" .
`;
    }
  }

  static async sparqlQuery(query: string): Promise<any> {
    // This would need to be implemented as a Supabase Edge Function if needed
    throw new Error('SPARQL queries not implemented in current version');
  }
}