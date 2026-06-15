import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { TicketsService } from '../../core/tickets.service';
import { I18nService } from '../../core/i18n.service';
import { TPipe } from '../../core/t.pipe';
import { Ticket } from '../../core/models';

@Component({
  selector: 'app-support',
  standalone: true,
  imports: [FormsModule, DatePipe, TPipe, MatCardModule, MatButtonModule, MatIconModule, MatFormFieldModule, MatInputModule, MatSnackBarModule],
  templateUrl: './support.html',
})
export class Support implements OnInit {
  tickets: Ticket[] = [];
  showForm = false;
  subject = '';
  message = '';

  constructor(
    private ticketsService: TicketsService,
    public i18n: I18nService,
    private cdr: ChangeDetectorRef,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit() { this.load(); }

  load() {
    this.ticketsService.mine().subscribe({
      next: (data) => { this.tickets = [...data]; this.cdr.detectChanges(); },
    });
  }

  send() {
    if (!this.subject.trim() || !this.message.trim()) return;
    this.ticketsService.create(this.subject, this.message).subscribe({
      next: () => {
        this.snackBar.open(this.i18n.t('tickets.sent'), this.i18n.t('common.close'), { duration: 2500 });
        this.subject = '';
        this.message = '';
        this.showForm = false;
        this.load();
      },
    });
  }
}
