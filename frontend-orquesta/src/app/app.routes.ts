import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  // ---------- Zona pública (cliente) ----------
  {
    path: '',
    loadComponent: () =>
      import('./Modulo-cliente/Components/cl-home/cl-home.component').then(m => m.ClHomeComponent),
  },
  {
    path: 'cotizar',
    loadComponent: () =>
      import('./Modulo-cliente/Components/cl-cotizador/cl-cotizador.component').then(m => m.ClCotizadorComponent),
  },

  // ---------- Login ----------
  {
    path: 'login',
    loadComponent: () =>
      import('./Modulo-seguridad/Components/seg-login/seg-login.component').then(m => m.SegLoginComponent),
  },

  // ---------- Zona administrativa ----------
  {
    path: 'main',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./Modulo-administrador/Components/adm-layout/adm-layout.component').then(m => m.AdmLayoutComponent),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./Modulo-administrador/Components/adm-dashboard/adm-dashboard.component').then(m => m.AdmDashboardComponent),
      },
      {
        path: 'cotizaciones',
        loadComponent: () =>
          import('./Modulo-administrador/Components/adm-cotizacion-listar/adm-cotizacion-listar.component').then(m => m.AdmCotizacionListarComponent),
      },
      {
        path: 'finanzas',
        loadComponent: () =>
          import('./Modulo-administrador/Components/adm-finanzas/adm-finanzas.component').then(m => m.AdmFinanzasComponent),
      },
      {
        path: 'catalogo',
        loadComponent: () =>
          import('./Modulo-maestros/Components/mae-paquete-listar/mae-paquete-listar.component').then(m => m.MaePaqueteListarComponent),
      },
      {
        path: 'eventos',
        loadComponent: () =>
          import('./Modulo-maestros/Components/mae-evento-listar/mae-evento-listar.component').then(m => m.MaeEventoListarComponent),
      },
    ],
  },

  { path: '**', redirectTo: '' },
];
