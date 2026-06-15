import { TPipe } from '../core/t.pipe';
import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { OrdersService } from '../core/orders.service';
import { NotificationsService } from '../core/notifications.service';
import { Subscription } from 'rxjs';
import { Order } from '../core/models';

@Component({
  selector: 'app-my-orders',
  standalone: true,
  imports: [TPipe, MatCardModule, MatButtonModule, MatIconModule, MatSnackBarModule],
  templateUrl: './my-orders.html',
})
export class MyOrders implements OnInit, OnDestroy {
  orders: Order[] = [];
  private notifSub: Subscription | null = null;

  constructor(
    private ordersService: OrdersService,
    private notifications: NotificationsService,
    private cdr: ChangeDetectorRef,
    private snackBar: MatSnackBar,
  ) {}

  ngOnDestroy() {
    this.notifSub?.unsubscribe();
  }

  ngOnInit() {
    this.load();
    // Re-fetch orders whenever a live notification comes in (order status changed)
    this.notifSub = this.notifications.stream().subscribe((n) => {
      if (n.type === 'order') this.load();
    });
  }

  load() {
    this.ordersService.mine().subscribe({
      next: (data) => {
        this.orders = [...data];
        this.cdr.detectChanges();
      },
      error: () => this.snackBar.open('Failed to load orders', 'Close', { duration: 3000 }),
    });
  }

  // Spec 3.3.1: cancel only while the driver has not accepted
  cancel(order: Order) {
    this.ordersService.cancel(order._id).subscribe({
      next: () => {
        this.snackBar.open('Order cancelled', 'Close', { duration: 2000 });
        this.load();
      },
      error: (err) =>
        this.snackBar.open(err?.error?.message || 'Cannot cancel this order', 'Close', { duration: 3000 }),
    });
  }

  // Spec 3.5: downloadable PDF invoice
  downloadInvoice(order: Order) {
    this.ordersService.downloadInvoice(order._id).subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `invoice-${order._id.slice(-8)}.pdf`;
        a.click();
        URL.revokeObjectURL(url);
      },
      error: () => this.snackBar.open('Failed to download invoice', 'Close', { duration: 3000 }),
    });
  }

  statusColor(status: string): string {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'accepted': return 'bg-blue-100 text-blue-800';
      case 'preparing': return 'bg-indigo-100 text-indigo-800';
      case 'in_transit': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      default: return 'bg-red-100 text-red-800';
    }
  }
}
