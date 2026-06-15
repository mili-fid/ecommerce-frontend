import { Component, OnDestroy, OnInit, ChangeDetectorRef } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatBadgeModule } from '@angular/material/badge';
import { MatMenuModule } from '@angular/material/menu';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Subscription } from 'rxjs';
import { AuthService } from '../core/auth.service';
import { CartService } from '../core/cart.service';
import { NotificationsService } from '../core/notifications.service';
import { ThemeService } from '../core/theme.service';
import { I18nService } from '../core/i18n.service';
import { TPipe } from '../core/t.pipe';
import { AppNotification, UserInfo } from '../core/models';

interface NavLink {
  key: string;
  path: string;
  icon: string;
}

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [
    RouterOutlet, RouterLink, RouterLinkActive, DatePipe, TPipe,
    MatToolbarModule, MatButtonModule, MatIconModule, MatBadgeModule,
    MatMenuModule, MatSnackBarModule,
  ],
  templateUrl: './shell.html',
})
export class Shell implements OnInit, OnDestroy {
  user: UserInfo | null = null;
  notifications: AppNotification[] = [];
  unread = 0;
  private sub: Subscription | null = null;

  constructor(
    private auth: AuthService,
    public cart: CartService,
    public theme: ThemeService,
    public i18n: I18nService,
    private notificationsService: NotificationsService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private snackBar: MatSnackBar,
  ) {
    this.user = this.auth.getUser();
  }

  // Getter so labels re-translate instantly when the language changes
  get links(): NavLink[] {
    switch (this.user?.role) {
      case 'admin':
        return [
          { key: 'nav.dashboard', path: '/admin/dashboard', icon: 'dashboard' },
          { key: 'nav.users', path: '/admin/users', icon: 'group' },
          { key: 'nav.products', path: '/admin/products', icon: 'inventory_2' },
          { key: 'nav.stock', path: '/admin/stock-requests', icon: 'move_to_inbox' },
          { key: 'nav.orders', path: '/admin/orders', icon: 'receipt_long' },
          { key: 'nav.offers', path: '/admin/offers', icon: 'handshake' },
          { key: 'nav.tickets', path: '/admin/tickets', icon: 'support_agent' },
          { key: 'nav.audit', path: '/admin/audit', icon: 'history' },
        ];
      case 'company':
        return [
          { key: 'nav.dashboard', path: '/company/dashboard', icon: 'dashboard' },
          { key: 'nav.myProducts', path: '/company/products', icon: 'inventory_2' },
          { key: 'nav.stockRequests', path: '/company/stock-requests', icon: 'move_to_inbox' },
          { key: 'nav.employees', path: '/company/sub-accounts', icon: 'badge' },
          { key: 'nav.platformOffers', path: '/company/offers', icon: 'handshake' },
          { key: 'nav.support', path: '/support', icon: 'support_agent' },
        ];
      case 'driver':
        return [
          { key: 'nav.board', path: '/driver/board', icon: 'local_shipping' },
          { key: 'nav.history', path: '/driver/history', icon: 'payments' },
          { key: 'nav.support', path: '/support', icon: 'support_agent' },
        ];
      case 'client':
        return [
          { key: 'nav.home', path: '/home', icon: 'home' },
          { key: 'nav.catalog', path: '/catalog', icon: 'storefront' },
          { key: 'nav.myOrders', path: '/my-orders', icon: 'receipt_long' },
          { key: 'nav.support', path: '/support', icon: 'support_agent' },
        ];
      default:
        return [
          { key: 'nav.home', path: '/home', icon: 'home' },
          { key: 'nav.catalog', path: '/catalog', icon: 'storefront' },
        ];
    }
  }

  ngOnInit() {
    if (!this.auth.isLoggedIn()) return;

    this.notificationsService.list().subscribe({
      next: (data) => { this.notifications = [...data]; this.cdr.detectChanges(); },
    });
    this.notificationsService.unreadCount().subscribe({
      next: (d) => { this.unread = d.count; this.cdr.detectChanges(); },
    });

    this.notificationsService.connect();
    this.sub = this.notificationsService.stream().subscribe((notif) => {
      this.notifications = [notif, ...this.notifications].slice(0, 30);
      this.unread++;
      this.cdr.detectChanges();
      this.snackBar.open(notif.message, this.i18n.t('common.close'), { duration: 4000 });
    });
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
    this.notificationsService.disconnect();
  }

  get initial(): string {
    if (!this.user) return '?';
    return (this.user.firstName?.[0] || this.user.email[0]).toUpperCase();
  }

  get isClient(): boolean {
    return this.user?.role === 'client';
  }

  get isLoggedIn(): boolean {
    return this.auth.isLoggedIn();
  }

  onBellOpened() {
    if (this.unread === 0) return;
    this.notificationsService.markAllRead().subscribe({
      next: () => {
        this.unread = 0;
        this.notifications = this.notifications.map((n) => ({ ...n, read: true }));
        this.cdr.detectChanges();
      },
    });
  }

  goLogin() {
    this.router.navigate(['/login']);
  }

  logout() {
    this.notificationsService.disconnect();
    this.auth.logout();
  }
}
