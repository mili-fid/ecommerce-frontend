import { Component, OnInit, AfterViewInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatRadioModule } from '@angular/material/radio';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import * as L from 'leaflet';
import { CartService } from '../core/cart.service';
import { OrdersService } from '../core/orders.service';
import { UsersService } from '../core/users.service';
import { PaymentsService } from '../core/payments.service';
import { I18nService } from '../core/i18n.service';
import { TPipe } from '../core/t.pipe';
import { Driver } from '../core/models';

const DEFAULT_CENTER: [number, number] = [36.8065, 10.1815];

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [
    FormsModule, TPipe, MatCardModule, MatButtonModule, MatIconModule,
    MatInputModule, MatFormFieldModule, MatRadioModule,
    MatProgressSpinnerModule, MatSnackBarModule,
  ],
  templateUrl: './cart.html',
})
export class Cart implements OnInit, AfterViewInit, OnDestroy {
  drivers: Driver[] = [];
  selectedDriver: Driver | null = null;
  deliveryAddress = '';
  paymentMethod = 'cash';
  placing = false;
  paymentStep: 'checkout' | 'stripe' | 'paypal' | 'done' = 'checkout';

  // Stripe
  stripeClientSecret = '';
  stripeIntentId = '';
  stripeCard = { number: '', expiry: '', cvc: '' };
  stripeProcessing = false;
  stripeSimulated = false;

  // PayPal
  paypalApprovalUrl = '';
  paypalOrderId = '';

  deliveryLat: number | null = null;
  deliveryLng: number | null = null;

  private map: L.Map | null = null;
  private pin: L.CircleMarker | null = null;

  constructor(
    public cart: CartService,
    private ordersService: OrdersService,
    private usersService: UsersService,
    private paymentsService: PaymentsService,
    public i18n: I18nService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit() { this.loadDrivers(); }

  ngAfterViewInit() { setTimeout(() => this.initMap(), 0); }

  ngOnDestroy() { this.map?.remove(); }

  private initMap() {
    const el = document.getElementById('delivery-map');
    if (!el || this.map) return;
    this.map = L.map(el).setView(DEFAULT_CENTER, 12);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(this.map);
    this.map.on('click', (e: L.LeafletMouseEvent) => {
      this.setDeliveryPoint(e.latlng.lat, e.latlng.lng);
    });
  }

  private setDeliveryPoint(lat: number, lng: number) {
    this.deliveryLat = lat;
    this.deliveryLng = lng;
    if (this.pin) this.pin.remove();
    this.pin = L.circleMarker([lat, lng], { radius: 10, color: '#1976d2', fillColor: '#1976d2', fillOpacity: 0.6 }).addTo(this.map!);
    this.map!.setView([lat, lng], 14);
    this.loadDrivers();
    this.cdr.detectChanges();
  }

  useMyLocation() {
    if (!navigator.geolocation) { this.snackBar.open(this.i18n.t('common.error'), this.i18n.t('common.close'), { duration: 3000 }); return; }
    navigator.geolocation.getCurrentPosition(
      (pos) => this.setDeliveryPoint(pos.coords.latitude, pos.coords.longitude),
      () => this.snackBar.open(this.i18n.t('cart.mapHint'), this.i18n.t('common.close'), { duration: 4000 }),
    );
  }

  loadDrivers() {
    this.usersService.availableDrivers(this.deliveryLat ?? undefined, this.deliveryLng ?? undefined).subscribe({
      next: (data) => { this.drivers = [...data]; this.cdr.detectChanges(); },
    });
  }

  get total(): number {
    return this.cart.subtotal() + (this.selectedDriver?.deliveryFee || 0);
  }

  // ─── Order confirmation ────────────────────────────────────────────────────
  confirmOrder() {
    if (this.placing) return;
    if (!this.cart.getItems().length) { this.snackBar.open(this.i18n.t('cart.empty'), this.i18n.t('common.close'), { duration: 3000 }); return; }
    if (!this.deliveryAddress.trim()) { this.snackBar.open(this.i18n.t('cart.needAddress'), this.i18n.t('common.close'), { duration: 3000 }); return; }
    if (!this.selectedDriver) { this.snackBar.open(this.i18n.t('cart.needDriver'), this.i18n.t('common.close'), { duration: 3000 }); return; }

    if (this.paymentMethod === 'cash') {
      this.placeOrder();
    } else if (this.paymentMethod === 'card') {
      this.initStripe();
    } else if (this.paymentMethod === 'paypal') {
      this.initPayPal();
    }
  }

  // ─── Cash ─────────────────────────────────────────────────────────────────
  placeOrder(stripeIntentId?: string, paypalOrderId?: string) {
    this.placing = true;
    this.cdr.detectChanges();
    this.ordersService.create({
      items: this.cart.getItems().map((i) => ({ product: i.product._id, quantity: i.quantity })),
      deliveryAddress: this.deliveryAddress,
      driver: this.selectedDriver!._id,
      paymentMethod: this.paymentMethod,
      ...(this.deliveryLat != null ? { deliveryLat: this.deliveryLat, deliveryLng: this.deliveryLng } : {}),
      ...(stripeIntentId ? { stripeIntentId } : {}),
      ...(paypalOrderId ? { paypalOrderId } : {}),
    } as any).subscribe({
      next: () => {
        this.placing = false;
        this.cart.clear();
        this.cdr.detectChanges();
        this.snackBar.open(this.i18n.t('cart.placed'), this.i18n.t('common.close'), { duration: 4000 });
        this.router.navigate(['/my-orders']);
      },
      error: (err) => {
        this.placing = false;
        this.cdr.detectChanges();
        this.snackBar.open(err?.error?.message || this.i18n.t('common.error'), this.i18n.t('common.close'), { duration: 4000 });
      },
    });
  }

  // ─── Stripe ───────────────────────────────────────────────────────────────
  initStripe() {
    this.placing = true;
    this.cdr.detectChanges();
    this.paymentsService.createStripeIntent(this.total, 'pending').subscribe({
      next: (res) => {
        this.stripeClientSecret = res.clientSecret;
        this.stripeIntentId = res.intentId;
        this.stripeSimulated = !!res.simulated;
        this.paymentStep = 'stripe';
        this.placing = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.placing = false;
        this.cdr.detectChanges();
        this.snackBar.open(err?.error?.message || this.i18n.t('common.error'), this.i18n.t('common.close'), { duration: 4000 });
      },
    });
  }

  payByStripe() {
    this.stripeProcessing = true;
    this.cdr.detectChanges();
    // In real mode: Stripe.js confirms the card, then we verify.
    // In simulated mode: intent starts with 'sim_' → backend returns true immediately.
    this.paymentsService.verifyStripePayment(this.stripeIntentId).subscribe({
      next: (ok) => {
        this.stripeProcessing = false;
        if (ok) {
          this.snackBar.open(this.i18n.t('payment.success'), this.i18n.t('common.close'), { duration: 3000 });
          this.placeOrder(this.stripeIntentId);
        } else {
          this.cdr.detectChanges();
          this.snackBar.open(this.i18n.t('payment.failed'), this.i18n.t('common.close'), { duration: 4000 });
        }
      },
      error: () => {
        this.stripeProcessing = false;
        this.cdr.detectChanges();
        this.snackBar.open(this.i18n.t('payment.failed'), this.i18n.t('common.close'), { duration: 4000 });
      },
    });
  }

  // ─── PayPal ───────────────────────────────────────────────────────────────
  initPayPal() {
    this.placing = true;
    this.cdr.detectChanges();
    this.paymentsService.createPayPalOrder(this.total, 'pending').subscribe({
      next: (res) => {
        this.paypalApprovalUrl = res.approvalUrl;
        this.paypalOrderId = res.paypalOrderId;
        this.paymentStep = 'paypal';
        this.placing = false;
        this.cdr.detectChanges();
        // In real mode: redirect to PayPal. Simulated: skip redirect.
        if (!res.simulated) {
          window.location.href = res.approvalUrl;
        }
      },
      error: (err) => {
        this.placing = false;
        this.cdr.detectChanges();
        this.snackBar.open(err?.error?.message || this.i18n.t('common.error'), this.i18n.t('common.close'), { duration: 4000 });
      },
    });
  }

  capturePayPal() {
    this.placing = true;
    this.cdr.detectChanges();
    this.paymentsService.capturePayPalOrder(this.paypalOrderId).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.snackBar.open(this.i18n.t('payment.paypalSuccess'), this.i18n.t('common.close'), { duration: 3000 });
          this.placeOrder(undefined, this.paypalOrderId);
        } else {
          this.placing = false;
          this.cdr.detectChanges();
          this.snackBar.open(this.i18n.t('payment.failed'), this.i18n.t('common.close'), { duration: 4000 });
        }
      },
      error: () => {
        this.placing = false;
        this.cdr.detectChanges();
        this.snackBar.open(this.i18n.t('payment.failed'), this.i18n.t('common.close'), { duration: 4000 });
      },
    });
  }

  backToCheckout() {
    this.paymentStep = 'checkout';
    this.stripeClientSecret = '';
    this.stripeIntentId = '';
    this.paypalApprovalUrl = '';
    this.paypalOrderId = '';
    this.placing = false;
    this.cdr.detectChanges();
  }
}
