import { TPipe } from '../core/t.pipe';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { OrdersService } from '../core/orders.service';
import { Order } from '../core/models';

@Component({
  selector: 'app-admin-orders',
  standalone: true,
  imports: [TPipe, FormsModule, MatTableModule, MatButtonModule, MatIconModule, MatCardModule, MatSelectModule, MatFormFieldModule, MatSnackBarModule],
  templateUrl: './orders.html',
})
export class AdminOrders implements OnInit {
  orders: Order[] = [];
  filterStatus = '';
  displayedColumns = ['client', 'driver', 'total', 'payment', 'status', 'actions'];

  constructor(private ordersService: OrdersService, private cdr: ChangeDetectorRef, private snackBar: MatSnackBar) {}

  ngOnInit() { this.load(); }

  load() {
    this.ordersService.allAdmin(this.filterStatus).subscribe({
      next: (data) => { this.orders = [...data]; this.cdr.detectChanges(); },
    });
  }

  downloadInvoice(o: Order) {
    this.ordersService.downloadInvoice(o._id).subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `invoice-${o._id.slice(-8)}.pdf`;
        a.click();
        URL.revokeObjectURL(url);
      },
      error: () => this.snackBar.open('Failed to download invoice', 'Close', { duration: 3000 }),
    });
  }

  cancel(o: Order) {
    this.ordersService.cancelAdmin(o._id).subscribe({
      next: () => { this.snackBar.open('Order cancelled', 'Close', { duration: 2000 }); this.load(); },
      error: (err) => this.snackBar.open(err?.error?.message || 'Cannot cancel', 'Close', { duration: 3000 }),
    });
  }

  statusColor(s: string): string {
    const map: any = { pending: 'bg-yellow-100', accepted: 'bg-blue-100', preparing: 'bg-indigo-100', in_transit: 'bg-purple-100', delivered: 'bg-green-100', cancelled: 'bg-red-100' };
    return map[s] || 'bg-gray-100';
  }
}
