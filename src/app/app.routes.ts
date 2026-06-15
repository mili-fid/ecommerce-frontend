import { Routes } from '@angular/router';
import { authGuard } from './core/auth.guard';
import { roleGuard } from './core/role.guard';

export const routes: Routes = [
  // Public
  { path: 'login', loadComponent: () => import('./auth/login/login').then((m) => m.Login) },
  { path: 'register', loadComponent: () => import('./auth/register/register').then((m) => m.Register) },
  { path: 'verify-email', loadComponent: () => import('./auth/verify-email/verify-email').then((m) => m.VerifyEmail) },
  { path: 'payment/paypal-return', loadComponent: () => import('./client/payment-return/payment-return').then((m) => m.PaymentReturn) },
  { path: 'forgot-password', loadComponent: () => import('./auth/forgot-password/forgot-password').then((m) => m.ForgotPassword) },
  { path: 'reset-password', loadComponent: () => import('./auth/reset-password/reset-password').then((m) => m.ResetPassword) },

  // Everything inside the shell shares the top navigation
  {
    path: '',
    loadComponent: () => import('./shell/shell').then((m) => m.Shell),
    children: [
      // Home + catalog are PUBLIC per spec 2.3 (browse without login, login required to order)
      { path: 'home', loadComponent: () => import('./client/home/home').then((m) => m.Home) },
      { path: 'catalog', loadComponent: () => import('./client/catalog').then((m) => m.Catalog) },
      { path: 'catalog/:id', loadComponent: () => import('./client/product-detail/product-detail').then((m) => m.ProductDetail) },

      // Any logged-in role
      {
        path: 'profile',
        canActivate: [authGuard],
        loadComponent: () => import('./shared/profile/profile').then((m) => m.Profile),
      },
      {
        path: 'support',
        canActivate: [authGuard, roleGuard(['client', 'company', 'driver'])],
        loadComponent: () => import('./shared/support/support').then((m) => m.Support),
      },

      // Client
      {
        path: 'cart',
        canActivate: [authGuard, roleGuard(['client'])],
        loadComponent: () => import('./client/cart').then((m) => m.Cart),
      },
      {
        path: 'my-orders',
        canActivate: [authGuard, roleGuard(['client'])],
        loadComponent: () => import('./client/my-orders').then((m) => m.MyOrders),
      },

      // Admin
      {
        path: 'admin/dashboard',
        canActivate: [authGuard, roleGuard(['admin'])],
        loadComponent: () => import('./admin/dashboard').then((m) => m.AdminDashboard),
      },
      {
        path: 'admin/users',
        canActivate: [authGuard, roleGuard(['admin'])],
        loadComponent: () => import('./admin/users').then((m) => m.AdminUsers),
      },
      {
        path: 'admin/products',
        canActivate: [authGuard, roleGuard(['admin'])],
        loadComponent: () => import('./admin/products').then((m) => m.AdminProducts),
      },
      {
        path: 'admin/stock-requests',
        canActivate: [authGuard, roleGuard(['admin'])],
        loadComponent: () => import('./admin/stock-requests').then((m) => m.AdminStockRequests),
      },
      {
        path: 'admin/offers',
        canActivate: [authGuard, roleGuard(['admin'])],
        loadComponent: () => import('./admin/offers').then((m) => m.AdminOffers),
      },
      {
        path: 'admin/tickets',
        canActivate: [authGuard, roleGuard(['admin'])],
        loadComponent: () => import('./admin/tickets').then((m) => m.AdminTickets),
      },
      {
        path: 'admin/audit',
        canActivate: [authGuard, roleGuard(['admin'])],
        loadComponent: () => import('./admin/audit').then((m) => m.AdminAudit),
      },
      {
        path: 'admin/orders',
        canActivate: [authGuard, roleGuard(['admin'])],
        loadComponent: () => import('./admin/orders').then((m) => m.AdminOrders),
      },

      // Company
      {
        path: 'company/dashboard',
        canActivate: [authGuard, roleGuard(['company'])],
        loadComponent: () => import('./company/dashboard').then((m) => m.CompanyDashboard),
      },
      {
        path: 'company/products',
        canActivate: [authGuard, roleGuard(['company'])],
        loadComponent: () => import('./company/products').then((m) => m.CompanyProducts),
      },
      {
        path: 'company/stock-requests',
        canActivate: [authGuard, roleGuard(['company'])],
        loadComponent: () => import('./company/stock-requests').then((m) => m.CompanyStockRequests),
      },
      {
        path: 'company/offers',
        canActivate: [authGuard, roleGuard(['company'])],
        loadComponent: () => import('./company/offers').then((m) => m.CompanyOffers),
      },
      {
        path: 'company/sub-accounts',
        canActivate: [authGuard, roleGuard(['company'])],
        loadComponent: () => import('./company/sub-accounts').then((m) => m.CompanySubAccounts),
      },

      // Driver
      {
        path: 'driver/board',
        canActivate: [authGuard, roleGuard(['driver'])],
        loadComponent: () => import('./driver/board').then((m) => m.DriverBoard),
      },
      {
        path: 'driver/history',
        canActivate: [authGuard, roleGuard(['driver'])],
        loadComponent: () => import('./driver/history').then((m) => m.DriverHistory),
      },

      { path: '', pathMatch: 'full', redirectTo: 'home' },
    ],
  },

  { path: '**', redirectTo: 'home' },
];
