
// Generate random nicknames and avatars for anonymous users

// List of adjectives for random nicknames
const adjectives = [
  "Shadow", "Neon", "Cosmic", "Phantom", "Ghost", 
  "Hidden", "Secret", "Mystic", "Cyber", "Silent", 
  "Stealth", "Masked", "Obscure", "Enigma", "Veiled", 
  "Covert", "Shrouded", "Disguised", "Cryptic", "Anonymous"
];

// List of nouns for random nicknames
const nouns = [
  "Fox", "Wolf", "Raven", "Specter", "Whisper", 
  "Ghost", "Phantom", "Shadow", "Spirit", "Wanderer", 
  "Voyager", "Hunter", "Stalker", "Watcher", "Observer", 
  "Guardian", "Sentinel", "Keeper", "Walker", "Drifter"
];

const avatarEmojis = [
  "🎭", "👻", "🕶️", "🦊", "🐺", "🦉", "🦅", "🦇", "🐲", 
  "🌑", "✨", "💫", "⚡", "🔮", "🎪", "🎯", "🎲", "🃏", 
  "🦹", "🥷", "👤", "👥", "🕵️", "🧙", "🧠", "👁️", "💭"
];

export const getRandomEmoji = (): string => {
  return avatarEmojis[Math.floor(Math.random() * avatarEmojis.length)];
};

export const generateNickname = (): string => {
  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  return `${adjective}${noun}`;
};

// Generate random color from our theme
export const getRandomColor = (): string => {
  const colors = [
    "#8B5CF6", // Primary purple
    "#9b87f5", // Light purple
    "#7E69AB", // Medium purple
    "#6E59A5", // Deep purple
    "#D6BCFA", // Soft purple
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};

export const generateIdentity = () => {
  return {
    nickname: generateNickname(),
    emoji: getRandomEmoji(),
    color: getRandomColor(),
  };
};
