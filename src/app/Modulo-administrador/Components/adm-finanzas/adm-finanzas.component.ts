import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { AdmFinanzaService } from '../../Services/adm-finanza.service';
import { NotificacionService } from '../../../Modulo-seguridad/Services/notificacion.service';
import { Finanza, ResumenFinanzas } from '../../Models/adm-finanza.model';

@Component({
  selector: 'adm-finanzas',
  standalone: true,
  imports: [FormsModule, MatTableModule, MatCardModule, MatButtonModule, MatFormFieldModule, MatInputModule, MatSelectModule],
  templateUrl: './adm-finanzas.component.html',
  styleUrls: ['./adm-finanzas.component.css'],
})
export class AdmFinanzasComponent implements OnInit {
  private finanzaService = inject(AdmFinanzaService);
  private noti = inject(NotificacionService);

  resumen: ResumenFinanzas | null = null;
  lista: Finanza[] = [];
  columnas = ['fecha', 'descripcion', 'tipo', 'monto'];
  nuevo: Partial<Finanza> = { tipo: 'ingreso', descripcion: '', categoria: '', monto: 0 };

  ngOnInit(): void { this.cargar(); }

  cargar(): void {
    this.finanzaService.obtenerResumen().subscribe(r => (this.resumen = r));
    this.finanzaService.listar().subscribe(l => (this.lista = l));
  }

  guardar(): void {
    if (!this.nuevo.descripcion || !this.nuevo.monto) {
      this.noti.error('Descripción y monto son obligatorios.');
      return;
    }
    this.finanzaService.crear(this.nuevo).subscribe(() => {
      this.noti.toast('Movimiento registrado.');
      this.nuevo = { tipo: 'ingreso', descripcion: '', categoria: '', monto: 0 };
      this.cargar();
    });
  }

  pen(n: number | undefined | null): string { return 'S/ ' + (n ?? 0).toFixed(2); }
}
