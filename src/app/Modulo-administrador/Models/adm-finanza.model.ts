export interface Finanza {
  id: number;
  adminId: number;
  cotizacionId?: number;
  tipo: 'ingreso' | 'gasto';
  monto: number;
  descripcion: string;
  categoria?: string;
  fecha: string;
}

export interface ResumenFinanzas {
  ingresos: number;
  gastos: number;
  balance: number;
}
