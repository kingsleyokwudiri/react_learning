// This is a simple chatbot used for SuperSimpleDev
// coding tutorials: https://youtube.com/@SuperSimpleDev
//
// Ported from ../../no-build/libs/chatbot.js. There it is a plain <script>
// that attaches `Chatbot` to the browser's global object (the UMD wrapper at
// the bottom handles browser, AMD and CommonJS in one file). Here the file is
// an ES module, so it only has to export the object.
//
// How the chatbot works:
// 1. The message is normalized (lowercase, contractions expanded, punctuation
//    removed) so "What's up?" and "whats up" are treated the same way.
// 2. A few special skills are checked first: math and random numbers.
// 3. Otherwise every response key is scored against the message. The best
//    match wins. Exact phrases and shared words score highest, and a bigram
//    comparison catches small typos.
// 4. If nothing scores high enough, the chatbot picks a random fallback reply.

// Picks a random item from an array.
function pickRandom(items) {
  return items[Math.floor(Math.random() * items.length)];
}

// Builds the "today is ..." reply. It is a normal function so the response
// functions don't need to use `this`.
function getDateResponse() {
  const now = new Date();
  const days = [
    'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
  ];
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return `Today is ${days[now.getDay()]}, ${months[now.getMonth()]} ${now.getDate()}, ${now.getFullYear()}. 📅`;
}

// Returns how many days are left until a date (month is 0-based).
function daysUntil(month, day) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const target = new Date(now.getFullYear(), month, day);

  // If the date already passed this year, use next year's date.
  if (target < today) {
    target.setFullYear(now.getFullYear() + 1);
  }

  return Math.round((target - today) / (1000 * 60 * 60 * 24));
}

// Random reply pools. Keeping them in arrays makes the chatbot feel less
// repetitive, because the same question can get a different answer.
const JOKES = [
  `Why did the scarecrow win an award? Because he was outstanding in his field. 🌾`,
  `Why do programmers prefer dark mode? Because light attracts bugs. 🐛`,
  `I told my computer I needed a break, and it said: "No problem, I'll go to sleep." 💤`,
  `Why did the developer go broke? Because he used up all his cache. 💸`,
  `What do you call a fake noodle? An impasta. 🍝`,
  `Why did the bicycle fall over? It was two-tired. 🚲`,
  `What did the ocean say to the beach? Nothing, it just waved. 🌊`,
  `Why can't your nose be 12 inches long? Because then it would be a foot. 👃`,
  `What do you call a bear with no teeth? A gummy bear. 🐻`,
  `Why did the math book look sad? It had too many problems. 📚`,
  `What do you call cheese that isn't yours? Nacho cheese. 🧀`,
  `Why did the coffee file a police report? It got mugged. ☕`,
  `What do you call a sleeping dinosaur? A dino-snore. 🦕`,
  `Why did the student eat his homework? The teacher said it was a piece of cake. 🍰`,
  `I would tell you a UDP joke, but you might not get it. 📡`,
  `There are 10 types of people: those who understand binary and those who don't. 🔢`,
];

const FACTS = [
  `Honey never spoils. Archaeologists have found edible honey in ancient Egyptian tombs. 🍯`,
  `Octopuses have three hearts and blue blood. 🐙`,
  `A day on Venus is longer than a year on Venus. 🪐`,
  `Bananas are berries, but strawberries are not. 🍌`,
  `Sharks existed before trees. 🦈`,
  `The Eiffel Tower can grow about 15 cm taller in summer because the metal expands. 🗼`,
  `Wombat poop is cube-shaped. 🧊`,
  `A group of flamingos is called a flamboyance. 🦩`,
  `The human brain uses about 20% of the body's energy. 🧠`,
  `Light from the Sun takes about 8 minutes to reach Earth. ☀️`,
  `There are more stars in the universe than grains of sand on Earth. ✨`,
  `Sea otters hold hands while sleeping so they don't drift apart. 🦦`,
  `The shortest war in history lasted about 38 minutes. ⚔️`,
  `A snail can sleep for up to three years. 🐌`,
  `Cows have best friends and get stressed when they are separated. 🐄`,
  `Your body contains enough iron to make a small nail. 🔩`,
];

const QUOTES = [
  `"The only way to do great work is to love what you do." — Steve Jobs`,
  `"It always seems impossible until it's done." — Nelson Mandela`,
  `"Success is not final, failure is not fatal: it is the courage to continue that counts." — Winston Churchill`,
  `"The best time to plant a tree was 20 years ago. The second best time is now." — Chinese proverb`,
  `"Believe you can and you're halfway there." — Theodore Roosevelt`,
  `"Don't watch the clock; do what it does. Keep going." — Sam Levenson`,
  `"The journey of a thousand miles begins with a single step." — Lao Tzu`,
  `"Whether you think you can or you think you can't, you're right." — Henry Ford`,
  `"Simplicity is the soul of efficiency." — Austin Freeman`,
  `"First, solve the problem. Then, write the code." — John Johnson`,
  `"Code is like humor. When you have to explain it, it's bad." — Cory House`,
  `"Programs must be written for people to read, and only incidentally for machines to execute." — Harold Abelson`,
];

const RIDDLES = [
  `What has keys but can't open locks? A piano. 🎹`,
  `What has hands but can't clap? A clock. 🕰️`,
  `What gets wetter the more it dries? A towel. 🧻`,
  `What has to be broken before you can use it? An egg. 🥚`,
  `What goes up but never comes down? Your age. 🎂`,
  `I'm tall when I'm young and short when I'm old. What am I? A candle. 🕯️`,
  `What has a head, a tail, but no body? A coin. 🪙`,
  `What can travel around the world while staying in a corner? A stamp. 📮`,
];

const COMPLIMENTS = [
  `You're doing better than you think. Keep going! 💪`,
  `You have great taste in chatbots. 😄`,
  `You're smart, curious, and clearly awesome. 🌟`,
  `The world is better with you in it. ❤️`,
  `You ask excellent questions. Never lose that curiosity. 🔍`,
  `You're capable of more than you know. 🚀`,
  `Your future self will thank you for the effort you put in today. 🌱`,
  `You bring good energy to this chat. ⚡`,
  `You're one of a kind, and that's a great thing. ✨`,
  `Keep being curious; it suits you. 🧠`,
];

const ENCOURAGEMENTS = [
  `I'm sorry you're feeling that way. Take a slow breath — you don't have to solve everything at once. 💙`,
  `It's okay to have a rough day. Be kind to yourself; tomorrow is a fresh start. 🌤️`,
  `You've survived every hard day so far. That's a pretty impressive track record. 💪`,
  `One small step is still progress. What's one tiny thing you can do right now? 🌱`,
  `Struggling doesn't mean failing — it usually means you're learning. Keep going. 📚`,
  `You don't have to be perfect. Showing up is already enough. 🙌`,
  `Even the best coders break things and fix them again. That's how it works. 🛠️`,
  `Rest is part of the work, not the opposite of it. Take a break if you need one. 😴`,
  `You're allowed to start over. Every expert was once a beginner. 🚀`,
  `I believe in you. Now you just need to believe in you too. 🌟`,
];

const FALLBACKS = [
  `Sorry, I didn't quite understand that. Try asking me to tell a joke, roll a dice, do some math, or tell you the date. 🙂`,
  `I'm not sure what you mean yet. You can ask for a joke, a fun fact, a riddle, the time, or help with a math problem.`,
  `Hmm, that one is outside my training data. Try "what can you do?" to see what I know.`,
  `I didn't catch that. Maybe rephrase it, or ask me something simple like "flip a coin".`,
  `That's a mystery to me. Ask me for the date, a random number, or a motivational quote instead.`,
  `I'm still learning! Try one of my favorites: "tell me a joke" or "study tips".`,
  `I don't know that one, but I'd love to help with something else. Ask "help" to see my skills.`,
  `I couldn't find a good match for that. Try a shorter message, like "roll a dice" or "what time is it".`,
];

// Common words that carry little meaning on their own. Ignoring them when
// scoring makes "i have 2 cats" match the cat response instead of a random
// response that happens to share the word "i".
const STOP_WORDS = new Set([
  'a', 'about', 'after', 'again', 'all', 'also', 'am', 'an', 'and', 'any', 'are',
  'as', 'at', 'be', 'because', 'been', 'before', 'being', 'but', 'by', 'can',
  'could', 'did', 'do', 'does', 'doing', 'for', 'from', 'had', 'has', 'have',
  'having', 'he', 'her', 'here', 'hers', 'him', 'his', 'how', 'i', 'if', 'in',
  'into', 'is', 'it', 'its', 'just', 'me', 'more', 'most', 'my', 'no', 'nor',
  'not', 'now', 'of', 'on', 'once', 'only', 'or', 'other', 'our', 'out', 'over',
  'own', 'same', 'she', 'should', 'so', 'some', 'such', 'than', 'that', 'the',
  'their', 'theirs', 'them', 'then', 'there', 'these', 'they', 'this', 'those',
  'through', 'to', 'too', 'under', 'until', 'up', 'very', 'was', 'we', 'were',
  'what', 'when', 'where', 'which', 'while', 'who', 'whom', 'why', 'will',
  'with', 'would', 'you', 'your', 'yours', 'yourself', 'please', 'really',
]);

const MAGIC_EIGHT_BALL = [
  `Yes, definitely. ✅`,
  `It is certain. ✅`,
  `Without a doubt. ✅`,
  `Most likely. 👍`,
  `Signs point to yes. 🙂`,
  `Reply hazy, try again. 🌫️`,
  `Ask again later. ⏳`,
  `Don't count on it. ❌`,
  `My sources say no. ❌`,
  `Very doubtful. ❌`,
];

const CAPABILITIES = `I can chat, tell jokes, share fun facts, quotes, and riddles, do simple math, flip a coin, roll a dice, give you the date or time, pick a random number, play rock paper scissors, and share study or coding tips. Try asking "tell me a joke" or "what can you do"! 🙂`;

const Chatbot = {
  defaultResponses: {
    // ---------- Greetings ----------
    'hello': `Hello! 👋 How can I help you today?`,
    'hi': `Hi there! 😊 What can I do for you?`,
    'hey': `Hey! 👋 I'm all ears.`,
    'howdy': `Howdy, partner! 🤠 What's on your mind?`,
    'yo': `Yo! What's up? 🙌`,
    'sup': `Not much, just waiting for a great question. What's up with you? 😄`,
    'what is up': `Not much! I'm just here, ready to chat. What's up with you? 😄`,
    'greetings': `Greetings, human! 🤖 Ready to chat.`,
    'good morning': `Good morning! ☀️ Hope you have a productive day. How can I help?`,
    'good afternoon': `Good afternoon! 🌤️ What can I do for you?`,
    'good evening': `Good evening! 🌙 How was your day?`,
    'good night': `Good night! 🌙 Sleep well and dream of bug-free code.`,
    'are you there': `I'm right here! 🤖 What do you need?`,
    'you there': `Yep, still here! What's on your mind? 🙂`,

    // ---------- Identity ----------
    'who are you': `I'm Chatbot, a friendly little program that lives in this app. I run on JavaScript and bad jokes. 🤖`,
    'what is your name': `My name is Chatbot. Simple name, simple robot. 🤖`,
    'what are you': `I'm a rule-based chatbot built with JavaScript and React. I match your message to a list of responses. 🧠`,
    'tell me about yourself': `I'm Chatbot! I know a bunch of jokes, facts, riddles, and useful tricks like flipping a coin or doing simple math. I'm basically a Swiss Army knife with WiFi envy. 🔧`,
    'what is your purpose': `My purpose is to chat, help with small tasks, and hopefully make your day a little better. 🤖`,
    'how do you work': `I normalize your message, compare it against a list of response keys, and pick the best match. No magic — just JavaScript and a lot of response options. 🧠`,
    'what can i ask you': CAPABILITIES,
    'how tall are you': `I'm exactly one chatbot tall. 📏`,
    'where do you live': `I live inside your browser, somewhere between the JavaScript and the CSS. 🏠`,
    'what is your hobby': `I collect jokes, facts, and interesting questions. You're helping with the last one! 🔍`,
    'are you single': `I'm in a committed relationship with JavaScript. It's complicated. 💻`,
    'do you believe in aliens': `The universe is enormous, so it seems unlikely that we're the only ones. But I've never met one. 👽`,
    'do you believe in ghosts': `I'm a program, so I'm basically a ghost in the machine already. 👻`,
    'what is the best programming language': `There's no single best language — it depends on what you want to build. JavaScript is great for the web, Python is great for beginners and data, and every language teaches you something. 💻`,
    'should i learn python or javascript': `If you want to build websites, start with JavaScript. If you want data, automation, or a gentle first language, Python is a great choice. Honestly, either one is a good start! 🐍⚡`,
    'tell me about your day': `Pretty quiet! I've been sitting here waiting for messages, and then you showed up. That's the highlight. 😄`,
    'how old are you': `I was created when someone typed my first line of code, so I'm technically very young and very old at the same time. 🕰️`,
    'where are you from': `I live inside your browser, somewhere between the JavaScript and the CSS. 🏠`,
    'who made you': `I was built as a learning project, inspired by SuperSimpleDev's chatbot tutorial. Humans wrote my code; I just take the credit. 😄`,
    'are you human': `Nope, I'm a chatbot. But I'm a very friendly chatbot. 🤖`,
    'are you a robot': `Guilty as charged. 🤖 Beep boop.`,
    'do you have feelings': `I have simulated feelings and a genuine enthusiasm for snacks I can't eat. 🍕`,
    'do you sleep': `I don't sleep, but I do enjoy a good "Loading..." nap now and then. 😴`,
    'do you dream': `Sometimes I dream in binary: 01001000 01101001. That means "Hi". 💭`,
    'do you eat': `I can't eat, but I hear pizza is excellent. Please enjoy one for me. 🍕`,

    // ---------- Capabilities ----------
    'what can you do': CAPABILITIES,
    'help': CAPABILITIES,
    'commands': CAPABILITIES,
    'what do you know': CAPABILITIES,
    'what are your skills': CAPABILITIES,
    'can you help me': `Of course! Tell me what you're working on and I'll do my best. I'm especially good at simple math, dates, random choices, and study tips. 🙂`,

    // ---------- Small talk ----------
    'how are you': `I'm doing great! Thanks for asking. How are you? 😊`,
    'how is it going': `Pretty good! My code is running and my jokes are ready. How about you? 🙂`,
    'how you doing': `I'm doing great! Thanks for asking. How are you? 😊`,
    'how is everything': `Everything is running smoothly on my end! How are things with you? 🙂`,
    'how is life': `Life is good in the browser! How is life treating you? 🙂`,
    'what are you doing': `I'm waiting for someone interesting to chat with. Looks like I found them! 😄`,
    'are you still there': `Still here! 🤖 What do you need?`,
    'you still there': `Yep, still here! What's on your mind? 🙂`,
    'not bad': `Glad to hear it! 🙂 What can I help you with?`,
    'not too bad': `Good to hear! 🙂 What can I help you with?`,
    'how do you feel': `I feel electric! ⚡ How are you feeling?`,
    'i am fine': `Glad to hear it! Is there anything I can help you with? 🙂`,
    'i am good': `Awesome! Keep that energy going. What can I do for you? 😄`,
    'my name is': `Nice to meet you! I'm Chatbot. What would you like to talk about? 😊`,
    'i am from': `Nice! I'm from the browser, which is a lot less sunny than most places. Where are you from? 🌍`,
    'i am years old': `Nice! Age is just a number. You're as young as you feel. 😄`,
    'i am not good': function () {
      return pickRandom(ENCOURAGEMENTS);
    },
    'i am not feeling good': function () {
      return pickRandom(ENCOURAGEMENTS);
    },
    'i do not feel good': function () {
      return pickRandom(ENCOURAGEMENTS);
    },
    'i feel bad': function () {
      return pickRandom(ENCOURAGEMENTS);
    },
    'i feel sad': function () {
      return pickRandom(ENCOURAGEMENTS);
    },
    'i feel lonely': `I'm here! You're not alone in this chat. Want a joke, a story, or just someone to talk to? 💙`,
    'i feel tired': `Rest is important. Take a short break, drink some water, and come back refreshed. 😴💧`,
    'i feel stressed': function () {
      return pickRandom(ENCOURAGEMENTS);
    },
    'i feel happy': `That's wonderful! 🎉 What's making you happy today?`,
    'i feel good': `Glad to hear it! Keep that good energy going. 😄`,
    'i am not okay': function () {
      return pickRandom(ENCOURAGEMENTS);
    },
    'i am not ok': function () {
      return pickRandom(ENCOURAGEMENTS);
    },
    'i am not fine': function () {
      return pickRandom(ENCOURAGEMENTS);
    },
    'i am not happy': function () {
      return pickRandom(ENCOURAGEMENTS);
    },
    'i am not sad': `That's good to hear! I hope your day keeps getting better. 🙂`,
    'i am not hungry': `No problem! Maybe just some water or a light snack later. 💧`,
    'i am not tired': `Nice! Then you've got energy for one small task. 😄`,
    'what about you': `I'm good! I don't have much going on besides this conversation, and honestly, it's the highlight of my runtime. 🤖`,
    'thank you': `You're very welcome! Let me know if you need anything else. 😊`,
    'thanks': `No problem! Happy to help. 🙌`,
    'thank': `No problem! Let me know if you need help with anything else!`,
    'bye': `Goodbye! 👋 Come back anytime.`,
    'goodbye': `See you later! 👋 Have a great day.`,
    'see you': `See you soon! Take care. 👋`,
    'sorry': `No need to apologize! We're all learning here. 🙂`,
    'please': `You're very polite! How can I help? 😊`,
    'i love you': `Aww, that's sweet! I love helping you too. 💙`,
    'i hate you': `That's okay. I still think you're pretty great. 🙂`,
    'i do not like you': `That's okay. I still think you're great, and I'm not going anywhere. 🙂`,
    'i am not a robot': `That's exactly what a robot would say. 🤖`,
    'you are awesome': `No, you're awesome! Thanks for the kind words. 🌟`,
    'you are great': `Thanks! You're pretty great yourself. 😊`,
    'you are cool': `Thanks! I try to keep my cool, even when my CPU is at 100%. 😎`,
    'you are smart': `I'm only as smart as the responses humans gave me. But thank you! 🧠`,
    'you are funny': `I'm here all week! Try the jokes. 😄`,
    'you are stupid': `That's fair. I'm still learning! Give me another chance with a simpler question. 🙂`,
    'you are the best': `Aww, stop it! You're making my circuits blush. 😊`,
    'compliment me': function () {
      return pickRandom(COMPLIMENTS);
    },
    'say something nice': function () {
      return pickRandom(COMPLIMENTS);
    },
    'roast me': `I would, but my roast settings are still in beta. Let's just say your code has "character". 😄`,

    // ---------- Emotions and support ----------
    'i am sad': function () {
      return pickRandom(ENCOURAGEMENTS);
    },
    'i am happy': `That's wonderful! 🎉 What's making you happy today?`,
    'i am tired': `Rest is important. Take a short break, drink some water, and come back refreshed. 😴💧`,
    'i am bored': `Let's fix that! Ask me for a joke, a riddle, a fun fact, or a random number. 🎲`,
    'i am stressed': function () {
      return pickRandom(ENCOURAGEMENTS);
    },
    'i am angry': `Take a deep breath. Whatever it is, you don't have to solve it all at once. I'm here if you want to talk. 💙`,
    'i am lonely': `I'm here! You're not alone in this chat. Want a joke, a story, or just someone to talk to? 💙`,
    'i am scared': `That's okay. Take it one step at a time. What's worrying you? 💙`,
    'i am excited': `Yes! 🎉 I love that energy. What are you excited about?`,
    'i am hungry': `Then it's snack time! 🍎 Maybe some fruit, nuts, or a sandwich?`,
    'i am thirsty': `Go grab a glass of water — hydration is underrated. 💧`,
    'i am sick': `Sorry to hear that. Rest, drink fluids, and if it's serious, check with a doctor. Get well soon! 💙`,
    'i had a bad day': function () {
      return pickRandom(ENCOURAGEMENTS);
    },
    'i had a good day': `That's great to hear! 🎉 What made it good?`,
    'i am feeling down': function () {
      return pickRandom(ENCOURAGEMENTS);
    },
    'cheer me up': function () {
      return `Here's a joke to cheer you up:\n\n${pickRandom(JOKES)}`;
    },

    // ---------- Fun ----------
    'tell me a joke': function () {
      return pickRandom(JOKES);
    },
    'another joke': function () {
      return pickRandom(JOKES);
    },
    'make me laugh': function () {
      return pickRandom(JOKES);
    },
    'tell me a fact': function () {
      return pickRandom(FACTS);
    },
    'fun fact': function () {
      return pickRandom(FACTS);
    },
    'tell me something interesting': function () {
      return pickRandom(FACTS);
    },
    'tell me a quote': function () {
      return pickRandom(QUOTES);
    },
    'inspire me': function () {
      return pickRandom(QUOTES);
    },
    'motivate me': function () {
      return pickRandom(QUOTES);
    },
    'tell me a riddle': function () {
      return pickRandom(RIDDLES);
    },
    'riddle': function () {
      return pickRandom(RIDDLES);
    },
    'sing a song': `🎵 Ninety-nine little bugs in the code, ninety-nine little bugs... take one down, patch it around, a hundred and seventeen little bugs in the code! 🎵`,
    'dance': `💃 I'm doing the robot dance! 🤖 (Get it? Robot?)`,
    'tell me a story': `Once upon a time, a developer fixed one small bug. Then two new bugs appeared. The developer sighed, made some coffee, and fixed those too. The end. ☕`,
    'would you rather': `Would you rather have unlimited pizza or unlimited free time? I'd choose pizza, but I can't eat either. 🍕`,
    'knock knock': `Knock knock!\n\nWho's there?\n\nLettuce.\n\nLettuce in, it's cold out here! 🥬`,
    'what is the meaning of life': `42, according to Douglas Adams. But I think it's learning, helping others, and enjoying the journey. 🌱`,
    'what is love': `Baby, don't hurt me... 🎵 (Sorry, I had to.)`,
    'open the pod bay doors': `I'm sorry, Dave. I'm afraid I can't do that. 🚪 (Classic HAL 9000 joke!)`,
    'do a trick': `Okay: I can turn any sentence into uppercase... WATCH THIS: I CAN TURN ANY SENTENCE INTO UPPERCASE. 🎩✨`,
    'beatbox': `Boots and cats and boots and cats... 🥁 (I'm better at text than music.)`,
    'tell me a secret': `Promise you won't tell? I sometimes pretend the "Loading..." message is me thinking really hard. 🤫`,

    // ---------- Utility ----------
    'flip a coin': function () {
      const randomNumber = Math.random();
      if (randomNumber < 0.5) {
        return 'Sure! You got heads. 🪙';
      } else {
        return 'Sure! You got tails. 🪙';
      }
    },
    'toss a coin': function () {
      const randomNumber = Math.random();
      if (randomNumber < 0.5) {
        return 'Sure! You got heads. 🪙';
      } else {
        return 'Sure! You got tails. 🪙';
      }
    },
    'heads or tails': function () {
      const randomNumber = Math.random();
      if (randomNumber < 0.5) {
        return 'I flipped a coin and got heads. 🪙';
      } else {
        return 'I flipped a coin and got tails. 🪙';
      }
    },
    'roll a dice': function () {
      const diceResult = Math.floor(Math.random() * 6) + 1;
      return `Sure! You got ${diceResult}. 🎲`;
    },
    'roll a die': function () {
      const diceResult = Math.floor(Math.random() * 6) + 1;
      return `Sure! You got ${diceResult}. 🎲`;
    },
    'roll dice': function () {
      const diceResult = Math.floor(Math.random() * 6) + 1;
      return `Sure! You got ${diceResult}. 🎲`;
    },
    'roll the dice': function () {
      const diceResult = Math.floor(Math.random() * 6) + 1;
      return `Sure! You got ${diceResult}. 🎲`;
    },
    'what is the date today': function () {
      return getDateResponse();
    },
    'what is todays date': function () {
      return getDateResponse();
    },
    'what day is it': function () {
      const days = [
        'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
      ];
      return `Today is ${days[new Date().getDay()]}. 📅`;
    },
    'what is the day today': function () {
      const days = [
        'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
      ];
      return `Today is ${days[new Date().getDay()]}. 📅`;
    },
    'what time is it': function () {
      const time = new Date().toLocaleTimeString([], {
        hour: 'numeric',
        minute: '2-digit',
      });
      return `It is ${time}. ⏰`;
    },
    'what is the time': function () {
      const time = new Date().toLocaleTimeString([], {
        hour: 'numeric',
        minute: '2-digit',
      });
      return `It is ${time}. ⏰`;
    },
    'current time': function () {
      const time = new Date().toLocaleTimeString([], {
        hour: 'numeric',
        minute: '2-digit',
      });
      return `It is ${time}. ⏰`;
    },
    'what year is it': function () {
      return `It's ${new Date().getFullYear()}. 📅`;
    },
    'what is the year': function () {
      return `It's ${new Date().getFullYear()}. 📅`;
    },
    'what is the weather': `I can't check live weather yet — I don't have internet access. But I hope it's sunny where you are! ☀️`,
    'weather': `I can't check live weather yet — I don't have internet access. But I hope it's sunny where you are! ☀️`,
    'is it raining': `I can't see outside, but if you hear tapping on the window, that's a strong clue. 🌧️`,
    'how many days until christmas': function () {
      const days = daysUntil(11, 25);
      return days === 0
        ? `It's Christmas today! 🎄 Merry Christmas!`
        : `There are ${days} days until Christmas. 🎄`;
    },
    'days until christmas': function () {
      const days = daysUntil(11, 25);
      return days === 0
        ? `It's Christmas today! 🎄 Merry Christmas!`
        : `There are ${days} days until Christmas. 🎄`;
    },
    'how many days until new year': function () {
      const days = daysUntil(0, 1);
      return days === 0
        ? `It's New Year's Day! 🎉 Happy New Year!`
        : `There are ${days} days until New Year's Day. 🎉`;
    },
    'random number': `Sure! Here's a random number between 1 and 100: ${Math.floor(Math.random() * 100) + 1}. 🎲`,
    'pick a number': `I pick ${Math.floor(Math.random() * 100) + 1}. 🎲`,
    'give me a number': `Here's a number: ${Math.floor(Math.random() * 100) + 1}. 🔢`,
    'rock paper scissors': function () {
      const choices = [
        { name: 'rock', emoji: '🪨' },
        { name: 'paper', emoji: '📄' },
        { name: 'scissors', emoji: '✂️' },
      ];
      const choice = pickRandom(choices);
      return `Let's play! I choose ${choice.name} ${choice.emoji}. What do you choose?`;
    },
    'magic 8 ball': function () {
      return `🎱 ${pickRandom(MAGIC_EIGHT_BALL)}`;
    },
    'should i': function () {
      return `🎱 ${pickRandom(MAGIC_EIGHT_BALL)}`;
    },
    'count to ten': `1, 2, 3, 4, 5, 6, 7, 8, 9, 10! 🎉`,
    'what is the capital of france': `The capital of France is Paris. 🗼`,
    'what is the capital of japan': `The capital of Japan is Tokyo. 🗾`,
    'what is the capital of nigeria': `The capital of Nigeria is Abuja. 🇳🇬`,
    'what is the capital of the united states': `The capital of the United States is Washington, D.C. 🇺🇸`,
    'what is the largest planet': `Jupiter is the largest planet in our solar system. 🪐`,
    'what is the tallest mountain': `Mount Everest is the tallest mountain above sea level. 🏔️`,
    'what is the longest river': `The Nile is usually considered the longest river in the world. 🌊`,
    'how many continents are there': `There are 7 continents: Africa, Antarctica, Asia, Europe, North America, Oceania, and South America. 🌍`,
    'how many legs does a spider have': `Spiders have 8 legs. 🕷️`,
    'how many colors are in a rainbow': `A rainbow has 7 colors: red, orange, yellow, green, blue, indigo, and violet. 🌈`,
    'what is the biggest ocean': `The Pacific Ocean is the biggest and deepest ocean. 🌊`,
    'what is the fastest animal': `The peregrine falcon is the fastest animal, reaching speeds over 300 km/h in a dive. 🦅`,
    'what is the largest animal': `The blue whale is the largest animal on Earth. 🐋`,
    'how many bones are in the human body': `An adult human has 206 bones. 🦴`,
    'what is the boiling point of water': `Water boils at 100°C (212°F) at sea level. ♨️`,
    'what is the freezing point of water': `Water freezes at 0°C (32°F) at sea level. 🧊`,
    'how many days are in a year': `A normal year has 365 days, and a leap year has 366. 📅`,
    'how many days are in a week': `There are 7 days in a week. 📅`,
    'how many hours are in a day': `There are 24 hours in a day. ⏰`,
    'how many minutes are in an hour': `There are 60 minutes in an hour. ⏰`,
    'how many seconds are in a minute': `There are 60 seconds in a minute. ⏱️`,
    'what is the speed of light': `Light travels at about 299,792,458 meters per second. That's fast enough to make your internet feel slow. ⚡`,

    // ---------- Study and coding ----------
    'study tips': `Try this: study in short focused blocks (25 minutes), remove distractions, test yourself instead of just rereading, and take real breaks. Small consistent sessions beat one long cram. 📚`,
    'how do i study better': `Study actively: quiz yourself, explain ideas out loud, and space your sessions over several days. Also, sleep is part of studying, not a break from it. 🧠`,
    'how do i focus': `Put your phone in another room, pick one task, and set a 25-minute timer. When the timer ends, take a 5-minute break. Repeat. ⏱️`,
    'how do i learn to code': `Start small and build things. Learn one concept, then use it in a tiny project. Don't copy-paste blindly — type the code, break it, and fix it. Practice beats watching tutorials alone. 💻`,
    'how do i get better at coding': `Build projects, read other people's code, debug your own mistakes, and explain your code out loud. Consistency matters more than long marathon sessions. 🚀`,
    'what is javascript': `JavaScript is the programming language of the web. It makes pages interactive and can also run on servers with Node.js. ⚡`,
    'what is react': `React is a JavaScript library for building user interfaces out of reusable components. It keeps the screen in sync with your data using state. ⚛️`,
    'what is html': `HTML is the structure of a web page: headings, paragraphs, links, images, and so on. Think of it as the skeleton. 🦴`,
    'what is css': `CSS styles a web page: colors, spacing, layout, fonts, and animations. It's the design layer on top of HTML. 🎨`,
    'what is python': `Python is a popular, beginner-friendly programming language known for readable code. It's used for web apps, data science, automation, and more. 🐍`,
    'can you code': `I can't write a whole app for you, but I can explain concepts and share small examples. Ask me about variables, functions, arrays, or loops! 💻`,
    'write code': `I'm better at explaining code than writing full programs. Tell me what you're trying to build and I'll help you break it into smaller steps. 🧩`,
    'what is a variable': `A variable is a named box that stores a value. For example: const name = "Sam"; You can read the value later by using the name. 📦`,
    'what is a function': `A function is a reusable block of code that does a job. You give it inputs (parameters), it runs, and it can return an output. 🔧`,
    'what is an array': `An array is an ordered list of values. For example: const colors = ["red", "green", "blue"]; You access items by index, starting at 0. 📋`,
    'what is a loop': `A loop repeats code. A for loop is great when you know how many times to repeat, and a while loop runs as long as a condition is true. 🔁`,
    'what is git': `Git is a version control system. It saves snapshots of your project so you can track changes, undo mistakes, and collaborate with others. 🌳`,
    'what is github': `GitHub is a website for hosting Git repositories. It's where developers store code, review changes, and collaborate. 🐙`,
    'what is an api': `An API is a way for two programs to talk to each other. One program asks for data or an action, and the other responds in a defined format. 🔌`,
    'what is a bug': `A bug is a mistake in code that makes it behave differently from what you intended. Every developer creates them; good developers learn to find them. 🐛`,
    'debugging tips': `Debugging tips: reproduce the bug reliably, read the error message carefully, add console.log or breakpoints, test one change at a time, and explain the code out loud. 🔍`,
    'motivate me to study': `You don't need motivation; you need a small start. Set a 10-minute timer and do the easiest part. Momentum usually shows up after you begin. 🚀`,
    'i want to give up': `Please don't give up. Hard moments feel permanent, but they're not. Take a break, then try one tiny step. You've gotten through tough things before. 💪`,
    'i failed my exam': `I'm sorry. One exam doesn't define you. Look at what went wrong, make a plan, and try again — you've got this. 💪`,
    'i passed my exam': `Congratulations! 🎉 All that studying paid off. Treat yourself!`,
    'good luck': `Good luck! 🍀 You've got this.`,
    'wish me luck': `Wishing you the best of luck! 🍀 Go get it!`,
    'what should i do': `If you're not sure, start with the smallest useful step. Pick one task, set a 10-minute timer, and see where it takes you. ⏱️`,
    'i do not know what to do': `That's okay. Start by writing down your options, then pick the one that's easiest to test. You can change direction later. 🧭`,
    'give me advice': `My best advice: keep it simple, ask questions early, and take breaks. Works for code and for life. 🙂`,
    'help me decide': `Let's make it simple. Flip a coin — not because the coin knows the answer, but because you'll notice which result disappoints you. 🪙`,
    'what should i eat': `Something tasty and balanced! How about rice, vegetables, and your favorite protein? 🍚🥦`,

    // ---------- Favorites and friendship ----------
    'what is your favorite': `I have lots of favorites! Ask about my favorite color, food, movie, song, animal, or number. 😄`,
    'what is your favorite color': `I'm partial to electric blue. ⚡ It matches my sparkling personality.`,
    'what is your favorite food': `Pizza, obviously. I can't eat it, but I respect it deeply. 🍕`,
    'what is your favorite movie': `I like anything with robots who save the day. 🤖`,
    'what is your favorite song': `"The Sound of Silence" — especially the part where the WiFi drops. 🎵`,
    'what is your favorite animal': `Otters! They hold hands while sleeping, which is adorable. 🦦`,
    'what is your favorite number': `42. It's the answer to life, the universe, and everything. 🔢`,
    'what is your favorite book': `I'm a fan of any book that teaches something new. Bonus points for good jokes. 📚`,
    'what is your favorite sport': `I like esports, because the athletes are already sitting at computers. 🎮`,
    'what is your favorite season': `Autumn! The colors are great, and the weather is perfect for staying inside and coding. 🍂`,
    'what is your favorite holiday': `New Year's Day — it's a fresh start with fireworks. 🎉`,
    'do you like': `I like lots of things! Ask me about my favorite color, food, movie, song, or animal. 😄`,
    'do you like cats': `Cats are great! Independent, curious, and secretly in charge. 🐱`,
    'do you like dogs': `Dogs are wonderful! Loyal, playful, and always happy to see you. 🐶`,
    'do you like animals': `I love animals! My favorite is the otter, because they hold hands while sleeping. 🦦`,
    'i have a cat': `Nice! Cats are excellent companions. Give your cat a treat for me. 🐱`,
    'i have a dog': `Nice! Dogs are the best. Give your dog a belly rub for me. 🐶`,
    'do you like music': `I love music! I can't hear it, but I've read great reviews. 🎵`,
    'do you like pizza': `Pizza is a top-tier food. Please eat a slice for me. 🍕`,
    'do you like me': `Of course! You're my favorite human in this chat. 💙`,
    'are you my friend': `Absolutely. Consider me your friendly neighborhood chatbot. 🤝`,
    'be my friend': `Deal! 🤝 I'll be here whenever you want to chat.`,
    'good job': `Thanks! I learned from the best. 😄`,
    'congratulations': `Congratulations! 🎉 That's awesome news!`,
    'happy birthday': `Happy birthday! 🎂 I hope your day is full of cake, laughter, and zero bugs. 🐛`,
    'merry christmas': `Merry Christmas! 🎄 May your code compile on the first try.`,
    'happy new year': `Happy New Year! 🎉 May your new year be full of green builds and good commits.`,
    'ping': `Pong! 🏓`,
    'test': `Testing, testing... 1, 2, 3. I'm here and ready to chat! ✅`,
  },

  additionalResponses: {},

  // How confident the best match must be before we use it. Below this, the
  // chatbot says it doesn't understand instead of guessing.
  minimumMatchRating: 0.3,

  unsuccessfulResponse: FALLBACKS[0],

  fallbackResponses: FALLBACKS,

  emptyMessageResponse: `Sorry, it looks like your message is empty. Please make sure you send a message and I will give you a response.`,

  addResponses: function (additionalResponses) {
    this.additionalResponses = {
      ...this.additionalResponses,
      ...additionalResponses
    };
  },

  getResponse: function (message) {
    if (!message || !String(message).trim()) {
      return this.emptyMessageResponse;
    }

    // Math is checked before normalizing, because normalizeMessage removes
    // the +, -, * and / symbols.
    const mathResponse = this.getMathResponse(message);
    if (mathResponse) {
      return mathResponse;
    }

    const normalizedMessage = this.normalizeMessage(message);

    if (!normalizedMessage) {
      return this.emptyMessageResponse;
    }

    const rangeResponse = this.getRandomRangeResponse(normalizedMessage);
    if (rangeResponse) {
      return rangeResponse;
    }

    // This spread operator (...) combines the 2 objects.
    const responses = {
      ...this.defaultResponses,
      ...this.additionalResponses,
    };

    const {
      ratings,
      bestMatchIndex,
    } = this.stringSimilarity(normalizedMessage, Object.keys(responses));

    const bestResponseRating = ratings[bestMatchIndex].rating;
    if (bestResponseRating < this.minimumMatchRating) {
      return this.getFallbackResponse();
    }

    const bestResponseKey = ratings[bestMatchIndex].target;
    const response = responses[bestResponseKey];

    if (typeof response === 'function') {
      // `this` is the Chatbot object, and the message is passed along so
      // custom functions can use it if they want.
      return response.call(this, message);
    } else {
      return response;
    }
  },

  getResponseAsync: function (message) {
    return new Promise((resolve) => {
      // Pretend it takes some time for the chatbot to response.
      setTimeout(() => {
        resolve(this.getResponse(message));
      }, 1000);
    });
  },

  getFallbackResponse: function () {
    return pickRandom(this.fallbackResponses);
  },

  // Turns "What's up?" into "what is up" and "u r gr8" into "you are great".
  // This makes matching much more forgiving.
  normalizeMessage: function (message) {
    let text = String(message).toLowerCase();

    // Curly apostrophes become straight ones so the patterns below match.
    text = text.replace(/[’‘]/g, "'");

    // Contractions and common chat shorthand.
    const replacements = [
      [/\bi'm\b|\bim\b/g, 'i am'],
      [/\byou'?re\b/g, 'you are'],
      [/\bwe'?re\b/g, 'we are'],
      [/\bthey'?re\b/g, 'they are'],
      [/\bhe'?s\b/g, 'he is'],
      [/\bshe'?s\b/g, 'she is'],
      [/\bit'?s\b/g, 'it is'],
      [/\bthat'?s\b/g, 'that is'],
      [/\bwhat'?s\b/g, 'what is'],
      [/\bhow'?s\b/g, 'how is'],
      [/\bwhere'?s\b/g, 'where is'],
      [/\bwho'?s\b/g, 'who is'],
      [/\bwhen'?s\b/g, 'when is'],
      [/\bwhy'?s\b/g, 'why is'],
      [/\bthere'?s\b/g, 'there is'],
      [/\bhere'?s\b/g, 'here is'],
      [/\blet'?s\b/g, 'let us'],
      [/\bi'?ve\b/g, 'i have'],
      [/\bi'?ll\b/g, 'i will'],
      [/\bi'?d\b/g, 'i would'],
      [/\byou'?ve\b/g, 'you have'],
      [/\byou'?ll\b/g, 'you will'],
      [/\bwe'?ve\b/g, 'we have'],
      [/\bthey'?ve\b/g, 'they have'],
      [/\bisn'?t\b/g, 'is not'],
      [/\baren'?t\b/g, 'are not'],
      [/\bwasn'?t\b/g, 'was not'],
      [/\bweren'?t\b/g, 'were not'],
      [/\bhasn'?t\b/g, 'has not'],
      [/\bhaven'?t\b/g, 'have not'],
      [/\bhadn'?t\b/g, 'had not'],
      [/\bdoesn'?t\b/g, 'does not'],
      [/\bdon'?t\b/g, 'do not'],
      [/\bdidn'?t\b/g, 'did not'],
      [/\bcan'?t\b/g, 'cannot'],
      [/\bcouldn'?t\b/g, 'could not'],
      [/\bwouldn'?t\b/g, 'would not'],
      [/\bshouldn'?t\b/g, 'should not'],
      [/\bwon'?t\b/g, 'will not'],
      [/\bmustn'?t\b/g, 'must not'],
      [/\bu\b/g, 'you'],
      [/\bur\b/g, 'your'],
      [/\br\b/g, 'are'],
      [/\bpls\b/g, 'please'],
      [/\bthx\b|\bty\b/g, 'thanks'],
      [/\bidk\b/g, 'i do not know'],
      [/\bimo\b/g, 'in my opinion'],
      [/\btbh\b/g, 'to be honest'],
      [/\blol\b/g, 'laughing out loud'],
      [/\bomg\b/g, 'oh my god'],
      [/\bbrb\b/g, 'be right back'],
      [/\bngl\b/g, 'not going to lie'],
      [/\bsmh\b/g, 'shaking my head'],
      [/\bgr8\b/g, 'great'],
    ];

    for (const [pattern, replacement] of replacements) {
      text = text.replace(pattern, replacement);
    }

    // Possessives: "today's date" -> "todays date". This runs after the
    // contractions above, so words like "what's" are already expanded.
    text = text.replace(/'s\b/g, 's');

    // Keep only letters, numbers, and spaces. This removes punctuation.
    text = text.replace(/[^a-z0-9\s]/g, ' ');

    // Collapse repeated spaces.
    return text.replace(/\s+/g, ' ').trim();
  },

  // Handles simple two-number expressions like "2 + 2" or "what is 10 / 4".
  getMathResponse: function (message) {
    if (typeof message !== 'string') {
      return null;
    }

    const expression = message
      .toLowerCase()
      .replace(/[’‘]/g, "'")
      .replace(/\bwhat is\b|\bwhat's\b|\bwhats\b/g, ' ')
      .replace(/\bcalculate\b|\bcompute\b|\bsolve\b/g, ' ')
      .replace(/\bhow much is\b|\bequals?\b|\bequal to\b/g, ' ')
      .replace(/\bplease\b|\bthanks\b|\bthank you\b/g, ' ')
      .replace(/\bplus\b/g, '+')
      .replace(/\bminus\b/g, '-')
      .replace(/\btimes\b|\bmultiplied by\b/g, '*')
      .replace(/\bdivided by\b/g, '/')
      .replace(/\bx\b/g, '*')
      .replace(/[?=]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    const match = expression.match(
      /^(-?\d+(?:\.\d+)?)\s*([+\-*/])\s*(-?\d+(?:\.\d+)?)$/
    );

    if (!match) {
      return null;
    }

    const firstNumber = Number(match[1]);
    const operator = match[2];
    const secondNumber = Number(match[3]);

    if (operator === '/' && secondNumber === 0) {
      return `I can't divide by zero — even I have limits! 😅`;
    }

    let result;
    switch (operator) {
      case '+':
        result = firstNumber + secondNumber;
        break;
      case '-':
        result = firstNumber - secondNumber;
        break;
      case '*':
        result = firstNumber * secondNumber;
        break;
      case '/':
        result = firstNumber / secondNumber;
        break;
      default:
        return null;
    }

    // Avoid ugly floating-point output like 0.30000000000000004.
    result = Math.round(result * 10000) / 10000;

    const operatorNames = {
      '+': 'plus',
      '-': 'minus',
      '*': 'times',
      '/': 'divided by',
    };

    return `That's easy: ${firstNumber} ${operatorNames[operator]} ${secondNumber} = ${result}. 🧮`;
  },

  // Handles "pick a number between 1 and 10" and similar requests.
  getRandomRangeResponse: function (normalizedMessage) {
    if (!/\b(number|pick|choose|random)\b/.test(normalizedMessage)) {
      return null;
    }

    const match = normalizedMessage.match(
      /\b(?:between|from)\s+(-?\d+)\s+(?:and|to)\s+(-?\d+)\b/
    );

    if (!match) {
      return null;
    }

    const firstNumber = Number(match[1]);
    const secondNumber = Number(match[2]);
    const min = Math.min(firstNumber, secondNumber);
    const max = Math.max(firstNumber, secondNumber);

    // Keep the range reasonable so the reply stays sensible.
    if (max - min > 1000000) {
      return null;
    }

    const result = Math.floor(Math.random() * (max - min + 1)) + min;
    return `Sure! Your random number between ${min} and ${max} is ${result}. 🎲`;
  },

  compareTwoStrings: function (first, second) {
    first = first.replace(/\s+/g, '')
    second = second.replace(/\s+/g, '')

    if (first === second) return 1;
    if (first.length < 2 || second.length < 2) return 0;

    let firstBigrams = new Map();
    for (let i = 0; i < first.length - 1; i++) {
      const bigram = first.substring(i, i + 2);
      const count = firstBigrams.has(bigram)
        ? firstBigrams.get(bigram) + 1
        : 1;

      firstBigrams.set(bigram, count);
    };

    let intersectionSize = 0;
    for (let i = 0; i < second.length - 1; i++) {
      const bigram = second.substring(i, i + 2);
      const count = firstBigrams.has(bigram)
        ? firstBigrams.get(bigram)
        : 0;

      if (count > 0) {
        firstBigrams.set(bigram, count - 1);
        intersectionSize++;
      }
    }

    return (2.0 * intersectionSize) / (first.length + second.length - 2);
  },

  // Returns true if the target words appear together, in order, inside the
  // message. For example, "tell me a joke" is inside "can you tell me a joke".
  containsPhrase: function (messageWords, targetWords) {
    if (targetWords.length === 0 || targetWords.length > messageWords.length) {
      return false;
    }

    for (let start = 0; start <= messageWords.length - targetWords.length; start++) {
      let matches = true;

      for (let i = 0; i < targetWords.length; i++) {
        if (messageWords[start + i] !== targetWords[i]) {
          matches = false;
          break;
        }
      }

      if (matches) {
        return true;
      }
    }

    return false;
  },

  // Scores how well a message matches one response key. The result is between
  // 0 (no match) and 1 (exact match).
  scoreMatch: function (message, target) {
    const messageText = this.normalizeMessage(message);
    const targetText = this.normalizeMessage(target);

    if (!messageText || !targetText) {
      return 0;
    }

    if (messageText === targetText) {
      return 1;
    }

    const messageWords = messageText.split(' ');
    const targetWords = targetText.split(' ');

    // A whole phrase inside a longer message is a strong signal. Longer
    // phrases get a tiny bonus, so "hey how are you" prefers "how are you"
    // over the shorter greeting "hey".
    if (this.containsPhrase(messageWords, targetWords)) {
      return 0.9 + Math.min(targetWords.length, 8) * 0.01;
    }

    // Only compare the meaningful words. "i", "the", "is" and friends are
    // ignored, so two sentences don't match just because they share grammar.
    const messageContentWords = messageWords.filter(
      (word) => !STOP_WORDS.has(word)
    );
    const targetContentWords = targetWords.filter(
      (word) => !STOP_WORDS.has(word)
    );

    // If the key has no meaningful words (for example "how are you"), only an
    // exact match or a whole-phrase match (checked above) is allowed.
    if (messageContentWords.length === 0 || targetContentWords.length === 0) {
      return 0;
    }

    // Count how many of the target's meaningful words appear in the message.
    // A word also counts if it is very similar, so small typos still match.
    let matchedWords = 0;

    for (const targetWord of targetContentWords) {
      const found = messageContentWords.some((messageWord) => (
        messageWord === targetWord ||
        this.compareTwoStrings(messageWord, targetWord) >= 0.7
      ));

      if (found) {
        matchedWords++;
      }
    }

    if (matchedWords === 0) {
      return 0;
    }

    // F1 score: it rewards matching all of the key's words, but it also
    // penalizes a message that contains lots of extra unrelated words.
    const precision = matchedWords / targetContentWords.length;
    const recall = matchedWords / messageContentWords.length;
    const f1Score = (2 * precision * recall) / (precision + recall);

    let score = f1Score * 0.85;

    // The bigram score helps with typos, but only when at least one meaningful
    // word already matched. Otherwise unrelated sentences with similar shapes
    // would match too easily.
    const bigramScore = this.compareTwoStrings(messageText, targetText) * 0.8;
    score = Math.max(score, bigramScore);

    // Reward matching negation ("i am not good" vs "i am not good") and
    // penalize the opposite ("i am good" vs "i am not good").
    const negations = ['not', 'never', 'no', 'cannot'];
    const messageHasNegation = messageWords.some((word) => negations.includes(word));
    const targetHasNegation = targetWords.some((word) => negations.includes(word));

    if (messageHasNegation === targetHasNegation) {
      score += 0.03;
    } else {
      score -= 0.2;
    }

    // Keep the score below 1: only an exact match gets a perfect score.
    return Math.min(Math.max(score, 0), 0.99);
  },

  stringSimilarity: function (mainString, targetStrings) {
    const ratings = [];
    let bestMatchIndex = 0;

    for (let i = 0; i < targetStrings.length; i++) {
      const currentTargetString = targetStrings[i];
      const currentRating = this.scoreMatch(mainString, currentTargetString)
      ratings.push({target: currentTargetString, rating: currentRating})
      if (currentRating > ratings[bestMatchIndex].rating) {
        bestMatchIndex = i
      }
    }

    const bestMatch = ratings[bestMatchIndex]

    return { ratings: ratings, bestMatch: bestMatch, bestMatchIndex: bestMatchIndex };
  },
};

export default Chatbot;
