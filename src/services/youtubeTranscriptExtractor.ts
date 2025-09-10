// Real YouTube transcript extraction
// This actually fetches transcripts from YouTube videos

import { YoutubeTranscript } from 'youtube-transcript';

export interface TranscriptSegment {
  text: string;
  start: number;
  end: number;
  duration: number;
}

export interface VideoWithTranscript {
  id: string;
  url: string;
  title: string;
  channel: string;
  description: string;
  transcript: TranscriptSegment[];
  entities: ExtractedEntity[];
}

export interface ExtractedEntity {
  type: 'Person' | 'Party' | 'Policy' | 'Location' | 'Event' | 'Quote';
  text: string;
  startTime: number;
  endTime: number;
  confidence: number;
  context: string;
}

export class YoutubeTranscriptExtractor {
  /**
   * Extract real transcript from YouTube video
   */
  static async extractTranscript(videoId: string): Promise<TranscriptSegment[]> {
    try {
      console.log(`Extracting transcript for video: ${videoId}`);
      
      const transcript = await YoutubeTranscript.fetchTranscript(videoId);
      
      return transcript.map((segment: any) => ({
        text: segment.text,
        start: segment.offset / 1000, // Convert ms to seconds
        duration: segment.duration / 1000,
        end: (segment.offset + segment.duration) / 1000
      }));
    } catch (error) {
      console.error(`Failed to extract transcript for ${videoId}:`, error);
      throw new Error(`Could not extract transcript from video ${videoId}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Process a video with real transcript extraction
   */
  static async processVideo(videoData: {
    id: string;
    url: string;
    title: string;
    channel: string;
    description: string;
  }): Promise<VideoWithTranscript> {
    try {
      console.log(`Processing video: ${videoData.title}`);
      
      // Extract real transcript from YouTube
      const transcript = await this.extractTranscript(videoData.id);
      
      console.log(`Extracted ${transcript.length} transcript segments`);
      
      // Extract entities from real transcript
      const entities = this.extractEntitiesFromTranscript(transcript, videoData);
      
      console.log(`Extracted ${entities.length} entities`);
      
      return {
        ...videoData,
        transcript,
        entities
      };
    } catch (error) {
      console.error(`Failed to process video ${videoData.id}:`, error);
      throw error;
    }
  }

  /**
   * Extract political entities from real transcript text
   */
  private static extractEntitiesFromTranscript(
    transcript: TranscriptSegment[], 
    videoData: any
  ): ExtractedEntity[] {
    const entities: ExtractedEntity[] = [];

    // UK Political entity patterns
    const patterns = {
      Person: [
        /\b(Mr|Mrs|Ms|Dr|Sir|Dame|Lord|Lady)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\b/g,
        /\b(Prime Minister|Chancellor|Secretary of State|Minister|MP)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\b/g,
        /\b(Boris Johnson|Rishi Sunak|Keir Starmer|Jeremy Hunt|Rachel Reeves)\b/gi
      ],
      Party: [
        /\b(Conservative|Labour|Liberal Democrat|SNP|Plaid Cymru|Green Party|UKIP|Brexit Party)\b/gi,
        /\b(Tory|Tories|Lib Dem|Lib Dems)\b/gi
      ],
      Policy: [
        /\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+(Bill|Act|Policy|Strategy|Programme|Scheme)\b/g,
        /\b(NHS|National Health Service|Brexit|Universal Credit|HS2)\b/gi,
        /\b(Net Zero|Climate Change|Levelling Up)\b/gi
      ],
      Location: [
        /\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+(constituency|borough|council|ward)\b/gi,
        /\b(England|Scotland|Wales|Northern Ireland|UK|United Kingdom|Britain)\b/gi,
        /\b(London|Manchester|Birmingham|Liverpool|Leeds|Sheffield|Bristol)\b/gi
      ],
      Event: [
        /\b(General Election|Local Election|Referendum|Budget|Autumn Statement)\b/gi,
        /\b(Prime Minister\'s Questions|PMQs|State Opening|Queen\'s Speech)\b/gi
      ]
    };

    transcript.forEach(segment => {
      Object.entries(patterns).forEach(([type, patternList]) => {
        patternList.forEach(pattern => {
          let match;
          const regex = new RegExp(pattern.source, pattern.flags);
          while ((match = regex.exec(segment.text)) !== null) {
            entities.push({
              type: type as ExtractedEntity['type'],
              text: match[0],
              startTime: segment.start,
              endTime: segment.end,
              confidence: 0.8,
              context: segment.text
            });
          }
        });
      });
    });

    return entities;
  }

  /**
   * Search through real transcript content
   */
  static searchTranscripts(
    videos: VideoWithTranscript[], 
    query: string
  ): Array<{
    videoId: string;
    title: string;
    channel: string;
    url: string;
    segment: TranscriptSegment;
    relevanceScore: number;
  }> {
    const results: any[] = [];
    const queryLower = query.toLowerCase();
    const queryWords = queryLower.split(' ').filter(word => word.length > 2);

    videos.forEach(video => {
      video.transcript.forEach(segment => {
        const segmentLower = segment.text.toLowerCase();
        
        // Calculate relevance score
        let score = 0;
        queryWords.forEach(word => {
          if (segmentLower.includes(word)) {
            score += 1;
          }
        });

        // Boost score for exact phrase matches
        if (segmentLower.includes(queryLower)) {
          score += 3;
        }

        if (score > 0) {
          results.push({
            videoId: video.id,
            title: video.title,
            channel: video.channel,
            url: video.url,
            segment,
            relevanceScore: score
          });
        }
      });
    });

    // Sort by relevance score and return top results
    return results
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, 10);
  }
}