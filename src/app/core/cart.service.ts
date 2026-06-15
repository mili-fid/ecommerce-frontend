import { Injectable } from '@angular/core';
import { CartItem, Product } from './models';

@Injectable({ providedIn: 'root' })
export class CartService {
  private items: CartItem[] = [];

  constructor() {
    const saved = sessionStorage.getItem('cart');
    if (saved) this.items = JSON.parse(saved);
  }

  private persist() {
    sessionStorage.setItem('cart', JSON.stringify(this.items));
  }

  getItems(): CartItem[] {
    return this.items;
  }

  count(): number {
    return this.items.reduce((sum, i) => sum + i.quantity, 0);
  }

  subtotal(): number {
    return this.items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
  }

  add(product: Product) {
    const existing = this.items.find((i) => i.product._id === product._id);
    if (existing) {
      if (existing.quantity < product.stock) existing.quantity++;
    } else {
      this.items.push({ product, quantity: 1 });
    }
    this.persist();
  }

  setQuantity(productId: string, quantity: number) {
    const item = this.items.find((i) => i.product._id === productId);
    if (!item) return;
    item.quantity = Math.max(1, Math.min(quantity, item.product.stock));
    this.persist();
  }

  remove(productId: string) {
    this.items = this.items.filter((i) => i.product._id !== productId);
    this.persist();
  }

  clear() {
    this.items = [];
    this.persist();
  }
}
