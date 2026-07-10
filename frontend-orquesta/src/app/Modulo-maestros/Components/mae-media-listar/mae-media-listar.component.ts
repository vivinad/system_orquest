import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MaeCatalogoService } from '../../Services/mae-catalogo.service';
import { NotificacionService } from '../../../Modulo-seguridad/Services/notificacion.service';
import { MediaHome } from '../../Models/mae-catalogo.model';

@Component({
  selector: 'mae-media-listar',
  standalone: true,
  imports: [FormsModule, MatCardModule, MatButtonModule, MatIconModule, MatFormFieldModule, MatInputModule],
  templateUrl: './mae-media-listar.component.html',
  styleUrls: ['./mae-media-listar.component.css'],
})
export class MaeMediaListarComponent implements OnInit {
  private catalogoService = inject(MaeCatalogoService);
  private noti = inject(NotificacionService);

  videos: MediaHome[] = [];
  fotos: MediaHome[] = [];
  nuevoVideo = '';

  ngOnInit(): void { this.cargar(); }

  cargar(): void {
    this.catalogoService.listarMedia('video').subscribe(v => (this.videos = v));
    this.catalogoService.listarMedia('foto').subscribe(f => (this.fotos = f));
  }

  miniaturaDe(id: string): string {
    return `https://img.youtube.com/vi/${id}/mqdefault.jpg`;
  }

  agregarVideo(): void {
    const id = this.extraerIdYoutube(this.nuevoVideo);
    if (!id) {
      this.noti.error('Pega un enlace de YouTube válido (o el ID del video).');
      return;
    }
    this.catalogoService.agregarMedia('video', id).subscribe({
      next: () => {
        this.noti.toast('Video agregado al home.');
        this.nuevoVideo = '';
        this.cargar();
      },
      error: () => this.noti.error('No se pudo agregar el video.'),
    });
  }

  fotoSeleccionada(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      this.catalogoService.agregarMedia('foto', reader.result as string).subscribe({
        next: () => {
          this.noti.toast('Foto agregada al home.');
          this.cargar();
        },
        error: () => this.noti.error('No se pudo agregar la foto.'),
      });
    };
    reader.readAsDataURL(file);
    input.value = ''; // permite volver a elegir el mismo archivo
  }

  async eliminar(m: MediaHome): Promise<void> {
    const ok = await this.noti.confirmar(
      m.tipo === 'video' ? '¿Quitar este video del home?' : '¿Quitar esta foto de la portada?',
    );
    if (!ok) return;
    this.catalogoService.eliminarMedia(m.id).subscribe({
      next: () => {
        this.noti.toast('Eliminado.');
        this.cargar();
      },
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
