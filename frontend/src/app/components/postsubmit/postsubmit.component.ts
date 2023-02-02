import { Component, Input, OnInit } from '@angular/core';
import { Invitation } from 'src/app/invitation';

@Component({
  selector: 'app-postsubmit',
  templateUrl: './postsubmit.component.html',
  styleUrls: ['./postsubmit.component.scss'],
})
export class PostsubmitComponent implements OnInit {
  @Input() invitation!: Invitation;
  constructor() {}

  ngOnInit(): void {}
}
