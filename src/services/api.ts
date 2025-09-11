import { ChatMessage } from '../types';
import { TranscriptProcessor } from './transcriptProcessor';
import { v4 as uuidv4 } from 'uuid';

export class ApiService {
  static async chatQuery(message: string, history: ChatMessage[]): Promise<ChatMessage> {
    try {
      // Ensure videos are loaded from your Supabase setup
      await TranscriptProcessor.initializeVideos();
      
      // Search for relevant content in processed videos
      const searchResults = TranscriptProcessor.searchSentences(message);
      
      // Generate response based on found content
      let content = '';
      let citations: any[] = [];

      if (searchResults.length > 0) {
        // Create response based on found parliamentary content
        content = this.generateResponseFromResults(message, searchResults);
        
        // Create citations from search results
        citations = searchResults.map(result => ({
          videoId: result.videoId,
          title: result.title,
          timestamp: Math.floor(result.sentence.start),
          text: result.sentence.text,
          url: `${result.url}&t=${Math.floor(result.sentence.start)}s`,
          channel: result.channel
        }));
      } else {
        // Try to ingest videos if none are processed yet
        const stats = TranscriptProcessor.getStats();
        if (stats.videosIngested === 0) {
          content = `I'm ready to help you understand UK Parliament! 

I can process the YouTube videos you've provided and answer questions about:
• Parliamentary debates and discussions
• MP speeches and statements  
• Committee hearings and evidence sessions
• Policy discussions and voting

Let me process your videos first. This may take a moment...`;

          // Trigger video processing in the background
          this.processVideosInBackground();
        } else {
          content = `I'd be happy to help you understand parliamentary discussions! 

I have access to ${stats.videosIngested} parliamentary videos. Try asking about topics like:
• NHS and healthcare policy
• Education funding and policy
• Housing and homelessness
• International relations
• Economic policy

What would you like to know about UK Parliament?`;
        }
      }

      return {
        id: uuidv4(),
        role: 'assistant',
        content,
        citations,
        timestamp: new Date()
      };
    } catch (error) {
      console.error('Failed to process chat query:', error);
      
      return {
        id: uuidv4(),
        role: 'assistant',
        content: 'I apologize, but I encountered an error processing your question. Please try asking about UK parliamentary topics like healthcare, education, housing, or foreign policy.',
        citations: [],
        timestamp: new Date()
      };
    }
  }

  /**
   * Process videos in background using your Supabase ingest function
   */
  private static async processVideosInBackground(): Promise<void> {
    try {
      // This will trigger your Supabase ingest function for each video
      await TranscriptProcessor.initializeVideos();
    } catch (error) {
      console.error('Background video processing failed:', error);
    }
  }

  private static generateResponseFromResults(query: string, results: any[]): string {
    const queryLower = query.toLowerCase();
    
    if (queryLower.includes('nhs') || queryLower.includes('health')) {
      return `Based on recent parliamentary discussions about healthcare:

${results[0]?.sentence.text || 'Healthcare remains a key priority in Parliament.'}

The government has been addressing NHS challenges including funding, staffing, and patient care. Parliamentary committees have been examining these issues in detail, with MPs from various parties contributing to the debate.`;
    }
    
    if (queryLower.includes('education') || queryLower.includes('school')) {
      return `From parliamentary debates on education policy:

${results[0]?.sentence.text || 'Education funding and policy are regularly discussed in Parliament.'}

MPs have been debating school funding, teacher recruitment, and educational outcomes. The discussions cover both primary and secondary education, as well as higher education policy.`;
    }
    
    if (queryLower.includes('housing') || queryLower.includes('homeless')) {
      return `Parliamentary discussions on housing policy include:

${results[0]?.sentence.text || 'Housing and homelessness are significant concerns addressed in Parliament.'}

The housing crisis has been a major topic, with debates covering affordable housing, first-time buyer support, and measures to address homelessness across the UK.`;
    }
    
    // General response
    return `From parliamentary proceedings:

${results[0]?.sentence.text || 'This topic has been discussed in Parliament.'}

${results.length > 1 ? `Additionally, ${results[1]?.sentence.text}` : ''}

These discussions reflect the ongoing parliamentary work on important issues affecting the UK.`;
  }

  static async getSystemStatus(): Promise<{ status: string; videosIngested: number; entitiesExtracted: number }> {
    try {
      const stats = TranscriptProcessor.getStats();
      return {
        status: 'active',
        videosIngested: stats.videosIngested,
        entitiesExtracted: stats.entitiesExtracted
      };
    } catch (error) {
      console.error('Failed to get system status:', error);
      return { status: 'error', videosIngested: 0, entitiesExtracted: 0 };
    }
  }

  static async exportKnowledgeGraph(): Promise<string> {
    try {
      const videos = TranscriptProcessor.getAvailableVideos();
      
      let turtle = `@prefix pol: <http://politics.kg/ontology#> .
@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .
@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .
@prefix dct: <http://purl.org/dc/terms/> .

# ParliQ Knowledge Graph
# Generated: ${new Date().toISOString()}
# Videos: ${videos.length}

`;

      // Add video data
      for (const video of videos) {
        const videoUri = `<http://politics.kg/video/${video.videoId}>`;
        
        turtle += `
# Video: ${video.title}
${videoUri} a pol:Video ;
    dct:title "${this.escapeString(video.title)}" ;
    pol:url "${video.url}" ;
    pol:channel "${this.escapeString(video.channel)}" .

`;

        // Add sentences
        video.sentences.forEach((sentence, index) => {
          const sentenceUri = `<http://politics.kg/sentence/${video.videoId}_${index}>`;
          turtle += `${sentenceUri} a pol:TranscriptSentence ;
    pol:text "${this.escapeString(sentence.text)}" ;
    pol:startTime ${sentence.start} ;
    pol:endTime ${sentence.end} ;
    pol:partOf ${videoUri} .

`;
        });

        // Add entities
        video.entities.forEach((entity, index) => {
          const entityUri = `<http://politics.kg/entity/${video.videoId}_${index}>`;
          turtle += `${entityUri} a pol:${entity.type} ;
    rdfs:label "${this.escapeString(entity.text)}" ;
    pol:startTime ${entity.startTime} ;
    pol:endTime ${entity.endTime} ;
    pol:confidence ${entity.confidence} ;
    pol:extractedFrom ${videoUri} .

`;
        });
      }

      return turtle;
    } catch (error) {
      console.error('Failed to export knowledge graph:', error);
      throw new Error('Failed to export knowledge graph');
    }
  }

  private static escapeString(str: string): string {
    return str
      .replace(/\\/g, '\\\\')
      .replace(/"/g, '\\"')
      .replace(/\n/g, '\\n')
      .replace(/\r/g, '\\r')
      .replace(/\t/g, '\\t');
  }

  static async sparqlQuery(query: string): Promise<any> {
    // This would need to be implemented as a Supabase Edge Function if needed
    throw new Error('SPARQL queries not implemented in current version');
  }
}