import { Component, inject } from '@angular/core';
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
    this.cargando = true;
    this.loginService.login(this.modelo).subscribe({
      next: () => this.router.navigate(['/main']),
      error: () => {
        this.cargando = false;
        this.noti.error('Credenciales incorrectas.');
      },
    });
  }
}
