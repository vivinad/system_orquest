import { Injectable, inject } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { UsuarioSesion } from '../Models/seg-login.model';
import { StorageService } from './storage.service';

/** Mantiene el usuario en sesión disponible para toda la app. */
@Injectable({ providedIn: 'root' })
export class UserContextService {
  private storage = inject(StorageService);

  user$ = new BehaviorSubject<UsuarioSesion | null>(this.storage.getUsuario<UsuarioSesion>());

  setUser(usuario: UsuarioSesion, token: string): void {
    this.storage.setToken(token);
    this.storage.setUsuario(usuario);
    this.user$.next(usuario);
  }

  logout(): void {
    this.storage.limpiar();
    this.user$.next(null);
  }

  get estaAutenticado(): boolean {
    return !!this.storage.getToken();
  }
}
