import { Injectable } from '@angular/core';

/** Acceso centralizado a localStorage (token y usuario). */
@Injectable({ providedIn: 'root' })
export class StorageService {

  setToken(token: string): void {
    localStorage.setItem('token', token);
  }
  getToken(): string | null {
    return localStorage.getItem('token');
  }

  setUsuario(usuario: unknown): void {
    localStorage.setItem('usuario', JSON.stringify(usuario));
  }
  getUsuario<T>(): T | null {
    const u = localStorage.getItem('usuario');
    return u ? (JSON.parse(u) as T) : null;
  }

  limpiar(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
  }
}
