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
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { UsersService } from '../core/users.service';
import { ManagedUser } from '../core/models';

@Component({
  selector: 'app-company-sub-accounts',
  standalone: true,
  imports: [TPipe, FormsModule, MatTableModule, MatButtonModule, MatIconModule, MatCardModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatSnackBarModule],
  templateUrl: './sub-accounts.html',
})
export class CompanySubAccounts implements OnInit {
  accounts: ManagedUser[] = [];
  showForm = false;
  form = { firstName: '', lastName: '', email: '', password: '', permissionLevel: 'catalog' };
  displayedColumns = ['name', 'email', 'permission'];

  constructor(private usersService: UsersService, private cdr: ChangeDetectorRef, private snackBar: MatSnackBar) {}

  ngOnInit() { this.load(); }

  load() {
    this.usersService.listSubAccounts().subscribe({ next: (data) => { this.accounts = [...data]; this.cdr.detectChanges(); } });
  }

  create() {
    if (!this.form.firstName || !this.form.email || this.form.password.length < 6) {
      this.snackBar.open('Please fill all fields (password min 6 chars)', 'Close', { duration: 3000 });
      return;
    }
    this.usersService.createSubAccount(this.form).subscribe({
      next: () => { this.snackBar.open('Employee account created', 'Close', { duration: 2000 }); this.showForm = false; this.load(); },
      error: (err) => this.snackBar.open(err?.error?.message || 'Error', 'Close', { duration: 3000 }),
    });
  }
}
