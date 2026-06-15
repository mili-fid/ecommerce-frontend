import { Component, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../core/auth.service';
import { I18nService } from '../../core/i18n.service';
import { TPipe } from '../../core/t.pipe';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    FormsModule, RouterLink, TPipe, MatInputModule, MatButtonModule, MatCardModule,
    MatFormFieldModule, MatProgressSpinnerModule, MatSnackBarModule,
  ],
  templateUrl: './login.html',
})
export class Login {
  email = '';
  password = '';
  error = '';
  loading = false;

  constructor(
    private auth: AuthService,
    public i18n: I18nService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private snackBar: MatSnackBar,
  ) {}

  login() {
    if (this.loading) return;
    if (!this.email.trim() || !this.password.trim()) {
      this.error = this.i18n.t('auth.invalidCreds');
      this.cdr.detectChanges();
      return;
    }
    this.loading = true;
    this.error = '';
    this.cdr.detectChanges();

    this.auth.login(this.email, this.password).subscribe({
      next: (res) => {
        this.loading = false;
        this.cdr.detectChanges();
        this.router.navigate([this.auth.homeFor(res.user.role)]);
      },
      error: (err) => {
        this.error = err?.error?.message || this.i18n.t('auth.invalidCreds');
        this.loading = false;
        this.cdr.detectChanges();
        this.snackBar.open(this.error, this.i18n.t('common.close'), { duration: 3000 });
      },
    });
  }
}
