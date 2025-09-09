import React from 'react';
import { ProcessedVideo, KnowledgeGraphStats } from '../types/video';

interface KnowledgeGraphState {
  videos: ProcessedVideo[];
  stats: KnowledgeGraphStats;
  rdfData: string;
}

export function useKnowledgeGraph() {
  const [state, setState] = React.useState<KnowledgeGraphState>({
    videos: [],
    stats: {
      totalVideos: 0,
      totalEntities: 0,
      totalTriples: 0,
      lastUpdated: new Date(),
      categories: {
        education: 0,
        healthcare: 0,
        housing: 0,
        international: 0,
        other: 0
      }
    },
    rdfData: ''
  });

  const addVideo = React.useCallback((video: ProcessedVideo) => {
    setState(prev => {
      const newVideos = [...prev.videos, video];
      const newStats = calculateStats(newVideos);
      const newRdfData = combineRdfData(newVideos);

      return {
        videos: newVideos,
        stats: newStats,
        rdfData: newRdfData
      };
    });
  }, []);

  const removeVideo = React.useCallback((videoId: string) => {
    setState(prev => {
      const newVideos = prev.videos.filter(v => v.metadata.id !== videoId);
      const newStats = calculateStats(newVideos);
      const newRdfData = combineRdfData(newVideos);

      return {
        videos: newVideos,
        stats: newStats,
        rdfData: newRdfData
      };
    });
  }, []);

  const clearAll = React.useCallback(() => {
    setState({
      videos: [],
      stats: {
        totalVideos: 0,
        totalEntities: 0,
        totalTriples: 0,
        lastUpdated: new Date(),
        categories: {
          education: 0,
          healthcare: 0,
          housing: 0,
          international: 0,
          other: 0
        }
      },
      rdfData: ''
    });
  }, []);

  const exportTurtle = React.useCallback(() => {
    if (!state.rdfData) {
      throw new Error('No knowledge graph data to export');
    }

    const blob = new Blob([state.rdfData], { type: 'text/turtle' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `parliq-knowledge-graph-${new Date().toISOString().split('T')[0]}.ttl`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [state.rdfData]);

  const searchVideos = React.useCallback((query: string) => {
    const lowerQuery = query.toLowerCase();
    return state.videos.filter(video => 
      video.metadata.title.toLowerCase().includes(lowerQuery) ||
      video.metadata.description.toLowerCase().includes(lowerQuery) ||
      video.metadata.channel.toLowerCase().includes(lowerQuery) ||
      video.entities.some(entity => 
        entity.text.toLowerCase().includes(lowerQuery) ||
        entity.context.toLowerCase().includes(lowerQuery)
      )
    );
  }, [state.videos]);

  const getVideosByCategory = React.useCallback((category: keyof KnowledgeGraphStats['categories']) => {
    const keywords = {
      education: ['education', 'school', 'university', 'student', 'teacher', 'learning'],
      healthcare: ['nhs', 'health', 'medical', 'hospital', 'doctor', 'patient'],
      housing: ['housing', 'homeless', 'home', 'rent', 'property', 'council'],
      international: ['international', 'foreign', 'global', 'world', 'trade', 'diplomatic'],
      other: []
    };

    return state.videos.filter(video => {
      const text = `${video.metadata.title} ${video.metadata.description}`.toLowerCase();
      return keywords[category].some(keyword => text.includes(keyword));
    });
  }, [state.videos]);

  return {
    videos: state.videos,
    stats: state.stats,
    rdfData: state.rdfData,
    addVideo,
    removeVideo,
    clearAll,
    exportTurtle,
    searchVideos,
    getVideosByCategory
  };
}

function calculateStats(videos: ProcessedVideo[]): KnowledgeGraphStats {
  const totalEntities = videos.reduce((sum, video) => sum + video.entities.length, 0);
  
  // Estimate triples: metadata + transcript segments + entities + relationships
  const totalTriples = videos.reduce((sum, video) => {
    const metadataTriples = 10; // Basic video metadata
    const transcriptTriples = video.transcript.length * 4; // Each segment has ~4 triples
    const entityTriples = video.entities.length * 6; // Each entity has ~6 triples
    return sum + metadataTriples + transcriptTriples + entityTriples;
  }, 0);

  const categories = {
    education: 0,
    healthcare: 0,
    housing: 0,
    international: 0,
    other: 0
  };

  videos.forEach(video => {
    const text = `${video.metadata.title} ${video.metadata.description}`.toLowerCase();
    
    if (text.includes('education') || text.includes('school') || text.includes('university')) {
      categories.education++;
    } else if (text.includes('nhs') || text.includes('health') || text.includes('medical')) {
      categories.healthcare++;
    } else if (text.includes('housing') || text.includes('homeless') || text.includes('home')) {
      categories.housing++;
    } else if (text.includes('international') || text.includes('foreign') || text.includes('world')) {
      categories.international++;
    } else {
      categories.other++;
    }
  });

  return {
    totalVideos: videos.length,
    totalEntities,
    totalTriples,
    lastUpdated: new Date(),
    categories
  };
}

function combineRdfData(videos: ProcessedVideo[]): string {
  if (videos.length === 0) return '';

  const header = `@prefix pol: <http://politics.kg/ontology#> .
@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .
@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .
@prefix dct: <http://purl.org/dc/terms/> .

# ParliQ Knowledge Graph
# Generated: ${new Date().toISOString()}
# Videos: ${videos.length}
# Total entities: ${videos.reduce((sum, v) => sum + v.entities.length, 0)}

`;

  const rdfContent = videos.map(video => video.rdfTriples).join('\n\n');
  
  return header + rdfContent;
}