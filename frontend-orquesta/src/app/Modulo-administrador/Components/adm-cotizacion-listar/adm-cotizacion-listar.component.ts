import { Component, OnInit, inject } from '@angular/core';
import { SlicePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ClCotizacionService } from '../../../Modulo-cliente/Services/cl-cotizacion.service';
import { NotificacionService } from '../../../Modulo-seguridad/Services/notificacion.service';
import { Cotizacion } from '../../../Modulo-cliente/Models/cl-cotizacion.model';

@Component({
  selector: 'adm-cotizacion-listar',
  standalone: true,
  imports: [SlicePipe, FormsModule, MatTableModule, MatCardModule, MatButtonToggleModule, MatFormFieldModule, MatSelectModule, MatIconModule, MatTooltipModule],
  templateUrl: './adm-cotizacion-listar.component.html',
  styleUrls: ['./adm-cotizacion-listar.component.css'],
})
export class AdmCotizacionListarComponent implements OnInit {
  private cotizacionService = inject(ClCotizacionService);
  private noti = inject(NotificacionService);

  lista: Cotizacion[] = [];
  filtro = '';
  columnas = ['folio', 'cliente', 'evento', 'tipo', 'ubicacion', 'total', 'estado'];
  estados = ['pendiente', 'confirmada', 'pagada', 'realizada', 'rechazada', 'cancelada'];

  ngOnInit(): void { this.cargar(); }

  cargar(): void {
    this.cotizacionService.listar(this.filtro || undefined).subscribe(c => (this.lista = c));
  }

  cambiar(c: Cotizacion, estado: string): void {
    this.cotizacionService.cambiarEstado(c.id, estado).subscribe(() => {
      this.noti.toast(`Cotización #${c.id} → ${estado}`);
      if (this.filtro && this.filtro !== estado) this.cargar();
    });
  }

  pen(n: number): string { return 'S/ ' + (n ?? 0).toFixed(2); }
}
