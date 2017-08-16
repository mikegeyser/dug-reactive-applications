import { Component, OnInit } from '@angular/core';
import { StreamService } from '../stream.service';

@Component({
  selector: 'app-ping',
  templateUrl: './ping.component.html',
  styles: []
})
export class PingComponent implements OnInit {

  constructor(public stream: StreamService) { }

  ngOnInit() { }
}