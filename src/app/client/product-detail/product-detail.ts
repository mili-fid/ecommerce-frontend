import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ProductsService } from '../../core/products.service';
import { CartService } from '../../core/cart.service';
import { AuthService } from '../../core/auth.service';
import { I18nService } from '../../core/i18n.service';
import { TPipe } from '../../core/t.pipe';
import { Product, Review } from '../../core/models';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [
    RouterLink, DatePipe, FormsModule, TPipe,
    MatCardModule, MatButtonModule, MatIconModule, MatFormFieldModule, MatInputModule, MatSnackBarModule,
  ],
  templateUrl: './product-detail.html',
})
export class ProductDetail implements OnInit {
  product: Product | null = null;
  reviews: Review[] = [];
  myRating = 5;
  myComment = '';
  stars = [1, 2, 3, 4, 5];

  constructor(
    private route: ActivatedRoute,
    private productsService: ProductsService,
    private cart: CartService,
    private auth: AuthService,
    public i18n: I18nService,
    private cdr: ChangeDetectorRef,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.productsService.detail(id).subscribe({
      next: (p) => { this.product = p; this.cdr.detectChanges(); },
    });
    this.loadReviews(id);
  }

  loadReviews(id: string) {
    this.productsService.reviews(id).subscribe({
      next: (data) => { this.reviews = [...data]; this.cdr.detectChanges(); },
    });
  }

  get isClient(): boolean {
    return this.auth.getUser()?.role === 'client';
  }

  addToCart() {
    if (!this.product) return;
    if (!this.auth.isLoggedIn()) {
      this.snackBar.open(this.i18n.t('catalog.loginToOrder'), this.i18n.t('common.close'), { duration: 3000 });
      return;
    }
    this.cart.add(this.product);
    this.snackBar.open(`"${this.product.name}" ${this.i18n.t('catalog.added')}`, this.i18n.t('common.close'), { duration: 2000 });
  }

  submitReview() {
    if (!this.product) return;
    this.productsService.addReview(this.product._id, this.myRating, this.myComment).subscribe({
      next: () => {
        this.snackBar.open(this.i18n.t('product.reviewSaved'), this.i18n.t('common.close'), { duration: 3000 });
        this.myComment = '';
        this.loadReviews(this.product!._id);
        this.productsService.detail(this.product!._id).subscribe({
          next: (p) => { this.product = p; this.cdr.detectChanges(); },
        });
      },
      error: (err) => this.snackBar.open(err?.error?.message || this.i18n.t('common.error'), this.i18n.t('common.close'), { duration: 3000 }),
    });
  }
}
