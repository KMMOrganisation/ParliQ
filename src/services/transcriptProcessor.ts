// Real transcript processor that extracts actual YouTube transcripts
// This processes REAL YouTube transcripts and creates knowledge graphs

import { PARLIAMENTARY_VIDEOS } from '../data/parliamentaryVideos';
import { YoutubeTranscriptExtractor, VideoWithTranscript } from './youtubeTranscriptExtractor';

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
  private static isInitialized = false;
  private static isInitializing = false;

  /**
   * Get all available processed videos
   */
  static getAvailableVideos(): ProcessedTranscript[] {
    return Array.from(this.processedVideos.values());
  }

  /**
   * Initialize with REAL YouTube transcript extraction
   */
  static async initializeVideos(): Promise<void> {
    if (this.isInitialized || this.isInitializing) {
      return;
    }

    this.isInitializing = true;
    console.log('🎬 Starting REAL YouTube transcript extraction...');
    
    try {
      for (const video of PARLIAMENTARY_VIDEOS) {
        try {
          console.log(`📹 Processing: ${video.title}`);
          
          // Extract REAL transcript from YouTube
          const processedVideo = await YoutubeTranscriptExtractor.processVideo(video);
          
          // Convert to our format
          const processed: ProcessedTranscript = {
            videoId: processedVideo.id,
            title: processedVideo.title,
            channel: processedVideo.channel,
            url: processedVideo.url,
            sentences: processedVideo.transcript.map(segment => ({
              text: segment.text,
              start: segment.start,
              end: segment.end
            })),
            entities: processedVideo.entities
          };
          
          this.processedVideos.set(video.id, processed);
          console.log(`✅ Processed ${video.id}: ${processed.sentences.length} segments, ${processed.entities.length} entities`);
          
        } catch (error) {
          console.error(`❌ Failed to process video ${video.id}:`, error);
          // Continue with other videos even if one fails
        }
      }
      
      this.isInitialized = true;
      console.log(`🎉 Completed! Processed ${this.processedVideos.size} videos with REAL transcripts`);
      
    } catch (error) {
      console.error('Failed to initialize videos:', error);
    } finally {
      this.isInitializing = false;
    }
  }

  /**
   * Search for relevant sentences based on query using REAL transcripts
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
    // Ensure videos are initialized
    if (!this.isInitialized && !this.isInitializing) {
      this.initializeVideos();
    }

    const results: Array<any> = [];
    const queryLower = query.toLowerCase();
    const queryWords = queryLower.split(' ').filter(word => word.length > 2);

    for (const video of this.processedVideos.values()) {
      for (const sentence of video.sentences) {
        const sentenceLower = sentence.text.toLowerCase();
        
        // Calculate relevance score
        let score = 0;
        queryWords.forEach(word => {
          if (sentenceLower.includes(word)) {
            score += 1;
          }
        });

        // Boost score for exact phrase matches
        if (sentenceLower.includes(queryLower)) {
          score += 3;
        }

        if (score > 0) {
          results.push({
            videoId: video.videoId,
            title: video.title,
            channel: video.channel,
            url: video.url,
            sentence,
            relevanceScore: score
          });
        }
      }
    }

    // Sort by relevance and return top matches
    return results
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, 5);
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

// Initialize REAL YouTube transcript extraction on module load
TranscriptProcessor.initializeVideos().catch(console.error);