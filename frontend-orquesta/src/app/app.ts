import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TemaService } from './Modulo-seguridad/Services/tema.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  template: '<router-outlet />',
})
export class App {
  // Aplica el tema guardado (oscuro / claro) desde el arranque
  private tema = inject(TemaService);
}
