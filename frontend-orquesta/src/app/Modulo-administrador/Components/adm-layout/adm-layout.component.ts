import { Component, inject } from '@angular/core';
import { Router, RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { UserContextService } from '../../../Modulo-seguridad/Services/user-context.service';
import { SegLoginService } from '../../../Modulo-seguridad/Services/seg-login.service';

@Component({
  selector: 'adm-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, MatToolbarModule, MatButtonModule, MatIconModule],
  templateUrl: './adm-layout.component.html',
  styleUrls: ['./adm-layout.component.css'],
})
export class AdmLayoutComponent {
  userContext = inject(UserContextService);
  private loginService = inject(SegLoginService);
  private router = inject(Router);

  salir(): void {
    this.loginService.logout();
    this.router.navigate(['/login']);
  }
}
