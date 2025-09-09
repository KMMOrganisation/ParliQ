export interface VideoIngestionRequest {
  url: string;
  type: 'video' | 'channel' | 'playlist';
}

export interface VideoMetadata {
  id: string;
  title: string;
  description: string;
  channel: string;
  channelId: string;
  publishedAt: string;
  duration: number;
  url: string;
  thumbnailUrl: string;
}

export interface TranscriptSegment {
  text: string;
  start: number;
  duration: number;
  end: number;
}

export interface ProcessedVideo {
  metadata: VideoMetadata;
  transcript: TranscriptSegment[];
  entities: ExtractedEntity[];
  rdfTriples: string; // Turtle format
}

export interface ExtractedEntity {
  type: 'Person' | 'Party' | 'Policy' | 'Location' | 'Event' | 'Quote';
  text: string;
  startTime: number;
  endTime: number;
  confidence: number;
  context: string;
}

export interface IngestionProgress {
  videoId: string;
  stage: 'fetching' | 'transcribing' | 'extracting' | 'generating_rdf' | 'complete' | 'error';
  progress: number; // 0-100
  message: string;
  error?: string;
}

export interface KnowledgeGraphStats {
  totalVideos: number;
  totalEntities: number;
  totalTriples: number;
  lastUpdated: Date;
  categories: {
    education: number;
    healthcare: number;
    housing: number;
    international: number;
    other: number;
  };
}