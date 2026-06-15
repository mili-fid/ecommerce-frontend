import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { UsersService } from '../../core/users.service';
import { AuthService } from '../../core/auth.service';
import { I18nService } from '../../core/i18n.service';
import { TPipe } from '../../core/t.pipe';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [FormsModule, TPipe, MatCardModule, MatButtonModule, MatIconModule, MatFormFieldModule, MatInputModule, MatSnackBarModule],
  templateUrl: './profile.html',
})
export class Profile implements OnInit {
  firstName = '';
  lastName = '';
  avatar = '';
  role = '';
  deliveryFee = 0;
  zone = '';
  companyAddress = '';
  saving = false;

  // Change password section
  showPwForm = false;
  currentPw = '';
  newPw = '';
  confirmPw = '';

  constructor(
    private usersService: UsersService,
    private authService: AuthService,
    public i18n: I18nService,
    private cdr: ChangeDetectorRef,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit() {
    this.usersService.me().subscribe({
      next: (u) => {
        this.firstName = u.firstName;
        this.lastName = u.lastName;
        this.avatar = u.avatar || '';
        this.role = u.role;
        this.deliveryFee = u.deliveryFee || 0;
        this.zone = u.zone || '';
        this.companyAddress = u.companyAddress || '';
        this.cdr.detectChanges();
      },
    });
  }

  get initial(): string {
    return (this.firstName?.[0] || '?').toUpperCase();
  }

  // Image optimization (spec 5.1): resized client-side before upload
  onFile(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const size = 200;
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d')!;
        const min = Math.min(img.width, img.height);
        ctx.drawImage(img, (img.width - min) / 2, (img.height - min) / 2, min, min, 0, 0, size, size);
        this.avatar = canvas.toDataURL('image/webp', 0.8);
        this.cdr.detectChanges();
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  }

  changePassword() {
    if (this.newPw.length < 6) {
      this.snackBar.open(this.i18n.t('auth.pwShort'), this.i18n.t('common.close'), { duration: 3000 });
      return;
    }
    if (this.newPw !== this.confirmPw) {
      this.snackBar.open(this.i18n.t('auth.pwNoMatch'), this.i18n.t('common.close'), { duration: 3000 });
      return;
    }
    this.authService.changePassword(this.currentPw, this.newPw).subscribe({
      next: () => {
        this.snackBar.open(this.i18n.t('profile.pwChanged'), this.i18n.t('common.close'), { duration: 2500 });
        this.showPwForm = false;
        this.currentPw = ''; this.newPw = ''; this.confirmPw = '';
        this.cdr.detectChanges();
      },
      error: (err) => this.snackBar.open(err?.error?.message || this.i18n.t('common.error'), this.i18n.t('common.close'), { duration: 3000 }),
    });
  }

  save() {
    if (this.saving) return;
    this.saving = true;
    this.cdr.detectChanges();
    const payload: any = { firstName: this.firstName, lastName: this.lastName, avatar: this.avatar };
    if (this.role === 'driver') {
      payload.deliveryFee = this.deliveryFee;
      payload.zone = this.zone;
    }
    if (this.role === 'company') {
      payload.companyAddress = this.companyAddress;
    }
    this.usersService.updateMe(payload).subscribe({
      next: (u) => {
        this.saving = false;
        this.cdr.detectChanges();
        // keep the toolbar in sync
        const stored = JSON.parse(sessionStorage.getItem('user') || '{}');
        sessionStorage.setItem('user', JSON.stringify({ ...stored, firstName: u.firstName, lastName: u.lastName, avatar: u.avatar }));
        this.snackBar.open(this.i18n.t('profile.saved'), this.i18n.t('common.close'), { duration: 2500 });
      },
      error: () => {
        this.saving = false;
        this.cdr.detectChanges();
        this.snackBar.open(this.i18n.t('common.error'), this.i18n.t('common.close'), { duration: 3000 });
      },
    });
  }
}
