import { TPipe } from '../core/t.pipe';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { StockRequestsService } from '../core/stock-requests.service';
import { StockRequest } from '../core/models';

@Component({
  selector: 'app-admin-stock-requests',
  standalone: true,
  imports: [TPipe, FormsModule, MatTableModule, MatButtonModule, MatIconModule, MatCardModule, MatSelectModule, MatFormFieldModule, MatSnackBarModule],
  templateUrl: './stock-requests.html',
})
export class AdminStockRequests implements OnInit {
  requests: StockRequest[] = [];
  filterStatus = 'pending';
  displayedColumns = ['company', 'product', 'quantity', 'justification', 'status', 'actions'];

  constructor(private service: StockRequestsService, private cdr: ChangeDetectorRef, private snackBar: MatSnackBar) {}

  ngOnInit() { this.load(); }

  load() {
    this.service.all(this.filterStatus).subscribe({
      next: (data) => { this.requests = [...data]; this.cdr.detectChanges(); },
    });
  }

  approve(r: StockRequest) {
    this.service.approve(r._id).subscribe({
      next: () => { this.snackBar.open('Approved — stock updated', 'Close', { duration: 2000 }); this.load(); },
    });
  }

  reject(r: StockRequest) {
    this.service.reject(r._id).subscribe({
      next: () => { this.snackBar.open('Request rejected', 'Close', { duration: 2000 }); this.load(); },
    });
  }
}
