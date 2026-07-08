import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MaeCatalogoService } from '../../../Modulo-maestros/Services/mae-catalogo.service';
import { Evento } from '../../../Modulo-maestros/Models/mae-catalogo.model';

@Component({
  selector: 'cl-home',
  standalone: true,
  imports: [RouterLink, MatButtonModule, MatIconModule],
  templateUrl: './cl-home.component.html',
  styleUrls: ['./cl-home.component.css'],
})
export class ClHomeComponent implements OnInit, OnDestroy {
  private sanitizer = inject(DomSanitizer);
  private catalogoService = inject(MaeCatalogoService);

  readonly whatsapp = '51993771153';

  // Carrusel de fotos del hero
  readonly fotos = ['imagen2.jpg', 'imagen3.jpg', 'imagen1.jpg', 'imagen4.png', 'imagen5.png', 'imagen6.png', 'imagen7.png'];
  fotoActual = 0;
  private timer?: ReturnType<typeof setInterval>;

  // Próximos eventos (los gestiona el admin), agrupados por ubicación:
  // los flyers de un mismo local rotan en carrusel y comparten mapa
  eventos: Evento[] = [];
  gruposEventos: { direccion: string; lugar: string; eventos: Evento[] }[] = [];
  private mapas = new Map<string, SafeResourceUrl>();

  // Carrusel de flyers por grupo de eventos
  eventoFotoActual = 0;

  ngOnInit(): void {
    this.iniciarTimer();
    this.catalogoService.listarEventosVigentes().subscribe(e => {
      this.eventos = e;
      this.agruparEventos();
    });
  }
  ngOnDestroy(): void {
    clearInterval(this.timer);
  }

  private iniciarTimer(): void {
    clearInterval(this.timer);
    this.timer = setInterval(() => {
      this.siguienteFoto();
      this.eventoFotoActual++;
    }, 4000);
  }

  siguienteFoto(): void {
    this.fotoActual = (this.fotoActual + 1) % this.fotos.length;
  }
  // Navegación manual: cambia la foto y reinicia el contador automático
  fotoManual(paso: number): void {
    this.fotoActual = (this.fotoActual + paso + this.fotos.length) % this.fotos.length;
    this.iniciarTimer();
  }
  irAFoto(i: number): void {
    this.fotoActual = i;
    this.iniciarTimer();
  }

  // Navegación manual del carrusel de flyers de eventos
  eventoManual(paso: number): void {
    this.eventoFotoActual += paso;
    this.iniciarTimer();
  }
  // Índice positivo del flyer visible en un grupo (soporta retrocesos)
  indiceEvento(g: { eventos: Evento[] }): number {
    const len = g.eventos.length;
    return ((this.eventoFotoActual % len) + len) % len;
  }

  private agruparEventos(): void {
    const grupos = new Map<string, { direccion: string; lugar: string; eventos: Evento[] }>();
    for (const e of this.eventos) {
      let g = grupos.get(e.direccion);
      if (!g) {
        g = { direccion: e.direccion, lugar: e.lugar, eventos: [] };
        grupos.set(e.direccion, g);
      }
      g.eventos.push(e);
    }
    this.gruposEventos = [...grupos.values()];
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

  get waLink(): string {
    const msg = 'Hola, quiero información sobre Agrupación Agua Cristalina para mi evento 🎶';
    return `https://wa.me/${this.whatsapp}?text=${encodeURIComponent(msg)}`;
  }
}
