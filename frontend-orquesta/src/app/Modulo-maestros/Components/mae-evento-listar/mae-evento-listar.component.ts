import { Component, HostListener, OnDestroy, OnInit, inject } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MaeCatalogoService } from '../../Services/mae-catalogo.service';
import { NotificacionService } from '../../../Modulo-seguridad/Services/notificacion.service';
import { Evento } from '../../Models/mae-catalogo.model';
import { fechaCorta, fechaMedia, hoyIso, diasHasta } from '../../../Modulo-administrador/Services/adm-formato';

@Component({
  selector: 'mae-evento-listar',
  standalone: true,
  imports: [FormsModule, NgTemplateOutlet, MatIconModule, MatTooltipModule],
  templateUrl: './mae-evento-listar.component.html',
  styleUrls: ['./mae-evento-listar.component.css'],
})
export class MaeEventoListarComponent implements OnInit, OnDestroy {
  private catalogoService = inject(MaeCatalogoService);
  private noti = inject(NotificacionService);
  private sanitizer = inject(DomSanitizer);

  eventos: Evento[] = [];
  /** Eventos quitados con la papelera (se pueden restaurar) */
  ocultos: Evento[] = [];
  verOcultos = false;
  cargando = true;
  guardando = false;
  editando: Partial<Evento> = this.nuevo();

  // Sugerencias para la categoría (se puede escribir cualquier otra)
  readonly categoriasSugeridas = [
    'Fiesta patronal', 'Festival playero', 'Evento especial', 'Fiestas Patrias',
    'Todos los domingos', 'Concierto', 'Aniversario',
  ];

  // Vista previa del mapa para verificar que la dirección sea exacta
  mapaPreview: SafeResourceUrl | null = null;
  private mapaTimer?: ReturnType<typeof setTimeout>;

  readonly fechaCorta = fechaCorta;
  readonly fechaMedia = fechaMedia;

  editorAbierto = false;

  // Mapa de la tarjeta "Ubicación" (evento seleccionado)
  mapaEvento: SafeResourceUrl | null = null;
  eventoMapa: Evento | null = null;

  ngOnInit(): void { this.cargar(); }

  get vigentesLista(): Evento[] { return this.eventos.filter(e => this.vigente(e)); }
  get vencidosLista(): Evento[] { return this.eventos.filter(e => !this.vigente(e)); }

  verEnMapa(e: Evento): void {
    this.eventoMapa = e;
    const dir = (e.direccion || '').trim();
    this.mapaEvento = dir
      ? this.sanitizer.bypassSecurityTrustResourceUrl(`https://www.google.com/maps?q=${encodeURIComponent(dir)}&output=embed`)
      : null;
  }

  nuevoEvento(): void {
    this.limpiar();
    this.abrirModal();
  }

  private abrirModal(): void {
    this.editorAbierto = true;
    document.body.classList.add('adm-modal-abierto');
  }

  cerrarModal(): void {
    // Siempre se puede cerrar (aunque el guardado siga en curso o la API no responda)
    this.guardando = false;
    this.limpiar();
  }

  @HostListener('document:keydown.escape')
  alEscape(): void { if (this.editorAbierto) this.cerrarModal(); }

  ngOnDestroy(): void { document.body.classList.remove('adm-modal-abierto'); }

  cargar(): void {
    this.catalogoService.listarEventosOcultos().subscribe({ next: o => (this.ocultos = o), error: () => (this.ocultos = []) });
    this.catalogoService.listarEventos().subscribe({
      next: e => {
        // Vigentes primero (por fecha más cercana) y luego los vencidos
        this.eventos = [...e].sort((a, b) => {
          const va = this.vigente(a), vb = this.vigente(b);
          if (va !== vb) return va ? -1 : 1;
          return va ? a.fecha.localeCompare(b.fecha) : b.fecha.localeCompare(a.fecha);
        });
        this.cargando = false;
        const actual = this.eventos.find(x => x.id === this.eventoMapa?.id) ?? this.vigentesLista[0] ?? null;
        if (actual) this.verEnMapa(actual); else { this.eventoMapa = null; this.mapaEvento = null; }
      },
      error: () => { this.cargando = false; this.noti.error('No se pudieron cargar los eventos.'); },
    });
  }

  vigente(e: Evento): boolean { return (e.fecha || '').slice(0, 10) >= hoyIso(); }
  get vigentes(): number { return this.eventos.filter(e => this.vigente(e)).length; }

  restanTxt(e: Evento): string {
    const n = diasHasta(e.fecha);
    return n === 0 ? 'Último día hoy' : n === 1 ? 'Termina mañana' : `Quedan ${n} días`;
  }

  serviciosDe(e: Partial<Evento>): string[] {
    return (e.servicios || '').split(',').map(s => s.trim()).filter(Boolean);
  }

  nuevo(): Partial<Evento> {
    return { titulo: '', fechaTexto: '', fecha: '', lugar: '', direccion: '', imagenUrl: '', categoria: '', horario: '', descripcion: '', servicios: '' };
  }

  limpiar(): void {
    this.editando = this.nuevo();
    this.mapaPreview = null;
    this.editorAbierto = false;
    document.body.classList.remove('adm-modal-abierto');
  }

  editar(e: Evento): void {
    this.editando = { ...e, fecha: (e.fecha || '').slice(0, 10) };
    this.abrirModal();
    this.verEnMapa(e);
    this.actualizarMapa();
  }

  // Espera a que el admin deje de escribir y luego actualiza el mapa
  direccionCambiada(): void {
    clearTimeout(this.mapaTimer);
    this.mapaTimer = setTimeout(() => this.actualizarMapa(), 700);
  }

  private actualizarMapa(): void {
    const dir = (this.editando.direccion ?? '').trim();
    this.mapaPreview = dir
      ? this.sanitizer.bypassSecurityTrustResourceUrl(
          `https://www.google.com/maps?q=${encodeURIComponent(dir)}&output=embed`,
        )
      : null;
  }

  imagenSeleccionada(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => (this.editando.imagenUrl = reader.result as string);
    reader.readAsDataURL(file);
    input.value = ''; // permite volver a elegir el mismo archivo
  }

  guardar(): void {
    const e = this.editando;
    e.titulo = (e.titulo || '').trim();
    if (!e.titulo || !e.fecha || !e.direccion || !e.imagenUrl) {
      this.noti.error('Título, fecha, dirección e imagen son obligatorios.');
      return;
    }
    this.guardando = true;
    const onOk = () => {
      this.guardando = false;
      this.noti.toast(e.id ? 'Evento actualizado.' : 'Evento publicado.');
      this.limpiar();
      this.cargar();
    };
    const onError = () => { this.guardando = false; this.noti.error('No se pudo guardar el evento.'); };
    if (e.id) this.catalogoService.actualizarEvento(e as Evento).subscribe({ next: onOk, error: onError });
    else this.catalogoService.grabarEvento(e).subscribe({ next: onOk, error: onError });
  }

  restaurar(e: Evento): void {
    this.catalogoService.restaurarEvento(e).subscribe({
      next: () => { this.noti.toast(`"${e.titulo}" vuelve a la cartelera.`); this.cargar(); },
      error: () => this.noti.error('No se pudo restaurar el evento.'),
    });
  }


  async eliminar(e: Evento): Promise<void> {
    const ok = await this.noti.confirmar(`"${e.titulo}" dejará de mostrarse en la página principal. Podrás restaurarlo desde "Eventos ocultos".`, '¿Quitar este evento?');
    if (!ok) return;
    this.catalogoService.eliminarEvento(e.id).subscribe({
      next: () => {
        this.noti.toast('Evento quitado. Puedes restaurarlo en "Eventos ocultos".');
        if (this.editando.id === e.id) this.limpiar();
        this.cargar();
      },
      error: () => this.noti.error('No se pudo quitar el evento.'),
    });
  }
}
