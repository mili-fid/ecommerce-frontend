import { Component, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../core/auth.service';
import { I18nService } from '../../core/i18n.service';
import { TPipe } from '../../core/t.pipe';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [FormsModule, RouterLink, TPipe, MatInputModule, MatButtonModule, MatCardModule, MatFormFieldModule, MatIconModule, MatSnackBarModule],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-slate-900">
      <mat-card class="w-full max-w-md p-6">
        <mat-card-header>
          <mat-card-title class="text-2xl font-bold text-center w-full mb-4">{{ 'auth.forgotTitle' | t }}</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          @if (!sent) {
            <div class="flex flex-col gap-4 mt-4">
              <p class="text-gray-500 dark:text-gray-400 text-sm">{{ 'auth.forgotSub' | t }}</p>
              <mat-form-field class="w-full">
                <mat-label>{{ 'common.email' | t }}</mat-label>
                <input matInput [(ngModel)]="email" type="email" (keyup.enter)="submit()" />
              </mat-form-field>
              <button mat-raised-button color="primary" class="w-full" (click)="submit()" [disabled]="loading">
                {{ 'auth.sendReset' | t }}
              </button>
              <p class="text-center text-sm"><a routerLink="/login" class="text-blue-500">{{ 'auth.backToLogin' | t }}</a></p>
            </div>
          } @else {
            <div class="flex flex-col items-center gap-4 mt-4 text-center">
              <mat-icon class="!text-6xl !w-16 !h-16 text-green-500">mark_email_read</mat-icon>
              <p>{{ 'auth.resetSent' | t }}</p>
              <a mat-stroked-button routerLink="/login">{{ 'auth.backToLogin' | t }}</a>
            </div>
          }
        </mat-card-content>
      </mat-card>
    </div>
  `,
})
export class ForgotPassword {
  email = '';
  loading = false;
  sent = false;

  constructor(private auth: AuthService, public i18n: I18nService, private cdr: ChangeDetectorRef, private snackBar: MatSnackBar) {}

  submit() {
    if (!this.email.trim()) return;
    this.loading = true;
    this.cdr.detectChanges();
    this.auth.forgotPassword(this.email).subscribe({
      next: () => { this.sent = true; this.loading = false; this.cdr.detectChanges(); },
      error: (err) => {
        this.loading = false;
        this.cdr.detectChanges();
        this.snackBar.open(err?.error?.message || this.i18n.t('common.error'), this.i18n.t('common.close'), { duration: 3000 });
      },
    });
  }
}
