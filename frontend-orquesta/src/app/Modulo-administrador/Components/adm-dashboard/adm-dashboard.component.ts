import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AdmFinanzaService } from '../../Services/adm-finanza.service';
import { ClCotizacionService } from '../../../Modulo-cliente/Services/cl-cotizacion.service';
import { UserContextService } from '../../../Modulo-seguridad/Services/user-context.service';
import { Finanza } from '../../Models/adm-finanza.model';
import { Cotizacion } from '../../../Modulo-cliente/Models/cl-cotizacion.model';
import {
  monto, soles, aFecha, hoyIso, isoDe, mesDe, nombreMes, nombreMesTitulo, mesCorto, nombreDia, fechaMedia,
  diasHasta, iniciales, ultimosMeses, mesAnterior, rangoHoras,
} from '../../Services/adm-formato';

type FiltroTabla = 'activas' | 'pendiente' | 'confirmada';

@Component({
  selector: 'adm-dashboard',
  standalone: true,
  imports: [FormsModule, RouterLink, MatIconModule, MatTooltipModule],
  templateUrl: './adm-dashboard.component.html',
  styleUrls: ['./adm-dashboard.component.css'],
})
export class AdmDashboardComponent implements OnInit {
  private finanzaService = inject(AdmFinanzaService);
  private cotizacionService = inject(ClCotizacionService);
  private userContext = inject(UserContextService);

  finanzas: Finanza[] = [];
  cotizaciones: Cotizacion[] = [];
  cargando = true;

  /** '' = todo el historial; 'yyyy-MM' = un mes */
  readonly mesActual = hoyIso().slice(0, 7);
  mes = this.mesActual;
  readonly meses = ultimosMeses(12).reverse();
  readonly anio = new Date().getFullYear();
  filtroTabla: FiltroTabla = 'activas';

  readonly monto = monto;
  readonly soles = soles;
  readonly fechaMedia = fechaMedia;
  readonly iniciales = iniciales;

  get nombre(): string {
    return (this.userContext.user$.value?.nombre || '').trim().split(/\s+/)[0] || 'Admin';
  }

  etiquetaMes(m: string): string {
    return m === this.mesActual ? `Este mes – ${nombreMesTitulo(m)}` : nombreMesTitulo(m);
  }

  ngOnInit(): void {
    let pendientesDeCarga = 2;
    let finanzasOk = false;
    const listo = () => {
      if (--pendientesDeCarga > 0) return;
      this.cargando = false;
      // Cotizaciones pagadas/realizadas con saldo: su pago se registra solo en Finanzas
      if (finanzasOk) {
        this.finanzaService.conciliarPagos(this.cotizaciones, this.finanzas).subscribe({
          next: creados => { if (creados.length) this.finanzas = [...this.finanzas, ...creados]; },
          error: () => {},
        });
      }
    };
    this.finanzaService.listar().subscribe({ next: l => { this.finanzas = l; finanzasOk = true; listo(); }, error: listo });
    this.cotizacionService.listar().subscribe({ next: l => { this.cotizaciones = l; listo(); }, error: listo });
  }

  // ---------- KPIs de finanzas ----------
  private suma(tipo: 'ingreso' | 'gasto', mes: string): number {
    return this.finanzas
      .filter(f => f.tipo === tipo && (!mes || mesDe(f.fecha) === mes))
      .reduce((s, f) => s + (f.monto || 0), 0);
  }
  get ingresos(): number { return this.suma('ingreso', this.mes); }
  get gastos(): number { return this.suma('gasto', this.mes); }
  get balance(): number { return this.ingresos - this.gastos; }
  get margen(): number { return this.ingresos > 0 ? Math.round((this.balance / this.ingresos) * 100) : 0; }

  /** Variación % de ingresos frente al mes anterior (null si no aplica) */
  get variacionIngresos(): number | null {
    if (!this.mes) return null;
    const previo = this.suma('ingreso', mesAnterior(this.mes));
    if (!previo) return null;
    return Math.round(((this.ingresos - previo) / previo) * 1000) / 10;
  }
  get mesAnteriorCorto(): string {
    return this.mes ? nombreMes(mesAnterior(this.mes)).slice(0, 3) : '';
  }

  /** Categorías de gasto con más monto en el periodo, p. ej. "Pago a músicos, Transporte" */
  get categoriasGasto(): string {
    const acc: Record<string, number> = {};
    for (const f of this.finanzas.filter(x => x.tipo === 'gasto' && (!this.mes || mesDe(x.fecha) === this.mes))) {
      const c = f.categoria || 'Otros';
      acc[c] = (acc[c] || 0) + f.monto;
    }
    const top = Object.entries(acc).sort((a, b) => b[1] - a[1]).slice(0, 2).map(e => e[0]);
    return top.length ? top.join(', ') : 'Sin gastos registrados';
  }

  /** Línea acumulada día a día del periodo (para la mini gráfica) */
  linea(tipo: 'ingreso' | 'gasto'): string {
    const ref = this.mes ? aFecha(this.mes + '-01')! : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const dias = new Date(ref.getFullYear(), ref.getMonth() + 1, 0).getDate();
    const clave = isoDe(ref).slice(0, 7);
    const porDia = new Array(dias).fill(0);
    for (const f of this.finanzas) {
      if (f.tipo !== tipo || mesDe(f.fecha) !== clave) continue;
      const d = aFecha(f.fecha)!.getDate();
      porDia[d - 1] += f.monto;
    }
    let acum = 0;
    const valores = porDia.map(v => (acum += v));
    const max = Math.max(acum, 1);
    return valores.map((v, i) => `${(i / (dias - 1)) * 80},${22 - (v / max) * 20}`).join(' ');
  }
  puntoFinal(tipo: 'ingreso' | 'gasto'): { x: number; y: number } {
    const pts = this.linea(tipo).split(' ');
    const [x, y] = pts[pts.length - 1].split(',').map(Number);
    return { x, y };
  }

  // ---------- Cotizaciones ----------
  private esActiva(c: Cotizacion): boolean { return ['pendiente', 'confirmada', 'pagada'].includes(c.estado); }
  get activas(): number { return this.cotizaciones.filter(c => this.esActiva(c)).length; }
  contar(estado: string): number { return this.cotizaciones.filter(c => c.estado === estado).length; }
  get cerradas(): number { return this.contar('confirmada') + this.contar('pagada'); }

  private filtradasTabla(): Cotizacion[] {
    return this.cotizaciones.filter(c =>
      this.filtroTabla === 'activas' ? this.esActiva(c) : c.estado === this.filtroTabla);
  }
  get porAtender(): Cotizacion[] {
    return [...this.filtradasTabla()]
      .sort((a, b) => (b.fechaCreacion || '').localeCompare(a.fechaCreacion || ''))
      .slice(0, 5);
  }
  get totalTabla(): number { return this.filtradasTabla().length; }

  /** Cuánto se cobró de una cotización (ingresos vinculados); una cotización "pagada" cuenta como 100 % */
  pctCobrado(c: Cotizacion): number {
    const cobrado = this.finanzas
      .filter(f => f.tipo === 'ingreso' && f.cotizacionId === c.id)
      .reduce((s, f) => s + f.monto, 0);
    return c.total > 0 ? Math.min(100, Math.round((cobrado / c.total) * 100)) : 0;
  }
  saldo(c: Cotizacion): number { return Math.max(0, Math.round(c.total * (1 - this.pctCobrado(c) / 100))); }

  get proximas(): Cotizacion[] {
    const hoy = hoyIso();
    return this.cotizaciones
      .filter(c => (c.estado === 'confirmada' || c.estado === 'pagada') && (c.fechaEvento || '').slice(0, 10) >= hoy)
      .sort((a, b) => a.fechaEvento.localeCompare(b.fechaEvento))
      .slice(0, 4);
  }

  diaNum(c: Cotizacion): number { return aFecha(c.fechaEvento)?.getDate() ?? 0; }
  mesTxt(c: Cotizacion): string { const d = aFecha(c.fechaEvento); return d ? mesCorto(d) : ''; }

  cuandoTxt(c: Cotizacion): string {
    const d = aFecha(c.fechaEvento);
    const n = diasHasta(c.fechaEvento);
    const cuando = n === 0 ? 'HOY' : n === 1 ? 'MAÑANA' : `EN ${n} DÍAS`;
    const h = +(c.horaInicio || '').slice(0, 2);
    const parte = !c.horaInicio ? '' : h < 12 ? ' MAÑANA' : h < 19 ? ' TARDE' : ' NOCHE';
    return `${cuando} • ${d ? nombreDia(d) : ''}${parte}`.toUpperCase();
  }

  tipoTxt(c: Cotizacion): string {
    const t = (c.tipoEvento || '').trim();
    return t ? t.charAt(0).toUpperCase() + t.slice(1) : 'Evento';
  }
  horario(c: Cotizacion): string { return rangoHoras(c.horaInicio, c.horasSolicitadas); }
}
