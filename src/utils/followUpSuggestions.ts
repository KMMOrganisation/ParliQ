import { FollowUpChip } from '../types';
import { v4 as uuidv4 } from 'uuid';

// Generate contextual follow-up suggestions based on the user's query and response
export function generateFollowUpSuggestions(userQuery: string, assistantResponse: string): FollowUpChip[] {
  const suggestions: FollowUpChip[] = [];
  const lowerQuery = userQuery.toLowerCase();
  const lowerResponse = assistantResponse.toLowerCase();

  // Topic-based follow-ups
  if (lowerQuery.includes('nhs') || lowerQuery.includes('health')) {
    suggestions.push({
      id: uuidv4(),
      label: 'NHS funding debates',
      query: 'What are the recent debates about NHS funding and budget allocation?'
    });
    suggestions.push({
      id: uuidv4(),
      label: 'Healthcare policy changes',
      query: 'What healthcare policy changes have been discussed recently?'
    });
  }

  if (lowerQuery.includes('education') || lowerQuery.includes('school')) {
    suggestions.push({
      id: uuidv4(),
      label: 'Education funding',
      query: 'What has been said about education funding and school budgets?'
    });
    suggestions.push({
      id: uuidv4(),
      label: 'University policy',
      query: 'What are the recent discussions about university fees and higher education?'
    });
  }

  if (lowerQuery.includes('housing') || lowerQuery.includes('homeless')) {
    suggestions.push({
      id: uuidv4(),
      label: 'Housing crisis',
      query: 'What are MPs saying about the housing crisis and affordability?'
    });
    suggestions.push({
      id: uuidv4(),
      label: 'Social housing',
      query: 'What are the recent debates about social housing and council homes?'
    });
  }

  // Time-based follow-ups
  suggestions.push({
    id: uuidv4(),
    label: 'Recent debates',
    query: 'What were the most important debates in Parliament this week?'
  });

  // Party-based follow-ups
  if (lowerResponse.includes('labour') || lowerResponse.includes('conservative') || lowerResponse.includes('liberal democrat')) {
    suggestions.push({
      id: uuidv4(),
      label: 'Cross-party views',
      query: 'What do different political parties say about this topic?'
    });
  }

  // General follow-ups
  suggestions.push({
    id: uuidv4(),
    label: 'Key speakers',
    query: 'Who are the main MPs speaking about this issue?'
  });

  // Return up to 5 suggestions, removing duplicates
  const uniqueSuggestions = suggestions.filter((suggestion, index, self) => 
    index === self.findIndex(s => s.label === suggestion.label)
  );

  return uniqueSuggestions.slice(0, 5);
}