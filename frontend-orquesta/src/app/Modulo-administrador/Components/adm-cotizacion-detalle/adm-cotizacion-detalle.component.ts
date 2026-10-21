import { Component, EventEmitter, HostListener, Input, OnDestroy, OnInit, Output, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MaeCatalogoService } from '../../../Modulo-maestros/Services/mae-catalogo.service';
import { MusicoAdicional, ServicioExtra } from '../../../Modulo-maestros/Models/mae-catalogo.model';
import { Cotizacion } from '../../../Modulo-cliente/Models/cl-cotizacion.model';
import { monto, fechaMedia, estadoInfo, rangoHoras } from '../../Services/adm-formato';

/** Ventana con todo el detalle de una cotización (solo lectura) */
@Component({
  selector: 'adm-cotizacion-detalle',
  standalone: true,
  imports: [MatIconModule, MatTooltipModule],
  templateUrl: './adm-cotizacion-detalle.component.html',
  styleUrls: ['./adm-cotizacion-detalle.component.css'],
})
export class AdmCotizacionDetalleComponent implements OnInit, OnDestroy {
  private catalogoService = inject(MaeCatalogoService);

  @Input({ required: true }) cotizacion!: Cotizacion;
  /** Lo cobrado según Finanzas (ingresos vinculados) */
  @Input() cobrado = 0;
  @Input() whatsapp = '';
  @Input() descargando = false;
  @Output() cerrar = new EventEmitter<void>();
  @Output() editar = new EventEmitter<void>();
  @Output() contrato = new EventEmitter<void>();

  musicos: MusicoAdicional[] = [];
  servicios: ServicioExtra[] = [];

  readonly monto = monto;
  readonly fechaMedia = fechaMedia;
  readonly estadoInfo = estadoInfo;

  ngOnInit(): void {
    document.body.classList.add('adm-modal-abierto');
    this.catalogoService.listarMusicos().subscribe({ next: m => (this.musicos = m), error: () => {} });
    this.catalogoService.listarServicios().subscribe({ next: s => (this.servicios = s), error: () => {} });
  }

  ngOnDestroy(): void { document.body.classList.remove('adm-modal-abierto'); }

  @HostListener('document:keydown.escape')
  alEscape(): void { this.cerrar.emit(); }

  get c(): Cotizacion { return this.cotizacion; }
  get saldo(): number { return Math.max(0, Math.round(((this.c.total || 0) - this.cobrado) * 100) / 100); }
  get horario(): string { return rangoHoras(this.c.horaInicio, this.c.horasSolicitadas); }
  get acordado(): boolean { return !!this.c.motivoATratar && !this.c.tieneATratar; }
  get tipo(): string {
    const t = (this.c.tipoEvento || '').trim();
    return t ? t.charAt(0).toUpperCase() + t.slice(1) : 'Sin especificar';
  }

  nombreMusico(id: number): string { return this.musicos.find(m => m.id === id)?.nombre ?? `Músico #${id}`; }
  nombreServicio(id: number): string { return this.servicios.find(s => s.id === id)?.nombre ?? `Servicio #${id}`; }
}
