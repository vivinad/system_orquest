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

  /**
   * Pide un monto (S/) con tres salidas: registrar el monto, continuar sin registrar, o cancelar.
   * Devuelve { accion: 'registrar' | 'omitir' | 'cancelar', monto }.
   */
  async pedirMonto(opciones: {
    titulo: string; texto: string; sugerido?: number; registrar?: string; omitir?: string;
  }): Promise<{ accion: 'registrar' | 'omitir' | 'cancelar'; monto: number }> {
    const r = await Swal.fire({
      icon: 'question', title: opciones.titulo, html: opciones.texto,
      input: 'number', inputValue: opciones.sugerido ? String(Math.round(opciones.sugerido * 100) / 100) : '',
      inputAttributes: { min: '0', step: '0.01', placeholder: 'Monto en S/' },
      showDenyButton: true, showCancelButton: true,
      confirmButtonText: opciones.registrar ?? 'Registrar pago',
      denyButtonText: opciones.omitir ?? 'Solo cambiar estado',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#f2405b', denyButtonColor: '#6b7185', cancelButtonColor: '#9e9e9e',
      inputValidator: v => (!v || Number(v) <= 0 ? 'Ingresa un monto mayor a 0' : null),
    });
    if (r.isConfirmed) return { accion: 'registrar', monto: Number(r.value) };
    if (r.isDenied) return { accion: 'omitir', monto: 0 };
    return { accion: 'cancelar', monto: 0 };
  }
}
