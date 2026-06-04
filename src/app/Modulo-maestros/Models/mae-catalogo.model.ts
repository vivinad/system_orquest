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

export interface ServicioExtra {
  id: number;
  nombre: string;
  descripcion?: string;
  telefonoContacto?: string;
  tienePrecioFijo: boolean;
  precio?: number;
  activo: boolean;
}
