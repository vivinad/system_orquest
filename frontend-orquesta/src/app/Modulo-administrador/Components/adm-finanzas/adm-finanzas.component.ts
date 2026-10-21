import { Component, HostListener, OnDestroy, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AdmFinanzaService } from '../../Services/adm-finanza.service';
import { ClCotizacionService } from '../../../Modulo-cliente/Services/cl-cotizacion.service';
import { NotificacionService } from '../../../Modulo-seguridad/Services/notificacion.service';
import { Finanza } from '../../Models/adm-finanza.model';
import { Cotizacion } from '../../../Modulo-cliente/Models/cl-cotizacion.model';
import { soles, monto, hoyIso, mesDe, nombreMes, nombreMesTitulo, fechaMedia, ultimosMeses, mesAnterior, descargarCsv } from '../../Services/adm-formato';

type Pestana = 'todos' | 'ingreso' | 'gasto';

@Component({
  selector: 'adm-finanzas',
  standalone: true,
  imports: [FormsModule, MatIconModule, MatTooltipModule],
  templateUrl: './adm-finanzas.component.html',
  styleUrls: ['./adm-finanzas.component.css'],
})
export class AdmFinanzasComponent implements OnInit, OnDestroy {
  private finanzaService = inject(AdmFinanzaService);
  private cotizacionService = inject(ClCotizacionService);
  private noti = inject(NotificacionService);

  lista: Finanza[] = [];
  cotizaciones: Cotizacion[] = [];
  cargando = true;
  guardando = false;

  // Filtros del historial
  mes = hoyIso().slice(0, 7); // '' = todo
  readonly meses = ultimosMeses(12).reverse();
  pestana: Pestana = 'todos';
  busqueda = '';
  pagina = 1;
  readonly porPagina = 5;
  readonly anio = new Date().getFullYear();

  // Formulario (se abre en una ventana modal)
  modalAbierto = false;
  editando: Partial<Finanza> = this.nuevoMovimiento();
  readonly categorias: Record<'ingreso' | 'gasto', { texto: string; icono: string }[]> = {
    ingreso: [
      { texto: 'Adelanto de evento', icono: 'south_west' },
      { texto: 'Pago completo', icono: 'south_west' },
      { texto: 'Presentación pública', icono: 'festival' },
      { texto: 'Otros', icono: 'south_west' },
    ],
    gasto: [
      { texto: 'Pago a músicos', icono: 'north_east' },
      { texto: 'Transporte y van', icono: 'directions_bus' },
      { texto: 'Equipamiento', icono: 'tune' },
      { texto: 'Otros', icono: 'north_east' },
    ],
  };

  readonly soles = soles;
  readonly monto = monto;
  readonly nombreMes = nombreMes;
  readonly nombreMesTitulo = nombreMesTitulo;
  readonly fechaMedia = fechaMedia;

  ngOnInit(): void {
    // Primero las cotizaciones y los movimientos juntos: así se registran solos los pagos pendientes
    forkJoin({ cotizaciones: this.cotizacionService.listar(), finanzas: this.finanzaService.listar() }).subscribe({
      next: ({ cotizaciones, finanzas }) => {
        this.cotizaciones = cotizaciones;
        this.lista = finanzas;
        this.cargando = false;
        this.finanzaService.conciliarPagos(cotizaciones, finanzas).subscribe({
          next: creados => { if (creados.length) this.lista = [...creados, ...this.lista]; },
          error: () => {},
        });
      },
      error: () => this.cargar(),
    });
  }

  cargar(): void {
    this.finanzaService.listar().subscribe({
      next: l => { this.lista = l; this.cargando = false; },
      error: () => { this.cargando = false; this.noti.error('No se pudieron cargar los movimientos.'); },
    });
  }

  // ---------- Resumen del periodo ----------
  private delPeriodo(): Finanza[] {
    return this.lista.filter(f => !this.mes || mesDe(f.fecha) === this.mes);
  }
  private total(tipo: 'ingreso' | 'gasto'): number {
    return this.delPeriodo().filter(f => f.tipo === tipo).reduce((s, f) => s + (f.monto || 0), 0);
  }
  get ingresos(): number { return this.total('ingreso'); }
  get gastos(): number { return this.total('gasto'); }
  get balance(): number { return this.ingresos - this.gastos; }
  get margen(): number { return this.ingresos > 0 ? Math.round((this.balance / this.ingresos) * 100) : 0; }
  get pctGastos(): number { return this.ingresos > 0 ? Math.round((this.gastos / this.ingresos) * 100) : 0; }
  get cantidad(): { ingresos: number; gastos: number } {
    const p = this.delPeriodo();
    return { ingresos: p.filter(f => f.tipo === 'ingreso').length, gastos: p.filter(f => f.tipo === 'gasto').length };
  }

  /** Variación % de ingresos frente al mes anterior */
  get variacionIngresos(): number | null {
    if (!this.mes) return null;
    const ant = mesAnterior(this.mes);
    const previo = this.lista.filter(f => f.tipo === 'ingreso' && mesDe(f.fecha) === ant).reduce((s, f) => s + f.monto, 0);
    return previo ? Math.round(((this.ingresos - previo) / previo) * 100) : null;
  }

  /** % cobrado de las cotizaciones vinculadas a ingresos del periodo */
  get cobradoContratos(): { contratos: number; pct: number } {
    const ids = [...new Set(this.delPeriodo().filter(f => f.tipo === 'ingreso' && f.cotizacionId).map(f => f.cotizacionId!))];
    let total = 0, cobrado = 0;
    for (const id of ids) {
      const c = this.cotizaciones.find(x => x.id === id);
      if (!c) continue;
      total += c.total || 0;
      cobrado += this.lista.filter(f => f.tipo === 'ingreso' && f.cotizacionId === id).reduce((s, f) => s + f.monto, 0);
    }
    return { contratos: ids.length, pct: total > 0 ? Math.min(100, Math.round((cobrado / total) * 100)) : 0 };
  }

  /** Las dos categorías de gasto con más monto */
  get topGastos(): { categoria: string; monto: number }[] {
    const acc: Record<string, number> = {};
    for (const f of this.delPeriodo().filter(x => x.tipo === 'gasto')) {
      const c = f.categoria || 'Otros';
      acc[c] = (acc[c] || 0) + f.monto;
    }
    return Object.entries(acc).sort((a, b) => b[1] - a[1]).slice(0, 2).map(([categoria, monto]) => ({ categoria, monto }));
  }

  /** Próxima cotización confirmada con saldo por cobrar */
  get proximoCobro(): Cotizacion | null {
    const hoy = hoyIso();
    return this.cotizaciones
      .filter(c => ['confirmada', 'pagada', 'realizada'].includes(c.estado) && this.saldoDe(c) > 0)
      .sort((a, b) => {
        const fa = a.fechaEvento.slice(0, 10), fb = b.fechaEvento.slice(0, 10);
        if ((fa >= hoy) !== (fb >= hoy)) return fa >= hoy ? -1 : 1;
        return fa.localeCompare(fb);
      })[0] ?? null;
  }
  saldoDe(c: Cotizacion): number {
    const cobrado = this.lista.filter(f => f.tipo === 'ingreso' && f.cotizacionId === c.id).reduce((s, f) => s + f.monto, 0);
    return Math.max(0, (c.total || 0) - cobrado);
  }
  fechaDiaMes(valor: string): string {
    const t = fechaMedia(valor).split(' ');
    return t.length >= 2 ? `${t[0]} ${t[1]}` : t[0];
  }

  /** Categoría de gasto con mayor monto en el periodo */
  get mayorGasto(): { categoria: string; monto: number } | null {
    const acc: Record<string, number> = {};
    for (const f of this.delPeriodo().filter(x => x.tipo === 'gasto')) {
      const c = f.categoria || 'Sin categoría';
      acc[c] = (acc[c] || 0) + f.monto;
    }
    const top = Object.entries(acc).sort((a, b) => b[1] - a[1])[0];
    return top ? { categoria: top[0], monto: top[1] } : null;
  }

  /** Lo que falta cobrar de las cotizaciones confirmadas (total − ingresos vinculados a ellas) */
  get porCobrar(): { monto: number; eventos: number } {
    let total = 0, eventos = 0;
    for (const c of this.cotizaciones.filter(x => ['confirmada', 'pagada', 'realizada'].includes(x.estado))) {
      const falta = this.saldoDe(c);
      if (falta > 0) { total += falta; eventos++; }
    }
    return { monto: total, eventos };
  }

  // ---------- Historial ----------
  get filtrados(): Finanza[] {
    const q = this.busqueda.trim().toLowerCase();
    return this.delPeriodo()
      .filter(f => this.pestana === 'todos' || f.tipo === this.pestana)
      .filter(f => !q || `${f.descripcion} ${f.categoria ?? ''} ${f.cotizacionId ?? ''}`.toLowerCase().includes(q));
  }
  get totalPaginas(): number { return Math.max(1, Math.ceil(this.filtrados.length / this.porPagina)); }
  get paginaActual(): Finanza[] {
    const p = Math.min(this.pagina, this.totalPaginas);
    return this.filtrados.slice((p - 1) * this.porPagina, p * this.porPagina);
  }
  contarTipo(t: Pestana): number {
    return this.delPeriodo().filter(f => t === 'todos' || f.tipo === t).length;
  }
  cambiarFiltro(): void { this.pagina = 1; }

  iconoDe(f: Finanza): string {
    const lista = this.categorias[f.tipo] ?? [];
    return lista.find(c => c.texto === f.categoria)?.icono ?? (f.tipo === 'ingreso' ? 'south_west' : 'north_east');
  }

  clienteDe(id?: number): string {
    if (!id) return '';
    const c = this.cotizaciones.find(x => x.id === id);
    return c ? c.nombreCliente : '';
  }
  paqueteDe(id?: number): string {
    if (!id) return '';
    return this.cotizaciones.find(x => x.id === id)?.paquete?.nombre ?? '';
  }
  get paginas(): number[] { return Array.from({ length: this.totalPaginas }, (_, i) => i + 1); }

  exportar(): void {
    const filas: (string | number)[][] = [['Fecha', 'Tipo', 'Categoría', 'Descripción', 'Cotización', 'Monto (S/)']];
    for (const f of this.filtrados) {
      filas.push([
        (f.fecha || '').slice(0, 10), f.tipo === 'ingreso' ? 'Ingreso' : 'Gasto', f.categoria ?? '',
        f.descripcion, f.cotizacionId ? `COT-${f.cotizacionId}` : '', (f.tipo === 'gasto' ? -1 : 1) * f.monto,
      ]);
    }
    descargarCsv(`finanzas-${this.mes || 'historial'}.csv`, filas);
  }

  // ---------- Formulario ----------
  get cotizacionesVinculables(): Cotizacion[] {
    return this.cotizaciones
      .filter(c => ['confirmada', 'pagada', 'realizada'].includes(c.estado) || c.id === this.editando.cotizacionId)
      .sort((a, b) => b.fechaEvento.localeCompare(a.fechaEvento));
  }

  nuevoMovimiento(): Partial<Finanza> {
    return { tipo: 'ingreso', descripcion: '', categoria: '', monto: undefined, fecha: hoyIso(), cotizacionId: undefined };
  }
  limpiar(): void { this.editando = this.nuevoMovimiento(); }

  abrirNuevo(): void {
    this.limpiar();
    this.abrirModal();
  }

  editar(f: Finanza): void {
    this.editando = { ...f, fecha: (f.fecha || '').slice(0, 10) };
    this.abrirModal();
  }

  private abrirModal(): void {
    this.modalAbierto = true;
    document.body.classList.add('adm-modal-abierto');
  }

  cerrarModal(): void {
    // Siempre se puede cerrar (aunque el guardado siga en curso o la API no responda)
    this.guardando = false;
    this.modalAbierto = false;
    document.body.classList.remove('adm-modal-abierto');
    this.limpiar();
  }

  @HostListener('document:keydown.escape')
  alEscape(): void { if (this.modalAbierto) this.cerrarModal(); }

  ngOnDestroy(): void { document.body.classList.remove('adm-modal-abierto'); }

  cambiarTipo(t: 'ingreso' | 'gasto'): void {
    if (this.editando.tipo === t) return;
    this.editando.tipo = t;
    this.editando.categoria = '';
    if (t === 'gasto') this.editando.cotizacionId = undefined;
  }

  sumar(n: number): void { this.editando.monto = Math.round(((this.editando.monto || 0) + n) * 100) / 100; }

  elegirCategoria(c: string): void { this.editando.categoria = this.editando.categoria === c ? '' : c; }

  guardar(): void {
    const e = this.editando;
    e.descripcion = (e.descripcion || '').trim();
    if (!e.descripcion || !e.monto) { this.noti.error('Descripción y monto son obligatorios.'); return; }
    if (e.monto <= 0) { this.noti.error('El monto debe ser mayor a 0.'); return; }
    if (!e.fecha) e.fecha = hoyIso();
    if (!e.cotizacionId) e.cotizacionId = undefined;

    this.guardando = true;
    const onOk = () => {
      this.guardando = false;
      this.noti.toast(e.id ? 'Movimiento actualizado.' : 'Movimiento registrado.');
      this.cerrarModal();
      this.cargar();
    };
    const onError = (err: { error?: unknown }) => {
      this.guardando = false;
      this.noti.error(typeof err?.error === 'string' ? err.error : 'No se pudo guardar el movimiento.');
    };
    if (e.id) this.finanzaService.actualizar(e as Finanza).subscribe({ next: onOk, error: onError });
    else this.finanzaService.crear(e).subscribe({ next: onOk, error: onError });
  }

  async eliminar(f: Finanza): Promise<void> {
    const ok = await this.noti.confirmar(`¿Eliminar el movimiento "${f.descripcion}" de ${soles(f.monto)}?`);
    if (!ok) return;
    this.finanzaService.eliminar(f.id).subscribe({
      next: () => {
        this.noti.toast('Movimiento eliminado.');
        if (this.editando.id === f.id) this.limpiar();
        this.cargar();
      },
      error: () => this.noti.error('No se pudo eliminar el movimiento.'),
    });
  }
}
