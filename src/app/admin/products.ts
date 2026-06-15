import { TPipe } from '../core/t.pipe';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ProductsService } from '../core/products.service';
import { Product } from '../core/models';

@Component({
  selector: 'app-admin-products',
  standalone: true,
  imports: [TPipe, FormsModule, MatTableModule, MatButtonModule, MatIconModule, MatCardModule, MatFormFieldModule, MatSelectModule, MatInputModule, MatSnackBarModule],
  templateUrl: './products.html',
})
export class AdminProducts implements OnInit {
  products: Product[] = [];
  filterStatus = 'pending';
  editingStock: string | null = null;
  stockInput = 0;
  displayedColumns = ['name', 'company', 'price', 'stock', 'status', 'actions'];

  constructor(private productsService: ProductsService, private cdr: ChangeDetectorRef, private snackBar: MatSnackBar) {}

  ngOnInit() { this.load(); }

  load() {
    this.productsService.allAdmin(this.filterStatus).subscribe({
      next: (data) => { this.products = [...data]; this.cdr.detectChanges(); },
    });
  }

  approve(p: Product) {
    this.productsService.approve(p._id).subscribe({
      next: () => { this.snackBar.open('Product approved', 'Close', { duration: 2000 }); this.load(); },
    });
  }

  reject(p: Product) {
    this.productsService.reject(p._id).subscribe({
      next: () => { this.snackBar.open('Product rejected', 'Close', { duration: 2000 }); this.load(); },
    });
  }

  saveStock(p: Product) {
    this.productsService.adjustStock(p._id, this.stockInput).subscribe({
      next: () => { this.snackBar.open('Stock updated', 'Close', { duration: 2000 }); this.editingStock = null; this.load(); },
    });
  }
}
