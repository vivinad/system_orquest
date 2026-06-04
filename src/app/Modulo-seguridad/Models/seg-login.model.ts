/** Datos que se envían al backend para iniciar sesión */
export class LoginModel {
  email: string;
  password: string;

  constructor() {
    this.email = '';
    this.password = '';
  }
}

/** Respuesta del backend al iniciar sesión */
export interface LoginResponse {
  token: string;
  nombre: string;
  rol: string;
}

/** Usuario en sesión (guardado en localStorage) */
export interface UsuarioSesion {
  nombre: string;
  rol: string;
}
