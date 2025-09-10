import React from 'react';
import { ChatInterface } from './components/Chat/ChatInterface';
import { useChat } from './hooks/useChat';
import { useSystemStatus } from './hooks/useSystemStatus';

function App() {
  const { messages, isLoading, sendMessage, followUpSuggestions } = useChat();
  const systemStatus = useSystemStatus();

  return (
    <ChatInterface
      messages={messages}
      isLoading={isLoading}
      onSendMessage={sendMessage}
      systemStatus={systemStatus}
      followUpSuggestions={followUpSuggestions}
    />
  );
}

export default App;