import { Routes } from '@angular/router';
import { guestGuard } from './core/guards/guest.guard';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'products',
    pathMatch: 'full',
  },
  {
    path: 'products',
    loadComponent: () =>
      import('./features/products/products-page/products-page').then((m) => m.ProductsPage),
  },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login').then((m) => m.Login),
    canActivate: [guestGuard],
  },
  {
    path: 'products/:id',
    loadComponent: () =>
      import('./features/products/product-detail-page/product-detail-page').then(
        (m) => m.ProductDetailPage,
      ),
  },
  {
    path: '**',
    redirectTo: 'products',
  },
];
