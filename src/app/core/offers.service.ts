import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL, Offer } from './models';

@Injectable({ providedIn: 'root' })
export class OffersService {
  private apiUrl = `${API_URL}/offers`;

  constructor(private http: HttpClient) {}

  create(data: Partial<Offer> & { company: string }): Observable<Offer> {
    return this.http.post<Offer>(this.apiUrl, data);
  }
  all(): Observable<Offer[]> {
    return this.http.get<Offer[]>(this.apiUrl);
  }
  mine(): Observable<Offer[]> {
    return this.http.get<Offer[]>(`${this.apiUrl}/mine`);
  }
  toggle(id: string): Observable<Offer> {
    return this.http.put<Offer>(`${this.apiUrl}/${id}/toggle`, {});
  }
}
