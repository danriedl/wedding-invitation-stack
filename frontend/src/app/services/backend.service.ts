import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, of } from 'rxjs';
import { UrlPreview } from '../components/preview/urlpreview';
import { Invitation } from '../invitation';

export interface ApiError {
  error: string;
}

@Injectable({
  providedIn: 'root',
})
export class BackendService {
  private backendUrl = 'api';
  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
  };

  constructor(private http: HttpClient) {}

  getInvitation(token: string): Observable<Invitation> {
    const apiurl = `${this.backendUrl}/invitation/${token}`;
    return this.http.get<Invitation>(apiurl).pipe(catchError(this.handleError<Invitation>()));
  }

  sendInvitation(invitation: Invitation): Observable<Invitation> {
    const apiurl = `${this.backendUrl}/invitation/${invitation.uuid}`;
    return this.http
      .post<Invitation>(apiurl, invitation, this.httpOptions)
      .pipe(catchError(this.handleError<Invitation>()));
  }

  getPreview(url: string): Observable<UrlPreview> {
    const apiurl = `${this.backendUrl}/song/preview`;

    let queryParams = new HttpParams();
    queryParams = queryParams.append('url', url);

    return this.http.get<UrlPreview>(apiurl, { params: queryParams }).pipe(catchError(this.handleError<UrlPreview>()));
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      return of(result as T);
    };
  }
}
