import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TPipe } from '../../core/t.pipe';
import { PaymentsService } from '../../core/payments.service';
import { CartService } from '../../core/cart.service';
import { OrdersService } from '../../core/orders.service';

@Component({
  selector: 'app-payment-return',
  standalone: true,
  imports: [TPipe, MatCardModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900">
      <mat-card class="w-full max-w-md p-6 text-center">
        <mat-card-content class="flex flex-col items-center gap-4 pt-4">
          @if (state === 'loading') {
            <mat-spinner diameter="48"></mat-spinner>
            <p>{{ 'payment.paypalCapturing' | t }}</p>
          } @else if (state === 'success') {
            <mat-icon class="!text-6xl !w-16 !h-16 text-green-500">check_circle</mat-icon>
            <h2 class="text-xl font-bold">{{ 'payment.paypalSuccess' | t }}</h2>
            <button mat-raised-button color="primary" (click)="goOrders()">{{ 'orders.title' | t }}</button>
          } @else {
            <mat-icon class="!text-6xl !w-16 !h-16 text-red-500">error</mat-icon>
            <h2 class="text-xl font-bold">{{ 'payment.failed' | t }}</h2>
            <button mat-raised-button (click)="goCart()">{{ 'nav.catalog' | t }}</button>
          }
        </mat-card-content>
      </mat-card>
    </div>`,
})
export class PaymentReturn implements OnInit {
  state: 'loading' | 'success' | 'error' = 'loading';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private paymentsService: PaymentsService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    const paypalOrderId = this.route.snapshot.queryParamMap.get('token') ||
                          this.route.snapshot.queryParamMap.get('paypalOrderId') || '';
    const sim = this.route.snapshot.queryParamMap.get('sim');
    if (sim) { this.state = 'success'; this.cdr.detectChanges(); return; }
    if (!paypalOrderId) { this.state = 'error'; this.cdr.detectChanges(); return; }

    this.paymentsService.capturePayPalOrder(paypalOrderId).subscribe({
      next: (res: any) => {
        this.state = res.success ? 'success' : 'error';
        this.cdr.detectChanges();
      },
      error: () => { this.state = 'error'; this.cdr.detectChanges(); },
    });
  }

  goOrders() { this.router.navigate(['/my-orders']); }
  goCart() { this.router.navigate(['/cart']); }
}
