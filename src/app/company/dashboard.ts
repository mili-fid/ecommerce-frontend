import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { ProductsService } from '../core/products.service';
import { StockRequestsService } from '../core/stock-requests.service';
import { OrdersService } from '../core/orders.service';
import { Product } from '../core/models';
import { TPipe } from '../core/t.pipe';

@Component({
  selector: 'app-company-dashboard',
  standalone: true,
  imports: [RouterLink, TPipe, MatCardModule, MatIconModule, MatButtonModule],
  templateUrl: './dashboard.html',
})
export class CompanyDashboard implements OnInit {
  activeProducts = 0;
  pendingProducts = 0;
  pendingRequests = 0;
  totalSold = 0;
  topSellers: any[] = [];

  constructor(
    private productsService: ProductsService,
    private stockRequestsService: StockRequestsService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    this.productsService.mine().subscribe({
      next: (products) => {
        this.activeProducts = products.filter(p => p.status === 'active').length;
        this.pendingProducts = products.filter(p => p.status === 'pending').length;
        this.totalSold = products.reduce((s, p) => s + (p.salesCount || 0), 0);
        this.topSellers = products
          .filter(p => p.status === 'active')
          .sort((a, b) => (b.salesCount || 0) - (a.salesCount || 0))
          .slice(0, 5);
        this.cdr.detectChanges();
      },
    });
    this.stockRequestsService.mine().subscribe({
      next: (reqs) => {
        this.pendingRequests = reqs.filter(r => r.status === 'pending').length;
        this.cdr.detectChanges();
      },
    });
  }
}
