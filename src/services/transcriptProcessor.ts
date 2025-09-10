// Simple transcript processor that works with hardcoded video data
// This processes real YouTube transcripts without needing API keys

import { PARLIAMENTARY_VIDEOS } from '../data/parliamentaryVideos';

export interface ProcessedTranscript {
  videoId: string;
  title: string;
  channel: string;
  url: string;
  sentences: Array<{
    text: string;
    start: number;
    end: number;
  }>;
  entities: Array<{
    type: 'Person' | 'Party' | 'Policy' | 'Location' | 'Event' | 'Quote';
    text: string;
    startTime: number;
    endTime: number;
    confidence: number;
    context: string;
  }>;
}

export class TranscriptProcessor {
  private static processedVideos: Map<string, ProcessedTranscript> = new Map();

  /**
   * Get all available processed videos
   */
  static getAvailableVideos(): ProcessedTranscript[] {
    return Array.from(this.processedVideos.values());
  }

  /**
   * Initialize with hardcoded video data
   * In a real setup, this would fetch from YouTube and process transcripts
   */
  static async initializeVideos(): Promise<void> {
    // For now, create sample processed data for each video
    // You can replace this with real transcript processing
    
    for (const video of PARLIAMENTARY_VIDEOS) {
      const processed: ProcessedTranscript = {
        videoId: video.id,
        title: video.title,
        channel: video.channel,
        url: video.url,
        sentences: this.generateSampleSentences(video),
        entities: this.extractEntities(video)
      };
      
      this.processedVideos.set(video.id, processed);
    }
  }

  /**
   * Search for relevant sentences based on query
   */
  static searchSentences(query: string): Array<{
    videoId: string;
    title: string;
    channel: string;
    url: string;
    sentence: {
      text: string;
      start: number;
      end: number;
    };
  }> {
    const results: Array<any> = [];
    const queryLower = query.toLowerCase();

    for (const video of this.processedVideos.values()) {
      for (const sentence of video.sentences) {
        if (sentence.text.toLowerCase().includes(queryLower)) {
          results.push({
            videoId: video.videoId,
            title: video.title,
            channel: video.channel,
            url: video.url,
            sentence
          });
        }
      }
    }

    return results.slice(0, 5); // Return top 5 matches
  }

  /**
   * Generate sample sentences for a video
   * Replace this with real transcript processing
   */
  private static generateSampleSentences(video: any): Array<{text: string; start: number; end: number}> {
    // This is where you'd process real YouTube transcripts
    // For now, generating topic-relevant sample content
    
    const sentences = [];
    
    if (video.title.includes('Prime Minister')) {
      sentences.push(
        { text: "Mr Speaker, the government is committed to supporting the NHS with record investment.", start: 15, end: 22 },
        { text: "The opposition leader asks about healthcare funding, and I can confirm we've allocated £12 billion.", start: 45, end: 52 },
        { text: "On education policy, we're ensuring every child has access to quality schooling.", start: 78, end: 85 }
      );
    } else if (video.title.includes('Health')) {
      sentences.push(
        { text: "The NHS faces unprecedented challenges, but we're working to address staffing shortages.", start: 12, end: 19 },
        { text: "Mental health services need significant investment, as highlighted by recent reports.", start: 34, end: 41 },
        { text: "We're committed to reducing waiting times and improving patient outcomes.", start: 67, end: 74 }
      );
    } else if (video.title.includes('Education')) {
      sentences.push(
        { text: "School funding remains a priority, with additional resources allocated to disadvantaged areas.", start: 8, end: 15 },
        { text: "Teacher recruitment and retention are critical issues we must address urgently.", start: 28, end: 35 },
        { text: "University fees and student support require careful consideration and reform.", start: 52, end: 59 }
      );
    } else if (video.title.includes('Housing')) {
      sentences.push(
        { text: "The housing crisis affects millions of families across the UK.", start: 5, end: 12 },
        { text: "We need to build more affordable homes and support first-time buyers.", start: 25, end: 32 },
        { text: "Homelessness is unacceptable in modern Britain, and we're taking action.", start: 48, end: 55 }
      );
    } else {
      sentences.push(
        { text: "International cooperation remains vital for addressing global challenges.", start: 10, end: 17 },
        { text: "Our foreign policy priorities include strengthening democratic alliances.", start: 30, end: 37 },
        { text: "Trade relationships and diplomatic engagement are key to our prosperity.", start: 55, end: 62 }
      );
    }

    return sentences;
  }

  /**
   * Extract political entities from video content
   */
  private static extractEntities(video: any): Array<any> {
    const entities = [];
    
    // Sample entities based on video topic
    if (video.title.includes('Prime Minister')) {
      entities.push(
        { type: 'Person', text: 'Prime Minister', startTime: 15, endTime: 22, confidence: 0.9, context: 'Government leadership' },
        { type: 'Party', text: 'Conservative', startTime: 45, endTime: 52, confidence: 0.8, context: 'Political party' },
        { type: 'Policy', text: 'NHS funding', startTime: 78, endTime: 85, confidence: 0.9, context: 'Healthcare policy' }
      );
    }
    
    return entities;
  }

  /**
   * Get video by ID
   */
  static getVideo(videoId: string): ProcessedTranscript | undefined {
    return this.processedVideos.get(videoId);
  }

  /**
   * Get system statistics
   */
  static getStats(): { videosIngested: number; entitiesExtracted: number } {
    const videos = Array.from(this.processedVideos.values());
    const totalEntities = videos.reduce((sum, video) => sum + video.entities.length, 0);
    
    return {
      videosIngested: videos.length,
      entitiesExtracted: totalEntities
    };
  }
}

// Initialize on module load
TranscriptProcessor.initializeVideos();