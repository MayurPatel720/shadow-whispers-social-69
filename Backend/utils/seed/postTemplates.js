
const postTemplates = {
  college: {
    study: [
      "Anyone else pulling an all-nighter for tomorrow's exam? The library is my second home at this point 📚",
      "Pro tip: If you're struggling with organic chemistry, the tutoring center actually has some amazing resources",
      "That moment when you realize you've been studying the wrong chapter for 3 hours straight 😅",
      "Coffee shop recommendations for studying? The campus one is way too loud",
      "Is it just me or does everyone become a philosopher during finals week?",
      "Found the perfect study spot in the old building - fourth floor, corner by the window",
      "Group study session anyone? Working on statistics homework and could use some company"
    ],
    social: [
      "Did anyone else see what happened at the quad today? Drama level: maximum 👀",
      "Shoutout to whoever left encouraging sticky notes in the bathroom stalls - made my day",
      "That awkward moment when you wave back at someone who wasn't actually waving at you",
      "Campus wifi is down again... how am I supposed to procrastinate now?",
      "The dining hall pizza hits different at 2am, don't @ me",
      "Made eye contact with someone cute in lecture today. Now I have to sit in the same spot forever",
      "Anyone else feel like they're living in a coming-of-age movie sometimes?"
    ],
    confession: [
      "I've been pretending to understand calculus for the entire semester",
      "Sometimes I eat lunch alone in my dorm just to avoid awkward dining hall small talk",
      "I have a crush on someone in my study group but I'm too scared to say anything",
      "I changed my major three times and I'm still not sure what I want to do with my life",
      "I cried in a bathroom stall after failing my midterm and a stranger passed me tissues under the door",
      "I've never actually read any of the assigned books cover to cover"
    ]
  },
  area: {
    food: [
      "Discovered this hole-in-the-wall taco place that's absolutely incredible 🌮",
      "The new coffee shop on Main Street has the best atmosphere for working",
      "PSA: The farmer's market on Saturdays has the freshest produce I've ever tasted",
      "Anyone know what happened to that sandwich shop that used to be downtown?",
      "Late night food options in this area are severely lacking",
      "Found the most amazing bakery tucked away behind the bookstore"
    ],
    local: [
      "This neighborhood has such a different vibe after dark",
      "Shoutout to the person who always feeds the stray cats by the park",
      "The sunset from the hill overlooking downtown is absolutely stunning tonight",
      "Anyone else notice how friendly people are at the local grocery store?",
      "That one house with the amazing garden always makes me smile when I walk by",
      "The sound of the train at night is oddly comforting"
    ],
    events: [
      "The street fair this weekend was actually pretty fun despite the weather",
      "Live music at the community center tonight - surprisingly good turnout",
      "Local art gallery opening was inspiring, so much talent in this area",
      "Volunteer cleanup at the park tomorrow morning if anyone wants to join",
      "The annual festival planning committee could use more help",
      "Pop-up market in the square had some incredible handmade items"
    ]
  },
  global: {
    philosophical: [
      "Do you ever wonder if we're all just living in someone else's dream?",
      "The older I get, the more I realize how little I actually know about anything",
      "Sometimes I think about how we're all just floating on a rock in space and it's wild",
      "Is it weird that I find comfort in knowing that everyone else is just winging it too?",
      "The concept of time is so strange when you really think about it",
      "What if every person you pass on the street has a story as complex as your own?"
    ],
    confession: [
      "I still sleep with a stuffed animal and I'm not sorry about it",
      "Sometimes I pretend I'm the main character in a movie when I'm doing mundane tasks",
      "I've had the same password for everything for like 5 years",
      "I judge people based on their music taste and I know it's wrong but I can't stop",
      "I talk to my plants and I swear they grow better when I do",
      "I still don't know how to properly fold a fitted sheet"
    ],
    humor: [
      "Why is adulting just googling how to do things and hoping for the best?",
      "My bank account and I are currently not on speaking terms",
      "That moment when you're an adult but you still ask for the 'adult' when calling businesses",
      "I have a love-hate relationship with my alarm clock. Mostly hate.",
      "My life is like a movie, but it's more of a low-budget indie film",
      "Why do I have 47 tabs open but can't remember what I was looking for?"
    ],
    relationships: [
      "It's funny how you can feel lonely in a room full of people",
      "The best relationships are the ones where you can be completely weird together",
      "Sometimes the people who understand you best are the ones you've never met",
      "Love languages are real - mine is definitely acts of service and snacks",
      "It's okay to outgrow people, even if it hurts",
      "The hardest part about caring about someone is learning when to give them space"
    ]
  }
};

const getRandomTemplate = (feedType, category = null) => {
  const templates = postTemplates[feedType];
  if (!templates) return null;
  
  if (category && templates[category]) {
    const categoryTemplates = templates[category];
    return categoryTemplates[Math.floor(Math.random() * categoryTemplates.length)];
  }
  
  // Get random category if none specified
  const categories = Object.keys(templates);
  const randomCategory = categories[Math.floor(Math.random() * categories.length)];
  const categoryTemplates = templates[randomCategory];
  return categoryTemplates[Math.floor(Math.random() * categoryTemplates.length)];
};

const commentTemplates = [
  "This is so relatable omg",
  "Literally me right now 😭",
  "Why is this so accurate?",
  "I felt this in my soul",
  "Same energy tbh",
  "This hit different",
  "Big mood",
  "I'm crying 😂",
  "Too real",
  "This is everything",
  "Absolutely this ^^^",
  "You get it",
  "Needed to hear this today",
  "Facts 💯",
  "Story of my life",
  "I'm deceased 💀",
  "Why did you call me out like this?",
  "This is sending me",
  "I can't even",
  "Periodt",
  "The accuracy",
  "I'm screaming",
  "This is it chief",
  "No lies detected",
  "Say it louder for the people in the back"
];

const getRandomComment = () => {
  return commentTemplates[Math.floor(Math.random() * commentTemplates.length)];
};

module.exports = {
  postTemplates,
  getRandomTemplate,
  getRandomComment
};
