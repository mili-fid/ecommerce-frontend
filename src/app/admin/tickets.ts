import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { TicketsService } from '../core/tickets.service';
import { I18nService } from '../core/i18n.service';
import { TPipe } from '../core/t.pipe';
import { Ticket } from '../core/models';

@Component({
  selector: 'app-admin-tickets',
  standalone: true,
  imports: [FormsModule, DatePipe, TPipe, MatCardModule, MatButtonModule, MatIconModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatSnackBarModule],
  templateUrl: './tickets.html',
})
export class AdminTickets implements OnInit {
  tickets: Ticket[] = [];
  filterStatus = 'open';
  replies: Record<string, string> = {};

  constructor(
    private ticketsService: TicketsService,
    public i18n: I18nService,
    private cdr: ChangeDetectorRef,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit() { this.load(); }

  load() {
    this.ticketsService.all(this.filterStatus).subscribe({
      next: (data) => { this.tickets = [...data]; this.cdr.detectChanges(); },
    });
  }

  reply(ticket: Ticket) {
    const text = this.replies[ticket._id];
    if (!text?.trim()) return;
    this.ticketsService.reply(ticket._id, text).subscribe({
      next: () => {
        this.snackBar.open(this.i18n.t('tickets.replied'), this.i18n.t('common.close'), { duration: 2500 });
        this.replies[ticket._id] = '';
        this.load();
      },
    });
  }
}
