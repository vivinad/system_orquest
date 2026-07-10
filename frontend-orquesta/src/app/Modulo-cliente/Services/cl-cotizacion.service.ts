import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, of, delay, map } from 'rxjs';
import { environment } from 'src/environments/environment';
import {
  CotizacionRequest, CotizacionResultado, Cotizacion, MusicoDetalle,
} from '../Models/cl-cotizacion.model';
import {
  MOCK_PAQUETES, MOCK_DISTRITOS, MOCK_MUSICOS, MOCK_SERVICIOS,
} from '../../Modulo-maestros/Services/mae-datos-demo';

const DIAS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

// Cotizaciones en memoria (vista admin) cuando useMock = true
const MOCK_COTIZACIONES: Cotizacion[] = [];

@Injectable({ providedIn: 'root' })
export class ClCotizacionService {
  private http = inject(HttpClient);
  private apiURL = environment.url_api + 'cotizacion';

  /** Previsualizar el precio (en vivo). */
  calcular(req: CotizacionRequest): Observable<CotizacionResultado> {
    return environment.useMock
      ? of(this.calcularLocal(req)).pipe(delay(100))
      : this.http.post<CotizacionResultado>(this.apiURL + '/calcular', req);
  }

  /** Crear la cotización (estado 'pendiente'). */
  crear(req: CotizacionRequest): Observable<Cotizacion> {
    if (environment.useMock) {
      const r = this.calcularLocal(req);
      const paq = MOCK_PAQUETES.find(p => p.id === req.paqueteId);
      const dis = MOCK_DISTRITOS.find(d => d.id === req.distritoId);
      const nueva: Cotizacion = {
        id: Math.max(0, ...MOCK_COTIZACIONES.map(c => c.id)) + 1,
        nombreCliente: req.nombreCliente, telefonoCliente: req.telefonoCliente, emailCliente: req.emailCliente,
        paqueteId: req.paqueteId, distritoId: req.distritoId, fechaEvento: req.fechaEvento,
        diaSemana: r.diaSemana, horasSolicitadas: req.horasSolicitadas,
        costoPaquete: r.costoPaquete, costoMusicosExtra: r.costoMusicosExtra, costoMovilidad: r.costoMovilidad,
        subtotal: r.subtotal, total: r.total, estado: 'pendiente',
        tieneATratar: r.tieneATratar, motivoATratar: r.motivoATratar, observaciones: req.observaciones,
        fechaCreacion: new Date().toISOString(),
        paquete: paq ? { id: paq.id, nombre: paq.nombre } : undefined,
        distrito: dis ? { id: dis.id, nombre: dis.nombre } : undefined,
      };
      MOCK_COTIZACIONES.unshift(nueva);
      return of(nueva).pipe(delay(200));
    }
    return this.http.post<Cotizacion>(this.apiURL, req);
  }

  // ---------- Admin ----------
  listar(estado?: string): Observable<Cotizacion[]> {
    if (environment.useMock) {
      const lista = estado ? MOCK_COTIZACIONES.filter(c => c.estado === estado) : MOCK_COTIZACIONES;
      return of([...lista]).pipe(delay(150));
    }
    const url = estado ? `${this.apiURL}?estado=${estado}` : this.apiURL;
    return this.http.get<Cotizacion[]>(url);
  }

  cambiarEstado(id: number, estado: string, observaciones?: string): Observable<void> {
    if (environment.useMock) {
      const c = MOCK_COTIZACIONES.find(x => x.id === id);
      if (c) { c.estado = estado; if (observaciones != null) c.observaciones = observaciones; }
      return of(void 0).pipe(delay(150));
    }
    return this.http.put<void>(`${this.apiURL}/${id}/estado`, { estado, observaciones });
  }

  /** Descarga el contrato PDF de una cotización ya creada. */
  descargarContrato(id: number): Observable<Blob> {
    return this.http.get(`${this.apiURL}/${id}/contrato`, { responseType: 'blob' });
  }

  contarPendientes(): Observable<number> {
    return environment.useMock
      ? of(MOCK_COTIZACIONES.filter(c => c.estado === 'pendiente').length).pipe(delay(100))
      : this.listar('pendiente').pipe(map(lista => lista.length));
  }

  // ---------- Cálculo local (espejo del backend) ----------
  private calcularLocal(req: CotizacionRequest): CotizacionResultado {
    const paquete = MOCK_PAQUETES.find(p => p.id === req.paqueteId);
    const distrito = MOCK_DISTRITOS.find(d => d.id === req.distritoId);
    const fecha = new Date(req.fechaEvento + 'T00:00:00');
    const dow = fecha.getDay();
    const finDeSemana = dow === 0 || dow === 6;
    const horas = req.horasSolicitadas;
    const motivos: string[] = [];

    const horasBase = paquete && paquete.horasBase > 0 ? paquete.horasBase : 5;
    const precioPorHora = paquete ? paquete.precioBase / horasBase : 0;
    const costoPaquete = Math.round(precioPorHora * horas * 100) / 100;

    if (finDeSemana && horas === 4) {
      motivos.push('Un evento de 4 horas en fin de semana se coordina directamente con la encargada.');
    }

    let costoMusicos = 0;
    const detalle: MusicoDetalle[] = [];
    for (const sel of req.musicos) {
      if (sel.cantidad <= 0) continue;
      const m = MOCK_MUSICOS.find(x => x.id === sel.musicoId);
      if (!m) continue;
      costoMusicos += m.precioAdicional * sel.cantidad;
      detalle.push({ musicoId: m.id, cantidad: sel.cantidad, precioAplicado: m.precioAdicional });
    }

    if (distrito?.esATratar) {
      motivos.push(`El distrito '${distrito.nombre}' está fuera de Lima Metropolitana; la movilidad se coordina directamente.`);
    }

    for (const id of req.serviciosExtra) {
      const s = MOCK_SERVICIOS.find(x => x.id === id);
      if (s && !s.tienePrecioFijo) {
        motivos.push(`El servicio '${s.nombre}' se coordina/cotiza directamente con el proveedor.`);
      }
    }

    const movilidad = distrito?.costoMovilidad ?? 0;
    const subtotal = costoPaquete + costoMusicos + movilidad;

    return {
      diaSemana: DIAS[dow],
      costoPaquete,
      costoMusicosExtra: costoMusicos,
      costoMovilidad: movilidad,
      subtotal,
      total: subtotal,
      tieneATratar: motivos.length > 0,
      motivoATratar: motivos.length ? motivos.join(' ') : undefined,
      musicosDetalle: detalle,
    };
  }
}
