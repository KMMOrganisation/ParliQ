import React from 'react';
import { Send, Bot, User, ExternalLink, Copy, RotateCcw, Download, Database } from 'lucide-react';
import { ChatMessage, Citation } from '../../types';
import { format } from 'date-fns';

interface ChatInterfaceProps {
  messages: ChatMessage[];
  isLoading: boolean;
  onSendMessage: (message: string) => void;
  onClearChat: () => void;
  onExportKG: () => void;
  systemStatus: { videosIngested: number; entitiesExtracted: number };
}

export function ChatInterface({ 
  messages, 
  isLoading, 
  onSendMessage, 
  onClearChat, 
  onExportKG,
  systemStatus 
}: ChatInterfaceProps) {
  const [input, setInput] = React.useState('');
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  React.useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    
    onSendMessage(input);
    setInput('');
  };

  const formatTimestamp = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const copyCitation = (citation: Citation) => {
    const text = `"${citation.text}" - ${citation.title} (${citation.channel}) at ${formatTimestamp(citation.timestamp)}`;
    navigator.clipboard.writeText(text);
  };

  const suggestedQuestions = [
    "What has been said about the NHS recently?",
    "Which MPs have spoken about climate change?",
    "What are the different party positions on Brexit?",
    "Show me quotes about housing policy",
    "Who has mentioned economic policy in the last month?",
    "What did Boris Johnson say about immigration?",
    "Find discussions about education funding",
    "What are Labour's positions on taxation?"
  ];

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      {/* Skip Link */}
      <a 
        href="#chat-input" 
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-blue-600 text-white px-4 py-2 rounded-md z-50"
      >
        Skip to chat input
      </a>

      {/* Header */}
      <header className="bg-slate-900 border-b border-slate-700 px-4 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-100">UK Politics Knowledge Graph</h1>
            <p className="text-slate-400 text-sm mt-1">
              Ask questions about UK political discourse • {systemStatus.videosIngested} videos • {systemStatus.entitiesExtracted} entities
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={onExportKG}
              className="flex items-center space-x-2 px-3 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
              title="Export knowledge graph as Turtle"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Export TTL</span>
            </button>
            
            <button
              onClick={onClearChat}
              className="flex items-center space-x-2 px-3 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={messages.length === 0}
              title="Clear chat history"
            >
              <RotateCcw className="w-4 h-4" />
              <span className="hidden sm:inline">Clear</span>
            </button>
          </div>
        </div>
      </header>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-4 py-6">
          {messages.length === 0 ? (
            <div className="text-center py-12">
              <div className="bg-slate-900 rounded-2xl p-8 border border-slate-700">
                <Bot className="w-16 h-16 text-blue-500 mx-auto mb-6" />
                <h2 className="text-2xl font-semibold text-slate-100 mb-4">
                  Ask me anything about UK politics
                </h2>
                <p className="text-slate-400 mb-8 max-w-2xl mx-auto">
                  I can help you explore political discourse, find quotes, discover entity relationships, 
                  and answer questions using our knowledge graph of UK political transcripts.
                </p>
                
                <div className="grid md:grid-cols-2 gap-3 max-w-3xl mx-auto">
                  {suggestedQuestions.map((question, index) => (
                    <button
                      key={index}
                      onClick={() => onSendMessage(question)}
                      className="text-left p-4 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg text-slate-300 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 hover:border-slate-500"
                      disabled={isLoading}
                    >
                      {question}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {messages.map((message) => (
                <div key={message.id} className="space-y-4">
                  <div className={`flex items-start space-x-4 ${
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}>
                    {message.role === 'assistant' && (
                      <div className="flex-shrink-0 w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                        <Bot className="w-5 h-5 text-white" />
                      </div>
                    )}
                    
                    <div className={`max-w-3xl ${
                      message.role === 'user' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-slate-800 text-slate-100 border border-slate-700'
                    } rounded-2xl p-6`}>
                      <div className="prose prose-invert max-w-none">
                        <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
                      </div>
                      
                      {message.citations && message.citations.length > 0 && (
                        <div className="mt-6 pt-6 border-t border-slate-700">
                          <h4 className="text-sm font-semibold text-slate-300 mb-4 flex items-center">
                            <Database className="w-4 h-4 mr-2" />
                            Sources ({message.citations.length})
                          </h4>
                          <div className="space-y-3">
                            {message.citations.map((citation, index) => (
                              <div key={index} className="bg-slate-900 rounded-lg p-4 border border-slate-600">
                                <div className="flex items-start justify-between mb-2">
                                  <div className="flex-1">
                                    <h5 className="font-medium text-slate-200 text-sm mb-1">
                                      {citation.title}
                                    </h5>
                                    <p className="text-xs text-slate-400">
                                      {citation.channel} • {formatTimestamp(citation.timestamp)}
                                    </p>
                                  </div>
                                  <div className="flex items-center space-x-2 ml-4">
                                    <button
                                      onClick={() => copyCitation(citation)}
                                      className="text-slate-500 hover:text-slate-400 transition-colors p-1"
                                      title="Copy citation"
                                    >
                                      <Copy className="w-3 h-3" />
                                    </button>
                                    <a
                                      href={`${citation.url}&t=${Math.floor(citation.timestamp)}s`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-blue-400 hover:text-blue-300 transition-colors p-1"
                                      title="Open video at timestamp"
                                    >
                                      <ExternalLink className="w-3 h-3" />
                                    </a>
                                  </div>
                                </div>
                                <blockquote className="text-sm text-slate-300 italic border-l-2 border-blue-500 pl-3">
                                  "{citation.text}"
                                </blockquote>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {message.role === 'user' && (
                      <div className="flex-shrink-0 w-10 h-10 bg-slate-600 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-white" />
                      </div>
                    )}
                  </div>
                  
                  <p className="text-xs text-slate-500 text-right px-14">
                    {format(message.timestamp, 'HH:mm')}
                  </p>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                  <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
                    <div className="flex items-center space-x-2">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                      <span className="text-slate-400 text-sm">Searching knowledge graph...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="bg-slate-900 border-t border-slate-700 px-4 py-4">
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSubmit} className="flex space-x-4">
            <div className="flex-1">
              <label htmlFor="chat-input" className="sr-only">Enter your question about UK politics</label>
              <input
                id="chat-input"
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about UK politics, policies, politicians, or specific quotes..."
                className="w-full px-6 py-4 bg-slate-800 border border-slate-600 rounded-xl text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                disabled={isLoading}
                autoComplete="off"
              />
            </div>
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="px-6 py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center space-x-2 text-lg font-medium"
              aria-label="Send message"
            >
              <Send className="w-5 h-5" />
              <span className="hidden sm:inline">Send</span>
            </button>
          </form>
          
          <p className="text-xs text-slate-500 mt-3 text-center">
            Ask questions about UK political discourse. I'll search the knowledge graph and provide citations.
          </p>
        </div>
      </div>
    </div>
  );
}