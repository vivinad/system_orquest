import { Component, ElementRef, OnDestroy, OnInit, ViewChild, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MaeCatalogoService } from '../../../Modulo-maestros/Services/mae-catalogo.service';
import { Evento } from '../../../Modulo-maestros/Models/mae-catalogo.model';
import { ClMetodosPagoComponent } from '../cl-metodos-pago/cl-metodos-pago.component';

@Component({
  selector: 'cl-home',
  standalone: true,
  imports: [RouterLink, MatButtonModule, MatIconModule, ClMetodosPagoComponent],
  templateUrl: './cl-home.component.html',
  styleUrls: ['./cl-home.component.css'],
})
export class ClHomeComponent implements OnInit, OnDestroy {
  private sanitizer = inject(DomSanitizer);
  private catalogoService = inject(MaeCatalogoService);

  readonly whatsapp = '51993771153';

  // Carrusel de fotos del hero (el admin las gestiona en "Contenido web";
  // esta lista es el respaldo si la API no responde)
  fotos = ['imagen2.jpg', 'imagen3.jpg', 'imagen1.jpg', 'imagen4.png', 'imagen5.png', 'imagen6.png', 'imagen7.png'];
  fotoActual = 0;
  private timer?: ReturnType<typeof setInterval>;

  // Próximos eventos (los gestiona el admin): un solo carrusel que avanza
  // evento por evento; el mapa se mueve con cada uno porque su ubicación puede cambiar.
  eventos: Evento[] = [];
  private mapas = new Map<string, SafeResourceUrl>();
  eventoIndex = 0;

  // Videos de YouTube del home (el admin los gestiona en "Contenido web";
  // esta lista es el respaldo si la API no responde)
  videosYT: string[] = [
    '2Qjpa-Tkbd0',
    '8wZEO0-0uXc',
    'gF-QTKfEmrs',
    'ODzmbdhZ42U',
    'osJSiNGWoQ4',
    'dZxinGCr6cU',
    'AIf5rnoSUoY',
    'j7ReJx63Zgw'
  ];
  private videosUrls = new Map<string, SafeResourceUrl>();
  // Video que se muestra en el reproductor grande (arranca con el primero)
  videoActual = this.videosYT[0];

  ngOnInit(): void {
    this.iniciarTimer();
    this.catalogoService.listarEventosVigentes().subscribe(e => {
      this.eventos = e;
    });
    // Videos y fotos administrados desde "Contenido web"
    this.catalogoService.listarMedia('video').subscribe(v => {
      if (v.length > 0) {
        this.videosYT = v.map(m => m.valor);
        this.videoActual = this.videosYT[0];
      }
    });
    this.catalogoService.listarMedia('foto').subscribe(f => {
      if (f.length > 0) {
        this.fotos = f.map(m => m.valor);
        this.fotoActual = 0;
      }
    });
  }
  ngOnDestroy(): void {
    clearInterval(this.timer);
  }

  private iniciarTimer(): void {
    clearInterval(this.timer);
    this.timer = setInterval(() => {
      this.siguienteFoto();
      this.siguienteEvento();
    }, 6500);
  }

  siguienteFoto(): void {
    this.fotoActual = (this.fotoActual + 1) % this.fotos.length;
  }

  private siguienteEvento(): void {
    if (this.eventos.length > 0) {
      this.eventoIndex = (this.eventoIndex + 1) % this.eventos.length;
    }
  }
  // Navegación manual del carrusel de eventos: cambia de evento (foto + mapa) y reinicia el contador
  eventoManual(paso: number): void {
    if (this.eventos.length === 0) return;
    this.eventoIndex = ((this.eventoIndex + paso) % this.eventos.length + this.eventos.length) % this.eventos.length;
    this.iniciarTimer();
  }
  get eventoActual(): Evento | undefined {
    return this.eventos[this.eventoIndex];
  }

  mapaDe(direccion: string): SafeResourceUrl {
    if (!this.mapas.has(direccion)) {
      this.mapas.set(
        direccion,
        this.sanitizer.bypassSecurityTrustResourceUrl(
          `https://www.google.com/maps?q=${encodeURIComponent(direccion)}&output=embed`,
        ),
      );
    }
    return this.mapas.get(direccion)!;
  }

  seleccionarVideo(id: string): void {
    this.videoActual = id;
  }

  // Fila de miniaturas: se desplaza de a 3 miniaturas con las flechas
  @ViewChild('thumbsRow') thumbsRow?: ElementRef<HTMLDivElement>;
  desplazarThumbs(direccion: number): void {
    this.thumbsRow?.nativeElement.scrollBy({ left: direccion * 480, behavior: 'smooth' });
  }

  // Miniatura oficial que YouTube genera para cada video
  miniaturaDe(id: string): string {
    return `https://img.youtube.com/vi/${id}/mqdefault.jpg`;
  }

  videoDe(id: string): SafeResourceUrl {
    if (!this.videosUrls.has(id)) {
      this.videosUrls.set(
        id,
        this.sanitizer.bypassSecurityTrustResourceUrl(`https://www.youtube-nocookie.com/embed/${id}`),
      );
    }
    return this.videosUrls.get(id)!;
  }

  get waLink(): string {
    const msg = 'Hola, quiero información sobre Agrupación Agua Cristalina para mi evento 🎶';
    return `https://wa.me/${this.whatsapp}?text=${encodeURIComponent(msg)}`;
  }
}
