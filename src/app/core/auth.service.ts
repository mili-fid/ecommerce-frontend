import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { API_URL, UserInfo, UserRole } from './models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = `${API_URL}/auth`;

  constructor(private http: HttpClient, private router: Router) {}

  register(data: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    role: UserRole;
  }): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, data);
  }

  login(email: string, password: string): Observable<any> {
    return this.http
      .post<{ access_token: string; refresh_token: string; user: UserInfo }>(
        `${this.apiUrl}/login`,
        { email, password },
      )
      .pipe(
        tap((res) => {
          sessionStorage.setItem('access_token', res.access_token);
          sessionStorage.setItem('refresh_token', res.refresh_token);
          sessionStorage.setItem('user', JSON.stringify(res.user));
        }),
      );
  }

  refresh(): Observable<any> {
    const refreshToken = sessionStorage.getItem('refresh_token');
    return this.http
      .post<{ access_token: string; refresh_token: string }>(`${this.apiUrl}/refresh`, {
        refresh_token: refreshToken,
      })
      .pipe(
        tap((res) => {
          sessionStorage.setItem('access_token', res.access_token);
          sessionStorage.setItem('refresh_token', res.refresh_token);
        }),
      );
  }

  verifyEmail(token: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/verify-email`, { params: { token } });
  }

  forgotPassword(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/forgot-password`, { email });
  }

  resetPassword(token: string, newPassword: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/reset-password`, { token, newPassword });
  }

  changePassword(currentPassword: string, newPassword: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/change-password`, { currentPassword, newPassword });
  }

  logout() {
    sessionStorage.clear();
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return sessionStorage.getItem('access_token');
  }

  getUser(): UserInfo | null {
    const raw = sessionStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  // Where each role lands after login
  homeFor(role: UserRole): string {
    switch (role) {
      case 'admin': return '/admin/dashboard';
      case 'company': return '/company/dashboard';
      case 'driver': return '/driver/board';
      default: return '/home';
    }
  }
}
