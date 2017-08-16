import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-tweet',
  templateUrl: './tweet.component.html',
  styles: []
})
export class TweetComponent implements OnInit {
  @Input() tweet: any;
  
  constructor() { }

  ngOnInit() {
  }

}
