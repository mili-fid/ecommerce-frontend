import { TPipe } from '../core/t.pipe';
import { Component, OnInit, AfterViewInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import * as L from 'leaflet';
import { OrdersService } from '../core/orders.service';
import { UsersService } from '../core/users.service';
import { Order } from '../core/models';

const DEFAULT_CENTER: [number, number] = [36.8065, 10.1815]; // Tunis

@Component({
  selector: 'app-driver-board',
  standalone: true,
  imports: [TPipe, MatCardModule, MatButtonModule, MatIconModule, MatSelectModule, MatFormFieldModule, FormsModule, MatSnackBarModule],
  templateUrl: './board.html',
})
export class DriverBoard implements OnInit, AfterViewInit, OnDestroy {
  available: Order[] = [];
  active: Order[] = [];
  availability = 'available';
  locationSet = false;

  private map: L.Map | null = null;
  private orderMarkers: L.CircleMarker[] = [];
  private myMarker: L.CircleMarker | null = null;

  constructor(
    private ordersService: OrdersService,
    private usersService: UsersService,
    private cdr: ChangeDetectorRef,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit() { this.load(); }

  ngAfterViewInit() {
    setTimeout(() => this.initMap(), 0);
  }

  ngOnDestroy() {
    this.map?.remove();
  }

  private initMap() {
    const el = document.getElementById('driver-map');
    if (!el || this.map) return;

    // Spec 3.4.2: interactive map showing nearby available orders
    this.map = L.map(el).setView(DEFAULT_CENTER, 12);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(this.map);
    this.drawOrderMarkers();
  }

  private drawOrderMarkers() {
    if (!this.map) return;
    this.orderMarkers.forEach((m) => m.remove());
    this.orderMarkers = [];

    for (const order of this.available) {
      if (order.deliveryLat == null || order.deliveryLng == null) continue;
      const marker = L.circleMarker([order.deliveryLat, order.deliveryLng], {
        radius: 10,
        color: '#e65100',
        fillColor: '#ff9800',
        fillOpacity: 0.8,
      })
        .addTo(this.map)
        .bindPopup(
          `<b>${order.deliveryFee} TND</b><br>${order.deliveryAddress}<br>` +
          `${order.items.length} item(s) — total ${order.total} TND`,
        );
      this.orderMarkers.push(marker);
    }
  }

  // Driver shares their position so clients see real distances at checkout
  shareMyLocation() {
    if (!navigator.geolocation) {
      this.snackBar.open('Geolocation is not supported by this browser', 'Close', { duration: 3000 });
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        this.usersService.setLocation(latitude, longitude).subscribe({
          next: () => {
            this.locationSet = true;
            this.cdr.detectChanges();
            this.snackBar.open('Position updated — clients now see your real distance', 'Close', { duration: 3000 });

            if (this.map) {
              if (this.myMarker) this.myMarker.remove();
              this.myMarker = L.circleMarker([latitude, longitude], {
                radius: 9,
                color: '#1565c0',
                fillColor: '#2196f3',
                fillOpacity: 0.9,
              }).addTo(this.map).bindPopup('You are here');
              this.map.setView([latitude, longitude], 13);
            }
          },
        });
      },
      () => this.snackBar.open('Could not get your location', 'Close', { duration: 3000 }),
    );
  }

  load() {
    this.ordersService.available().subscribe({
      next: (d) => {
        this.available = [...d];
        this.cdr.detectChanges();
        this.drawOrderMarkers();
      },
    });
    this.ordersService.active().subscribe({ next: (d) => { this.active = [...d]; this.cdr.detectChanges(); } });
  }

  setAvailability() {
    this.usersService.setAvailability(this.availability).subscribe({
      next: () => this.snackBar.open(`Status set to ${this.availability}`, 'Close', { duration: 2000 }),
    });
  }

  action(order: Order, action: 'accept' | 'refuse' | 'preparing' | 'in-transit' | 'delivered') {
    this.ordersService.setStatus(order._id, action).subscribe({
      next: () => { this.snackBar.open(`Order ${action}`, 'Close', { duration: 2000 }); this.load(); },
      error: (err) => this.snackBar.open(err?.error?.message || 'Error', 'Close', { duration: 3000 }),
    });
  }

  nextAction(status: string): { label: string; action: any } | null {
    const map: any = {
      accepted: { label: 'driver.markPreparing', action: 'preparing' },
      preparing: { label: 'driver.markTransit', action: 'in-transit' },
      in_transit: { label: 'driver.markDelivered', action: 'delivered' },
    };
    return map[status] || null;
  }

  statusColor(s: string): string {
    const map: any = { pending: 'bg-yellow-100', accepted: 'bg-blue-100', preparing: 'bg-indigo-100', in_transit: 'bg-purple-100' };
    return map[s] || 'bg-gray-100';
  }
}
