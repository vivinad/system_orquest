import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { AdmFinanzaService } from '../../Services/adm-finanza.service';
import { ClCotizacionService } from '../../../Modulo-cliente/Services/cl-cotizacion.service';
import { ResumenFinanzas } from '../../Models/adm-finanza.model';

@Component({
  selector: 'adm-dashboard',
  standalone: true,
  imports: [RouterLink, MatCardModule, MatIconModule, MatButtonModule],
  templateUrl: './adm-dashboard.component.html',
  styleUrls: ['./adm-dashboard.component.css'],
})
export class AdmDashboardComponent implements OnInit {
  private finanzaService = inject(AdmFinanzaService);
  private cotizacionService = inject(ClCotizacionService);

  resumen: ResumenFinanzas | null = null;
  pendientes = 0;

  ngOnInit(): void {
    this.finanzaService.obtenerResumen().subscribe(r => (this.resumen = r));
    this.cotizacionService.contarPendientes().subscribe(n => (this.pendientes = n));
  }

  pen(n: number | undefined | null): string {
    return 'S/ ' + (n ?? 0).toFixed(2);
  }
}
