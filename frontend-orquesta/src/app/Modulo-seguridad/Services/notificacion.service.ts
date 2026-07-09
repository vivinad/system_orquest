import { Injectable } from '@angular/core';
import Swal from 'sweetalert2';

/** Envoltorio de SweetAlert2 para avisos consistentes en toda la app. */
@Injectable({ providedIn: 'root' })
export class NotificacionService {

  exito(mensaje: string, titulo = '¡Listo!'): void {
    Swal.fire({ icon: 'success', title: titulo, text: mensaje, confirmButtonColor: '#7b1e3b' });
  }

  error(mensaje: string, titulo = 'Ups…'): void {
    Swal.fire({ icon: 'error', title: titulo, text: mensaje, confirmButtonColor: '#7b1e3b' });
  }

  info(mensaje: string, titulo = 'Información'): void {
    Swal.fire({ icon: 'info', title: titulo, text: mensaje, confirmButtonColor: '#7b1e3b' });
  }

  toast(mensaje: string, icon: 'success' | 'error' | 'info' = 'success'): void {
    Swal.fire({
      toast: true, position: 'top-end', showConfirmButton: false,
      timer: 2500, timerProgressBar: true, icon, title: mensaje,
    });
  }

  async confirmar(mensaje: string, titulo = '¿Estás segura?'): Promise<boolean> {
    const r = await Swal.fire({
      icon: 'question', title: titulo, text: mensaje,
      showCancelButton: true, confirmButtonText: 'Sí', cancelButtonText: 'Cancelar',
      confirmButtonColor: '#7b1e3b', cancelButtonColor: '#9e9e9e',
    });
    return r.isConfirmed;
  }
}
