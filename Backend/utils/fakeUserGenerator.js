const FakeUser = require('../models/fakeUserModel');
const { generateAnonymousAlias, generateAvatar } = require('./generators');

// Pool of realistic names and usernames
const fakeUserData = [
  { username: 'midnight_wanderer', fullName: 'Alex Morgan', bio: 'Late night thinker, early morning dreamer 🌙' },
  { username: 'silent_observer', fullName: 'Jordan Rivers', bio: 'Watching the world from the shadows 👁️' },
  { username: 'anonymous_soul', fullName: 'Casey Thompson', bio: 'Just another voice in the void 🌌' },
  { username: 'hidden_truth', fullName: 'Riley Chen', bio: 'Seeking authenticity in anonymity ✨' },
  { username: 'masked_heart', fullName: 'Taylor Brooks', bio: 'Emotions behind the emoji 💭' },
  { username: 'ghost_writer', fullName: 'Morgan Davis', bio: 'Stories that need to be told 📝' },
  { username: 'shadow_self', fullName: 'Avery Kim', bio: 'The other side of me speaks here 🎭' },
  { username: 'whisper_wind', fullName: 'Cameron Lee', bio: 'Soft confessions in the digital breeze 🍃' },
  { username: 'faceless_friend', fullName: 'Quinn Martinez', bio: 'A friend you haven\'t met yet 🤝' },
  { username: 'echo_chamber', fullName: 'Sage Williams', bio: 'Reflecting thoughts back to the universe 🔄' },
  { username: 'digital_drifter', fullName: 'River Johnson', bio: 'Floating through cyberspace freely 🌊' },
  { username: 'veiled_voice', fullName: 'Rowan Smith', bio: 'Speaking truth through the veil 🎪' },
  { username: 'phantom_poet', fullName: 'Blake Anderson', bio: 'Words from beyond the visible 👻' },
  { username: 'invisible_ink', fullName: 'Drew Garcia', bio: 'Writing between the lines of reality ✍️' },
  { username: 'nameless_nomad', fullName: 'Phoenix Taylor', bio: 'Traveling without a trace 🗺️' },
  { username: 'secret_keeper', fullName: 'Sage Rodriguez', bio: 'Guardian of untold stories 🔐' },
  { username: 'lost_but_found', fullName: 'River Murphy', bio: 'Finding myself in losing myself 🧭' },
  { username: 'quiet_chaos', fullName: 'Emery Foster', bio: 'Calm on the surface, storm underneath ⛈️' },
  { username: 'paper_mask', fullName: 'Kendall Price', bio: 'Fragile but protecting what matters 📄' },
  { username: 'void_voice', fullName: 'Finley Cooper', bio: 'Speaking from the space between thoughts 🕳️' }
];

// Generate and store fake users
const createFakeUsers = async () => {
  try {
    // Check if fake users already exist
    const existingCount = await FakeUser.countDocuments();
    if (existingCount >= fakeUserData.length) {
      console.log(`${existingCount} fake users already exist. Skipping creation.`);
      return await FakeUser.find().lean();
    }

    console.log('Creating fake users...');
    const fakeUsers = [];

    for (const userData of fakeUserData) {
      // Check if this specific user already exists
      const existingUser = await FakeUser.findOne({ username: userData.username });
      if (existingUser) {
        fakeUsers.push(existingUser);
        continue;
      }

      const fakeUser = new FakeUser({
        username: userData.username,
        fullName: userData.fullName,
        anonymousAlias: await generateAnonymousAlias(),
        avatarEmoji: generateAvatar(),
        bio: userData.bio
      });

      const savedUser = await fakeUser.save();
      fakeUsers.push(savedUser);
    }

    console.log(`Created/retrieved ${fakeUsers.length} fake users`);
    return fakeUsers;
  } catch (error) {
    console.error('Error creating fake users:', error);
    throw error;
  }
};

// Get a random fake user
const getRandomFakeUser = async () => {
  try {
    const fakeUsers = await FakeUser.find().lean();
    if (fakeUsers.length === 0) {
      const newUsers = await createFakeUsers();
      return newUsers[Math.floor(Math.random() * newUsers.length)];
    }
    return fakeUsers[Math.floor(Math.random() * fakeUsers.length)];
  } catch (error) {
    console.error('Error getting random fake user:', error);
    throw error;
  }
};

// Get multiple random fake users
const getRandomFakeUsers = async (count) => {
  try {
    const fakeUsers = await FakeUser.find().lean();
    if (fakeUsers.length === 0) {
      await createFakeUsers();
      return await FakeUser.find().limit(count).lean();
    }
    
    // Shuffle and return requested count
    const shuffled = [...fakeUsers].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, Math.min(count, shuffled.length));
  } catch (error) {
    console.error('Error getting random fake users:', error);
    throw error;
  }
};

// Initialize fake users on startup
const initializeFakeUsers = async () => {
  try {
    await createFakeUsers();
  } catch (error) {
    console.error('Error initializing fake users:', error);
  }
};

module.exports = {
  createFakeUsers,
  getRandomFakeUser,
  getRandomFakeUsers,
  initializeFakeUsers
};