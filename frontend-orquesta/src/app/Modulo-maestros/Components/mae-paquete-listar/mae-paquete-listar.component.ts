import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MaeCatalogoService } from '../../Services/mae-catalogo.service';
import { NotificacionService } from '../../../Modulo-seguridad/Services/notificacion.service';
import { Paquete } from '../../Models/mae-catalogo.model';

@Component({
  selector: 'mae-paquete-listar',
  standalone: true,
  imports: [FormsModule, MatTableModule, MatCardModule, MatButtonModule, MatIconModule, MatFormFieldModule, MatInputModule],
  templateUrl: './mae-paquete-listar.component.html',
  styleUrls: ['./mae-paquete-listar.component.css'],
})
export class MaePaqueteListarComponent implements OnInit {
  private catalogoService = inject(MaeCatalogoService);
  private noti = inject(NotificacionService);

  paquetes: Paquete[] = [];
  columnas = ['nombre', 'precio', 'acciones'];
  editando: Partial<Paquete> = this.nuevo();

  ngOnInit(): void { this.cargar(); }

  cargar(): void { this.catalogoService.listarPaquetes().subscribe(p => (this.paquetes = p)); }

  nuevo(): Partial<Paquete> {
    return { nombre: '', descripcion: '', numIntegrantes: 3, horasBase: 5, precioBase: 0 };
  }
  limpiar(): void { this.editando = this.nuevo(); }
  editar(p: Paquete): void { this.editando = { ...p }; }

  guardar(): void {
    if (!this.editando.nombre || !this.editando.precioBase) {
      this.noti.error('Nombre y precio son obligatorios.');
      return;
    }
    const onOk = () => {
      this.noti.toast('Paquete guardado.');
      this.limpiar();
      this.cargar();
    };
    if (this.editando.id) {
      this.catalogoService.actualizarPaquete(this.editando as Paquete).subscribe(onOk);
    } else {
      this.catalogoService.grabarPaquete(this.editando).subscribe(onOk);
    }
  }

  async eliminar(p: Paquete): Promise<void> {
    const ok = await this.noti.confirmar(`¿Desactivar el paquete "${p.nombre}"?`);
    if (!ok) return;
    this.catalogoService.eliminarPaquete(p.id).subscribe(() => {
      this.noti.toast('Paquete desactivado.');
      this.cargar();
    });
  }

  pen(n: number): string { return 'S/ ' + (n ?? 0).toFixed(2); }
}
