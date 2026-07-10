import { Component, OnInit, inject } from '@angular/core';
import { Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatStepperModule } from '@angular/material/stepper';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatCardModule } from '@angular/material/card';
import { MatRadioModule } from '@angular/material/radio';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { provideNativeDateAdapter } from '@angular/material/core';

import { MaeCatalogoService } from '../../../Modulo-maestros/Services/mae-catalogo.service';
import { Paquete, Distrito, MusicoAdicional, ServicioExtra } from '../../../Modulo-maestros/Models/mae-catalogo.model';
import { ClCotizacionService } from '../../Services/cl-cotizacion.service';
import { NotificacionService } from '../../../Modulo-seguridad/Services/notificacion.service';
import { CotizacionRequest, CotizacionResultado } from '../../Models/cl-cotizacion.model';
import { ClMetodosPagoComponent } from '../cl-metodos-pago/cl-metodos-pago.component';

@Component({
  selector: 'cl-cotizador',
  standalone: true,
  providers: [provideNativeDateAdapter()],
  imports: [
    FormsModule, RouterLink, MatStepperModule, MatButtonModule, MatIconModule,
    MatFormFieldModule, MatInputModule, MatSelectModule, MatDatepickerModule,
    MatCheckboxModule, MatCardModule, MatRadioModule, MatProgressSpinnerModule,
    ClMetodosPagoComponent,
  ],
  templateUrl: './cl-cotizador.component.html',
  styleUrls: ['./cl-cotizador.component.css'],
})
export class ClCotizadorComponent implements OnInit {
  private catalogoService = inject(MaeCatalogoService);
  private cotizacionService = inject(ClCotizacionService);
  private noti = inject(NotificacionService);
  private location = inject(Location);

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
  pasoActual = 0; // índice del paso activo del stepper (la burbuja de WhatsApp solo sale en "Tu evento")
  calculando = false;
  enviando = false;
  enviado = false;
  folio: number | null = null;
  descargando = false;

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
    return 'S/ ' + (n ?? 0).toFixed(2);
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
        this.noti.exito('Te contactaremos muy pronto.', '¡Cotización enviada!');
      },
      error: (e) => {
        this.enviando = false;
        // 409 = el día se ocupó (p. ej. el admin confirmó otro contrato mientras cotizaba)
        this.noti.error(e?.error?.mensaje ?? 'Hubo un problema al enviar. Intenta de nuevo.');
      },
    });
  }

  descargarContrato(): void {
    if (!this.folio || this.descargando) return;
    this.descargando = true;
    this.cotizacionService.descargarContrato(this.folio).subscribe({
      next: blob => {
        this.descargando = false;
        window.open(URL.createObjectURL(blob), '_blank');
      },
      error: () => {
        this.descargando = false;
        this.noti.error('No se pudo generar el contrato. Intenta de nuevo.');
      },
    });
  }
}
