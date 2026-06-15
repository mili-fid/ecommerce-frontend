import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL, AuditEntry } from './models';

@Injectable({ providedIn: 'root' })
export class AuditService {
  constructor(private http: HttpClient) {}

  list(): Observable<AuditEntry[]> {
    return this.http.get<AuditEntry[]>(`${API_URL}/audit`);
  }
}
