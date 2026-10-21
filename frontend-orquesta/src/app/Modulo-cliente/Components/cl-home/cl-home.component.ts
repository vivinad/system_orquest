import { Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild, inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MaeCatalogoService } from '../../../Modulo-maestros/Services/mae-catalogo.service';
import { Evento } from '../../../Modulo-maestros/Models/mae-catalogo.model';
import { ClMetodosPagoComponent } from '../cl-metodos-pago/cl-metodos-pago.component';
import { TemaService } from '../../../Modulo-seguridad/Services/tema.service';
import { NotificacionService } from '../../../Modulo-seguridad/Services/notificacion.service';

@Component({
  selector: 'cl-home',
  standalone: true,
  imports: [RouterLink, MatButtonModule, MatIconModule, MatTooltipModule, ClMetodosPagoComponent],
  templateUrl: './cl-home.component.html',
  styleUrls: ['./cl-home.component.css'],
})
export class ClHomeComponent implements OnInit, OnDestroy {
  private sanitizer = inject(DomSanitizer);
  private catalogoService = inject(MaeCatalogoService);
  private temaService = inject(TemaService);
  private noti = inject(NotificacionService);
  private document = inject(DOCUMENT);

  // ---------- Barra de navegación ----------
  readonly enlaces = [
    { id: 'inicio', texto: 'Inicio' },
    { id: 'nosotros', texto: 'Nosotros' },
    { id: 'eventos', texto: 'Eventos' },
    { id: 'videos', texto: 'Videos' },
    { id: 'arma', texto: 'Arma tu orquesta' },
  ];
  seccionActiva = 'inicio';
  scrolled = false;
  readonly anio = new Date().getFullYear();

  // Tema oscuro / claro (se recuerda entre visitas)
  readonly tema = this.temaService.tema;
  alternarTema(): void {
    this.temaService.alternar();
  }

  // Desplazamiento suave a una sección (el navbar es fijo: se descuenta su alto)
  irA(evento: Event, id: string): void {
    const destino = this.document.getElementById(id);
    if (!destino) return; // la sección no existe (p. ej. no hay eventos): se deja el enlace normal
    evento.preventDefault();
    const top = id === 'inicio' ? 0 : destino.getBoundingClientRect().top + window.scrollY - 76;
    window.scrollTo({ top, behavior: 'smooth' });
  }

  // Marca en el navbar la sección que se está viendo
  @HostListener('window:scroll')
  alHacerScroll(): void {
    this.scrolled = window.scrollY > 8;
    let actual = 'inicio';
    for (const l of this.enlaces) {
      const el = this.document.getElementById(l.id);
      if (el && el.getBoundingClientRect().top <= 120) actual = l.id;
    }
    this.seccionActiva = actual;
  }

  // ---------- Tarjeta "Preview más solicitado" ----------
  previewAbierto = false;
  previewUrl?: SafeResourceUrl;

  abrirPreview(): void {
    const id = this.videosYT[0];
    if (!id) return;
    this.previewUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
      `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`,
    );
    this.previewAbierto = true;
    this.document.body.style.overflow = 'hidden';
  }

  cerrarPreview(): void {
    if (!this.previewAbierto) return;
    this.previewAbierto = false;
    this.previewUrl = undefined; // detiene el video
    this.document.body.style.overflow = '';
  }

  @HostListener('document:keydown.escape')
  alPresionarEscape(): void {
    this.cerrarPreview();
  }

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
    this.cargarTitulos(); // títulos de la lista de respaldo (si la API responde, se completan los nuevos)
    this.catalogoService.listarEventosVigentes().subscribe(e => {
      this.eventos = e;
    });
    // Videos y fotos administrados desde "Contenido web"
    this.catalogoService.listarMedia('video').subscribe(v => {
      if (v.length > 0) {
        this.videosYT = v.map(m => m.valor);
        this.videoActual = this.videosYT[0];
      }
      this.cargarTitulos();
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
    this.document.body.style.overflow = '';
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

  // Puntos del carrusel: salta a una foto y reinicia el contador
  fotoManual(indice: number): void {
    this.fotoActual = indice;
    this.iniciarTimer();
  }

  private siguienteEvento(): void {
    // Si la persona eligió un evento de la cartelera, ya no se cambia solo
    if (this.eventos.length > 0 && !this.eventoFijado) {
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

  // ---------- Cartelera de eventos ----------
  private eventoFijado = false;

  // Al tocar una fecha de la cartelera: se muestra arriba (afiche, lugar y mapa)
  seleccionarEvento(indice: number): void {
    this.eventoIndex = indice;
    this.eventoFijado = true;
    const vitrina = this.document.getElementById('vitrina-evento');
    if (vitrina) {
      window.scrollTo({ top: vitrina.getBoundingClientRect().top + window.scrollY - 90, behavior: 'smooth' });
    }
  }

  // "Cartelera 2026" o "Cartelera 2026 – 2027" según las fechas de los eventos
  get anioCartelera(): string {
    const anios = this.eventos
      .map(e => new Date(e.fecha).getFullYear())
      .filter(a => !isNaN(a));
    if (anios.length === 0) return String(this.anio);
    const min = Math.min(this.anio, ...anios);
    const max = Math.max(...anios);
    return min === max ? String(min) : `${min} – ${max}`;
  }

  serviciosDe(e: Evento): string[] {
    return (e.servicios ?? '').split(',').map(x => x.trim()).filter(x => x.length > 0).slice(0, 6);
  }

  // Ícono según lo que ofrece el local (por palabras clave; si no coincide, una estrella)
  iconoServicio(texto: string): string {
    const t = texto.toLowerCase();
    if (/(almuerzo|comida|ceviche|plato|menú|menu|parrilla)/.test(t)) return 'restaurant';
    if (/(estacionamiento|parqueo|cochera)/.test(t)) return 'local_parking';
    if (/(seguridad|vigilancia)/.test(t)) return 'verified_user';
    if (/(cerveza|trago|bebida|bar|coctel|cóctel)/.test(t)) return 'local_bar';
    if (/(familia|niños|ninos)/.test(t)) return 'family_restroom';
    if (/(playa|piscina)/.test(t)) return 'beach_access';
    return 'star';
  }

  mapsUrl(direccion: string): string {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(direccion)}`;
  }

  comoLlegarUrl(direccion: string): string {
    return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(direccion)}`;
  }

  async copiarDireccion(direccion: string): Promise<void> {
    try {
      await navigator.clipboard.writeText(direccion);
      this.noti.toast('Dirección copiada');
    } catch {
      this.noti.info(direccion, 'Dirección del evento');
    }
  }

  waEvento(e: Evento): string {
    const msg = `Hola, quiero información sobre el evento "${e.titulo}" (${e.fechaTexto}) de Agua Cristalina 🎶`;
    return `https://wa.me/${this.whatsapp}?text=${encodeURIComponent(msg)}`;
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

  // ---------- Títulos de los videos (los da YouTube, sin API key) ----------
  private titulos: Record<string, string> = {};

  tituloDe(id: string): string {
    return this.titulos[id] ?? 'Agua Cristalina en vivo';
  }

  private cargarTitulos(): void {
    for (const id of this.videosYT) {
      if (this.titulos[id]) continue;
      const url = 'https://www.youtube.com/oembed?format=json&url=' +
        encodeURIComponent(`https://www.youtube.com/watch?v=${id}`);
      // fetch directo (sin HttpClient) para no enviar el token del admin a YouTube
      fetch(url)
        .then(r => (r.ok ? r.json() : null))
        .then(d => {
          if (d?.title) this.titulos = { ...this.titulos, [id]: this.formatoTitulo(d.title) };
        })
        .catch(() => { /* sin título: se muestra el texto por defecto */ });
    }
  }

  // "MIX AÑORANZAS" -> "Mix Añoranzas" (los títulos del canal vienen en mayúsculas)
  private formatoTitulo(t: string): string {
    const limpio = t.replace(/\s+/g, ' ').trim();
    if (limpio !== limpio.toUpperCase()) return limpio;
    return limpio.toLowerCase().replace(/(^|[\s(\-‐])(\p{L})/gu, (_m: string, a: string, b: string) => a + b.toUpperCase())
      .replace(/ (De|Del|Y)(?= )/g, (m: string) => m.toLowerCase())
      .replace(/\b(Dr)\b/g, 'DR');
  }

  async compartirVideo(id: string): Promise<void> {
    const url = `https://www.youtube.com/watch?v=${id}`;
    const nav = navigator as Navigator & { share?: (d: ShareData) => Promise<void> };
    try {
      if (nav.share) {
        await nav.share({ title: this.tituloDe(id), text: 'Mira a Wendy y su Agua Cristalina 🎶', url });
      } else {
        await navigator.clipboard.writeText(url);
        this.noti.toast('Enlace del video copiado');
      }
    } catch { /* el usuario canceló */ }
  }

  // Fila de miniaturas: se desplaza de a 3 miniaturas con las flechas
  @ViewChild('thumbsRow') thumbsRow?: ElementRef<HTMLDivElement>;
  desplazarThumbs(direccion: number): void {
    const fila = this.thumbsRow?.nativeElement;
    fila?.scrollBy({ left: direccion * fila.clientWidth * 0.8, behavior: 'smooth' });
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
