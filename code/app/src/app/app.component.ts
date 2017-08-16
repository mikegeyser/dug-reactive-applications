import { Component } from '@angular/core';
import { StreamService } from './stream.service';

declare let Masonry: any;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent {
  constructor(public stream: StreamService) {
    var masonry = new Masonry('app-root', {
      itemSelector: '.EmbeddedTweet'
    });

    this.stream.tweets.debounceTime(1).subscribe(x => {
      masonry.reloadItems();
      masonry.layout();
    });
  }
}
