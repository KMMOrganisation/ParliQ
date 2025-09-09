import React from 'react';
import { ChatInterface } from './components/Chat/ChatInterface';
import { useChat } from './hooks/useChat';
import { useSystemStatus } from './hooks/useSystemStatus';
import { useKnowledgeGraph } from './hooks/useKnowledgeGraph';
import { ApiService } from './services/api';

function App() {
  const { messages, isLoading, sendMessage, clearChat, followUpSuggestions } = useChat();
  const systemStatus = useSystemStatus();
  const { stats, addVideo, exportTurtle, rdfData } = useKnowledgeGraph();

  const handleExportKG = async () => {
    try {
      // Try to export from local knowledge graph first
      if (rdfData) {
        exportTurtle();
        return;
      }

      // Fallback to backend API if available
      const turtleData = await ApiService.exportKnowledgeGraph();
      
      // Create and download file
      const blob = new Blob([turtleData], { type: 'text/turtle' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `parliq-kg-${new Date().toISOString().split('T')[0]}.ttl`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export knowledge graph:', error);
      alert('Failed to export knowledge graph. Please try again.');
    }
  };

  // Use local stats if available, otherwise fall back to system status
  const displayStats = {
    videosIngested: stats.totalVideos || systemStatus.videosIngested,
    entitiesExtracted: stats.totalEntities || systemStatus.entitiesExtracted
  };

  return (
    <ChatInterface
      messages={messages}
      isLoading={isLoading}
      onSendMessage={sendMessage}
      onClearChat={clearChat}
      onExportKG={handleExportKG}
      systemStatus={displayStats}
      followUpSuggestions={followUpSuggestions}
      onVideoProcessed={addVideo}
    />
  );
}

export default App;