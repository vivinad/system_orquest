import { Component, OnInit, inject } from '@angular/core';
import { SlicePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { AdmFinanzaService } from '../../Services/adm-finanza.service';
import { NotificacionService } from '../../../Modulo-seguridad/Services/notificacion.service';
import { Finanza, ResumenFinanzas } from '../../Models/adm-finanza.model';

@Component({
  selector: 'adm-finanzas',
  standalone: true,
  imports: [SlicePipe, FormsModule, MatTableModule, MatCardModule, MatButtonModule, MatIconModule, MatFormFieldModule, MatInputModule, MatSelectModule],
  templateUrl: './adm-finanzas.component.html',
  styleUrls: ['./adm-finanzas.component.css'],
})
export class AdmFinanzasComponent implements OnInit {
  private finanzaService = inject(AdmFinanzaService);
  private noti = inject(NotificacionService);

  resumen: ResumenFinanzas | null = null;
  lista: Finanza[] = [];
  columnas = ['fecha', 'descripcion', 'tipo', 'monto', 'acciones'];
  editando: Partial<Finanza> = this.nuevoMovimiento();

  ngOnInit(): void { this.cargar(); }

  cargar(): void {
    this.finanzaService.obtenerResumen().subscribe(r => (this.resumen = r));
    this.finanzaService.listar().subscribe(l => (this.lista = l));
  }

  nuevoMovimiento(): Partial<Finanza> {
    return { tipo: 'ingreso', descripcion: '', categoria: '', monto: 0 };
  }
  limpiar(): void { this.editando = this.nuevoMovimiento(); }
  editar(f: Finanza): void { this.editando = { ...f }; }

  guardar(): void {
    if (!this.editando.descripcion || !this.editando.monto) {
      this.noti.error('Descripción y monto son obligatorios.');
      return;
    }
    if (this.editando.monto <= 0) {
      this.noti.error('El monto debe ser mayor a 0.');
      return;
    }
    const onOk = () => {
      this.noti.toast(this.editando.id ? 'Movimiento actualizado.' : 'Movimiento registrado.');
      this.limpiar();
      this.cargar();
    };
    const onError = (e: { error?: unknown }) => {
      this.noti.error(typeof e?.error === 'string' ? e.error : 'No se pudo guardar el movimiento.');
    };
    if (this.editando.id) {
      this.finanzaService.actualizar(this.editando as Finanza).subscribe({ next: onOk, error: onError });
    } else {
      this.finanzaService.crear(this.editando).subscribe({ next: onOk, error: onError });
    }
  }

  async eliminar(f: Finanza): Promise<void> {
    const ok = await this.noti.confirmar(`¿Eliminar el movimiento "${f.descripcion}" de ${this.pen(f.monto)}?`);
    if (!ok) return;
    this.finanzaService.eliminar(f.id).subscribe({
      next: () => {
        this.noti.toast('Movimiento eliminado.');
        if (this.editando.id === f.id) this.limpiar();
        this.cargar();
      },
      error: () => this.noti.error('No se pudo eliminar el movimiento.'),
    });
  }

  pen(n: number | undefined | null): string { return 'S/ ' + (n ?? 0).toFixed(2); }
}
