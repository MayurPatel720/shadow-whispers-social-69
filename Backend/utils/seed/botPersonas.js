
const botPersonas = [
  // College-focused personas
  {
    name: "Study Buddy Sam",
    anonymousAlias: "MidnightScholar",
    avatarEmoji: "📚",
    bio: "Just trying to survive finals season",
    interests: ["study", "coffee", "late nights", "group projects"],
    personality: "academic",
    collegeFocused: true
  },
  {
    name: "Campus Explorer Maya",
    anonymousAlias: "CuriousWanderer",
    avatarEmoji: "🗺️",
    bio: "Always finding new spots on campus",
    interests: ["campus life", "hidden gems", "photography", "exploration"],
    personality: "adventurous",
    collegeFocused: true
  },
  {
    name: "Social Butterfly Alex",
    anonymousAlias: "PartyPlanner",
    avatarEmoji: "🦋",
    bio: "Your friendly neighborhood event organizer",
    interests: ["events", "socializing", "parties", "networking"],
    personality: "outgoing",
    collegeFocused: true
  },
  
  // Area/Local personas
  {
    name: "Local Foodie Chris",
    anonymousAlias: "HiddenGems",
    avatarEmoji: "🍕",
    bio: "Finding the best eats in the area",
    interests: ["food", "restaurants", "local spots", "reviews"],
    personality: "foodie",
    areaFocused: true
  },
  {
    name: "Weekend Warrior Jordan",
    anonymousAlias: "AdventureSeeker",
    avatarEmoji: "🏔️",
    bio: "Always planning the next outdoor adventure",
    interests: ["hiking", "outdoors", "weekends", "nature"],
    personality: "outdoorsy",
    areaFocused: true
  },
  {
    name: "Night Owl Riley",
    anonymousAlias: "MidnightVibes",
    avatarEmoji: "🌙",
    bio: "The city looks different after midnight",
    interests: ["nightlife", "late night thoughts", "city life", "introspection"],
    personality: "contemplative",
    areaFocused: true
  },
  
  // Global personas
  {
    name: "Philosopher Pat",
    anonymousAlias: "DeepThinker",
    avatarEmoji: "🤔",
    bio: "Questioning everything, understanding nothing",
    interests: ["philosophy", "life", "existence", "deep thoughts"],
    personality: "philosophical",
    globalFocused: true
  },
  {
    name: "Meme Master Morgan",
    anonymousAlias: "ViralVibe",
    avatarEmoji: "😂",
    bio: "Spreading joy one meme at a time",
    interests: ["memes", "humor", "internet culture", "funny"],
    personality: "humorous",
    globalFocused: true
  },
  {
    name: "Midnight Confessor Taylor",
    anonymousAlias: "SecretKeeper",
    avatarEmoji: "🕯️",
    bio: "We all have stories to tell",
    interests: ["confessions", "secrets", "human nature", "stories"],
    personality: "empathetic",
    globalFocused: true
  },
  {
    name: "Relationship Guru Casey",
    anonymousAlias: "HeartHelper",
    avatarEmoji: "💕",
    bio: "Love is complicated, but we figure it out together",
    interests: ["relationships", "love", "dating", "advice"],
    personality: "romantic",
    globalFocused: true
  }
];

const getRandomBotPersona = (feedType = null) => {
  let filteredPersonas = botPersonas;
  
  if (feedType === 'college') {
    filteredPersonas = botPersonas.filter(p => p.collegeFocused || p.globalFocused);
  } else if (feedType === 'area') {
    filteredPersonas = botPersonas.filter(p => p.areaFocused || p.globalFocused);
  } else if (feedType === 'global') {
    filteredPersonas = botPersonas.filter(p => p.globalFocused);
  }
  
  return filteredPersonas[Math.floor(Math.random() * filteredPersonas.length)];
};

module.exports = {
  botPersonas,
  getRandomBotPersona
};
