import { Component, OnInit, inject } from '@angular/core';
import { SlicePipe } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MaeCatalogoService } from '../../Services/mae-catalogo.service';
import { NotificacionService } from '../../../Modulo-seguridad/Services/notificacion.service';
import { Evento } from '../../Models/mae-catalogo.model';

@Component({
  selector: 'mae-evento-listar',
  standalone: true,
  providers: [provideNativeDateAdapter()],
  imports: [FormsModule, SlicePipe, MatTableModule, MatCardModule, MatButtonModule, MatIconModule, MatFormFieldModule, MatInputModule, MatDatepickerModule],
  templateUrl: './mae-evento-listar.component.html',
  styleUrls: ['./mae-evento-listar.component.css'],
})
export class MaeEventoListarComponent implements OnInit {
  private catalogoService = inject(MaeCatalogoService);
  private noti = inject(NotificacionService);
  private sanitizer = inject(DomSanitizer);

  eventos: Evento[] = [];
  columnas = ['titulo', 'fecha', 'lugar', 'acciones'];
  editando: Partial<Evento> = this.nuevo();
  fechaSel: Date | null = null;

  // Vista previa del mapa para verificar que la dirección sea exacta
  mapaPreview: SafeResourceUrl | null = null;
  private mapaTimer?: ReturnType<typeof setTimeout>;

  ngOnInit(): void { this.cargar(); }

  cargar(): void { this.catalogoService.listarEventos().subscribe(e => (this.eventos = e)); }

  nuevo(): Partial<Evento> {
    return { titulo: '', fechaTexto: '', fecha: '', lugar: '', direccion: '', imagenUrl: '' };
  }
  limpiar(): void {
    this.editando = this.nuevo();
    this.fechaSel = null;
    this.mapaPreview = null;
  }
  editar(e: Evento): void {
    this.editando = { ...e };
    this.fechaSel = e.fecha ? new Date(e.fecha + 'T00:00:00') : null;
    this.actualizarMapa();
  }

  // Espera a que el admin deje de escribir y luego actualiza el mapa
  direccionCambiada(): void {
    clearTimeout(this.mapaTimer);
    this.mapaTimer = setTimeout(() => this.actualizarMapa(), 700);
  }

  private actualizarMapa(): void {
    const dir = (this.editando.direccion ?? '').trim();
    this.mapaPreview = dir
      ? this.sanitizer.bypassSecurityTrustResourceUrl(
          `https://www.google.com/maps?q=${encodeURIComponent(dir)}&output=embed`,
        )
      : null;
  }

  imagenSeleccionada(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => (this.editando.imagenUrl = reader.result as string);
    reader.readAsDataURL(file);
    input.value = ''; // permite volver a elegir el mismo archivo
  }

  guardar(): void {
    if (this.fechaSel) this.editando.fecha = this.formatoFecha(this.fechaSel);
    if (!this.editando.titulo || !this.editando.fecha || !this.editando.direccion || !this.editando.imagenUrl) {
      this.noti.error('Título, fecha, dirección e imagen son obligatorios.');
      return;
    }
    const onOk = () => {
      this.noti.toast('Evento guardado.');
      this.limpiar();
      this.cargar();
    };
    if (this.editando.id) {
      this.catalogoService.actualizarEvento(this.editando as Evento).subscribe(onOk);
    } else {
      this.catalogoService.grabarEvento(this.editando).subscribe(onOk);
    }
  }

  async eliminar(e: Evento): Promise<void> {
    const ok = await this.noti.confirmar(`¿Desactivar el evento "${e.titulo}"?`);
    if (!ok) return;
    this.catalogoService.eliminarEvento(e.id).subscribe(() => {
      this.noti.toast('Evento desactivado.');
      this.cargar();
    });
  }

  private formatoFecha(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const dia = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${dia}`;
  }
}
