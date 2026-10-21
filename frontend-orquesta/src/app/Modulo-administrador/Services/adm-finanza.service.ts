import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, of, delay, forkJoin, finalize } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Finanza, ResumenFinanzas } from '../Models/adm-finanza.model';
import { Cotizacion } from '../../Modulo-cliente/Models/cl-cotizacion.model';

const MOCK_FINANZAS: Finanza[] = [];

@Injectable({ providedIn: 'root' })
export class AdmFinanzaService {
  private http = inject(HttpClient);
  private apiURL = environment.url_api + 'finanza';

  obtenerResumen(): Observable<ResumenFinanzas> {
    if (environment.useMock) {
      const ingresos = MOCK_FINANZAS.filter(f => f.tipo === 'ingreso').reduce((s, f) => s + f.monto, 0);
      const gastos = MOCK_FINANZAS.filter(f => f.tipo === 'gasto').reduce((s, f) => s + f.monto, 0);
      return of({ ingresos, gastos, balance: ingresos - gastos }).pipe(delay(150));
    }
    return this.http.get<ResumenFinanzas>(`${this.apiURL}/resumen`);
  }

  listar(): Observable<Finanza[]> {
    return environment.useMock
      ? of([...MOCK_FINANZAS]).pipe(delay(150))
      : this.http.get<Finanza[]>(this.apiURL);
  }

  crear(f: Partial<Finanza>): Observable<Finanza> {
    if (environment.useMock) {
      const nueva: Finanza = {
        id: Math.max(0, ...MOCK_FINANZAS.map(x => x.id)) + 1,
        adminId: 1, tipo: 'ingreso', monto: 0, descripcion: '',
        fecha: new Date().toISOString().slice(0, 10), ...f,
      } as Finanza;
      MOCK_FINANZAS.unshift(nueva);
      return of(nueva).pipe(delay(150));
    }
    return this.http.post<Finanza>(this.apiURL, f);
  }

  actualizar(f: Finanza): Observable<void> {
    if (environment.useMock) {
      const i = MOCK_FINANZAS.findIndex(x => x.id === f.id);
      if (i >= 0) MOCK_FINANZAS[i] = { ...f };
      return of(void 0).pipe(delay(150));
    }
    // Solo los campos del modelo (sin navegaciones que devuelve el GET)
    const payload: Finanza = {
      id: f.id, adminId: f.adminId, cotizacionId: f.cotizacionId,
      tipo: f.tipo, monto: f.monto, descripcion: f.descripcion,
      categoria: f.categoria, fecha: f.fecha,
    };
    return this.http.put<void>(`${this.apiURL}/${f.id}`, payload);
  }

  eliminar(id: number): Observable<void> {
    if (environment.useMock) {
      const i = MOCK_FINANZAS.findIndex(x => x.id === id);
      if (i >= 0) MOCK_FINANZAS.splice(i, 1);
      return of(void 0).pipe(delay(150));
    }
    return this.http.delete<void>(`${this.apiURL}/${id}`);
  }

  // ---------- Pagos automáticos de cotizaciones ----------
  /** Cotizaciones cuyo pago se está registrando (evita duplicados si dos pantallas lo piden a la vez) */
  private enCurso = new Set<number>();

  /** Lo cobrado de una cotización = suma de ingresos vinculados a ella */
  cobradoDe(cotizacionId: number, finanzas: Finanza[]): number {
    return finanzas
      .filter(f => f.tipo === 'ingreso' && f.cotizacionId === cotizacionId)
      .reduce((s, f) => s + (f.monto || 0), 0);
  }

  /**
   * Una cotización "pagada" o "realizada" está cobrada por completo: si aún tiene saldo
   * en Finanzas, se registra automáticamente el ingreso que falta (vinculado a la cotización).
   * Devuelve los movimientos creados.
   */
  conciliarPagos(cotizaciones: Cotizacion[], finanzas: Finanza[]): Observable<Finanza[]> {
    const hoy = new Date();
    const fecha = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}-${String(hoy.getDate()).padStart(2, '0')}`;
    const pendientes = cotizaciones
      .filter(c => (c.estado === 'pagada' || c.estado === 'realizada') && !this.enCurso.has(c.id))
      .map(c => {
        const cobrado = this.cobradoDe(c.id, finanzas);
        return { c, cobrado, saldo: Math.round(((c.total || 0) - cobrado) * 100) / 100 };
      })
      .filter(x => x.saldo > 0);
    if (!pendientes.length) return of([]);

    pendientes.forEach(x => this.enCurso.add(x.c.id));
    return forkJoin(pendientes.map(({ c, cobrado, saldo }) => {
      const tipo = (c.tipoEvento || '').trim().toLowerCase();
      return this.crear({
        tipo: 'ingreso',
        monto: saldo,
        categoria: 'Pago completo',
        descripcion: `${cobrado > 0 ? 'Saldo' : 'Pago'} ${tipo ? tipo + ' ' : ''}${c.nombreCliente} (COT-${c.id})`.slice(0, 255),
        cotizacionId: c.id,
        fecha,
      });
    })).pipe(finalize(() => pendientes.forEach(x => this.enCurso.delete(x.c.id))));
  }
}
