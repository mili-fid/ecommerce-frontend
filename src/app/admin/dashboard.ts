import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { UsersService } from '../core/users.service';
import { OrdersService } from '../core/orders.service';
import { ProductsService } from '../core/products.service';
import { TPipe } from '../core/t.pipe';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [MatCardModule, MatIconModule, MatButtonModule, RouterLink, MatSnackBarModule, TPipe],
  templateUrl: './dashboard.html',
})
export class AdminDashboard implements OnInit {
  userStats: any = {};
  orderStats: any = { last7Days: [] };
  lowStockCount = 0;
  topProducts: any[] = [];

  constructor(
    private usersService: UsersService,
    private ordersService: OrdersService,
    private productsService: ProductsService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    this.usersService.stats().subscribe({ next: (d) => { this.userStats = d; this.cdr.detectChanges(); } });
    this.ordersService.stats().subscribe({ next: (d) => { this.orderStats = d; this.cdr.detectChanges(); } });
    this.productsService.lowStock().subscribe({ next: (d) => { this.lowStockCount = d.length; this.cdr.detectChanges(); } });
    this.productsService.topProductsAdmin().subscribe({ next: (d) => { this.topProducts = [...d]; this.cdr.detectChanges(); } });
  }

  // Bar heights for the 7-day chart (spec 7.2 "graphiques de ventes")
  get maxOrders(): number {
    const days = this.orderStats.last7Days || [];
    return Math.max(1, ...days.map((d: any) => d.orders));
  }

  barHeight(orders: number): string {
    return Math.max(4, Math.round((orders / this.maxOrders) * 100)) + '%';
  }
}
