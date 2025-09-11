// Transcript processor that uses Supabase backend for YouTube data
// This connects to your existing Supabase YouTube API setup

import { PARLIAMENTARY_VIDEOS } from '../data/parliamentaryVideos';
import { supabase } from '../lib/supabase';

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
   * Initialize by calling your Supabase backend to process videos
   */
  static async initializeVideos(): Promise<void> {
    if (this.isInitialized || this.isInitializing) {
      return;
    }

    this.isInitializing = true;
    console.log('🎬 Connecting to Supabase to process YouTube videos...');
    
    try {
      // First, try to load already processed videos from Supabase database
      await this.loadProcessedVideosFromDatabase();
      
      // If no videos in database, process them via Supabase Edge Functions
      if (this.processedVideos.size === 0) {
        await this.processVideosViaSupabase();
      }
      
      this.isInitialized = true;
      console.log(`🎉 Loaded ${this.processedVideos.size} videos from Supabase`);
      
    } catch (error) {
      console.error('Failed to initialize videos from Supabase:', error);
      console.log('📝 Using your hardcoded video list as fallback');
      
      // Fallback: create entries for your videos (they'll be processed when you set up Supabase functions)
      this.createPlaceholderEntries();
    } finally {
      this.isInitializing = false;
    }
  }

  /**
   * Load already processed videos from Supabase database
   */
  private static async loadProcessedVideosFromDatabase(): Promise<void> {
    try {
      // Get videos from your database
      const { data: videos, error: videosError } = await supabase
        .from('videos')
        .select('*')
        .in('video_id', PARLIAMENTARY_VIDEOS.map(v => v.id));

      if (videosError) throw videosError;

      for (const video of videos || []) {
        // Get transcript sentences for this video
        const { data: sentences, error: sentencesError } = await supabase
          .from('transcripts')
          .select('*')
          .eq('video_id', video.video_id)
          .order('start_time');

        if (sentencesError) throw sentencesError;

        // Note: Your schema has videos and transcripts tables
        // Entities would be extracted from transcript content if needed

        // Create processed video entry from your database structure
        const processed: ProcessedTranscript = {
          videoId: video.video_id,
          title: video.title,
          channel: video.channel,
          url: `https://www.youtube.com/watch?v=${video.video_id}`,
          sentences: (sentences || []).map(s => ({
            text: s.text,
            start: s.start_time,
            end: s.start_time + (s.duration || 5) // Approximate end time
          })),
          entities: [] // Extract entities from sentences if needed
        };

        this.processedVideos.set(video.video_id, processed);
        console.log(`✅ Loaded ${video.video_id} from database: ${processed.sentences.length} sentences`);
      }
    } catch (error) {
      console.log('No existing videos in database, will process via Edge Functions');
    }
  }

  /**
   * Process videos via your Supabase Edge Functions
   */
  private static async processVideosViaSupabase(): Promise<void> {
    console.log('📡 Processing videos via your Supabase ingest function...');
    
    for (const video of PARLIAMENTARY_VIDEOS) {
      try {
        console.log(`📹 Processing: ${video.title} (${video.id})`);
        
        // Call your actual Supabase ingest function
        const { data, error } = await supabase.functions.invoke('ingest', {
          body: { urlOrId: video.url }
        });

        if (error) {
          console.error(`Failed to process ${video.id}:`, error.message);
          continue;
        }

        if (data?.ok) {
          console.log(`✅ Processed ${video.id}: ${data.sentences?.length || 0} sentences`);
        } else {
          console.warn(`⚠️ Processing ${video.id} completed but with issues`);
        }
        
      } catch (error) {
        console.error(`❌ Failed to process video ${video.id}:`, error);
      }
    }

    // After processing, reload from database
    console.log('🔄 Reloading processed videos from database...');
    await this.loadProcessedVideosFromDatabase();
  }

  /**
   * Create placeholder entries for your videos
   */
  private static createPlaceholderEntries(): void {
    for (const video of PARLIAMENTARY_VIDEOS) {
      const processed: ProcessedTranscript = {
        videoId: video.id,
        title: video.title,
        channel: video.channel,
        url: video.url,
        sentences: [],
        entities: []
      };
      
      this.processedVideos.set(video.id, processed);
    }
    
    console.log(`📝 Created placeholders for ${this.processedVideos.size} videos`);
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