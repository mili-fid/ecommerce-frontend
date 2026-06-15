import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL, Ticket } from './models';

@Injectable({ providedIn: 'root' })
export class TicketsService {
  private apiUrl = `${API_URL}/tickets`;

  constructor(private http: HttpClient) {}

  create(subject: string, message: string): Observable<Ticket> {
    return this.http.post<Ticket>(this.apiUrl, { subject, message });
  }
  mine(): Observable<Ticket[]> {
    return this.http.get<Ticket[]>(`${this.apiUrl}/mine`);
  }
  all(status?: string): Observable<Ticket[]> {
    let params = new HttpParams();
    if (status) params = params.set('status', status);
    return this.http.get<Ticket[]>(this.apiUrl, { params });
  }
  reply(id: string, reply: string): Observable<Ticket> {
    return this.http.put<Ticket>(`${this.apiUrl}/${id}/reply`, { reply });
  }
}
