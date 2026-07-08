export interface Paquete {
  id: number;
  nombre: string;
  descripcion?: string;
  numIntegrantes: number;
  precioBase: number;
  horasBase: number;
  activo: boolean;
}

export interface MusicoAdicional {
  id: number;
  nombre: string;
  tipo: 'normal' | 'viento';
  precioAdicional: number;
  activo: boolean;
}

export interface Distrito {
  id: number;
  nombre: string;
  zona: string; // 'sin_costo' | 'zona_50' | 'zona_150' | 'fuera_lima'
  costoMovilidad: number;
  esATratar: boolean;
}

export interface Evento {
  id: number;
  titulo: string;
  fechaTexto: string; // texto para el público, ej: '11 y 12 de julio · desde la 1:00 PM'
  fecha: string; // ISO — último día del evento (para saber si sigue vigente)
  lugar: string;
  direccion: string; // dirección para el mapa de Google
  imagenUrl: string; // nombre de archivo del flyer, ej: 'evento1.png'
  activo: boolean;
}

export interface ServicioExtra {
  id: number;
  nombre: string;
  descripcion?: string;
  telefonoContacto?: string;
  tienePrecioFijo: boolean;
  precio?: number;
  activo: boolean;
}
