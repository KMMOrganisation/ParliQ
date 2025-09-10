import React from 'react';
import { Send, Bot, User, ExternalLink, Copy, Database } from 'lucide-react';
import { ChatMessage, Citation, FollowUpChip } from '../../types';
import { format } from 'date-fns';
import { ExampleChips } from './ExampleChips';
import { FollowUpChips } from './FollowUpChips';
import { DisclaimerBanner } from './DisclaimerBanner';
import { ResourceCards } from './ResourceCards';

interface ChatInterfaceProps {
  messages: ChatMessage[];
  isLoading: boolean;
  onSendMessage: (message: string) => void;
  systemStatus: { videosIngested: number; entitiesExtracted: number };
  followUpSuggestions: FollowUpChip[];
}

export function ChatInterface({ 
  messages, 
  isLoading, 
  onSendMessage, 
  systemStatus,
  followUpSuggestions
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

  // Remove the old suggested questions array as we now use ExampleChips

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      {/* Skip Link */}
      <a 
        href="#chat-input" 
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-blue-600 text-white px-4 py-2 rounded-md z-50"
      >
        Skip to chat input
      </a>

      {/* Disclaimer Banner */}
      <DisclaimerBanner />

      {/* Header */}
      <header className="bg-slate-900 border-b border-slate-700 px-4 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-100">ParliQ</h1>
            <p className="text-slate-400 text-sm mt-1">
              Understand Parliament, one question at a time • {systemStatus.videosIngested} videos • {systemStatus.entitiesExtracted} entities
            </p>
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
                  Hi! I'm ParliQ, your AI guide to what's happening in UK Parliament.
                </h2>
                <p className="text-slate-400 mb-8 max-w-2xl mx-auto">
                  I'll summarise debates and link you straight to the moments in video. Ask me anything.
                </p>
                
                <div className="max-w-3xl mx-auto">
                  <ExampleChips 
                    onChipClick={onSendMessage}
                    disabled={isLoading}
                  />
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
                      
                      {message.isGuardrailResponse && (
                        <ResourceCards />
                      )}
                      
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

                      {/* Show follow-up suggestions only for the last assistant message */}
                      {message.role === 'assistant' && 
                       !message.isGuardrailResponse && 
                       messages[messages.length - 1]?.id === message.id && 
                       followUpSuggestions.length > 0 && (
                        <FollowUpChips 
                          suggestions={followUpSuggestions}
                          onChipClick={onSendMessage}
                          disabled={isLoading}
                        />
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

      {/* Input Area - Sticky on mobile */}
      <div className="sticky bottom-0 bg-slate-900 border-t border-slate-700 px-4 py-4 safe-area-inset-bottom">
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSubmit} className="flex space-x-3 sm:space-x-4">
            <div className="flex-1">
              <label htmlFor="chat-input" className="sr-only">Enter your question about Parliament</label>
              <input
                id="chat-input"
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about Parliament, policies, MPs, or specific debates..."
                className="w-full px-4 py-3 sm:px-6 sm:py-4 bg-slate-800 border border-slate-600 rounded-xl text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base sm:text-lg min-h-[44px]"
                disabled={isLoading}
                autoComplete="off"
              />
            </div>
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="px-4 py-3 sm:px-6 sm:py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center space-x-2 text-base sm:text-lg font-medium min-h-[44px] min-w-[44px]"
              aria-label="Send message"
            >
              <Send className="w-5 h-5" />
              <span className="hidden sm:inline">Send</span>
            </button>
          </form>
          
          <p className="text-xs text-slate-500 mt-3 text-center">
            I'll explain parliamentary discussions with precise video citations.
          </p>
        </div>
      </div>


    </div>
  );
}