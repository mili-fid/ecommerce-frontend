# Multi-Role E-Commerce Platform — Frontend

Angular 22 + Angular Material + Tailwind CSS

## How to run

```powershell
npm install
ng serve
```

Then open http://localhost:4200

## Default admin login
email: admin@platform.com
password: admin123
(Created by npm run seed in the backend project)

## 4 role dashboards

| Role    | After login lands on        | Key pages                                   |
|---------|-----------------------------|---------------------------------------------|
| admin   | /admin/dashboard            | Users, Products validation, Stock requests, Orders |
| company | /company/products           | Products CRUD, Stock requests, Sub-accounts |
| client  | /catalog                    | Catalog, Cart + checkout, My orders         |
| driver  | /driver/board               | Pending/active orders, History + revenue    |

## Architecture notes
- Auth service: access token (15min) + refresh token (7d) in sessionStorage
- Interceptor: automatically adds Bearer token + silently refreshes on 401
- Role guard: each route locked to specific roles, redirects to correct dashboard
- Cart service: persists to sessionStorage across navigation
- All API calls in dedicated services (products, orders, users, stock-requests, cart)

## Phase 4 — Maps (Leaflet + OpenStreetMap, no API key)
- Checkout: interactive map, click to pin the delivery point or "Use my location";
  driver list re-sorts by distance with km + ETA shown
- Driver board: map with orange markers for pending orders (click for details),
  "Share my position" button so clients see real distances

## Phase 5 — Invoices
- My Orders: "Invoice PDF" button on every order (downloads via authenticated blob request)
- Admin Orders: invoice icon per row
- IMPORTANT: TypeScript dependency is now ~6.0.0 (required by Angular 22)

## Phase 6 — Dark mode, email verification, sales stats
- Dark mode toggle in the toolbar (sun/moon icon); preference saved in localStorage;
  switches both Tailwind (dark: utilities) and Angular Material (color-scheme)
- /verify-email page: target of the link sent in the registration email
- Company "My Products": sales performance cards (units sold, gross sales) + Sold column
- Dockerfile + nginx.conf: production build served by nginx (Angular routing handled)

## Phase 7 — Spec completion
- Multilingual EN/FR: toggle in toolbar, all main pages + admin/company headers translated
- Home page (spec 7.1): hero, featured products, category navigation
- Product detail page with star reviews (spec 3.2.1)
- Profile page: avatar (auto-resized), name, driver fee + zone
- Support tickets (user) + ticket management (admin)
- Admin dashboard: 7-day orders bar chart
- Admin users: direct account creation form
- Company products: photo upload (auto-resized), live search autocomplete in catalog
- Register: real-time email/password validation
