import { Component, Input, OnInit } from '@angular/core';

import { UrlPreview } from 'src/app/components/preview/urlpreview';
import { Invitation } from 'src/app/invitation';
import { BackendService } from 'src/app/services/backend.service';

@Component({
  selector: 'app-preview',
  templateUrl: './preview.component.html',
  styleUrls: ['./preview.component.scss'],
})
export class PreviewComponent implements OnInit {
  @Input() invitation!: Invitation;
  constructor(private backend: BackendService) {}

  songPreview!: UrlPreview;

  ngOnInit(): void {
    var validUrl = require('valid-url');
    let url = this.invitation.favourite_song?.trim();
    if (!url) {
      return;
    }
    if (validUrl.isUri(url)) {
      this.backend.getPreview(url).subscribe((preview) => {
        if (preview) {
          this.songPreview = preview;
        }
      });
    }
  }
}
