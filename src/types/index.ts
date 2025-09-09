export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  citations?: Citation[];
  timestamp: Date;
  isGuardrailResponse?: boolean;
}

export interface Citation {
  videoId: string;
  title: string;
  timestamp: number;
  text: string;
  url: string;
  channel: string;
}

export interface Entity {
  id: string;
  type: EntityType;
  label: string;
  mentions: EntityMention[];
}

export interface EntityMention {
  text: string;
  startTime: number;
  videoId: string;
  confidence: number;
}

export enum EntityType {
  PERSON = 'Person',
  PARTY = 'Party', 
  POLICY = 'Policy',
  LOCATION = 'Location',
  EVENT = 'Event',
  QUOTE = 'Quote'
}

export interface SearchContext {
  query: string;
  entities?: Entity[];
  timeRange?: {
    start: Date;
    end: Date;
  };
  sources?: string[];
}

export interface ExampleChip {
  id: string;
  label: string;
  query: string;
}

export interface FollowUpChip {
  id: string;
  label: string;
  query: string;
}

export interface ResourceCard {
  title: string;
  description: string;
  url: string;
  icon?: string;
}