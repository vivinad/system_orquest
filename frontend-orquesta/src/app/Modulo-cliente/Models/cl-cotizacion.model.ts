export interface MusicoSeleccionado {
  musicoId: number;
  cantidad: number;
}

/** Lo que el cliente envía al cotizar */
export class CotizacionRequest {
  nombreCliente = '';
  telefonoCliente = '';
  emailCliente?: string;
  paqueteId = 0;
  distritoId = 0;
  fechaEvento = '';        // 'YYYY-MM-DD'
  horasSolicitadas = 0;
  musicos: MusicoSeleccionado[] = [];
  serviciosExtra: number[] = [];
  observaciones?: string;
}

export interface MusicoDetalle {
  musicoId: number;
  cantidad: number;
  precioAplicado: number;
}

/** Resultado de POST /cotizacion/calcular */
export interface CotizacionResultado {
  diaSemana: string;
  costoPaquete: number;
  costoMusicosExtra: number;
  costoMovilidad: number;
  subtotal: number;
  total: number;
  tieneATratar: boolean;
  motivoATratar?: string;
  musicosDetalle: MusicoDetalle[];
}

export type EstadoCotizacion =
  | 'pendiente' | 'confirmada' | 'pagada' | 'realizada' | 'rechazada' | 'cancelada';

/** Cotización guardada (vista admin) */
export interface Cotizacion {
  id: number;
  nombreCliente: string;
  telefonoCliente: string;
  emailCliente?: string;
  paqueteId: number;
  distritoId: number;
  fechaEvento: string;
  diaSemana: string;
  horasSolicitadas: number;
  costoPaquete: number;
  costoMusicosExtra: number;
  costoMovilidad: number;
  subtotal: number;
  total: number;
  estado: EstadoCotizacion | string;
  tieneATratar: boolean;
  motivoATratar?: string;
  observaciones?: string;
  fechaCreacion: string;
  paquete?: { id: number; nombre: string };
  distrito?: { id: number; nombre: string };
}
