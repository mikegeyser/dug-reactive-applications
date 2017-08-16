var app = require('express')();
var server = require('http').createServer(app);
var io = require('socket.io')(server);

server.listen(3000);

setInterval(() => io.emit('ping'), 3000);

let Twit = require('twit');
let T = new Twit({
  'consumer_key': 'xitnRpFbe4ryxjIoxfNioNDjO',
  'consumer_secret': '5RuicreNaXz36eu7HLvMOzZ2MBd8ObniRvTL8S6prcOChIMykR',
  'access_token': '29650035-9iVplpLxsCMR2pxUy5kBLaYqfmLAwR6rkA7qXG2cg',
  'access_token_secret': 'HLUuX5lr8V9OnfMnyHNtOuZthbIjpHMia3DNqvhQUXCRf',
  'timeout_ms': 60000
});

let stream = T.stream('statuses/filter', {
  track: [
    '@DeveloperUG',
    '@BBDSoftware',
    '@mikegeyser',
    '#javascript'
  ].join(','),
  language: 'en'
});

stream.on('tweet', (status) => {
  console.log(status);
  io.emit('tweet', status);
});

let tweets = [];
stream.on('tweet', (status) => {
  console.log(status);
  tweets.unshift(status);

  if (tweets.length > 100)
    tweets.splice(100);
  io.emit('tweet', status);
});

var cors = require('cors');
app.use(cors())
app.get('/tweets', (request, response) => response.send(tweets));