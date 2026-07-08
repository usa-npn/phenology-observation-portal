import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { Config } from './config.service';

@Injectable()
export class TinybirdService {
  private token: string = null;
  private expiresAt: number = null; // epoch ms parsed from expires_at

  constructor(private http: HttpClient, private config: Config) {
  }

  // Generic: any pipe URL + params → count observable, so future
  // data types can reuse this with their own pipe.
  getCount(pipeUrl: string, params: HttpParams): Observable<number> {
    return this.ensureToken().pipe(
      switchMap(() => {
        const headers = new HttpHeaders({ Authorization: 'Bearer ' + this.token });
        return this.http.get<any>(pipeUrl, { headers, params });
      }),
      map((response: any) => Number(response.data[0].total_records))
    );
  }

  private ensureToken(): Observable<any> {
    if (this.token === null || Date.now() > this.expiresAt - 60000) {
      return this.http.get<any>(this.config.getTokenUrl()).pipe(
        map((response: any) => {
          this.token = response.token;
          this.expiresAt = new Date(response.expires_at).getTime();
          return response;
        })
      );
    }
    return of(null);
  }
}
