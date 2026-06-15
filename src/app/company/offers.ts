import { TPipe } from '../core/t.pipe';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { OffersService } from '../core/offers.service';
import { Offer } from '../core/models';

@Component({
  selector: 'app-company-offers',
  standalone: true,
  imports: [TPipe, DatePipe, MatCardModule, MatIconModule],
  templateUrl: './offers.html',
})
export class CompanyOffers implements OnInit {
  offers: Offer[] = [];

  constructor(private offersService: OffersService, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.offersService.mine().subscribe({
      next: (data) => { this.offers = [...data]; this.cdr.detectChanges(); },
    });
  }
}
