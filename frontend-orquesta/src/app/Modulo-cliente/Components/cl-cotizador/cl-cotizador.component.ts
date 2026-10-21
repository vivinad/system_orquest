import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { DOCUMENT, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';

import { MaeCatalogoService } from '../../../Modulo-maestros/Services/mae-catalogo.service';
import { Paquete, Distrito, MusicoAdicional, ServicioExtra } from '../../../Modulo-maestros/Models/mae-catalogo.model';
import { ClCotizacionService } from '../../Services/cl-cotizacion.service';
import { NotificacionService } from '../../../Modulo-seguridad/Services/notificacion.service';
import { CotizacionRequest, CotizacionResultado } from '../../Models/cl-cotizacion.model';
import { ClMetodosPagoComponent } from '../cl-metodos-pago/cl-metodos-pago.component';
import { TemaService } from '../../../Modulo-seguridad/Services/tema.service';

@Component({
  selector: 'cl-cotizador',
  standalone: true,
  imports: [FormsModule, RouterLink, MatIconModule, MatProgressSpinnerModule, MatTooltipModule, ClMetodosPagoComponent],
  templateUrl: './cl-cotizador.component.html',
  styleUrls: ['./cl-cotizador.component.css'],
})
export class ClCotizadorComponent implements OnInit, OnDestroy {
  private catalogoService = inject(MaeCatalogoService);
  private cotizacionService = inject(ClCotizacionService);
  private noti = inject(NotificacionService);
  private location = inject(Location);
  private document = inject(DOCUMENT);
  private temaService = inject(TemaService);
  private sanitizer = inject(DomSanitizer);

  // Tema oscuro / claro (el mismo botón que en la página principal)
  readonly tema = this.temaService.tema;
  alternarTema(): void {
    this.temaService.alternar();
  }

  // ---------- Pasos ----------
  readonly pasos = [
    { titulo: 'Formación musical', icono: 'groups' },
    { titulo: 'Tu evento', icono: 'event' },
    { titulo: 'Extras & sonido', icono: 'library_music' },
    { titulo: 'Datos y reserva', icono: 'assignment_ind' },
  ];
  paso = 0;

  // Un paso se puede abrir si todos los anteriores están completos
  puedeIrA(indice: number): boolean {
    for (let k = 0; k < indice; k++) {
      if (!this.puedeAvanzar(k)) return false;
    }
    return true;
  }
  irAPaso(indice: number): void {
    if (indice === this.paso || !this.puedeIrA(indice)) return;
    this.paso = indice;
    this.subirAlInicio();
  }
  siguiente(): void {
    if (this.paso < this.pasos.length - 1 && this.puedeAvanzar(this.paso)) {
      this.paso++;
      this.subirAlInicio();
    }
  }
  anterior(): void {
    if (this.paso > 0) {
      this.paso--;
      this.subirAlInicio();
    }
  }
  private subirAlInicio(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  paquetes: Paquete[] = [];
  distritos: Distrito[] = [];
  musicos: MusicoAdicional[] = [];
  servicios: ServicioExtra[] = [];

  // Selecciones
  paqueteId: number | null = null;
  distritoId: number | null = null;
  fechaEvento: Date | null = null;
  direccionEvento = '';
  horaInicio = '';
  tipoEvento = '';
  // Opciones de tipo de evento (definen la vestimenta de la orquesta)
  readonly tiposEvento = [
    'Boda', 'Cumpleaños', 'Quinceañero', 'Aniversario',
    'Fiestas Patrias', 'Fiesta patronal', 'Evento corporativo', 'Otro',
  ];
  horas = 5;
  hoy = new Date();
  readonly hoyStr = this.formatoFecha(this.hoy);

  // Fecha para el <input type="date"> ('yyyy-mm-dd'); internamente se usa Date
  get fechaStr(): string {
    return this.fechaEvento ? this.formatoFecha(this.fechaEvento) : '';
  }
  set fechaStr(valor: string) {
    if (!valor) { this.fechaEvento = null; return; }
    const [y, m, d] = valor.split('-').map(Number);
    this.fechaEvento = new Date(y, m - 1, d);
  }
  cantidades: Record<number, number> = {};
  serviciosSel: Record<number, boolean> = {};

  // Contacto
  nombreCliente = '';
  telefonoCliente = '';
  emailCliente = '';
  dniCliente = '';
  direccionCliente = '';
  observaciones = '';

  readonly whatsapp = '51993771153';

  resultado: CotizacionResultado | null = null;
  calculando = false;
  enviando = false;
  enviado = false;
  folio: number | null = null;
  codigoAcceso: string | undefined; // clave para descargar el contrato
  descargando = false;
  // Contrato generado: se muestra en la misma página con su botón de descarga
  contratoUrl: string | null = null;
  contratoVista: SafeResourceUrl | null = null;
  // Si la cotización tiene puntos "a tratar", se invita a escribir por WhatsApp
  aTratar = false;
  motivoATratar = '';

  ngOnInit(): void {
    this.catalogoService.listarPaquetes().subscribe(p => (this.paquetes = p));
    this.catalogoService.listarDistritos().subscribe(d => (this.distritos = d));
    this.catalogoService.listarMusicos().subscribe(m => (this.musicos = m));
    this.catalogoService.listarServicios().subscribe(s => (this.servicios = s));
  }

  volver(): void {
    this.location.back();
  }

  get waLink(): string {
    const msg = 'Hola, estoy cotizando mi evento con Agrupación Agua Cristalina y tengo una consulta 🎶';
    return `https://wa.me/${this.whatsapp}?text=${encodeURIComponent(msg)}`;
  }

  get esFinDeSemana(): boolean {
    if (!this.fechaEvento) return false;
    const d = this.fechaEvento.getDay();
    return d === 0 || d === 6;
  }
  get minHoras(): number {
    return this.esFinDeSemana ? 4 : 3;
  }
  get datosEventoOk(): boolean {
    return !!this.paqueteId && !!this.distritoId && !!this.fechaEvento
      && this.direccionEvento.trim().length > 4 && !!this.horaInicio && !!this.tipoEvento
      && this.horas >= this.minHoras;
  }
  get contactoOk(): boolean {
    return this.nombreCliente.trim().length > 1 && this.telefonoCliente.trim().length === 9
      && this.dniCliente.trim().length >= 8 && this.direccionCliente.trim().length > 4;
  }

  // Deja solo números y recorta al máximo indicado (p. ej. teléfono de 9 dígitos)
  soloDigitos(valor: string, max: number): string {
    return (valor || '').replace(/\D/g, '').slice(0, max);
  }

  // Habilita el botón "Siguiente paso" centralizado junto al Resumen, según el paso activo
  puedeAvanzar(indicePaso: number): boolean {
    switch (indicePaso) {
      case 0: return !!this.paqueteId;
      case 1: return this.datosEventoOk;
      default: return true;
    }
  }

  paqueteSel(): Paquete | undefined {
    return this.paquetes.find(p => p.id === this.paqueteId);
  }
  distritoSel(): Distrito | undefined {
    return this.distritos.find(d => d.id === this.distritoId);
  }
  esProyector(s: ServicioExtra): boolean {
    return /proyector/i.test(s.nombre);
  }

  pen(n: number | undefined | null): string {
    return 'S/ ' + (n ?? 0).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  // Precio corto para las tarjetas: S/ 1,250
  soles(n: number | undefined | null): string {
    return 'S/ ' + (n ?? 0).toLocaleString('es-PE', { maximumFractionDigits: 0 });
  }

  etiquetaTipo(m: MusicoAdicional): string {
    return m.tipo === 'viento' ? 'Viento' : 'Ritmo';
  }

  // Monto que se muestra en "Tu presupuesto": el total calculado o, mientras falten datos, el precio base
  get montoEstimado(): number {
    if (this.resultado) return this.resultado.total;
    const p = this.paqueteSel();
    return p ? p.precioBase + (this.distritoSel()?.costoMovilidad ?? 0) : 0;
  }
  get cantidadExtras(): number {
    return Object.values(this.cantidades).filter(c => c > 0).length
      + Object.values(this.serviciosSel).filter(v => v).length;
  }

  toggleMusico(m: MusicoAdicional, checked: boolean): void {
    this.cantidades[m.id] = checked ? 1 : 0;
    this.recalcular();
  }
  toggleServicio(s: ServicioExtra, checked: boolean): void {
    this.serviciosSel[s.id] = checked;
    this.recalcular();
  }

  // Al elegir fecha: primero se verifica que la orquesta no tenga
  // un evento ya asegurado ese día; si está libre, se cotiza normal.
  fechaCambiada(): void {
    if (!this.fechaEvento) { this.recalcular(); return; }
    this.cotizacionService.fechaOcupada(this.formatoFecha(this.fechaEvento)).subscribe(ocupada => {
      if (ocupada) {
        this.fechaEvento = null;
        this.resultado = null;
        this.noti.error('La orquesta ya tiene un evento confirmado ese día.', 'Día no disponible');
      } else {
        this.recalcular();
      }
    });
  }

  recalcular(): void {
    if (!this.datosEventoOk) {
      this.resultado = null;
      return;
    }
    this.calculando = true;
    this.cotizacionService.calcular(this.armarRequest()).subscribe({
      next: r => { this.resultado = r; this.calculando = false; },
      error: () => { this.calculando = false; },
    });
  }

  private armarRequest(): CotizacionRequest {
    const req = new CotizacionRequest();
    req.nombreCliente = this.nombreCliente;
    req.telefonoCliente = this.telefonoCliente;
    req.emailCliente = this.emailCliente || undefined;
    req.dniCliente = this.dniCliente || undefined;
    req.direccionCliente = this.direccionCliente || undefined;
    req.paqueteId = this.paqueteId!;
    req.distritoId = this.distritoId!;
    req.fechaEvento = this.formatoFecha(this.fechaEvento!);
    req.direccionEvento = this.direccionEvento.trim() || undefined;
    req.horaInicio = this.horaInicio || undefined;
    req.tipoEvento = this.tipoEvento || undefined;
    req.horasSolicitadas = this.horas;
    req.musicos = Object.entries(this.cantidades)
      .filter(([, c]) => c > 0)
      .map(([id, c]) => ({ musicoId: +id, cantidad: c }));
    req.serviciosExtra = Object.entries(this.serviciosSel)
      .filter(([, v]) => v)
      .map(([id]) => +id);
    req.observaciones = this.observaciones || undefined;
    return req;
  }

  private formatoFecha(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const dia = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${dia}`;
  }

  enviar(): void {
    if (!this.datosEventoOk || !this.contactoOk) return;
    this.enviando = true;
    this.cotizacionService.crear(this.armarRequest()).subscribe({
      next: c => {
        this.enviando = false;
        this.enviado = true;
        this.folio = c.id;
        this.codigoAcceso = c.codigoAcceso;
        this.aTratar = !!c.tieneATratar;
        this.motivoATratar = c.motivoATratar ?? '';
        this.noti.exito('Te contactaremos muy pronto.', '¡Cotización enviada!');
      },
      error: (e) => {
        this.enviando = false;
        // 409 = el día se ocupó (p. ej. el admin confirmó otro contrato mientras cotizaba)
        this.noti.error(e?.error?.mensaje ?? 'Hubo un problema al enviar. Intenta de nuevo.');
      },
    });
  }

  get nombreContrato(): string { return `Contrato-Agua-Cristalina-${this.folio}.pdf`; }

  bajarArchivo(): void {
    if (!this.contratoUrl) return;
    const a = this.document.createElement('a');
    a.href = this.contratoUrl;
    a.download = this.nombreContrato;
    a.click();
  }

  /** Mensaje de WhatsApp para coordinar lo que quedó "a tratar" */
  get waATratar(): string {
    const msg = `Hola, acabo de enviar la cotización #${this.folio} y quiero coordinar los detalles pendientes 🎶`;
    return `https://wa.me/${this.whatsapp}?text=${encodeURIComponent(msg)}`;
  }

  ngOnDestroy(): void {
    if (this.contratoUrl) URL.revokeObjectURL(this.contratoUrl);
  }

  descargarContrato(): void {
    if (!this.folio || this.descargando) return;
    this.descargando = true;
    this.cotizacionService.descargarContrato(this.folio, this.codigoAcceso).subscribe({
      next: blob => {
        this.descargando = false;
        if (this.contratoUrl) URL.revokeObjectURL(this.contratoUrl);
        this.contratoUrl = URL.createObjectURL(blob);
        this.contratoVista = this.sanitizer.bypassSecurityTrustResourceUrl(this.contratoUrl);
        // Descarga el archivo y además lo deja visible en la página
        this.bajarArchivo();
      },
      error: () => {
        this.descargando = false;
        this.noti.error('No se pudo generar el contrato. Intenta de nuevo.');
      },
    });
  }
}
