import { TPipe } from '../core/t.pipe';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { OffersService } from '../core/offers.service';
import { UsersService } from '../core/users.service';
import { ManagedUser, Offer } from '../core/models';

@Component({
  selector: 'app-admin-offers',
  standalone: true,
  imports: [TPipe, 
    FormsModule, MatTableModule, MatButtonModule, MatIconModule, MatCardModule,
    MatFormFieldModule, MatInputModule, MatSelectModule, MatSlideToggleModule, MatSnackBarModule,
  ],
  templateUrl: './offers.html',
})
export class AdminOffers implements OnInit {
  offers: Offer[] = [];
  companies: ManagedUser[] = [];
  showForm = false;
  form = { company: '', title: '', commissionPercent: 10, entryFee: 0, conditions: '' };
  displayedColumns = ['company', 'title', 'commission', 'entryFee', 'active'];

  constructor(
    private offersService: OffersService,
    private usersService: UsersService,
    private cdr: ChangeDetectorRef,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit() {
    this.load();
    // Only main company accounts (sub-accounts share the parent's offers)
    this.usersService.list('company').subscribe({
      next: (data) => { this.companies = [...data]; this.cdr.detectChanges(); },
    });
  }

  load() {
    this.offersService.all().subscribe({
      next: (data) => { this.offers = [...data]; this.cdr.detectChanges(); },
    });
  }

  create() {
    if (!this.form.company || !this.form.title.trim()) {
      this.snackBar.open('Company and title are required', 'Close', { duration: 3000 });
      return;
    }
    this.offersService.create(this.form).subscribe({
      next: () => {
        this.snackBar.open('Offer published — the company has been notified', 'Close', { duration: 3000 });
        this.showForm = false;
        this.load();
      },
      error: (err) => this.snackBar.open(err?.error?.message || 'Error', 'Close', { duration: 3000 }),
    });
  }

  toggle(offer: Offer) {
    this.offersService.toggle(offer._id).subscribe({
      next: () => this.load(),
    });
  }
}
