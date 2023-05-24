import { Component } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';
import { v4 as uuid } from 'uuid';
import { Invitation } from './invitation';
import { BackendService } from './services/backend.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  constructor(private translate: TranslateService, private backend: BackendService, private _snackBar: MatSnackBar) {
    translate.use(navigator.language);
  }

  title = 'Einladung';
  hosts = 'Janine & Felix';

  invitation: Invitation = { further_guests: [] };
  submitted: boolean = false;
  openSnackBar(message: string, action: string) {
    this._snackBar.open(message, action, { duration: 5000 });
  }

  /**
   * Gets the invitation UUID from localstorage if there is one.
   * If it doesn't exist yet, one will be created.
   * Fetches already existing stored invitation from API
   */
  ngOnInit(): void {
    let storageToken = localStorage.getItem('token');
    let token: string;
    if (storageToken) {
      token = storageToken;
      this.backend.getInvitation(token).subscribe((invitation: Invitation) => {
        if (invitation) {
          this.invitation = invitation;
        }
      });
    } else {
      token = uuid();
      localStorage.setItem('token', token);
    }
    this.invitation.uuid = token;
  }
  checkInvitation(): boolean {
    if (this.invitation.further_guest) {
      if (this.invitation.further_guest.length) {
        this.openSnackBar(this.translate.instant('SNACKBAR.MISSING.ADD'), '');
        return false;
      }
    }
    if (!this.invitation.name) {
      this.openSnackBar(this.translate.instant('SNACKBAR.MISSING.NAME'), '');
      return false;
    }
    if (this.invitation.accepted == null) {
      this.openSnackBar(this.translate.instant('SNACKBAR.MISSING.ACCEPT'), '');
      return false;
    }

    if (!this.invitation.uuid) {
      this.openSnackBar(this.translate.instant('SNACKBAR.MISSING.UUID'), '');
      return false;
    }

    if (this.invitation.accepted && !this.invitation.rideshare) {
      this.openSnackBar(this.translate.instant('SNACKBAR.MISSING.RIDESHARE'), '');
      return false;
    }

    return true;
  }
  submit(): void {
    if (!this.checkInvitation()) {
      return;
    }

    this.backend.sendInvitation(this.invitation).subscribe((invitation: Invitation) => {
      if (invitation) {
        //this.clear();
        this.openSnackBar(this.translate.instant('SNACKBAR.INVITATION.SENT'), '');
        this.submitted = true;
      } else {
        this.openSnackBar(this.translate.instant('SNACKBAR.INVITATION.FAILED'), '');
      }
    });
  }

  clear(): void {
    this.invitation = { further_guests: [], uuid: this.invitation.uuid };
  }
}
