import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class NpnUsageService {
  private apiUrl = 'http://localhost:3000/pop-usage';  // Your Fastify API endpoint

  constructor(private http: HttpClient) {}

  // Method to post new npn_usage data
  addNpnUsage(data: NpnUsage): Observable<NpnUsage> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });

    return this.http.post<NpnUsage>(this.apiUrl, data, { headers });
  }
}

// Interface for npn_usage data model
export interface NpnUsage {
  date_time: string;
  tool_id: number;
  metric_id: number;
}
