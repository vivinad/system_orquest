import { Paquete, MusicoAdicional, Distrito, ServicioExtra, Evento } from '../Models/mae-catalogo.model';

// Datos de prueba en memoria — reflejan la proforma real.
// Permiten avanzar el frontend SIN base de datos (environment.useMock = true).

export const MOCK_PAQUETES: Paquete[] = [
  { id: 1, nombre: 'Agrupación 3 integrantes', descripcion: '1 vocalista femenino, 1 vocalista masculino, 1 tecladista. Incluye equipo de sonido y movilidad en Lima Metropolitana y Callao.', numIntegrantes: 3, precioBase: 1250, horasBase: 5, activo: true },
  { id: 2, nombre: 'Agrupación 4 integrantes', descripcion: '1 vocalista femenino, 1 vocalista masculino, 1 tecladista, 1 timbalero. Incluye equipo de sonido.', numIntegrantes: 4, precioBase: 1500, horasBase: 5, activo: true },
  { id: 3, nombre: 'Agrupación 5 integrantes', descripcion: '2 vocalistas, 1 animador o conguero, 1 tecladista, 1 timbalero. Incluye equipo de sonido.', numIntegrantes: 5, precioBase: 1800, horasBase: 5, activo: true },
  { id: 4, nombre: 'Agrupación 8 integrantes', descripcion: '2 vocalistas, animador, tecladista, timbalero, conguero, trompeta, trombón. Incluye equipo de sonido.', numIntegrantes: 8, precioBase: 3200, horasBase: 5, activo: true },
  { id: 5, nombre: 'Orquesta 11 músicos', descripcion: '3 vocalistas, animador, tecladista, timbalero, conguero, bongó y 3 vientos (2 trompetas, 1 trombón). Equipo de sonido apropiado para el evento.', numIntegrantes: 11, precioBase: 5000, horasBase: 5, activo: true },
];

export const MOCK_MUSICOS: MusicoAdicional[] = [
  { id: 1, nombre: 'Timbalero', tipo: 'normal', precioAdicional: 250, activo: true },
  { id: 2, nombre: 'Conguero', tipo: 'normal', precioAdicional: 250, activo: true },
  { id: 3, nombre: 'Animador', tipo: 'normal', precioAdicional: 250, activo: true },
  { id: 4, nombre: 'Bongó', tipo: 'normal', precioAdicional: 250, activo: true },
  { id: 5, nombre: 'Trompeta', tipo: 'viento', precioAdicional: 300, activo: true },
  { id: 6, nombre: 'Trombón', tipo: 'viento', precioAdicional: 300, activo: true },
  { id: 7, nombre: 'Saxofón', tipo: 'viento', precioAdicional: 300, activo: true },
];

export const MOCK_DISTRITOS: Distrito[] = [
  { id: 1, nombre: 'Miraflores', zona: 'sin_costo', costoMovilidad: 0, esATratar: false },
  { id: 2, nombre: 'San Isidro', zona: 'sin_costo', costoMovilidad: 0, esATratar: false },
  { id: 3, nombre: 'Surco', zona: 'sin_costo', costoMovilidad: 0, esATratar: false },
  { id: 4, nombre: 'La Molina', zona: 'sin_costo', costoMovilidad: 0, esATratar: false },
  { id: 5, nombre: 'San Juan de Lurigancho', zona: 'sin_costo', costoMovilidad: 0, esATratar: false },
  { id: 6, nombre: 'Callao', zona: 'sin_costo', costoMovilidad: 0, esATratar: false },
  { id: 7, nombre: 'Santa Rosa', zona: 'zona_50', costoMovilidad: 50, esATratar: false },
  { id: 8, nombre: 'Ancón', zona: 'zona_50', costoMovilidad: 50, esATratar: false },
  { id: 9, nombre: 'Carabayllo', zona: 'zona_50', costoMovilidad: 50, esATratar: false },
  { id: 10, nombre: 'Cieneguilla', zona: 'zona_150', costoMovilidad: 150, esATratar: false },
  { id: 11, nombre: 'Chosica - Lurigancho', zona: 'zona_150', costoMovilidad: 150, esATratar: false },
  { id: 12, nombre: 'Pachacámac', zona: 'zona_150', costoMovilidad: 150, esATratar: false },
  { id: 13, nombre: 'Lurín', zona: 'zona_150', costoMovilidad: 150, esATratar: false },
  { id: 14, nombre: 'Punta Hermosa', zona: 'zona_150', costoMovilidad: 150, esATratar: false },
  { id: 15, nombre: 'San Bartolo', zona: 'zona_150', costoMovilidad: 150, esATratar: false },
  { id: 16, nombre: 'Fuera de Lima / Provincia', zona: 'fuera_lima', costoMovilidad: 0, esATratar: true },
];

export const MOCK_EVENTOS: Evento[] = [
  {
    id: 1,
    titulo: 'Fiestas Patrias con Segundo Meléndez',
    fechaTexto: '11 y 12 de julio · desde la 1:00 PM',
    fecha: '2026-07-12',
    lugar: 'Picantería "Huarique Piurano" — La Encantada',
    direccion: 'Av. José Saco Rojas, Carabayllo, Lima',
    imagenUrl: 'evento1.png',
    activo: true,
  },
  {
    id: 2,
    titulo: 'Domingos de Peña',
    fechaTexto: 'Todos los domingos · de 1:00 PM a 6:00 PM',
    fecha: '2026-12-31',
    lugar: 'Picantería "Huarique Piurano" — La Encantada',
    direccion: 'Av. José Saco Rojas, Carabayllo, Lima',
    imagenUrl: 'evento2.png',
    activo: true,
  },
];

export const MOCK_SERVICIOS: ServicioExtra[] = [
  { id: 1, nombre: 'Alquiler de proyector', descripcion: 'Proyector para el evento.', telefonoContacto: '999888777', tienePrecioFijo: false, activo: true },
  { id: 2, nombre: 'Edición de video', descripcion: 'Edición profesional del video del evento.', telefonoContacto: '999888777', tienePrecioFijo: false, activo: true },
];
