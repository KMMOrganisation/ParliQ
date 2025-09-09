import { ChatMessage } from '../types';

const API_BASE = '/api';

export class ApiService {
  static async chatQuery(message: string, history: ChatMessage[]): Promise<ChatMessage> {
    const response = await fetch(`${API_BASE}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        message, 
        history,
        // Request sentence-level precision for citations
        citationPrecision: 'sentence'
      })
    });
    
    if (!response.ok) {
      throw new Error(`Chat query failed: ${response.statusText}`);
    }
    
    return response.json();
  }

  static async getSystemStatus(): Promise<{ status: string; videosIngested: number; entitiesExtracted: number }> {
    const response = await fetch(`${API_BASE}/status`);
    return response.json();
  }

  static async exportKnowledgeGraph(): Promise<string> {
    const response = await fetch(`${API_BASE}/export/knowledge-graph.ttl`);
    return response.text();
  }

  static async sparqlQuery(query: string): Promise<any> {
    const response = await fetch(`${API_BASE}/sparql`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/sparql-query' },
      body: query
    });
    
    return response.json();
  }
}