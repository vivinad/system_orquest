import { DOCUMENT } from '@angular/common';
import { Injectable, inject, signal } from '@angular/core';

export type Tema = 'oscuro' | 'claro';

/**
 * Tema visual de la web (oscuro / claro).
 * Se aplica con el atributo data-tema en <html> (ver styles.scss) y se recuerda en localStorage.
 */
@Injectable({ providedIn: 'root' })
export class TemaService {
  private readonly clave = 'tema';
  private document = inject(DOCUMENT);

  readonly tema = signal<Tema>(this.leerGuardado());

  constructor() {
    this.aplicar(this.tema());
  }

  alternar(): void {
    this.cambiar(this.tema() === 'oscuro' ? 'claro' : 'oscuro');
  }

  cambiar(tema: Tema): void {
    this.tema.set(tema);
    this.aplicar(tema);
    try { localStorage.setItem(this.clave, tema); } catch { /* sin localStorage: solo dura la sesión */ }
  }

  private aplicar(tema: Tema): void {
    this.document.documentElement.setAttribute('data-tema', tema);
  }

  private leerGuardado(): Tema {
    try {
      const t = localStorage.getItem(this.clave);
      if (t === 'claro' || t === 'oscuro') return t;
    } catch { /* ignorar */ }
    return 'oscuro'; // diseño original de la marca
  }
}
