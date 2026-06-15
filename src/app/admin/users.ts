import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { UsersService } from '../core/users.service';
import { I18nService } from '../core/i18n.service';
import { TPipe } from '../core/t.pipe';
import { ManagedUser } from '../core/models';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [
    FormsModule, TPipe, MatTableModule, MatButtonModule, MatIconModule, MatCardModule,
    MatFormFieldModule, MatSelectModule, MatInputModule, MatTooltipModule, MatMenuModule, MatSnackBarModule,
  ],
  templateUrl: './users.html',
})
export class AdminUsers implements OnInit {
  users: ManagedUser[] = [];
  filterRole = '';
  filterActive = '';
  editingColor: string | null = null;
  colorInput = '';
  displayedColumns = ['name', 'email', 'role', 'status', 'color', 'actions'];

  showCreate = false;
  newUser = { firstName: '', lastName: '', email: '', password: '', role: 'client', colorCode: '' };

  constructor(
    private usersService: UsersService,
    public i18n: I18nService,
    private cdr: ChangeDetectorRef,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit() { this.load(); }

  load() {
    this.usersService.list(this.filterRole, this.filterActive).subscribe({
      next: (data) => { this.users = [...data]; this.cdr.detectChanges(); },
    });
  }

  // Spec 2.1: admin creates accounts directly, any role
  create() {
    if (!this.newUser.firstName || !this.newUser.email || this.newUser.password.length < 6) {
      this.snackBar.open(this.i18n.t('common.error'), this.i18n.t('common.close'), { duration: 3000 });
      return;
    }
    this.usersService.createByAdmin(this.newUser).subscribe({
      next: () => {
        this.snackBar.open(this.i18n.t('admin.userCreated'), this.i18n.t('common.close'), { duration: 2500 });
        this.showCreate = false;
        this.newUser = { firstName: '', lastName: '', email: '', password: '', role: 'client', colorCode: '' };
        this.load();
      },
      error: (err) => this.snackBar.open(err?.error?.message || this.i18n.t('common.error'), this.i18n.t('common.close'), { duration: 3000 }),
    });
  }

  toggle(user: ManagedUser) {
    const verb = user.isActive ? 'deactivate' : 'activate';
    if (!confirm(`Are you sure you want to ${verb} ${user.firstName} ${user.lastName}?`)) return;
    const action = user.isActive ? this.usersService.deactivate(user._id) : this.usersService.activate(user._id);
    action.subscribe({
      next: () => { this.load(); },
      error: (err) => this.snackBar.open(err?.error?.message || this.i18n.t('common.error'), this.i18n.t('common.close'), { duration: 3000 }),
    });
  }

  saveColor(user: ManagedUser) {
    this.usersService.setColor(user._id, this.colorInput).subscribe({
      next: () => {
        this.editingColor = null;
        this.load();
      },
    });
  }

  setRole(user: ManagedUser, role: string) {
    this.usersService.setRole(user._id, role).subscribe({
      next: () => { this.snackBar.open(`Role changed to ${role}`, this.i18n.t('common.close'), { duration: 2000 }); this.load(); },
    });
  }

  remove(user: ManagedUser) {
    if (!confirm(`Delete ${user.firstName} ${user.lastName}?`)) return;
    this.usersService.remove(user._id).subscribe({
      next: () => { this.load(); },
    });
  }
}
