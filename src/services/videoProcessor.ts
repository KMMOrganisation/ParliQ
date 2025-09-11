// Video processor that uses your existing Supabase ingest function
import { supabase } from '../lib/supabase';
import { PARLIAMENTARY_VIDEOS } from '../data/parliamentaryVideos';

export class VideoProcessor {
  /**
   * Process all your YouTube videos using your Supabase ingest function
   */
  static async processAllVideos(): Promise<void> {
    console.log('🚀 Starting video processing with your Supabase setup...');
    
    for (const video of PARLIAMENTARY_VIDEOS) {
      try {
        console.log(`📹 Processing: ${video.title}`);
        
        // Call your ingest function
        const { data, error } = await supabase.functions.invoke('ingest', {
          body: { urlOrId: video.url }
        });

        if (error) {
          console.error(`❌ Failed to process ${video.id}:`, error.message);
          continue;
        }

        if (data?.ok) {
          console.log(`✅ Successfully processed ${video.id}`);
          console.log(`   - Video ID: ${data.videoId}`);
          console.log(`   - Sentences: ${data.sentences?.length || 0}`);
        }
        
      } catch (error) {
        console.error(`❌ Error processing ${video.id}:`, error);
      }
    }
    
    console.log('🎉 Video processing complete!');
  }

  /**
   * Process a single video
   */
  static async processSingleVideo(url: string): Promise<any> {
    try {
      const { data, error } = await supabase.functions.invoke('ingest', {
        body: { urlOrId: url }
      });

      if (error) {
        throw new Error(`Processing failed: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Failed to process video:', error);
      throw error;
    }
  }

  /**
   * Discover videos from channels using your discover function
   */
  static async discoverVideos(channelIds: string[], since?: string): Promise<string[]> {
    try {
      const { data, error } = await supabase.functions.invoke('discover', {
        body: { channelIds, since }
      });

      if (error) {
        throw new Error(`Discovery failed: ${error.message}`);
      }

      return data?.videoIds || [];
    } catch (error) {
      console.error('Failed to discover videos:', error);
      throw error;
    }
  }
}