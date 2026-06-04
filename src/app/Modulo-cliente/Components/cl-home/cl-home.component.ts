import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MaeCatalogoService } from '../../../Modulo-maestros/Services/mae-catalogo.service';
import { Paquete } from '../../../Modulo-maestros/Models/mae-catalogo.model';

@Component({
  selector: 'cl-home',
  standalone: true,
  imports: [RouterLink, MatButtonModule, MatIconModule],
  templateUrl: './cl-home.component.html',
  styleUrls: ['./cl-home.component.css'],
})
export class ClHomeComponent implements OnInit {
  private catalogoService = inject(MaeCatalogoService);

  paquetes: Paquete[] = [];
  readonly whatsapp = '51993771153';

  ngOnInit(): void {
    this.catalogoService.listarPaquetes().subscribe(p => (this.paquetes = p));
  }

  get waLink(): string {
    const msg = 'Hola, quiero información sobre Agrupación Agua Cristalina para mi evento 🎶';
    return `https://wa.me/${this.whatsapp}?text=${encodeURIComponent(msg)}`;
  }

  pen(n: number): string {
    return 'S/ ' + (n ?? 0).toFixed(0);
  }
}
