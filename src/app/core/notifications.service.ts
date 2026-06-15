import { Injectable, NgZone } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { API_URL, AppNotification } from './models';
import { AuthService } from './auth.service';

/**
 * Real-time notifications over Server-Sent Events.
 * EventSource cannot send headers, so the JWT goes in the URL as ?token=.
 * On connection error (e.g. the 15-min access token expired) we silently
 * refresh the token and reconnect.
 */
@Injectable({ providedIn: 'root' })
export class NotificationsService {
  private source: EventSource | null = null;
  private incoming = new Subject<AppNotification>();

  constructor(
    private http: HttpClient,
    private auth: AuthService,
    private zone: NgZone,
  ) {}

  stream(): Observable<AppNotification> {
    return this.incoming.asObservable();
  }

  connect() {
    this.disconnect();
    const token = this.auth.getToken();
    if (!token) return;

    this.source = new EventSource(`${API_URL}/notifications/stream?token=${token}`);

    this.source.onmessage = (event) => {
      // EventSource callbacks run outside Angular — bring them back in
      this.zone.run(() => {
        this.incoming.next(JSON.parse(event.data));
      });
    };

    this.source.onerror = () => {
      this.disconnect();
      // Token probably expired: refresh, then reconnect
      setTimeout(() => {
        this.auth.refresh().subscribe({
          next: () => this.connect(),
          error: () => { /* logged out — stop trying */ },
        });
      }, 3000);
    };
  }

  disconnect() {
    if (this.source) {
      this.source.close();
      this.source = null;
    }
  }

  list(): Observable<AppNotification[]> {
    return this.http.get<AppNotification[]>(`${API_URL}/notifications`);
  }

  unreadCount(): Observable<{ count: number }> {
    return this.http.get<{ count: number }>(`${API_URL}/notifications/unread-count`);
  }

  markAllRead(): Observable<any> {
    return this.http.put(`${API_URL}/notifications/read-all`, {});
  }
}
