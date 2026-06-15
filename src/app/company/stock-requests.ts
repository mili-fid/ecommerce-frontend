import { TPipe } from '../core/t.pipe';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { StockRequestsService } from '../core/stock-requests.service';
import { ProductsService } from '../core/products.service';
import { Product, StockRequest } from '../core/models';

@Component({
  selector: 'app-company-stock-requests',
  standalone: true,
  imports: [TPipe, FormsModule, MatTableModule, MatButtonModule, MatIconModule, MatCardModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatSnackBarModule],
  templateUrl: './stock-requests.html',
})
export class CompanyStockRequests implements OnInit {
  requests: StockRequest[] = [];
  products: Product[] = [];
  showForm = false;
  form = { product: '', quantity: 1, justification: '' };
  displayedColumns = ['product', 'quantity', 'justification', 'status'];

  constructor(
    private service: StockRequestsService,
    private productsService: ProductsService,
    private cdr: ChangeDetectorRef,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit() {
    this.load();
    this.productsService.mine().subscribe({ next: (data) => { this.products = data.filter(p => p.status === 'active'); this.cdr.detectChanges(); } });
  }

  load() {
    this.service.mine().subscribe({ next: (data) => { this.requests = [...data]; this.cdr.detectChanges(); } });
  }

  submit() {
    if (!this.form.product || !this.form.justification.trim()) {
      this.snackBar.open('Please fill all fields', 'Close', { duration: 3000 });
      return;
    }
    this.service.create(this.form).subscribe({
      next: () => { this.snackBar.open('Request submitted', 'Close', { duration: 2000 }); this.showForm = false; this.load(); },
      error: (err) => this.snackBar.open(err?.error?.message || 'Error', 'Close', { duration: 3000 }),
    });
  }
}
