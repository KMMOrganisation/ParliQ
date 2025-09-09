// Keywords that indicate legal advice or voting guidance requests
const LEGAL_KEYWORDS = [
  'legal advice', 'lawyer', 'solicitor', 'sue', 'lawsuit', 'court case',
  'legal help', 'legal support', 'legal rights', 'can i sue', 'legal action'
];

const VOTING_KEYWORDS = [
  'who should i vote for', 'who to vote for', 'voting advice', 'voting guidance',
  'recommend vote', 'best candidate', 'which party to vote', 'voting recommendation',
  'who do you recommend', 'electoral advice'
];

export function isLegalOrVotingQuery(query: string): boolean {
  const lowerQuery = query.toLowerCase();
  
  const hasLegalKeywords = LEGAL_KEYWORDS.some(keyword => 
    lowerQuery.includes(keyword)
  );
  
  const hasVotingKeywords = VOTING_KEYWORDS.some(keyword => 
    lowerQuery.includes(keyword)
  );
  
  return hasLegalKeywords || hasVotingKeywords;
}

export function getGuardrailResponse(): string {
  return "I'm designed to help you understand parliamentary discussions and debates, but I can't provide legal advice or voting guidance. For these important matters, I'd recommend consulting the official resources below, where you can get proper support from qualified professionals.";
}