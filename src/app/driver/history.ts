import { TPipe } from '../core/t.pipe';
import { DatePipe } from '@angular/common';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { OrdersService } from '../core/orders.service';
import { Order } from '../core/models';

@Component({
  selector: 'app-driver-history',
  standalone: true,
  imports: [TPipe, MatCardModule, MatIconModule, MatSnackBarModule, DatePipe],
  templateUrl: './history.html',
})
export class DriverHistory implements OnInit {
  deliveries: Order[] = [];
  totalRevenue = 0;
  count = 0;

  constructor(private ordersService: OrdersService, private cdr: ChangeDetectorRef, private snackBar: MatSnackBar) {}

  ngOnInit() {
    this.ordersService.history().subscribe({
      next: (data) => {
        this.deliveries = [...data.deliveries];
        this.totalRevenue = data.totalRevenue;
        this.count = data.count;
        this.cdr.detectChanges();
      },
      error: () => this.snackBar.open('Failed to load history', 'Close', { duration: 3000 }),
    });
  }
}
