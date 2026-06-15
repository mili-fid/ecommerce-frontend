import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
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
  selector: 'app-reset-password',
  standalone: true,
  imports: [FormsModule, RouterLink, TPipe, MatInputModule, MatButtonModule, MatCardModule, MatFormFieldModule, MatIconModule, MatSnackBarModule],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-slate-900">
      <mat-card class="w-full max-w-md p-6">
        <mat-card-header>
          <mat-card-title class="text-2xl font-bold text-center w-full mb-4">{{ 'auth.resetTitle' | t }}</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          @if (!done) {
            <div class="flex flex-col gap-4 mt-4">
              <mat-form-field class="w-full">
                <mat-label>{{ 'auth.newPassword' | t }}</mat-label>
                <input matInput [(ngModel)]="password" type="password" />
              </mat-form-field>
              <mat-form-field class="w-full">
                <mat-label>{{ 'auth.confirmPassword' | t }}</mat-label>
                <input matInput [(ngModel)]="confirm" type="password" />
              </mat-form-field>
              @if (error) {
                <p class="text-red-500 text-sm">{{ error }}</p>
              }
              <button mat-raised-button color="primary" class="w-full" (click)="submit()" [disabled]="loading">
                {{ 'auth.resetBtn' | t }}
              </button>
            </div>
          } @else {
            <div class="flex flex-col items-center gap-4 mt-4 text-center">
              <mat-icon class="!text-6xl !w-16 !h-16 text-green-500">lock_reset</mat-icon>
              <p>{{ 'auth.resetDone' | t }}</p>
              <a mat-raised-button color="primary" routerLink="/login">{{ 'auth.loginBtn' | t }}</a>
            </div>
          }
        </mat-card-content>
      </mat-card>
    </div>
  `,
})
export class ResetPassword implements OnInit {
  password = '';
  confirm = '';
  error = '';
  loading = false;
  done = false;
  private token = '';

  constructor(
    private route: ActivatedRoute,
    private auth: AuthService,
    public i18n: I18nService,
    private cdr: ChangeDetectorRef,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit() {
    this.token = this.route.snapshot.queryParamMap.get('token') || '';
  }

  submit() {
    if (this.password.length < 6) { this.error = this.i18n.t('auth.pwShort'); this.cdr.detectChanges(); return; }
    if (this.password !== this.confirm) { this.error = this.i18n.t('auth.pwNoMatch'); this.cdr.detectChanges(); return; }
    this.loading = true; this.error = '';
    this.cdr.detectChanges();
    this.auth.resetPassword(this.token, this.password).subscribe({
      next: () => { this.done = true; this.loading = false; this.cdr.detectChanges(); },
      error: (err) => {
        this.loading = false;
        this.error = err?.error?.message || this.i18n.t('common.error');
        this.cdr.detectChanges();
      },
    });
  }
}
