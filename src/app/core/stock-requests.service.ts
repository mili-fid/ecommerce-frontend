import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL, StockRequest } from './models';

@Injectable({ providedIn: 'root' })
export class StockRequestsService {
  private apiUrl = `${API_URL}/stock-requests`;

  constructor(private http: HttpClient) {}

  create(data: { product: string; quantity: number; justification: string }): Observable<StockRequest> {
    return this.http.post<StockRequest>(this.apiUrl, data);
  }
  mine(): Observable<StockRequest[]> {
    return this.http.get<StockRequest[]>(`${this.apiUrl}/mine`);
  }
  all(status?: string): Observable<StockRequest[]> {
    let params = new HttpParams();
    if (status) params = params.set('status', status);
    return this.http.get<StockRequest[]>(this.apiUrl, { params });
  }
  approve(id: string): Observable<StockRequest> {
    return this.http.put<StockRequest>(`${this.apiUrl}/${id}/approve`, {});
  }
  reject(id: string): Observable<StockRequest> {
    return this.http.put<StockRequest>(`${this.apiUrl}/${id}/reject`, {});
  }
}
