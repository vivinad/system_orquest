import { Component, HostListener, OnDestroy, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MaeCatalogoService } from '../../Services/mae-catalogo.service';
import { NotificacionService } from '../../../Modulo-seguridad/Services/notificacion.service';
import { Paquete } from '../../Models/mae-catalogo.model';
import { soles, monto } from '../../../Modulo-administrador/Services/adm-formato';

@Component({
  selector: 'mae-paquete-listar',
  standalone: true,
  imports: [FormsModule, MatIconModule, MatTooltipModule],
  templateUrl: './mae-paquete-listar.component.html',
  styleUrls: ['./mae-paquete-listar.component.css'],
})
export class MaePaqueteListarComponent implements OnInit, OnDestroy {
  private catalogoService = inject(MaeCatalogoService);
  private noti = inject(NotificacionService);

  paquetes: Paquete[] = [];
  /** Paquetes quitados del catálogo (se pueden restaurar) */
  ocultos: Paquete[] = [];
  verOcultos = false;
  cargando = true;
  guardando = false;
  editando: Partial<Paquete> = this.nuevo();
  /** El editor se abre en una ventana modal */
  modalAbierto = false;

  readonly soles = soles;
  readonly monto = monto;

  ngOnInit(): void { this.cargar(); }

  cargar(): void {
    this.catalogoService.listarPaquetes().subscribe({
      next: p => { this.paquetes = p; this.cargando = false; },
      error: () => { this.cargando = false; this.noti.error('No se pudieron cargar los paquetes.'); },
    });
    this.catalogoService.listarPaquetesOcultos().subscribe({ next: o => (this.ocultos = o), error: () => (this.ocultos = []) });
  }

  restaurar(p: Paquete): void {
    this.catalogoService.restaurarPaquete(p).subscribe({
      next: () => { this.noti.toast(`"${p.nombre}" vuelve a mostrarse en la web.`); this.cargar(); },
      error: () => this.noti.error('No se pudo restaurar el paquete.'),
    });
  }


  get precioMinimo(): number { return this.paquetes.length ? Math.min(...this.paquetes.map(p => p.precioBase)) : 0; }

  nuevo(): Partial<Paquete> {
    return { nombre: '', descripcion: '', numIntegrantes: 3, horasBase: 5, precioBase: undefined };
  }
  limpiar(): void { this.editando = this.nuevo(); }

  editar(p: Paquete): void {
    this.editando = { ...p };
    this.irAlEditor();
  }

  duplicar(p: Paquete): void {
    const copia: Partial<Paquete> = { ...p, nombre: `${p.nombre} (copia)` };
    delete copia.id;
    this.editando = copia;
    this.irAlEditor();
  }

  nuevoPaquete(): void {
    this.limpiar();
    this.irAlEditor();
  }

  private irAlEditor(): void {
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

  paso(campo: 'numIntegrantes' | 'horasBase', delta: number): void {
    const min = 1, max = campo === 'horasBase' ? 12 : 30;
    const v = (this.editando[campo] ?? min) + delta;
    this.editando[campo] = Math.min(max, Math.max(min, v));
  }

  /** Precio por hora de referencia (el cotizador lo usa para calcular horas extra) */
  get precioHora(): number {
    const h = this.editando.horasBase || 0;
    return h > 0 ? (this.editando.precioBase || 0) / h : 0;
  }

  guardar(): void {
    const e = this.editando;
    e.nombre = (e.nombre || '').trim();
    if (!e.nombre || !e.precioBase) { this.noti.error('Nombre y precio son obligatorios.'); return; }
    if (e.precioBase <= 0) { this.noti.error('El precio debe ser mayor a 0.'); return; }
    this.guardando = true;
    const onOk = () => {
      this.guardando = false;
      this.noti.toast(e.id ? 'Paquete actualizado.' : 'Paquete creado.');
      this.cerrarModal();
      this.cargar();
    };
    const onError = () => { this.guardando = false; this.noti.error('No se pudo guardar el paquete.'); };
    if (e.id) this.catalogoService.actualizarPaquete(e as Paquete).subscribe({ next: onOk, error: onError });
    else this.catalogoService.grabarPaquete({ ...e, activo: true }).subscribe({ next: onOk, error: onError });
  }

  /** El ícono de papelera también desactiva el paquete (no se borra de la base: lo usan cotizaciones antiguas) */
  async eliminar(p: Paquete): Promise<void> {
    const ok = await this.noti.confirmar(
      `"${p.nombre}" dejará de mostrarse en la página y en el cotizador. Podrás restaurarlo desde "Paquetes ocultos". Las cotizaciones ya hechas no cambian.`,
      '¿Quitar este paquete?',
    );
    if (!ok) return;
    this.catalogoService.eliminarPaquete(p.id).subscribe({
      next: () => {
        this.noti.toast('Paquete quitado. Puedes restaurarlo en "Paquetes ocultos".');
        if (this.editando.id === p.id) this.limpiar();
        this.cargar();
      },
      error: () => this.noti.error('No se pudo quitar el paquete.'),
    });
  }

}
