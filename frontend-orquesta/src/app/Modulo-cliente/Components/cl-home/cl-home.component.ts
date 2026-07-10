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

  // Próximos eventos (los gestiona el admin): un solo carrusel que avanza
  // evento por evento; el mapa se mueve con cada uno porque su ubicación puede cambiar.
  eventos: Evento[] = [];
  private mapas = new Map<string, SafeResourceUrl>();
  eventoIndex = 0;

  ngOnInit(): void {
    this.iniciarTimer();
    this.catalogoService.listarEventosVigentes().subscribe(e => {
      this.eventos = e;
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

  get waLink(): string {
    const msg = 'Hola, quiero información sobre Agrupación Agua Cristalina para mi evento 🎶';
    return `https://wa.me/${this.whatsapp}?text=${encodeURIComponent(msg)}`;
  }
}
