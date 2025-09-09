import React from 'react';
import { ChatMessage, FollowUpChip } from '../types';
import { ApiService } from '../services/api';
import { v4 as uuidv4 } from 'uuid';
import { isLegalOrVotingQuery, getGuardrailResponse } from '../utils/guardrails';
import { generateFollowUpSuggestions } from '../utils/followUpSuggestions';

export function useChat() {
  const [messages, setMessages] = React.useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [followUpSuggestions, setFollowUpSuggestions] = React.useState<FollowUpChip[]>([]);

  const sendMessage = async (content: string) => {
    const userMessage: ChatMessage = {
      id: uuidv4(),
      role: 'user',
      content,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setFollowUpSuggestions([]);

    try {
      // Check for legal/voting queries
      if (isLegalOrVotingQuery(content)) {
        const guardrailMessage: ChatMessage = {
          id: uuidv4(),
          role: 'assistant',
          content: getGuardrailResponse(),
          timestamp: new Date(),
          isGuardrailResponse: true
        };
        setMessages(prev => [...prev, guardrailMessage]);
        setFollowUpSuggestions([]);
        return;
      }

      const response = await ApiService.chatQuery(content, messages);
      setMessages(prev => [...prev, response]);
      
      // Generate follow-up suggestions
      const suggestions = generateFollowUpSuggestions(content, response.content);
      setFollowUpSuggestions(suggestions);
      
    } catch (error) {
      const errorMessage: ChatMessage = {
        id: uuidv4(),
        role: 'assistant',
        content: 'I apologize, but I encountered an error processing your request. Please try again or rephrase your question.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
      setFollowUpSuggestions([]);
      console.error('Chat error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([]);
    setFollowUpSuggestions([]);
  };

  return {
    messages,
    isLoading,
    sendMessage,
    clearChat,
    followUpSuggestions
  };
}