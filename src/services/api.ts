import { ChatMessage } from '../types';
import { ParliQApi } from './parliQApi';
import { v4 as uuidv4 } from 'uuid';

export class ApiService {
  static async chatQuery(message: string, history: ChatMessage[]): Promise<ChatMessage> {
    try {
      // Convert ChatMessage history to simple format for API
      const apiHistory = history.map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      const response = await ParliQApi.sendMessage(message, apiHistory);
      
      return {
        id: response.id,
        role: response.role,
        content: response.content,
        citations: response.citations,
        timestamp: response.timestamp
      };
    } catch (error) {
      throw new Error(`Chat query failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  static async getSystemStatus(): Promise<{ status: string; videosIngested: number; entitiesExtracted: number }> {
    try {
      const status = await ParliQApi.getSystemStatus();
      return {
        status: 'active',
        videosIngested: status.videosIngested,
        entitiesExtracted: status.entitiesExtracted
      };
    } catch (error) {
      console.error('Failed to get system status:', error);
      return { status: 'error', videosIngested: 0, entitiesExtracted: 0 };
    }
  }

  static async exportKnowledgeGraph(): Promise<string> {
    return ParliQApi.exportKnowledgeGraph();
  }

  static async sparqlQuery(query: string): Promise<any> {
    // This would need to be implemented as a Supabase Edge Function if needed
    throw new Error('SPARQL queries not implemented in current version');
  }
}