import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ProductsService } from '../../core/products.service';
import { CartService } from '../../core/cart.service';
import { AuthService } from '../../core/auth.service';
import { I18nService } from '../../core/i18n.service';
import { TPipe } from '../../core/t.pipe';
import { Product } from '../../core/models';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, TPipe, MatCardModule, MatButtonModule, MatIconModule, MatSnackBarModule],
  templateUrl: './home.html',
})
export class Home implements OnInit {
  featured: Product[] = [];
  categories: string[] = [];

  constructor(
    private productsService: ProductsService,
    private cart: CartService,
    private auth: AuthService,
    public i18n: I18nService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit() {
    // Featured = most popular active products (spec 7.1)
    this.productsService.catalog({ sort: 'popularity' }).subscribe({
      next: (data) => { this.featured = data.slice(0, 8); this.cdr.detectChanges(); },
    });
    this.productsService.categories().subscribe({
      next: (data) => { this.categories = [...data]; this.cdr.detectChanges(); },
    });
  }

  browseCategory(c: string) {
    this.router.navigate(['/catalog'], { queryParams: { category: c } });
  }

  addToCart(product: Product) {
    if (!this.auth.isLoggedIn()) {
      this.snackBar.open(this.i18n.t('catalog.loginToOrder'), this.i18n.t('common.close'), { duration: 3000 });
      return;
    }
    this.cart.add(product);
    this.snackBar.open(`"${product.name}" ${this.i18n.t('catalog.added')}`, this.i18n.t('common.close'), { duration: 2000 });
  }
}
