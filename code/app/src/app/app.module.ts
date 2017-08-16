import { BrowserModule } from '@angular/platform-browser';
import { HttpModule } from '@angular/http';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { PingComponent } from './ping/ping.component';

import { StreamService } from './stream.service';
import { TweetComponent } from './tweet/tweet.component';

@NgModule({
  declarations: [
    AppComponent,
    PingComponent,
    TweetComponent
  ],
  imports: [
    BrowserModule,
    HttpModule
  ],
  providers: [StreamService],
  bootstrap: [AppComponent]
})
export class AppModule { }
