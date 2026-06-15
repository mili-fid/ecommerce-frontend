import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL, Driver, ManagedUser } from './models';

@Injectable({ providedIn: 'root' })
export class UsersService {
  private apiUrl = `${API_URL}/users`;

  constructor(private http: HttpClient) {}

  // Admin: create any user directly (spec 2.1)
  createByAdmin(data: any): Observable<any> {
    return this.http.post(this.apiUrl, data);
  }

  // Own profile (any role; drivers can set fee + zone)
  me(): Observable<any> {
    return this.http.get(`${this.apiUrl}/me`);
  }
  updateMe(data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/me`, data);
  }

  // Admin
  list(role?: string, isActive?: string): Observable<ManagedUser[]> {
    let params = new HttpParams();
    if (role) params = params.set('role', role);
    if (isActive) params = params.set('isActive', isActive);
    return this.http.get<ManagedUser[]>(this.apiUrl, { params });
  }
  stats(): Observable<any> {
    return this.http.get(`${this.apiUrl}/stats`);
  }
  activate(id: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}/activate`, {});
  }
  deactivate(id: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}/deactivate`, {});
  }
  setRole(id: string, role: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}/role`, { role });
  }
  setColor(id: string, colorCode: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}/color`, { colorCode });
  }
  remove(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  // Checkout: available drivers (spec 3.4.1).
  // Pass the client's coordinates to get distance-sorted results with ETA.
  availableDrivers(lat?: number, lng?: number): Observable<Driver[]> {
    let params = new HttpParams();
    if (lat != null && lng != null) {
      params = params.set('lat', lat).set('lng', lng);
    }
    return this.http.get<Driver[]>(`${this.apiUrl}/drivers/available`, { params });
  }

  // Driver: update own GPS position
  setLocation(lat: number, lng: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/me/location`, { lat, lng });
  }

  // Driver
  setAvailability(availability: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/me/availability`, { availability });
  }

  // Company sub-accounts
  createSubAccount(data: any): Observable<any> {
    return this.http.post(`${API_URL}/auth/sub-accounts`, data);
  }
  listSubAccounts(): Observable<ManagedUser[]> {
    return this.http.get<ManagedUser[]>(`${API_URL}/auth/sub-accounts`);
  }
}
