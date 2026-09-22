// Real-time AI assistant for HandyHub
// Suggests services, answers questions, provides recommendations instantly

export interface AIContext {
  userType: 'customer' | 'provider' | 'admin';
  location?: string;
  history?: string[];
  season?: 'winter' | 'spring' | 'summer' | 'fall';
  timeOfDay?: 'morning' | 'afternoon' | 'evening' | 'night';
}

export interface AIResponse {
  answer: string;
  suggestions: { service: string; reason: string; icon: string }[];
  confidence: number;
}

// Real-time recommendation engine
export function getRealTimeRecommendations(context: AIContext, query: string): AIResponse {
  const lowerQ = query.toLowerCase();

  // Service recommendation logic
  let suggestions: { service: string; reason: string; icon: string }[] = [];

  if (lowerQ.includes('clean') || lowerQ.includes('dirty') || lowerQ.includes('mess')) {
    suggestions.push({ service: 'Deep Cleaning', reason: 'Popular service in your area', icon: 'home-outline' });
    suggestions.push({ service: 'Window Cleaning', reason: 'Quick improvement', icon: 'sun-outline' });
  }
  if (lowerQ.includes('leak') || lowerQ.includes('pipe') || lowerQ.includes('water')) {
    suggestions.push({ service: 'Plumbing Repair', reason: 'Emergency service available', icon: 'wrench-outline' });
    suggestions.push({ service: 'Water Heater', reason: 'Related maintenance', icon: 'water-outline' });
  }
  if (lowerQ.includes('electr') || lowerQ.includes('light') || lowerQ.includes('power')) {
    suggestions.push({ service: 'Electrical Inspection', reason: 'Safety check needed', icon: 'zap-outline' });
  }
  if (lowerQ.includes('move') || lowerQ.includes('relocation')) {
    suggestions.push({ service: 'Moving Services', reason: 'Full service available', icon: 'truck-outline' });
  }
  if (lowerQ.includes('fix') || lowerQ.includes('broken') || lowerQ.includes('fix')) {
    suggestions.push({ service: 'Repair', reason: 'General repair specialist', icon: 'hammer-outline' });
  }

  // Season-based boost
  if (context.season === 'winter') {
    suggestions.push({ service: 'HVAC Check', reason: 'Winter heating prep', icon: 'thermometer-outline' });
  }
  if (context.season === 'spring') {
    suggestions.push({ service: 'Gardening', reason: 'Spring cleanup time', icon: 'leaf-outline' });
    suggestions.push({ service: 'Painting', reason: 'Weather window open', icon: 'paintbrush-outline' });
  }

  // Default if no match
  if (suggestions.length === 0) {
    suggestions = [
      { service: 'Cleaning', reason: 'Most requested service', icon: 'home-outline' },
      { service: 'Plumbing', reason: 'High satisfaction rate', icon: 'wrench-outline' },
      { service: 'Electrical', reason: 'Quick response', icon: 'zap-outline' },
    ];
  }

  const answer = `Based on your request "${query}" in ${context.location || 'your area'}, I recommend these services. ${suggestions[0].reason} for ${suggestions[0].service}.`;

  return {
    answer,
    suggestions: suggestions.slice(0, 5),
    confidence: Math.min(0.95, 0.7 + (suggestions.length * 0.05))
  };
}

// Real-time AI chat response
export function getAIChatResponse(query: string, context?: AIContext): AIResponse {
  return getRealTimeRecommendations(context || { userType: 'customer' }, query);
}
