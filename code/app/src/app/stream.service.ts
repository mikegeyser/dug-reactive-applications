import { Injectable, OnInit } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import 'rxjs/add/operator/debounceTime';

import { Http } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/mergeMap';

declare let io: any;

@Injectable()
export class StreamService {
  ping = new BehaviorSubject<boolean>(false);
  tweets = new BehaviorSubject([]);

  constructor(http: Http) {
    let socket = io('http://localhost:3000/');

    socket.on('ping', () => this.ping.next(true));

    this.ping
      .debounceTime(1000)
      .subscribe(x => this.ping.next(false));

    let get = http.get('http://localhost:3000/tweets').map(response => response.json());
    let emit = Observable.create(observer => {
      socket.on('tweet', (tweet) => {
        observer.next(tweet);
      });
    });

    emit.subscribe(tweet => {
      let tweets = this.tweets.value;
      tweets.unshift(tweet);
    
      if (tweets.length > 100)
        tweets.splice(100);
    
      this.tweets.next(tweets);
    });
  }
}