import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { API_URL, Product, Review } from './models';

@Injectable({ providedIn: 'root' })
export class ProductsService {
  private apiUrl = `${API_URL}/products`;

  constructor(private http: HttpClient) {}

  // Public catalog with filters (spec 3.2.1)
  catalog(filters: {
    search?: string;
    category?: string;
    subcategory?: string;
    company?: string;
    minPrice?: number | null;
    maxPrice?: number | null;
    inStock?: boolean;
    sort?: string;
    brand?: string;
    minRating?: number | null;
  }): Observable<Product[]> {
    let params = new HttpParams();
    if (filters.search) params = params.set('search', filters.search);
    if (filters.category) params = params.set('category', filters.category);
    if (filters.minPrice != null) params = params.set('minPrice', filters.minPrice);
    if (filters.maxPrice != null) params = params.set('maxPrice', filters.maxPrice);
    if (filters.inStock) params = params.set('inStock', 'true');
    if (filters.sort) params = params.set('sort', filters.sort);
    if (filters.brand) params = params.set('brand', filters.brand);
    if (filters.minRating != null) params = params.set('minRating', filters.minRating);
    return this.http.get<Product[]>(`${this.apiUrl}/catalog`, { params });
  }

  // Public: product detail page
  detail(id: string): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/catalog/${id}`);
  }

  // Public: category list for the home page (spec 7.1)
  categories(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/categories`);
  }

  subcategories(category?: string): Observable<string[]> {
    let params = new HttpParams();
    if (category) params = params.set('category', category);
    return this.http.get<string[]>(`${this.apiUrl}/subcategories`, { params });
  }

  companies(): Observable<{ _id: string; name: string; colorCode: string }[]> {
    return this.http.get<any[]>(`${this.apiUrl}/companies`);
  }

  // Public: real-time search suggestions (spec 3.2.1)
  suggest(q: string): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/suggest`, { params: { q } });
  }

  // Reviews (spec 3.2.1 "avis clients")
  reviews(productId: string): Observable<Review[]> {
    return this.http.get<Review[]>(`${this.apiUrl}/${productId}/reviews`);
  }
  addReview(productId: string, rating: number, comment: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/${productId}/reviews`, { rating, comment });
  }

  // Company
  mine(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}/mine`);
  }
  create(data: Partial<Product>): Observable<Product> {
    return this.http.post<Product>(this.apiUrl, data);
  }
  update(id: string, data: Partial<Product>): Observable<Product> {
    return this.http.put<Product>(`${this.apiUrl}/${id}`, data);
  }
  remove(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  // Admin: top products by sales count (spec 7.2)
  topProducts(limit = 5): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}/catalog`, {
      params: { sort: 'popularity' }
    }).pipe(map((products) => products.slice(0, limit)));
  }

  // Admin
  allAdmin(status?: string): Observable<Product[]> {
    let params = new HttpParams();
    if (status) params = params.set('status', status);
    return this.http.get<Product[]>(this.apiUrl, { params });
  }
  approve(id: string): Observable<Product> {
    return this.http.put<Product>(`${this.apiUrl}/${id}/approve`, {});
  }
  reject(id: string): Observable<Product> {
    return this.http.put<Product>(`${this.apiUrl}/${id}/reject`, {});
  }
  adjustStock(id: string, stock: number): Observable<Product> {
    return this.http.put<Product>(`${this.apiUrl}/${id}/stock`, { stock });
  }
  lowStock(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}/alerts/low-stock`);
  }
  topProductsAdmin(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/top-products`);
  }
}
