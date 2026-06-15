import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL, Order } from './models';

@Injectable({ providedIn: 'root' })
export class OrdersService {
  private apiUrl = `${API_URL}/orders`;

  constructor(private http: HttpClient) {}

  // Client
  create(data: {
    items: { product: string; quantity: number }[];
    deliveryAddress: string;
    driver: string;
    paymentMethod: string;
  }): Observable<Order> {
    return this.http.post<Order>(this.apiUrl, data);
  }
  mine(): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.apiUrl}/mine`);
  }
  cancel(id: string): Observable<Order> {
    return this.http.put<Order>(`${this.apiUrl}/${id}/cancel`, {});
  }

  // PDF invoice as a Blob — the auth interceptor adds the Bearer token,
  // which a normal <a href> download could not do.
  downloadInvoice(id: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${id}/invoice`, { responseType: 'blob' });
  }

  // Driver
  available(): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.apiUrl}/available`);
  }
  active(): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.apiUrl}/active`);
  }
  history(): Observable<{ deliveries: Order[]; totalRevenue: number; count: number }> {
    return this.http.get<any>(`${this.apiUrl}/history`);
  }
  setStatus(id: string, action: 'accept' | 'refuse' | 'preparing' | 'in-transit' | 'delivered'): Observable<Order> {
    return this.http.put<Order>(`${this.apiUrl}/${id}/${action}`, {});
  }

  // Admin
  allAdmin(status?: string): Observable<Order[]> {
    let params = new HttpParams();
    if (status) params = params.set('status', status);
    return this.http.get<Order[]>(this.apiUrl, { params });
  }
  stats(): Observable<{ ordersToday: number; deliveredCount: number; totalRevenue: number }> {
    return this.http.get<any>(`${this.apiUrl}/stats`);
  }
  cancelAdmin(id: string): Observable<Order> {
    return this.http.put<Order>(`${this.apiUrl}/${id}/cancel-admin`, {});
  }
}
