import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Paquete, Distrito, MusicoAdicional, ServicioExtra } from '../Models/mae-catalogo.model';
import { MOCK_PAQUETES, MOCK_DISTRITOS, MOCK_MUSICOS, MOCK_SERVICIOS } from './mae-datos-demo';

@Injectable({ providedIn: 'root' })
export class MaeCatalogoService {
  private http = inject(HttpClient);
  private apiURL = environment.url_api_maestras;

  // ---------- Lecturas (públicas) ----------
  listarPaquetes(): Observable<Paquete[]> {
    return environment.useMock
      ? of(MOCK_PAQUETES.filter(p => p.activo)).pipe(delay(150))
      : this.http.get<Paquete[]>(this.apiURL + 'paquete');
  }

  listarDistritos(): Observable<Distrito[]> {
    return environment.useMock
      ? of(MOCK_DISTRITOS).pipe(delay(150))
      : this.http.get<Distrito[]>(this.apiURL + 'distrito');
  }

  listarMusicos(): Observable<MusicoAdicional[]> {
    return environment.useMock
      ? of(MOCK_MUSICOS.filter(m => m.activo)).pipe(delay(150))
      : this.http.get<MusicoAdicional[]>(this.apiURL + 'musicoadicional');
  }

  listarServicios(): Observable<ServicioExtra[]> {
    return environment.useMock
      ? of(MOCK_SERVICIOS.filter(s => s.activo)).pipe(delay(150))
      : this.http.get<ServicioExtra[]>(this.apiURL + 'servicioextra');
  }

  // ---------- CRUD de Paquete (admin) ----------
  grabarPaquete(p: Partial<Paquete>): Observable<Paquete> {
    if (environment.useMock) {
      const nuevo: Paquete = {
        id: Math.max(0, ...MOCK_PAQUETES.map(x => x.id)) + 1,
        activo: true, horasBase: 5, numIntegrantes: 3, precioBase: 0, nombre: '', ...p,
      } as Paquete;
      MOCK_PAQUETES.push(nuevo);
      return of(nuevo).pipe(delay(150));
    }
    return this.http.post<Paquete>(this.apiURL + 'paquete', p);
  }

  actualizarPaquete(p: Paquete): Observable<void> {
    if (environment.useMock) {
      const i = MOCK_PAQUETES.findIndex(x => x.id === p.id);
      if (i >= 0) MOCK_PAQUETES[i] = { ...p };
      return of(void 0).pipe(delay(150));
    }
    return this.http.put<void>(this.apiURL + 'paquete/' + p.id, p);
  }

  eliminarPaquete(id: number): Observable<void> {
    if (environment.useMock) {
      const i = MOCK_PAQUETES.findIndex(x => x.id === id);
      if (i >= 0) MOCK_PAQUETES[i].activo = false;
      return of(void 0).pipe(delay(150));
    }
    return this.http.delete<void>(this.apiURL + 'paquete/' + id);
  }
}
