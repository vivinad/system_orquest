import { Component, inject } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { environment } from 'src/environments/environment';
import { LoginModel } from '../../Models/seg-login.model';
import { SegLoginService } from '../../Services/seg-login.service';
import { NotificacionService } from '../../Services/notificacion.service';

@Component({
  selector: 'seg-login',
  standalone: true,
  imports: [FormsModule, RouterLink, MatCardModule, MatButtonModule, MatFormFieldModule, MatInputModule, MatIconModule],
  templateUrl: './seg-login.component.html',
  styleUrls: ['./seg-login.component.css'],
})
export class SegLoginComponent {
  private loginService = inject(SegLoginService);
  private router = inject(Router);
  private noti = inject(NotificacionService);

  modelo = new LoginModel();
  cargando = false;
  esMock = environment.useMock;

  entrar(): void {
    // Espacios accidentales al inicio/fin del correo (p. ej. al copiar y pegar)
    this.modelo.email = (this.modelo.email || '').trim();
    if (!this.modelo.email || !this.modelo.password) {
      this.noti.error('Escribe tu correo y tu contraseña.');
      return;
    }
    this.cargando = true;
    this.loginService.login(this.modelo).subscribe({
      next: () => this.router.navigate(['/main']),
      error: (e: HttpErrorResponse) => {
        this.cargando = false;
        // Cada causa con su mensaje: así se distingue una clave errada de un problema de conexión
        if (e.status === 401) {
          this.noti.error('El correo o la contraseña no coinciden con un administrador activo.', 'Credenciales incorrectas');
        } else if (e.status === 0) {
          this.noti.error(`No se pudo conectar con el servidor (${environment.url_api}). Verifica que la API esté en ejecución.`, 'Sin conexión');
        } else {
          this.noti.error(`El servidor respondió con un error (${e.status}). Revisa la consola de la API.`, 'Error del servidor');
        }
      },
    });
  }
}
