# Building Reactive Applications with Angular, RxJS and Socket.IO
<img align="left" src="http://www.wethinkcode.co.za/assets/wethinkcode-logo-blue-76a0a747b9dc27dafc3a62735f23f14d1d13c4ebe578a7bc97819b888bce892c.png">

A talk for the We Think Code_ students on 13 June 2017

We have been building client-server web applications using the same paradigms since bellbottoms, disco and IBM were popular. Everything since then has been a rehash of RPC and Request-Response, with JSON + REST being just the latest incarnation. We can do better. We now have the tools available to challenge those paradigms and build a new breed of application. Using reactive programming techniques and data streaming we can easily build rich, reactive web applications. 
This code-oriented talk will show how to use Socket.IO to stream data to an Angular application. It will cover websocket basics, RxJS and working observables, as well as how it all seamlessly fits into Angular’s data-binding. 

[@mikegeyser](https://twitter.com/mikegeyser)

# Set up the server

### server/index.js
> # wtc_express
``` javascript
var app = require('express')();
var server = require('http').createServer(app);
var io = require('socket.io')(server);

server.listen(3000);
```

> # wtc_ping
```js
setInterval(() => io.emit('ping'), 3000);
```

# Create a ping component

```bash
> ng generate component ping
```

### app/src/app/app.component.html
```html
<app-ping></app-ping>
```

### app/src/app/ping/ping.component.ts
```ts 
declare let io: any; 
```
```ts 
shouldPing = false;
```
> # wtc_ping1
```ts
let socket = io('http://localhost:3000/');
socket.on('ping', (ping) => {
  this.shouldPing = true;
  setTimeout(() => this.shouldPing = false, 1000);
});
```

### app/src/app/ping/ping.component.html
> # wtc_ping
```html
<div class="dot" [class.ping]="shouldPing"></div>
```

# Change the ping component

### app/src/app/ping/ping.component.ts
> # wtc_ping_imports
```ts
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import 'rxjs/add/operator/debounceTime';
```

> # wtc_ping_subject
```ts
shouldPing = new BehaviorSubject(false);
```

> # wtc_ping_2
```ts
socket.on('ping', () => this.shouldPing.next(true));

this.shouldPing
  .debounceTime(1000)
  .subscribe(x => this.shouldPing.next(false));
```

### app/src/app/ping/ping.component.html
```html
"shouldPing | async"
```

# Create the stream service
```bash
> ng generate service stream
```

### app/src/app/app.module.ts
```ts
import { StreamService } from './stream.service';
```
```ts
providers: [StreamService],
```

### app/src/app/stream.service.ts
> # wtc_service_1
```ts
import { Injectable, OnInit } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import 'rxjs/add/operator/debounceTime';

declare let io: any;

@Injectable()
export class StreamService {
  ping = new BehaviorSubject<boolean>(false);

  constructor() {
    let socket = io('http://localhost:3000/');

    socket.on('ping', () => this.ping.next(true));

    this.ping
      .debounceTime(1000)
      .subscribe(x => this.ping.next(false));
  }
}
```

### app/src/app/ping/ping.component.ts
> # wtc_ping_3
```ts
import { Component, OnInit } from '@angular/core';
import { StreamService } from '../stream.service';

@Component({
  selector: 'app-pulse',
  templateUrl: './pulse.component.html'
})
export class PingComponent {
  constructor(public stream: StreamService) { }
}
```
### app/src/app/ping/ping.component.html
```html
"stream.ping | async"
```

# Add twitter streaming to the server
### server/index.js
> # wtc_twitter_config
```js
let Twit = require('twit');
let T = new Twit({
  'consumer_key': '{{redacted}}',
  'consumer_secret': '{{redacted}}',
  'access_token': '{{redacted}}',
  'access_token_secret': '{{redacted}}',
  'timeout_ms': 60000
});
```

> # wtc_twitter_stream
```js
let stream = T.stream('statuses/filter', {
  track: [
    '@wethinkcode',
    '@mikegeyser'
  ].join(','),
  language: 'en'
});
```

> # wtc_tweet_emit
```js
stream.on('tweet', (status) => {
  console.log(status);
  io.emit('tweet', status);
});
```

> # wtc_tweet_store
```js
let tweets = [];
stream.on('tweet', (status) => {
  console.log(status);
    tweets.unshift(status);
    
    if (tweets.length > 100)
      tweets.splice(100);
  io.emit('tweet', status);
});
```

> # wtc_get_all
```js
var cors = require('cors');
app.use(cors())
app.get('/tweets', (request, response) => response.send(tweets));
```

# Add twitter streaming to the app service
### app/src/app/stream.service.ts
> # wtc_service_tweet_import
```ts
import { Http } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/mergeMap';
```

```ts
tweets = new BehaviorSubject([]);
```

```ts
constructor(http: Http) {
```

># wtc_service_tweet_1
```ts
let get = http.get('http://localhost:3000/tweets').map(response => response.json());
```

> # wtc_service_tweet_2
```ts
let emit = Observable.create(observer => {
  socket.on('tweet', (tweet) => {
    observer.next(tweet);
  });
});
```

> # wtc_service_tweet_3
```ts
get.subscribe(tweets => this.tweets.next(tweets));
```

> # wtc_service_tweet_4
```ts
emit.subscribe(tweet => {
  let tweets = this.tweets.value;
  tweets.unshift(tweet);

  if (tweets.length > 100)
    tweets.splice(100);

  this.tweets.next(tweets);
});
```

# Add the service to the app component
### app/src/app/app.component.ts
```ts
import { StreamService } from './stream.service';
```

> # wtc_app_1
```ts
constructor(public stream: StreamService) { }
```

# Add some initial markup to the app component
### app/src/app/app.component.html
> # wtc_app_1
```ts
<div *ngFor="let tweet of stream.tweets | async">
  {{tweet.text}}
</div>
```

# Create a tweet component
```bash
> ng generate component tweet
```

### app/src/app/tweet/tweet.component.ts
```ts
import { Component, Input, OnInit } from '@angular/core';
```

```ts
@Input() tweet: any;
```

### app/src/app/tweet/tweet.component.html
> # wtc_tweet
```html
<div class="EmbeddedTweet">
  <div class="EmbeddedTweet-tweet">
    <blockquote class="Tweet">
      <div class="Tweet-header">
        <div class="TweetAuthor">
          <span class="TweetAuthor-link Identity" href="">
            <span class="TweetAuthor-avatar Identity-avatar">
              <img class="Avatar" alt="" src="{{ tweet.user.profile_image_url }}">
            </span>
          <span class="TweetAuthor-name Identity-name">{{ tweet.user.name }}</span>
          <span class="TweetAuthor-screenName Identity-screenName">@{{tweet.user.screen_name }}
          </span>
          </span>
        </div>
      </div>
      <div class="Tweet-body">
        <p class="Tweet-text">{{ tweet.text }}</p>
        <div class="Tweet-metadata dateline">
          <span class="long-permalink" href="">
            <time>{{ tweet.created_at | date: 'short'}}</time>
          </span>
        </div>
      </div>
    </blockquote>
  </div>
</div>
```

### app/src/app/app.component.html
> # wtc_app_2
```html
<app-tweet *ngFor="let tweet of stream.tweets | async" [tweet]="tweet">
</app-tweet>
```

# Add some flair (and show observable subscriptions)
### app/src/app/app.component.ts
> # wtc_app_declare_masonry
```ts
declare let Masonry: any;
```
> # wtc_app_new_masonry
```ts
var masonry = new Masonry('app-root', {
  itemSelector: '.EmbeddedTweet'
});
```

> # wtc_app_masonry_subscribe
```ts
this.stream.tweets.debounceTime(1).subscribe(x => {
  masonry.reloadItems();
  masonry.layout();
});
```

# done!

