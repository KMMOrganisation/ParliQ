import { IngestionProgress } from '../types/video';
import { supabase } from '../lib/supabase';

export interface IngestedVideo {
  videoId: string;
  sentences: Array<{
    text: string;
    start: number;
  }>;
}

export class VideoIngestionService {
    /**
     * Process a video using Supabase Edge Functions
     * All heavy lifting (YouTube API, transcript extraction, AI processing) happens server-side
     */
    static async processVideo(
        url: string,
        onProgress?: (progress: IngestionProgress) => void
    ): Promise<IngestedVideo> {
        const videoId = this.extractVideoId(url);

        try {
            // Stage 1: Starting ingestion
            onProgress?.({
                videoId,
                stage: 'fetching',
                progress: 10,
                message: 'Starting video ingestion...'
            });

            // Stage 2: Call Supabase Edge Function to do all the work
            onProgress?.({
                videoId,
                stage: 'transcribing',
                progress: 50,
                message: 'Processing video on server...'
            });

            const { data, error } = await supabase.functions.invoke('ingest-video', {
                body: { urlOrId: url }
            });

            if (error) {
                throw new Error(`Ingestion failed: ${error.message}`);
            }

            const result = {
                videoId: data.videoId,
                sentences: data.sentences || []
            };

            // Stage 3: Complete
            onProgress?.({
                videoId: result.videoId,
                stage: 'complete',
                progress: 100,
                message: 'Video processing complete!'
            });

            return result;

        } catch (error) {
            onProgress?.({
                videoId,
                stage: 'error',
                progress: 0,
                message: 'Processing failed',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
            throw error;
        }
    }

    /**
     * Extract video ID from URL (client-side utility)
     */
    static extractVideoId(url: string): string {
        const patterns = [
            /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
            /youtube\.com\/v\/([^&\n?#]+)/
        ];

        for (const pattern of patterns) {
            const match = url.match(pattern);
            if (match) return match[1];
        }

        // If no pattern matches, assume it's already a video ID
        return url;
    }

    /**
     * Extract channel ID from URL (client-side utility)
     */
    static extractChannelId(url: string): string {
        const patterns = [
            /youtube\.com\/channel\/([^\/\n?#]+)/,
            /youtube\.com\/c\/([^\/\n?#]+)/,
            /youtube\.com\/@([^\/\n?#]+)/,
            /youtube\.com\/user\/([^\/\n?#]+)/
        ];

        for (const pattern of patterns) {
            const match = url.match(pattern);
            if (match) return match[1];
        }

        throw new Error('Invalid YouTube channel URL format');
    }
}