import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ProductsService } from '../core/products.service';
import { CartService } from '../core/cart.service';
import { AuthService } from '../core/auth.service';
import { I18nService } from '../core/i18n.service';
import { TPipe } from '../core/t.pipe';
import { Product } from '../core/models';

@Component({
  selector: 'app-catalog',
  standalone: true,
  imports: [
    FormsModule, RouterLink, TPipe, MatCardModule, MatButtonModule, MatIconModule,
    MatInputModule, MatFormFieldModule, MatSelectModule, MatAutocompleteModule, MatSnackBarModule,
  ],
  templateUrl: './catalog.html',
})
export class Catalog implements OnInit {
  products: Product[] = [];
  suggestions: string[] = [];
  loading = false;

  search = '';
  category = '';
  subcategory = '';
  companyId = '';
  companies: { _id: string; name: string; colorCode: string }[] = [];
  subcategories: string[] = [];
  minPrice: number | null = null;
  maxPrice: number | null = null;
  inStock = false;
  sort = '';
  brand = '';
  minRating: number | null = null;

  constructor(
    private productsService: ProductsService,
    private cart: CartService,
    private auth: AuthService,
    public i18n: I18nService,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit() {
    // Category can come from the home page (spec 7.1 navigation)
    const cat = this.route.snapshot.queryParamMap.get('category');
    if (cat) this.category = cat;
    this.load();
    this.productsService.companies().subscribe({
      next: (data) => { this.companies = [...data]; this.cdr.detectChanges(); },
    });
    this.loadSubcategories();
  }

  // Sub-categories depend on the selected category (spec 3.2.1)
  loadSubcategories() {
    this.productsService.subcategories(this.category).subscribe({
      next: (data) => { this.subcategories = [...data]; this.cdr.detectChanges(); },
    });
  }

  onCategoryChange() {
    this.subcategory = '';
    this.loadSubcategories();
    this.load();
  }

  load() {
    this.loading = true;
    this.cdr.detectChanges();
    this.productsService
      .catalog({
        search: this.search,
        category: this.category,
        subcategory: this.subcategory,
        company: this.companyId,
        minPrice: this.minPrice,
        maxPrice: this.maxPrice,
        inStock: this.inStock,
        sort: this.sort,
        brand: this.brand,
        minRating: this.minRating,
      })
      .subscribe({
        next: (data) => {
          this.products = [...data];
          this.loading = false;
          this.cdr.detectChanges();
        },
        error: () => {
          this.loading = false;
          this.cdr.detectChanges();
          this.snackBar.open(this.i18n.t('common.error'), this.i18n.t('common.close'), { duration: 3000 });
        },
      });
  }

  // Real-time suggestions (spec 3.2.1 autocomplete)
  onSearchInput() {
    if (this.search.length < 2) {
      this.suggestions = [];
      this.cdr.detectChanges();
      return;
    }
    this.productsService.suggest(this.search).subscribe({
      next: (s) => { this.suggestions = [...s]; this.cdr.detectChanges(); },
    });
  }

  pickSuggestion() {
    this.load();
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
