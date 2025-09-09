import React from 'react';
import { ChatInterface } from './components/Chat/ChatInterface';
import { useChat } from './hooks/useChat';
import { useSystemStatus } from './hooks/useSystemStatus';
import { ApiService } from './services/api';

function App() {
  const { messages, isLoading, sendMessage, clearChat, followUpSuggestions } = useChat();
  const systemStatus = useSystemStatus();

  const handleExportKG = async () => {
    try {
      const turtleData = await ApiService.exportKnowledgeGraph();
      
      // Create and download file
      const blob = new Blob([turtleData], { type: 'text/turtle' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `uk-politics-kg-${new Date().toISOString().split('T')[0]}.ttl`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export knowledge graph:', error);
      alert('Failed to export knowledge graph. Please try again.');
    }
  };

  return (
    <ChatInterface
      messages={messages}
      isLoading={isLoading}
      onSendMessage={sendMessage}
      onClearChat={clearChat}
      onExportKG={handleExportKG}
      systemStatus={systemStatus}
      followUpSuggestions={followUpSuggestions}
    />
  );
}

export default App;