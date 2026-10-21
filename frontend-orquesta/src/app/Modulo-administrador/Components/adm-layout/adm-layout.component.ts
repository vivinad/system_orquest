import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Subscription, filter } from 'rxjs';
import { UserContextService } from '../../../Modulo-seguridad/Services/user-context.service';
import { SegLoginService } from '../../../Modulo-seguridad/Services/seg-login.service';
import { ClCotizacionService } from '../../../Modulo-cliente/Services/cl-cotizacion.service';
import { TemaService } from '../../../Modulo-seguridad/Services/tema.service';

interface ItemMenu { ruta: string; texto: string; icono: string; }

@Component({
  selector: 'adm-layout',
  standalone: true,
  imports: [FormsModule, RouterOutlet, RouterLink, RouterLinkActive, MatIconModule, MatTooltipModule],
  templateUrl: './adm-layout.component.html',
  styleUrls: ['./adm-layout.component.css'],
})
export class AdmLayoutComponent implements OnInit, OnDestroy {
  userContext = inject(UserContextService);
  tema = inject(TemaService);
  private loginService = inject(SegLoginService);
  private cotizacionService = inject(ClCotizacionService);
  private router = inject(Router);
  private sub?: Subscription;

  readonly menu: ItemMenu[] = [
    { ruta: '/main/dashboard', texto: 'Dashboard', icono: 'dashboard' },
    { ruta: '/main/cotizaciones', texto: 'Cotizaciones', icono: 'request_quote' },
    { ruta: '/main/finanzas', texto: 'Finanzas', icono: 'account_balance_wallet' },
    { ruta: '/main/catalogo', texto: 'Catálogo', icono: 'inventory_2' },
    { ruta: '/main/eventos', texto: 'Eventos', icono: 'event' },
    { ruta: '/main/contenido', texto: 'Contenido Web', icono: 'perm_media' },
  ];

  pendientes = 0;
  menuAbierto = false;
  busqueda = '';
  /** Tercer nivel de la ruta de navegación (lo define cada pantalla con data.miga) */
  miga = '';

  get nombre(): string { return this.userContext.user$.value?.nombre || 'Administradora'; }
  get rol(): string {
    const r = (this.userContext.user$.value?.rol || 'admin').toLowerCase();
    return r === 'admin' || r === 'administrador' ? 'Administradora' : r.charAt(0).toUpperCase() + r.slice(1);
  }

  ngOnInit(): void {
    // Tamaño de letra más compacto solo dentro del panel (la web pública no cambia)
    document.documentElement.classList.add('adm-html');
    this.actualizarPendientes();
    this.leerMiga();
    this.sub = this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe(() => {
        this.actualizarPendientes();
        this.leerMiga();
        this.menuAbierto = false;
      });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
    document.documentElement.classList.remove('adm-html');
  }

  private leerMiga(): void {
    let r = this.router.routerState.snapshot.root;
    while (r.firstChild) r = r.firstChild;
    this.miga = r.data?.['miga'] ?? '';
  }

  /** El contador se refresca al cambiar de pantalla (p. ej. tras atender una cotización) */
  private actualizarPendientes(): void {
    this.cotizacionService.contarPendientes().subscribe({
      next: n => (this.pendientes = n),
      error: () => (this.pendientes = 0),
    });
  }

  /** Busca en las cotizaciones (cliente, DNI, distrito, local, código…) */
  buscar(): void {
    const q = this.busqueda.trim();
    this.router.navigate(['/main/cotizaciones'], { queryParams: q ? { q } : {} });
  }

  salir(): void {
    this.loginService.logout();
    this.router.navigate(['/login']);
  }
}
