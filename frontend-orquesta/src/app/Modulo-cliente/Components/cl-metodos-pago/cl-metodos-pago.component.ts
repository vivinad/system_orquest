import { Component } from '@angular/core';

/**
 * Franja informativa con los métodos de pago que acepta la orquesta.
 * Es solo referencial (no se paga desde la página). Se muestra al final
 * del home y del cotizador.
 */
@Component({
  selector: 'cl-metodos-pago',
  standalone: true,
  templateUrl: './cl-metodos-pago.component.html',
  styleUrls: ['./cl-metodos-pago.component.css'],
})
export class ClMetodosPagoComponent {
  // Para agregar o quitar un método: sube la imagen a la carpeta public\ y edita esta lista
  readonly metodos = [
    { imagen: 'yape.png', nombre: 'Yape' },
    { imagen: 'plin.png', nombre: 'Plin' },
    { imagen: 'izipay.png', nombre: 'Izipay' },
    { imagen: 'bcp.png', nombre: 'BCP' },
    { imagen: 'bbva.png', nombre: 'BBVA' },
  ];
}
