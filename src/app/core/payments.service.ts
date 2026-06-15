import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL } from './models';

@Injectable({ providedIn: 'root' })
export class PaymentsService {
  private apiUrl = `${API_URL}/payments`;

  constructor(private http: HttpClient) {}

  // Stripe: step 1 – get client secret
  createStripeIntent(amount: number, orderId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/stripe/intent`, { amount, orderId });
  }

  // Stripe: step 2 – verify after Elements confirms
  verifyStripePayment(intentId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/stripe/verify`, { intentId });
  }

  // PayPal: step 1 – create order and get approval URL
  createPayPalOrder(amount: number, orderId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/paypal/create`, { amount, orderId });
  }

  // PayPal: step 2 – capture after redirect returns
  capturePayPalOrder(paypalOrderId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/paypal/capture`, { paypalOrderId });
  }
}
