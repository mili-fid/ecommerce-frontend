import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../core/auth.service';
import { TPipe } from '../../core/t.pipe';

@Component({
  selector: 'app-verify-email',
  standalone: true,
  imports: [RouterLink, TPipe, MatCardModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule],
  templateUrl: './verify-email.html',
})
export class VerifyEmail implements OnInit {
  state: 'loading' | 'success' | 'error' = 'loading';

  constructor(
    private route: ActivatedRoute,
    private auth: AuthService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    const token = this.route.snapshot.queryParamMap.get('token');
    if (!token) {
      this.state = 'error';
      return;
    }
    this.auth.verifyEmail(token).subscribe({
      next: () => { this.state = 'success'; this.cdr.detectChanges(); },
      error: () => { this.state = 'error'; this.cdr.detectChanges(); },
    });
  }
}
