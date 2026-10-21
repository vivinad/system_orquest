import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { forkJoin } from 'rxjs';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ClCotizacionService } from '../../../Modulo-cliente/Services/cl-cotizacion.service';
import { NotificacionService } from '../../../Modulo-seguridad/Services/notificacion.service';
import { Cotizacion } from '../../../Modulo-cliente/Models/cl-cotizacion.model';
import { AdmCotizacionManualComponent } from '../adm-cotizacion-manual/adm-cotizacion-manual.component';
import { AdmCotizacionDetalleComponent } from '../adm-cotizacion-detalle/adm-cotizacion-detalle.component';
import { AdmFinanzaService } from '../../Services/adm-finanza.service';
import { Finanza } from '../../Models/adm-finanza.model';
import { hoyIso } from '../../Services/adm-formato';
import { soles, monto, fechaCorta, fechaMedia, aFecha, estadoInfo, ESTADOS_COTIZACION, descargarCsv } from '../../Services/adm-formato';

@Component({
  selector: 'adm-cotizacion-listar',
  standalone: true,
  imports: [FormsModule, MatIconModule, MatTooltipModule, AdmCotizacionManualComponent, AdmCotizacionDetalleComponent],
  templateUrl: './adm-cotizacion-listar.component.html',
  styleUrls: ['./adm-cotizacion-listar.component.css'],
})
export class AdmCotizacionListarComponent implements OnInit {
  private cotizacionService = inject(ClCotizacionService);
  private noti = inject(NotificacionService);
  private route = inject(ActivatedRoute);
  private finanzaService = inject(AdmFinanzaService);

  /** Ingresos registrados (para saber cuánto se cobró de cada cotización) */
  finanzas: Finanza[] = [];

  lista: Cotizacion[] = [];
  cargando = true;
  filtro = '';        // '' = todas
  busqueda = '';
  descargando: number | null = null;

  readonly estados = ESTADOS_COTIZACION;
  /** Pestañas visibles (como en el diseño); rechazadas y canceladas se ven en "Todas" o con Filtros */
  readonly pestanas = ESTADOS_COTIZACION.filter(e => ['pendiente', 'confirmada', 'pagada', 'realizada'].includes(e.valor));
  readonly anio = new Date().getFullYear();
  readonly soles = soles;
  readonly monto = monto;
  readonly fechaCorta = fechaCorta;
  readonly fechaMedia = fechaMedia;
  readonly estadoInfo = estadoInfo;

  /** Modal de cotización manual (cliente atendido en persona) */
  modalNueva = false;
  /** Cotización abierta en la ventana de detalle / en edición */
  detalle: Cotizacion | null = null;
  edicion: Cotizacion | null = null;

  // Panel de filtros
  filtrosAbiertos = false;
  desde = '';
  hasta = '';
  distrito = '';

  ngOnInit(): void {
    // Búsqueda desde la barra superior o la campana de pendientes
    this.route.queryParamMap.subscribe(p => {
      this.busqueda = p.get('q') ?? this.busqueda;
      const estado = p.get('estado');
      if (estado != null) this.filtro = estado;
      if (p.get('nueva')) this.modalNueva = true;
    });
    this.cargar();
  }

  get distritos(): string[] {
    return [...new Set(this.lista.map(c => c.distrito?.nombre).filter((d): d is string => !!d))].sort();
  }
  get filtrosActivos(): number { return [this.desde, this.hasta, this.distrito].filter(Boolean).length; }
  limpiarFiltros(): void { this.desde = ''; this.hasta = ''; this.distrito = ''; }

  cargar(): void {
    forkJoin({
      cotizaciones: this.cotizacionService.listar(),
      finanzas: this.finanzaService.listar(),
    }).subscribe({
      next: ({ cotizaciones, finanzas }) => {
        this.lista = cotizaciones;
        this.finanzas = finanzas;
        this.cargando = false;
        this.conciliar(cotizaciones);
      },
      error: () => {
        this.cargando = false;
        // Si Finanzas falla, al menos se muestran las cotizaciones (sin registrar pagos automáticos)
        this.cotizacionService.listar().subscribe({
          next: c => (this.lista = c),
          error: () => this.noti.error('No se pudieron cargar las cotizaciones.'),
        });
      },
    });
  }

  /** Registra en Finanzas el pago de las cotizaciones pagadas/realizadas que aún tengan saldo */
  private conciliar(cotizaciones: Cotizacion[], aviso = true): void {
    this.finanzaService.conciliarPagos(cotizaciones, this.finanzas).subscribe({
      next: creados => {
        if (!creados.length) return;
        this.finanzas = [...this.finanzas, ...creados];
        const total = creados.reduce((s, f) => s + f.monto, 0);
        if (aviso) this.noti.toast(`Ingreso de S/ ${total.toFixed(2)} registrado en Finanzas.`);
      },
      error: () => this.noti.error('No se pudo registrar el pago en Finanzas. Inténtalo de nuevo.'),
    });
  }

  contar(estado: string): number {
    return estado ? this.lista.filter(c => c.estado === estado).length : this.lista.length;
  }

  get filtradas(): Cotizacion[] {
    const q = this.busqueda.trim().toLowerCase();
    return this.lista
      .filter(c => !this.filtro || c.estado === this.filtro)
      .filter(c => !this.desde || (c.fechaEvento || '').slice(0, 10) >= this.desde)
      .filter(c => !this.hasta || (c.fechaEvento || '').slice(0, 10) <= this.hasta)
      .filter(c => !this.distrito || c.distrito?.nombre === this.distrito)
      .filter(c => !q || [
        c.nombreCliente, c.telefonoCliente, c.dniCliente, c.emailCliente, c.distrito?.nombre,
        c.direccionEvento, c.tipoEvento, c.paquete?.nombre, `cot-${c.id}`, String(c.id),
      ].some(v => (v ?? '').toString().toLowerCase().includes(q)))
      .sort((a, b) => (b.fechaCreacion || '').localeCompare(a.fechaCreacion || ''));
  }

  abrirEdicion(): void {
    this.edicion = this.detalle;
    this.detalle = null;
  }

  edicionGuardada(c: Cotizacion): void {
    this.edicion = null;
    this.cargar();
    this.detalle = c;   // vuelve a mostrar el detalle ya actualizado
  }

  cotizacionCreada(): void {
    this.modalNueva = false;
    this.filtro = '';
    this.cargar();
  }

  // ---------- Acciones ----------
  // ---------- Cobros ----------
  cobrado(c: Cotizacion): number { return this.finanzaService.cobradoDe(c.id, this.finanzas); }
  saldo(c: Cotizacion): number { return Math.max(0, Math.round(((c.total || 0) - this.cobrado(c)) * 100) / 100); }
  /** Confirmadas a las que aún les falta cobrar (las pagadas/realizadas se registran solas) */
  tieneSaldo(c: Cotizacion): boolean { return c.estado === 'confirmada' && this.saldo(c) > 0; }

  /**
   * - "Pagada" o "Realizada": el saldo se registra solo como ingreso en Finanzas.
   * - "Confirmada": se pregunta si el cliente dejó un adelanto.
   */
  async cambiar(c: Cotizacion, estado: string): Promise<void> {
    const anterior = c.estado;
    if (estado === anterior) return;
    c.estado = estado;

    let adelanto = 0;
    if (estado === 'confirmada' && this.saldo(c) > 0) {
      const r = await this.noti.pedirMonto({
        titulo: '¿Recibiste un adelanto?',
        texto: `COT-${c.id} · ${c.nombreCliente}<br>Total: <b>S/ ${(c.total || 0).toFixed(2)}</b><br><small>Si el cliente dejó un adelanto, se registra como ingreso en Finanzas.</small>`,
        registrar: 'Registrar adelanto', omitir: 'Sin adelanto',
      });
      if (r.accion === 'cancelar') { setTimeout(() => (c.estado = anterior)); return; }
      adelanto = r.accion === 'registrar' ? Math.min(r.monto, this.saldo(c)) : 0;
    }

    this.cotizacionService.cambiarEstado(c.id, estado).subscribe({
      next: () => {
        this.noti.toast(`COT-${c.id} → ${estadoInfo(estado).texto}`);
        if (estado === 'pagada' || estado === 'realizada') this.conciliar([c]);
        else if (adelanto > 0) this.registrarAdelanto(c, adelanto);
        else if ((estado === 'cancelada' || estado === 'rechazada') && this.cobrado(c) > 0) {
          this.noti.info(`Esta cotización tiene S/ ${this.cobrado(c).toFixed(2)} cobrados. Si devolviste dinero, regístralo como gasto en Finanzas.`, 'Revisa los cobros');
        }
      },
      error: () => { c.estado = anterior; this.noti.error('No se pudo cambiar el estado.'); },
    });
  }

  private registrarAdelanto(c: Cotizacion, montoAdelanto: number): void {
    const tipo = (c.tipoEvento || '').trim().toLowerCase();
    this.finanzaService.crear({
      tipo: 'ingreso', monto: montoAdelanto, categoria: 'Adelanto de evento',
      descripcion: `Adelanto ${tipo ? tipo + ' ' : ''}${c.nombreCliente} (COT-${c.id})`.slice(0, 255),
      cotizacionId: c.id, fecha: hoyIso(),
    }).subscribe({
      next: f => {
        this.finanzas = [...this.finanzas, f];
        this.noti.toast(`Adelanto de S/ ${montoAdelanto.toFixed(2)} registrado en Finanzas.`);
      },
      error: () => this.noti.error('El estado se guardó, pero no se pudo registrar el adelanto. Regístralo desde Finanzas.'),
    });
  }

  whatsapp(c: Cotizacion): string {
    let num = (c.telefonoCliente || '').replace(/\D/g, '');
    if (num.length === 9) num = '51' + num;
    const texto = `Hola ${c.nombreCliente.split(' ')[0]}, te escribimos de Wendy y su Agua Cristalina sobre tu cotización COT-${c.id} para el ${fechaCorta(c.fechaEvento)}.`;
    return `https://wa.me/${num}?text=${encodeURIComponent(texto)}`;
  }

  contrato(c: Cotizacion): void {
    this.descargando = c.id;
    this.cotizacionService.descargarContrato(c.id).subscribe({
      next: blob => {
        this.descargando = null;
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `contrato-COT-${c.id}.pdf`;
        a.click();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      },
      error: () => { this.descargando = null; this.noti.error('No se pudo generar el contrato.'); },
    });
  }

  exportar(): void {
    const filas: (string | number)[][] = [[
      'Código', 'Creada', 'Cliente', 'Teléfono', 'DNI', 'Correo', 'Tipo de evento', 'Paquete', 'Fecha evento',
      'Día', 'Hora', 'Horas', 'Distrito', 'Dirección', 'Total (S/)', 'A tratar', 'Estado',
    ]];
    for (const c of this.filtradas) {
      filas.push([
        `COT-${c.id}`, (c.fechaCreacion || '').slice(0, 10), c.nombreCliente, c.telefonoCliente, c.dniCliente ?? '',
        c.emailCliente ?? '', c.tipoEvento ?? '', c.paquete?.nombre ?? '', (c.fechaEvento || '').slice(0, 10),
        c.diaSemana, (c.horaInicio || '').slice(0, 5), c.horasSolicitadas, c.distrito?.nombre ?? '',
        c.direccionEvento ?? '', c.total, c.tieneATratar ? (c.motivoATratar ?? 'Sí') : '', estadoInfo(c.estado).texto,
      ]);
    }
    descargarCsv(`cotizaciones${this.filtro ? '-' + this.filtro : ''}.csv`, filas);
  }

  tipoTxt(c: Cotizacion): string {
    const t = (c.tipoEvento || '').trim();
    return t ? t.charAt(0).toUpperCase() + t.slice(1) : 'Sin especificar';
  }
  hora(c: Cotizacion): string { return (c.horaInicio || '').slice(0, 5); }
  fechaIso(c: Cotizacion): string { return (c.fechaEvento || '').slice(0, 10); }
  diaTxt(c: Cotizacion): string {
    const d = aFecha(c.fechaEvento);
    return d ? ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'][d.getDay()] : c.diaSemana;
  }
  /** Nota bajo el total */
  notaTotal(c: Cotizacion): string {
    if (c.tieneATratar) return 'Monto a tratar';
    if (c.costoMovilidad > 0) return 'Incluye movilidad';
    return '';
  }
}
