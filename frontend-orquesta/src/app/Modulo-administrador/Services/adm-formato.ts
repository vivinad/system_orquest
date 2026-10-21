/** Utilidades de formato compartidas por las pantallas del panel administrativo. */

const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
const MESES_CORTOS = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SET', 'OCT', 'NOV', 'DIC'];
const DIAS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];

/** 1,250.00 (sin el prefijo de moneda) */
export function monto(n: number | null | undefined, decimales = 2): string {
  return (n ?? 0).toLocaleString('es-PE', { minimumFractionDigits: decimales, maximumFractionDigits: decimales });
}

/** S/ 1,250.00 */
export function soles(n: number | null | undefined, decimales = 2): string {
  return 'S/ ' + (n ?? 0).toLocaleString('es-PE', { minimumFractionDigits: decimales, maximumFractionDigits: decimales });
}

/** Convierte '2026-10-21' o '2026-10-21T00:00:00' en una fecha local (sin desfase de zona horaria). */
export function aFecha(valor: string | null | undefined): Date | null {
  if (!valor) return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(valor);
  if (m) return new Date(+m[1], +m[2] - 1, +m[3]);
  const d = new Date(valor);
  return isNaN(d.getTime()) ? null : d;
}

/** 'yyyy-MM-dd' de hoy (hora local) */
export function hoyIso(): string { return isoDe(new Date()); }

export function isoDe(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/** 'yyyy-MM' */
export function mesDe(valor: string | null | undefined): string { return (valor ?? '').slice(0, 7); }

/** '2026-10' -> 'octubre 2026' */
export function nombreMes(clave: string): string {
  const [a, m] = clave.split('-').map(Number);
  return a && m ? `${MESES[m - 1]} ${a}` : clave;
}

export function mesCorto(d: Date): string { return MESES_CORTOS[d.getMonth()]; }
export function nombreDia(d: Date): string { return DIAS[d.getDay()]; }

/** 21 Oct 2026 */
export function fechaMedia(valor: string | null | undefined): string {
  const d = aFecha(valor);
  if (!d) return '—';
  const m = MESES_CORTOS[d.getMonth()];
  return `${d.getDate()} ${m.charAt(0)}${m.slice(1).toLowerCase()} ${d.getFullYear()}`;
}

/** 'Octubre 2026' */
export function nombreMesTitulo(clave: string): string {
  const t = nombreMes(clave);
  return t.charAt(0).toUpperCase() + t.slice(1);
}

/** '20:00' + 4 h -> '08:00 PM – 12:00 AM' */
export function rangoHoras(hora: string | null | undefined, horas: number | null | undefined): string {
  const m = /^(\d{1,2}):(\d{2})/.exec(hora ?? '');
  if (!m) return '';
  const fmt = (min: number) => {
    const h24 = Math.floor(min / 60) % 24, mm = min % 60;
    const h12 = h24 % 12 || 12;
    return `${String(h12).padStart(2, '0')}:${String(mm).padStart(2, '0')} ${h24 < 12 ? 'AM' : 'PM'}`;
  };
  const ini = +m[1] * 60 + +m[2];
  return horas ? `${fmt(ini)} – ${fmt(ini + Math.round(horas * 60))}` : fmt(ini);
}

/** 21 oct. 2026 */
export function fechaCorta(valor: string | null | undefined): string {
  const d = aFecha(valor);
  return d ? `${d.getDate()} ${MESES_CORTOS[d.getMonth()].toLowerCase()}. ${d.getFullYear()}` : '—';
}

/** Días que faltan desde hoy (0 = hoy) */
export function diasHasta(valor: string | null | undefined): number {
  const d = aFecha(valor);
  if (!d) return 0;
  const hoy = aFecha(hoyIso())!;
  return Math.round((d.getTime() - hoy.getTime()) / 86400000);
}

/** Iniciales para el avatar: 'María López' -> 'ML' */
export function iniciales(nombre: string | null | undefined): string {
  const partes = (nombre ?? '').trim().split(/\s+/).filter(Boolean);
  return ((partes[0]?.[0] ?? '') + (partes[1]?.[0] ?? '')).toUpperCase() || '?';
}

/** Últimas N claves de mes ('yyyy-MM'), de la más antigua a la actual */
export function ultimosMeses(n: number, desde = new Date()): string[] {
  const r: string[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(desde.getFullYear(), desde.getMonth() - i, 1);
    r.push(isoDe(d).slice(0, 7));
  }
  return r;
}

/** Mes anterior a 'yyyy-MM' */
export function mesAnterior(clave: string): string {
  const [a, m] = clave.split('-').map(Number);
  return isoDe(new Date(a, m - 2, 1)).slice(0, 7);
}

export const ESTADOS_COTIZACION: { valor: string; texto: string; tono: string }[] = [
  { valor: 'pendiente', texto: 'Pendiente', tono: 'tono-dorado' },
  { valor: 'confirmada', texto: 'Confirmada', tono: 'tono-verde' },
  { valor: 'pagada', texto: 'Pagada', tono: 'tono-azul' },
  { valor: 'realizada', texto: 'Realizada', tono: 'tono-rosa' },
  { valor: 'rechazada', texto: 'Rechazada', tono: 'tono-gris' },
  { valor: 'cancelada', texto: 'Cancelada', tono: 'tono-gris' },
];

export function estadoInfo(valor: string): { valor: string; texto: string; tono: string } {
  return ESTADOS_COTIZACION.find(e => e.valor === valor) ?? { valor, texto: valor, tono: 'tono-gris' };
}

/** Descarga un CSV (con BOM para que Excel respete tildes y ñ) */
export function descargarCsv(nombreArchivo: string, filas: (string | number | null | undefined)[][]): void {
  const esc = (v: string | number | null | undefined) => {
    const s = String(v ?? '');
    return /[",;\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const csv = '﻿' + filas.map(f => f.map(esc).join(',')).join('\r\n');
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = nombreArchivo;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
