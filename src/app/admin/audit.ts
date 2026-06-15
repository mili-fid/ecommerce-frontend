import { TPipe } from '../core/t.pipe';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { AuditService } from '../core/audit.service';
import { AuditEntry } from '../core/models';

@Component({
  selector: 'app-admin-audit',
  standalone: true,
  imports: [TPipe, DatePipe, MatTableModule, MatCardModule],
  templateUrl: './audit.html',
})
export class AdminAudit implements OnInit {
  entries: AuditEntry[] = [];
  displayedColumns = ['date', 'admin', 'action', 'details'];

  constructor(private auditService: AuditService, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.auditService.list().subscribe({
      next: (data) => { this.entries = [...data]; this.cdr.detectChanges(); },
    });
  }
}
