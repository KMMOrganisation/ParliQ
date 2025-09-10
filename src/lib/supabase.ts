import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Please check your .env file and ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface Video {
  id: string;
  title: string;
  description: string;
  channel: string;
  channel_id: string;
  published_at: string;
  duration: number;
  url: string;
  thumbnail_url: string;
  created_at: string;
  updated_at: string;
}

export interface TranscriptSentence {
  id: string;
  video_id: string;
  text: string;
  start_time: number;
  end_time: number;
  sequence: number;
  created_at: string;
}

export interface Entity {
  id: string;
  video_id: string;
  type: 'Person' | 'Party' | 'Policy' | 'Location' | 'Event' | 'Quote';
  text: string;
  start_time: number;
  end_time: number;
  confidence: number;
  context: string;
  created_at: string;
}

export interface KnowledgeGraphTriple {
  id: string;
  subject: string;
  predicate: string;
  object: string;
  video_id: string;
  created_at: string;
}