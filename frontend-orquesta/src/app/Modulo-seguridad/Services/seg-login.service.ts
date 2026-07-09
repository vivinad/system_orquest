import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, of, tap } from 'rxjs';
import { environment } from 'src/environments/environment';
import { LoginModel, LoginResponse } from '../Models/seg-login.model';
import { UserContextService } from './user-context.service';

@Injectable({ providedIn: 'root' })
export class SegLoginService {
  private http = inject(HttpClient);
  private userContext = inject(UserContextService);

  private apiURL_Auth = environment.url_api + 'auth';

  login(usuario: LoginModel): Observable<LoginResponse> {
    if (environment.useMock) {
      // En modo demo, cualquier credencial entra.
      const fake: LoginResponse = { token: 'mock-token', nombre: 'Administradora', rol: 'admin' };
      return of(fake).pipe(tap(r => this.guardarSesion(r)));
    }
    return this.http
      .post<LoginResponse>(this.apiURL_Auth + '/login', usuario)
      .pipe(tap(r => this.guardarSesion(r)));
  }

  logout(): void {
    this.userContext.logout();
  }

  private guardarSesion(r: LoginResponse): void {
    this.userContext.setUser({ nombre: r.nombre, rol: r.rol }, r.token);
  }
}
