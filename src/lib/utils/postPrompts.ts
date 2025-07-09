
// Smart post prompts to encourage user engagement
export interface PostPrompt {
  id: string;
  text: string;
  category: 'confession' | 'reflection' | 'emotional' | 'regret' | 'dream' | 'funny' | 'philosophical';
  placeholder?: string;
}

export const postPrompts: PostPrompt[] = [
  // Confession prompts
  {
    id: 'conf_1',
    text: "What's something you never told anyone?",
    category: 'confession',
    placeholder: "Share your deepest secret..."
  },
  {
    id: 'conf_2', 
    text: "What's a lie you've been living?",
    category: 'confession',
    placeholder: "Tell us about the facade..."
  },
  {
    id: 'conf_3',
    text: "What would you do if nobody was watching?",
    category: 'confession',
    placeholder: "Your true desires..."
  },
  {
    id: 'conf_4',
    text: "What's your most embarrassing secret?",
    category: 'confession',
    placeholder: "We won't judge..."
  },

  // Reflection prompts
  {
    id: 'ref_1',
    text: "Describe your biggest secret in 5 words.",
    category: 'reflection',
    placeholder: "Just five words..."
  },
  {
    id: 'ref_2',
    text: "What's something about yourself that would surprise people?",
    category: 'reflection',
    placeholder: "The real you..."
  },
  {
    id: 'ref_3',
    text: "If you could restart your life, what would you change?",
    category: 'reflection',
    placeholder: "A fresh beginning..."
  },
  {
    id: 'ref_4',
    text: "What's a belief you hold that others might find weird?",
    category: 'reflection',
    placeholder: "Your unique perspective..."
  },

  // Emotional prompts
  {
    id: 'emo_1',
    text: "Who do you miss, but can't message?",
    category: 'emotional',
    placeholder: "Tell us about them..."
  },
  {
    id: 'emo_2',
    text: "What makes you cry when you're alone?",
    category: 'emotional',
    placeholder: "Your private tears..."
  },
  {
    id: 'emo_3',
    text: "What's keeping you up at night?",
    category: 'emotional',
    placeholder: "Share your midnight thoughts..."
  },
  {
    id: 'emo_4',
    text: "When did you last feel truly happy?",
    category: 'emotional',
    placeholder: "That perfect moment..."
  },

  // Regret prompts
  {
    id: 'reg_1',
    text: "What's a moment you regret deeply?",
    category: 'regret',
    placeholder: "If only you could go back..."
  },
  {
    id: 'reg_2',
    text: "What opportunity did you miss that still haunts you?",
    category: 'regret',
    placeholder: "The path not taken..."
  },
  {
    id: 'reg_3',
    text: "What would you apologize for if you could?",
    category: 'regret',
    placeholder: "Your unspoken sorry..."
  },
  {
    id: 'reg_4',
    text: "What's a decision you wish you could unmake?",
    category: 'regret',
    placeholder: "Turn back time..."
  },

  // Dream prompts
  {
    id: 'dream_1',
    text: "What's your secret dream that you're too scared to pursue?",
    category: 'dream',
    placeholder: "Your hidden ambition..."
  },
  {
    id: 'dream_2',
    text: "If money wasn't an issue, what would you do with your life?",
    category: 'dream',
    placeholder: "Dream without limits..."
  },
  {
    id: 'dream_3',
    text: "What would your 10-year-old self think of your life now?",
    category: 'dream',
    placeholder: "Through innocent eyes..."
  },
  {
    id: 'dream_4',
    text: "What adventure do you daydream about?",
    category: 'dream',
    placeholder: "Your perfect escape..."
  },

  // Funny prompts
  {
    id: 'funny_1',
    text: "What's your weirdest habit that nobody knows about?",
    category: 'funny',
    placeholder: "Your quirky secret..."
  },
  {
    id: 'funny_2',
    text: "What's the most ridiculous thing you believed as a child?",
    category: 'funny',
    placeholder: "Childhood logic..."
  },
  {
    id: 'funny_3',
    text: "What's your most irrational fear?",
    category: 'funny',
    placeholder: "We all have them..."
  },
  {
    id: 'funny_4',
    text: "What's the strangest compliment you've ever received?",
    category: 'funny',
    placeholder: "Oddly flattering..."
  },

  // Philosophical prompts
  {
    id: 'phil_1',
    text: "What do you think happens after we die?",
    category: 'philosophical',
    placeholder: "Your deepest thoughts..."
  },
  {
    id: 'phil_2',
    text: "If you could know one truth about the universe, what would it be?",
    category: 'philosophical',
    placeholder: "The ultimate question..."
  },
  {
    id: 'phil_3',
    text: "What's the meaning of life, in your opinion?",
    category: 'philosophical',
    placeholder: "Your philosophy..."
  },
  {
    id: 'phil_4',
    text: "Do you think we're living in a simulation?",
    category: 'philosophical',
    placeholder: "Question reality..."
  }
];

export const getRandomPrompt = (): PostPrompt => {
  const randomIndex = Math.floor(Math.random() * postPrompts.length);
  return postPrompts[randomIndex];
};

export const getPromptByCategory = (category: PostPrompt['category']): PostPrompt[] => {
  return postPrompts.filter(prompt => prompt.category === category);
};

export const getDailyPrompt = (): PostPrompt => {
  // Use current date as seed for consistent daily prompt
  const today = new Date();
  const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
  const promptIndex = dayOfYear % postPrompts.length;
  return postPrompts[promptIndex];
};
