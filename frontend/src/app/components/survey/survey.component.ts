import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Invitation } from 'src/app/invitation';
import { BackendService } from 'src/app/services/backend.service';

@Component({
  selector: 'app-survey',
  templateUrl: './survey.component.html',
  styleUrls: ['./survey.component.scss'],
})
export class SurveyComponent implements OnInit {
  @Input() invitation!: Invitation;
  @Output() invitationChange = new EventEmitter<Invitation>();

  constructor(private translate: TranslateService, private backend: BackendService) {}

  ngOnInit(): void {}

  displayedColumns: string[] = ['name', 'delete'];

  rideOptions = [
    { id: 1, description: this.translate.instant('SURVEY.RIDESHARE.OPTION.ROUNDTRIP') },
    { id: 2, description: this.translate.instant('SURVEY.RIDESHARE.OPTION.TOWARDS') },
    { id: 3, description: this.translate.instant('SURVEY.RIDESHARE.OPTION.BACKWARDS') },
    { id: 4, description: this.translate.instant('SURVEY.RIDESHARE.OPTION.NO') },
  ];

  acceptOptions = [
    { value: true, description: this.translate.instant('SURVEY.ACCEPT.OPTION.YES') },
    { value: false, description: this.translate.instant('SURVEY.ACCEPT.OPTION.NO') },
  ];

  delete(participant: string): void {
    if (this.invitation.further_guests) {
      this.invitation.further_guests = this.invitation.further_guests.filter((h) => h !== participant);
    }
    this.invitation.further_guests = [...this.invitation.further_guests];
  }

  add(name: string): void {
    name = name.trim();
    if (!name) {
      return;
    }
    if (this.invitation.further_guests) {
      this.invitation.further_guests.push(name);
    }
    this.invitation.further_guests = [...this.invitation.further_guests];
  }
}
