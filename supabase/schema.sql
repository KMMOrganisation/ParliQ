-- ParliQ Database Schema
-- Run this in your Supabase SQL Editor

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Videos table
CREATE TABLE videos (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  channel TEXT NOT NULL,
  channel_id TEXT NOT NULL,
  published_at TIMESTAMPTZ NOT NULL,
  duration INTEGER NOT NULL,
  url TEXT NOT NULL,
  thumbnail_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Transcript sentences table
CREATE TABLE transcript_sentences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  video_id TEXT REFERENCES videos(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  start_time DECIMAL NOT NULL,
  end_time DECIMAL NOT NULL,
  sequence INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Entities table
CREATE TABLE entities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  video_id TEXT REFERENCES videos(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('Person', 'Party', 'Policy', 'Location', 'Event', 'Quote')),
  text TEXT NOT NULL,
  start_time DECIMAL NOT NULL,
  end_time DECIMAL NOT NULL,
  confidence DECIMAL NOT NULL CHECK (confidence >= 0 AND confidence <= 1),
  context TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Knowledge graph triples table
CREATE TABLE knowledge_graph_triples (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  subject TEXT NOT NULL,
  predicate TEXT NOT NULL,
  object TEXT NOT NULL,
  video_id TEXT REFERENCES videos(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_transcript_sentences_video_id ON transcript_sentences(video_id);
CREATE INDEX idx_transcript_sentences_sequence ON transcript_sentences(video_id, sequence);
CREATE INDEX idx_entities_video_id ON entities(video_id);
CREATE INDEX idx_entities_type ON entities(type);
CREATE INDEX idx_entities_start_time ON entities(start_time);
CREATE INDEX idx_knowledge_graph_triples_video_id ON knowledge_graph_triples(video_id);

-- Row Level Security (RLS) - Enable public read access
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE transcript_sentences ENABLE ROW LEVEL SECURITY;
ALTER TABLE entities ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_graph_triples ENABLE ROW LEVEL SECURITY;

-- Allow public read access to all tables
CREATE POLICY "Allow public read access" ON videos FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON transcript_sentences FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON entities FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON knowledge_graph_triples FOR SELECT USING (true);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at
CREATE TRIGGER update_videos_updated_at BEFORE UPDATE ON videos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();