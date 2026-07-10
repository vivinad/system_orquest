import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Finanza, ResumenFinanzas } from '../Models/adm-finanza.model';

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
}
