import { Component, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../core/auth.service';
import { I18nService } from '../../core/i18n.service';
import { TPipe } from '../../core/t.pipe';
import { UserRole } from '../../core/models';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    FormsModule, RouterLink, TPipe, MatInputModule, MatButtonModule, MatCardModule,
    MatFormFieldModule, MatSelectModule, MatIconModule, MatProgressSpinnerModule, MatSnackBarModule,
  ],
  templateUrl: './register.html',
})
export class Register {
  firstName = '';
  lastName = '';
  email = '';
  password = '';
  role: UserRole = 'client';
  error = '';
  loading = false;

  constructor(
    private auth: AuthService,
    public i18n: I18nService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private snackBar: MatSnackBar,
  ) {}

  // Real-time validation (spec 3.1.1)
  get emailValid(): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email);
  }
  get passwordValid(): boolean {
    return this.password.length >= 6;
  }

  register() {
    if (this.loading) return;
    if (!this.firstName.trim() || !this.lastName.trim() || !this.emailValid || !this.passwordValid) {
      this.error = this.i18n.t('common.error');
      this.cdr.detectChanges();
      return;
    }
    this.loading = true;
    this.error = '';
    this.cdr.detectChanges();

    this.auth.register({
      firstName: this.firstName,
      lastName: this.lastName,
      email: this.email,
      password: this.password,
      role: this.role,
    }).subscribe({
      next: (res) => {
        this.loading = false;
        this.cdr.detectChanges();
        this.snackBar.open(res.message, this.i18n.t('common.close'), { duration: 5000 });
        this.router.navigate(['/login']);
      },
      error: (err) => {
        this.error = err?.status === 409 ? 'Email already in use' : this.i18n.t('common.error');
        this.loading = false;
        this.cdr.detectChanges();
        this.snackBar.open(this.error, this.i18n.t('common.close'), { duration: 3000 });
      },
    });
  }
}
