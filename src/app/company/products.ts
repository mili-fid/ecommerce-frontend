import { TPipe } from '../core/t.pipe';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ProductsService } from '../core/products.service';
import { Product } from '../core/models';

@Component({
  selector: 'app-company-products',
  standalone: true,
  imports: [TPipe, FormsModule, MatTableModule, MatButtonModule, MatIconModule, MatCardModule, MatFormFieldModule, MatInputModule, MatDialogModule, MatSnackBarModule],
  templateUrl: './products.html',
})
export class CompanyProducts implements OnInit {
  products: Product[] = [];
  showForm = false;
  editingId: string | null = null;
  form = { name: '', description: '', brand: '', subcategory: '', price: 0, category: '', stock: 0, photos: [] as string[] };
  displayedColumns = ['name', 'price', 'stock', 'sold', 'status', 'actions'];

  get totalUnitsSold(): number {
    return this.products.reduce((sum, p) => sum + (p.salesCount || 0), 0);
  }

  get estimatedRevenue(): number {
    return this.products.reduce((sum, p) => sum + (p.salesCount || 0) * p.price, 0);
  }

  constructor(private productsService: ProductsService, private cdr: ChangeDetectorRef, private snackBar: MatSnackBar) {}

  ngOnInit() { this.load(); }

  load() {
    this.productsService.mine().subscribe({
      next: (data) => { this.products = [...data]; this.cdr.detectChanges(); },
    });
  }

  openCreate() {
    this.form = { name: '', description: '', brand: '', subcategory: '', price: 0, category: '', stock: 0, photos: [] as string[] };
    this.editingId = null;
    this.showForm = true;
  }

  openEdit(p: Product) {
    this.form = { name: p.name, description: p.description, brand: (p as any).brand || '', subcategory: (p as any).subcategory || '', price: p.price, category: p.category, stock: p.stock, photos: p.photos };
    this.editingId = p._id;
    this.showForm = true;
  }

  // Image optimization (spec 5.1): resized client-side before upload
  onPhoto(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxW = 600;
        const scale = Math.min(1, maxW / img.width);
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height);
        this.form.photos = [canvas.toDataURL('image/webp', 0.8)];
        this.cdr.detectChanges();
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  }

  save() {
    const obs = this.editingId
      ? this.productsService.update(this.editingId, this.form)
      : this.productsService.create(this.form);

    obs.subscribe({
      next: () => {
        this.snackBar.open(this.editingId ? 'Product updated' : 'Product submitted for validation', 'Close', { duration: 3000 });
        this.showForm = false;
        this.load();
      },
      error: (err) => this.snackBar.open(err?.error?.message || 'Error', 'Close', { duration: 3000 }),
    });
  }

  remove(p: Product) {
    if (!confirm(`Delete "${p.name}"?`)) return;
    this.productsService.remove(p._id).subscribe({
      next: () => { this.snackBar.open('Product deleted', 'Close', { duration: 2000 }); this.load(); },
    });
  }
}
