import { Component, EventEmitter, HostListener, Input, OnDestroy, OnInit, Output, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Observable, of, switchMap } from 'rxjs';
import { MaeCatalogoService } from '../../../Modulo-maestros/Services/mae-catalogo.service';
import { ClCotizacionService } from '../../../Modulo-cliente/Services/cl-cotizacion.service';
import { AdmFinanzaService } from '../../Services/adm-finanza.service';
import { NotificacionService } from '../../../Modulo-seguridad/Services/notificacion.service';
import { Paquete, Distrito, MusicoAdicional, ServicioExtra } from '../../../Modulo-maestros/Models/mae-catalogo.model';
import { Cotizacion, CotizacionRequest, CotizacionResultado } from '../../../Modulo-cliente/Models/cl-cotizacion.model';
import { monto, hoyIso } from '../../Services/adm-formato';

/**
 * Registro manual de una cotización: para clientes que contrataron en persona
 * (no usaron el cotizador web). Así su dinero también se administra en el panel.
 */
@Component({
  selector: 'adm-cotizacion-manual',
  standalone: true,
  imports: [FormsModule, MatIconModule, MatTooltipModule],
  templateUrl: './adm-cotizacion-manual.component.html',
  styleUrls: ['./adm-cotizacion-manual.component.css'],
})
export class AdmCotizacionManualComponent implements OnInit, OnDestroy {
  private catalogoService = inject(MaeCatalogoService);
  private cotizacionService = inject(ClCotizacionService);
  private finanzaService = inject(AdmFinanzaService);
  private noti = inject(NotificacionService);

  /** Si viene una cotización, el formulario sirve para editarla (datos + monto acordado) */
  @Input() editar: Cotizacion | null = null;
  @Output() cerrar = new EventEmitter<void>();
  @Output() creada = new EventEmitter<Cotizacion>();

  paquetes: Paquete[] = [];
  distritos: Distrito[] = [];
  musicos: MusicoAdicional[] = [];
  servicios: ServicioExtra[] = [];

  readonly tiposEvento = [
    'Boda', 'Cumpleaños', 'Quinceañero', 'Aniversario',
    'Fiestas Patrias', 'Fiesta patronal', 'Evento corporativo', 'Otro',
  ];
  readonly monto = monto;

  // Cliente
  nombreCliente = '';
  telefonoCliente = '';
  dniCliente = '';
  emailCliente = '';
  direccionCliente = '';
  // Evento
  tipoEvento = '';
  fechaEvento = '';
  horaInicio = '';
  horas = 5;
  paqueteId: number | null = null;
  distritoId: number | null = null;
  direccionEvento = '';
  cantidades: Record<number, number> = {};
  serviciosSel: Record<number, boolean> = {};
  // Estado y pago
  estado: 'pendiente' | 'confirmada' | 'pagada' = 'confirmada';
  adelanto: number | null = null;
  observaciones = '';
  /** Precio final acordado con el cliente (solo al editar) */
  montoAcordado: number | null = null;

  resultado: CotizacionResultado | null = null;
  calculando = false;
  guardando = false;
  private timer?: ReturnType<typeof setTimeout>;

  ngOnInit(): void {
    document.body.classList.add('adm-modal-abierto');
    if (this.editar) this.cargarEdicion(this.editar);
    this.catalogoService.listarPaquetes().subscribe({
      next: p => {
        // Si el paquete de la cotización ya no está publicado, se agrega para poder verlo
        const actual = this.editar?.paquete;
        this.paquetes = actual && !p.some(x => x.id === actual.id)
          ? [...p, { id: actual.id, nombre: actual.nombre + ' (oculto)', numIntegrantes: actual.numIntegrantes ?? 0, precioBase: this.editar!.costoPaquete, horasBase: this.editar!.horasSolicitadas, activo: false }]
          : p;
      },
      error: () => {},
    });
    this.catalogoService.listarDistritos().subscribe({ next: d => (this.distritos = d), error: () => {} });
    this.catalogoService.listarMusicos().subscribe({ next: m => (this.musicos = m), error: () => {} });
    this.catalogoService.listarServicios().subscribe({ next: s => (this.servicios = s), error: () => {} });
  }

  get esEdicion(): boolean { return !!this.editar; }

  private cargarEdicion(c: Cotizacion): void {
    this.nombreCliente = c.nombreCliente || '';
    this.telefonoCliente = c.telefonoCliente || '';
    this.dniCliente = c.dniCliente || '';
    this.emailCliente = c.emailCliente || '';
    this.direccionCliente = c.direccionCliente || '';
    this.tipoEvento = this.tiposEvento.find(t => t.toLowerCase() === (c.tipoEvento || '').toLowerCase()) ?? (c.tipoEvento || '');
    this.fechaEvento = (c.fechaEvento || '').slice(0, 10);
    this.horaInicio = (c.horaInicio || '').slice(0, 5);
    this.horas = c.horasSolicitadas || 1;
    this.paqueteId = c.paqueteId;
    this.distritoId = c.distritoId;
    this.direccionEvento = c.direccionEvento || '';
    this.cantidades = {};
    for (const m of c.musicos ?? []) this.cantidades[m.musicoId] = m.cantidad;
    this.serviciosSel = {};
    for (const e of c.extras ?? []) this.serviciosSel[e.servicioId] = true;
    this.observaciones = c.observaciones || '';
    // Si tuvo algo "a tratar", el total guardado es el acordado (o el calculado si aún no se acordó)
    this.montoAcordado = c.motivoATratar && !c.tieneATratar ? c.total : null;
    this.recalcular();
  }

  /** Total que quedará guardado: el acordado si se escribió, si no el calculado */
  get totalFinal(): number { return this.montoAcordado && this.montoAcordado > 0 ? this.montoAcordado : this.total; }

  ngOnDestroy(): void {
    document.body.classList.remove('adm-modal-abierto');
    clearTimeout(this.timer);
  }

  @HostListener('document:keydown.escape')
  alEscape(): void { this.cerrar.emit(); }

  soloDigitos(valor: string, max: number): string { return (valor || '').replace(/\D/g, '').slice(0, max); }

  paso(delta: number): void {
    this.horas = Math.min(12, Math.max(1, this.horas + delta));
    this.recalcular();
  }
  pasoMusico(id: number, delta: number): void {
    this.cantidades[id] = Math.min(10, Math.max(0, (this.cantidades[id] || 0) + delta));
    this.recalcular();
  }
  alternarServicio(id: number): void {
    this.serviciosSel[id] = !this.serviciosSel[id];
    this.recalcular();
  }

  private armar(): CotizacionRequest {
    const req = new CotizacionRequest();
    req.nombreCliente = this.nombreCliente.trim();
    req.telefonoCliente = this.telefonoCliente.trim();
    req.dniCliente = this.dniCliente.trim() || undefined;
    req.emailCliente = this.emailCliente.trim() || undefined;
    req.direccionCliente = this.direccionCliente.trim() || undefined;
    req.paqueteId = this.paqueteId ?? 0;
    req.distritoId = this.distritoId ?? 0;
    req.fechaEvento = this.fechaEvento;
    req.direccionEvento = this.direccionEvento.trim() || undefined;
    req.horaInicio = this.horaInicio || undefined;
    req.tipoEvento = this.tipoEvento || undefined;
    req.horasSolicitadas = this.horas;
    req.musicos = Object.entries(this.cantidades)
      .filter(([, c]) => c > 0)
      .map(([id, c]) => ({ musicoId: +id, cantidad: c }));
    req.serviciosExtra = Object.entries(this.serviciosSel).filter(([, v]) => v).map(([id]) => +id);
    req.observaciones = this.observaciones.trim() || undefined;
    return req;
  }

  get puedeCalcular(): boolean { return !!this.paqueteId && !!this.distritoId && !!this.fechaEvento && this.horas > 0; }

  /** Precio en vivo (mismo cálculo que el cotizador web) */
  recalcular(): void {
    clearTimeout(this.timer);
    if (!this.puedeCalcular) { this.resultado = null; return; }
    this.timer = setTimeout(() => {
      this.calculando = true;
      this.cotizacionService.calcular(this.armar()).subscribe({
        next: r => { this.resultado = r; this.calculando = false; },
        error: () => { this.resultado = null; this.calculando = false; },
      });
    }, 300);
  }

  get total(): number { return this.resultado?.total ?? 0; }
  get saldo(): number { return Math.max(0, this.total - (this.adelanto || 0)); }

  get faltantes(): string[] {
    const f: string[] = [];
    if (this.nombreCliente.trim().length < 2) f.push('nombre del cliente');
    if (this.telefonoCliente.trim().length !== 9) f.push('teléfono (9 dígitos)');
    if (!this.fechaEvento) f.push('fecha del evento');
    if (!this.paqueteId) f.push('paquete');
    if (!this.distritoId) f.push('distrito');
    return f;
  }

  private guardarEdicion(c: Cotizacion): void {
    if (this.montoAcordado != null && this.montoAcordado <= 0) { this.noti.error('El monto acordado debe ser mayor a 0.'); return; }
    this.guardando = true;
    const req = { ...this.armar(), montoAcordado: this.montoAcordado && this.montoAcordado > 0 ? this.montoAcordado : undefined };
    this.cotizacionService.actualizar(c.id, req).subscribe({
      next: actualizada => {
        this.guardando = false;
        this.noti.toast(`COT-${c.id} actualizada. El contrato ya sale con los datos nuevos.`);
        this.creada.emit(actualizada);
      },
      error: (e: { error?: { mensaje?: string } | string }) => {
        this.guardando = false;
        const msg = typeof e?.error === 'string' ? e.error : e?.error?.mensaje;
        this.noti.error(msg || 'No se pudo guardar los cambios.');
      },
    });
  }

  marcarPagada(): void {
    this.estado = 'pagada';
    if (this.total > 0) this.adelanto = this.total;
  }

  guardar(): void {
    if (this.faltantes.length) {
      this.noti.error('Completa: ' + this.faltantes.join(', ') + '.');
      return;
    }
    if (this.editar) { this.guardarEdicion(this.editar); return; }
    if (this.adelanto != null && this.adelanto < 0) { this.noti.error('El monto recibido no puede ser negativo.'); return; }
    // "Pagada" sin monto escrito = se cobró el total
    if (this.estado === 'pagada' && !this.adelanto && this.total > 0) this.adelanto = this.total;
    this.guardando = true;
    const req = this.armar();
    let creada: Cotizacion | null = null;

    this.cotizacionService.crear(req).pipe(
      switchMap(c => {
        creada = c;
        return this.estado !== 'pendiente' ? this.cotizacionService.cambiarEstado(c.id, this.estado) : of(void 0);
      }),
      switchMap((): Observable<unknown> => {
        const recibido = this.adelanto || 0;
        if (recibido <= 0) return of(null);
        const completo = recibido >= creada!.total;
        return this.finanzaService.crear({
          tipo: 'ingreso',
          monto: recibido,
          categoria: completo ? 'Pago completo' : 'Adelanto de evento',
          descripcion: `${completo ? 'Pago completo' : 'Adelanto'} ${req.tipoEvento ? req.tipoEvento.toLowerCase() + ' ' : ''}${req.nombreCliente}`.slice(0, 255),
          cotizacionId: creada!.id,
          fecha: hoyIso(),
        });
      }),
    ).subscribe({
      next: () => {
        this.guardando = false;
        this.noti.toast(`Cotización COT-${creada!.id} registrada.`);
        this.creada.emit({ ...creada!, estado: this.estado });
      },
      error: (e: { error?: { mensaje?: string } | string }) => {
        this.guardando = false;
        const msg = typeof e?.error === 'string' ? e.error : e?.error?.mensaje;
        const hecha = creada as Cotizacion | null;
        this.noti.error(hecha
          ? `La cotización COT-${hecha.id} se creó, pero no se pudo completar el registro del pago o del estado. Revísalo en la lista.`
          : (msg || 'No se pudo registrar la cotización.'));
        if (hecha) this.creada.emit(hecha);
      },
    });
  }
}
