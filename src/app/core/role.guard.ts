import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';
import { UserRole } from './models';

// Usage in routes: canActivate: [authGuard, roleGuard(['admin'])]
export function roleGuard(allowed: UserRole[]): CanActivateFn {
  return () => {
    const auth = inject(AuthService);
    const router = inject(Router);
    const user = auth.getUser();
    if (user && allowed.includes(user.role)) return true;
    router.navigate([user ? auth.homeFor(user.role) : '/login']);
    return false;
  };
}
