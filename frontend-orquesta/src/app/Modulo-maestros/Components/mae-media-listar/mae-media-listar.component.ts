import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MaeCatalogoService } from '../../Services/mae-catalogo.service';
import { NotificacionService } from '../../../Modulo-seguridad/Services/notificacion.service';
import { MediaHome } from '../../Models/mae-catalogo.model';

@Component({
  selector: 'mae-media-listar',
  standalone: true,
  imports: [FormsModule, MatIconModule, MatTooltipModule],
  templateUrl: './mae-media-listar.component.html',
  styleUrls: ['./mae-media-listar.component.css'],
})
export class MaeMediaListarComponent implements OnInit {
  private catalogoService = inject(MaeCatalogoService);
  private noti = inject(NotificacionService);

  videos: MediaHome[] = [];
  fotos: MediaHome[] = [];
  nuevoVideo = '';
  agregando = false;
  titulos: Record<string, string> = {};

  ngOnInit(): void { this.cargar(); }

  cargar(): void {
    this.catalogoService.listarMedia('video').subscribe({
      next: v => {
        this.videos = [...v].sort((a, b) => a.orden - b.orden);
        this.cargarTitulos();
      },
      error: () => {},
    });
    this.catalogoService.listarMedia('foto').subscribe({
      next: f => { this.fotos = [...f].sort((a, b) => a.orden - b.orden); },
      error: () => {},
    });
  }

  miniaturaDe(id: string): string { return `https://img.youtube.com/vi/${id}/mqdefault.jpg`; }
  enlaceDe(id: string): string { return `https://www.youtube.com/watch?v=${id}`; }
  tituloDe(id: string): string { return this.titulos[id] ?? 'Video de YouTube'; }

  /** Vista previa del ID mientras se escribe el enlace */
  get idDetectado(): string | null { return this.extraerIdYoutube(this.nuevoVideo); }

  private cargarTitulos(): void {
    for (const v of this.videos) {
      if (this.titulos[v.valor]) continue;
      const url = 'https://www.youtube.com/oembed?format=json&url=' + encodeURIComponent(this.enlaceDe(v.valor));
      // fetch directo (sin HttpClient) para no enviar el token del admin a YouTube
      fetch(url)
        .then(r => (r.ok ? r.json() : null))
        .then(d => { if (d?.title) this.titulos = { ...this.titulos, [v.valor]: d.title }; })
        .catch(() => { /* sin título */ });
    }
  }

  agregarVideo(): void {
    const id = this.idDetectado;
    if (!id) { this.noti.error('Pega un enlace de YouTube válido (o el ID del video).'); return; }
    if (this.videos.some(v => v.valor === id)) { this.noti.info('Ese video ya está en la página principal.'); return; }
    this.agregando = true;
    this.catalogoService.agregarMedia('video', id).subscribe({
      next: () => {
        this.agregando = false;
        this.noti.toast('Video agregado al home.');
        this.nuevoVideo = '';
        this.cargar();
      },
      error: () => { this.agregando = false; this.noti.error('No se pudo agregar el video.'); },
    });
  }

  fotoSeleccionada(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { this.noti.error('El archivo debe ser una imagen.'); return; }
    const reader = new FileReader();
    reader.onload = () => {
      this.catalogoService.agregarMedia('foto', reader.result as string).subscribe({
        next: () => { this.noti.toast('Portada agregada.'); this.cargar(); },
        error: () => this.noti.error('No se pudo agregar la foto.'),
      });
    };
    reader.readAsDataURL(file);
    input.value = ''; // permite volver a elegir el mismo archivo
  }

  /** Mueve un video o foto una posición (delta -1 = antes, +1 = después) y guarda el orden */
  mover(lista: 'videos' | 'fotos', i: number, delta: number): void {
    const items = [...this[lista]];
    const j = i + delta;
    if (j < 0 || j >= items.length) return;
    [items[i], items[j]] = [items[j], items[i]];
    const anterior = this[lista];
    this[lista] = items;
    this.catalogoService.ordenarMedia(items.map(m => m.id)).subscribe({
      next: () => this.noti.toast('Orden actualizado.'),
      error: () => { this[lista] = anterior; this.noti.error('No se pudo guardar el nuevo orden.'); },
    });
  }

  async eliminar(m: MediaHome): Promise<void> {
    const ok = await this.noti.confirmar(
      m.tipo === 'video' ? '¿Quitar este video del home?' : '¿Quitar esta foto de la portada?',
    );
    if (!ok) return;
    this.catalogoService.eliminarMedia(m.id).subscribe({
      next: () => { this.noti.toast('Eliminado.'); this.cargar(); },
      error: () => this.noti.error('No se pudo eliminar.'),
    });
  }

  // Acepta enlaces youtube.com/watch?v=..., youtu.be/..., shorts, embed... o el ID pelado
  private extraerIdYoutube(texto: string): string | null {
    const t = (texto || '').trim();
    const m = t.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/|youtube\.com\/embed\/)([\w-]{6,})/);
    if (m) return m[1];
    return /^[\w-]{6,}$/.test(t) ? t : null;
  }
}
