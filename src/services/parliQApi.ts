import { supabase, Video, TranscriptSentence, Entity } from '../lib/supabase';

export interface DiscoveredVideo {
    videoId: string;
    title: string;
    publishedAt: string;
    duration: number;
}

export interface IngestedVideo {
    videoId: string;
    sentences: Array<{
        text: string;
        start: number;
    }>;
}

export interface ChatResponse {
    id: string;
    role: 'assistant';
    content: string;
    citations?: Array<{
        videoId: string;
        title: string;
        timestamp: number;
        text: string;
        url: string;
        channel: string;
    }>;
    timestamp: Date;
}

export class ParliQApi {
    /**
     * Discover latest videos from specified channels
     */
    static async discoverLatest(
        channelIds: string[],
        since?: string
    ): Promise<DiscoveredVideo[]> {
        try {
            const { data, error } = await supabase.functions.invoke('discover-videos', {
                body: { channelIds, since }
            });

            if (error) {
                throw new Error(`Discovery failed: ${error.message}`);
            }

            return data.videos || [];
        } catch (error) {
            console.error('Failed to discover videos:', error);
            throw new Error(`Failed to discover videos: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Ingest a video by URL or ID
     */
    static async ingestVideo(urlOrId: string): Promise<IngestedVideo> {
        try {
            const { data, error } = await supabase.functions.invoke('ingest-video', {
                body: { urlOrId }
            });

            if (error) {
                throw new Error(`Ingestion failed: ${error.message}`);
            }

            return {
                videoId: data.videoId,
                sentences: data.sentences || []
            };
        } catch (error) {
            console.error('Failed to ingest video:', error);
            throw new Error(`Failed to ingest video: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Send a chat message and get AI response
     */
    static async sendMessage(
        message: string,
        history: Array<{ role: string; content: string }>
    ): Promise<ChatResponse> {
        try {
            const { data, error } = await supabase.functions.invoke('chat', {
                body: { message, history }
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
            throw new Error(`Failed to send message: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Get system status (videos and entities count)
     */
    static async getSystemStatus(): Promise<{ videosIngested: number; entitiesExtracted: number }> {
        try {
            const [videosResult, entitiesResult] = await Promise.all([
                supabase.from('videos').select('id', { count: 'exact', head: true }),
                supabase.from('entities').select('id', { count: 'exact', head: true })
            ]);

            return {
                videosIngested: videosResult.count || 0,
                entitiesExtracted: entitiesResult.count || 0
            };
        } catch (error) {
            console.error('Failed to get system status:', error);
            return { videosIngested: 0, entitiesExtracted: 0 };
        }
    }

    /**
     * Export knowledge graph as Turtle/TTL format
     */
    static async exportKnowledgeGraph(): Promise<string> {
        try {
            const { data, error } = await supabase.functions.invoke('export-knowledge-graph');

            if (error) {
                throw new Error(`Export failed: ${error.message}`);
            }

            return data.turtle || '';
        } catch (error) {
            console.error('Failed to export knowledge graph:', error);
            throw new Error(`Failed to export knowledge graph: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Get all videos from database
     */
    static async getVideos(): Promise<Video[]> {
        try {
            const { data, error } = await supabase
                .from('videos')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) {
                throw new Error(`Failed to fetch videos: ${error.message}`);
            }

            return data || [];
        } catch (error) {
            console.error('Failed to get videos:', error);
            return [];
        }
    }

    /**
     * Get transcript sentences for a video
     */
    static async getTranscript(videoId: string): Promise<TranscriptSentence[]> {
        try {
            const { data, error } = await supabase
                .from('transcript_sentences')
                .select('*')
                .eq('video_id', videoId)
                .order('sequence', { ascending: true });

            if (error) {
                throw new Error(`Failed to fetch transcript: ${error.message}`);
            }

            return data || [];
        } catch (error) {
            console.error('Failed to get transcript:', error);
            return [];
        }
    }

    /**
     * Get entities for a video
     */
    static async getEntities(videoId: string): Promise<Entity[]> {
        try {
            const { data, error } = await supabase
                .from('entities')
                .select('*')
                .eq('video_id', videoId)
                .order('start_time', { ascending: true });

            if (error) {
                throw new Error(`Failed to fetch entities: ${error.message}`);
            }

            return data || [];
        } catch (error) {
            console.error('Failed to get entities:', error);
            return [];
        }
    }
}