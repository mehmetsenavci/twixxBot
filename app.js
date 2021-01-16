require('dotenv').config({ path: './config.env' });
const tmi = require('tmi.js');

const options = {
  identity: {
    username: process.env.BOT_USERNAME,
    password: process.env.BOT_OAUTH_TOKEN,
  },
  channels: ['twixx_bot', 'littlecabana'],
};

const client = new tmi.client(options);
console.log(process.env.BOT_USERNAME);

// Register our event handlers (defined below)
let votedUsers = [];
let vote = { t: 0, ct: 0 };
let selecting = false;

client.on('message', onMessageHandler);
client.on('connected', onConnectedHandler);

// Connect to Twitch:
client.connect();

// Called every time a message comes in
function onMessageHandler(target, context, msg, self) {
  /*
  if (self) {
    return;
  } // Ignore messages from the bot
*/
  const message = msg.trim().toLowerCase();

  if ((context.mod || context.badges.broadcaster) && msg === '!pickside') {
    selecting = true;
    console.log(selecting);
  }

  if (selecting) {
    if (msg === '!t' && !votedUsers.includes(context.username)) {
      votedUsers.push(context.username);
      vote.t++;
    } else if (msg === '!ct' && !votedUsers.includes(context.username)) {
      votedUsers.push(context.username);
      vote.ct++;
    }
  }

  if (
    (context.mod || context.badges.broadcaster) &&
    selecting &&
    msg === '!endpickside'
  ) {
    selecting = false;
    client.say(target, `Results: T:${vote.t} CT:${vote.ct}`);
    if (vote.t > vote.ct) {
      client.say(target, 'Lets play on T side!');
    } else if (vote.t === vote.ct) {
      client.say(target, 'Votes are equal streamer selects!');
    } else {
      client.say(target, 'Lets play on CT side!');
    }
    vote.t = 0;
    vote.ct = 0;
    votedUsers = [];
  }

  if (message === '!test') {
    console.log(context);
  }
}

// Called every time the bot connects to Twitch chat
function onConnectedHandler(addr, port) {
  console.log(`* Connected to ${addr}:${port}`);
}
