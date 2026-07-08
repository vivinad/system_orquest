USE ORQUESTA;
GO

-- Columna nueva en Paquete (qué incluye cada agrupación)
ALTER TABLE Paquete ADD descripcion NVARCHAR(500) NULL;
GO

-- Movilidad por zona
UPDATE Distrito SET costo_movilidad = 50  WHERE zona = 'zona_50';
UPDATE Distrito SET costo_movilidad = 150 WHERE zona = 'zona_150';
GO

-- Los 5 paquetes de la proforma (precio por show de 5 horas)
INSERT INTO Paquete (nombre, descripcion, num_integrantes, precio_base, horas_base) VALUES
('Agrupación 3 integrantes', '1 vocalista femenino, 1 vocalista masculino, 1 tecladista. Incluye equipo de sonido y movilidad en Lima Metropolitana y Callao.', 3, 1250, 5),
('Agrupación 4 integrantes', '1 vocalista femenino, 1 vocalista masculino, 1 tecladista, 1 timbalero. Incluye equipo de sonido.', 4, 1500, 5),
('Agrupación 5 integrantes', '2 vocalistas, 1 animador o conguero, 1 tecladista, 1 timbalero. Incluye equipo de sonido.', 5, 1800, 5),
('Agrupación 8 integrantes', '2 vocalistas, animador, tecladista, timbalero, conguero, trompeta, trombón. Incluye equipo de sonido.', 8, 3200, 5),
('Orquesta 11 músicos', '3 vocalistas, animador, tecladista, timbalero, conguero, bongó y 3 vientos (2 trompetas, 1 trombón). Equipo de sonido apropiado para el evento.', 11, 5000, 5);
GO

-- Músicos adicionales (normal +250 / viento +300)
INSERT INTO MusicoAdicional (nombre, tipo, precio_adicional) VALUES
('Timbalero', 'normal', 250), ('Conguero', 'normal', 250),
('Animador', 'normal', 250),  ('Bongó', 'normal', 250),
('Trompeta', 'viento', 300),  ('Trombón', 'viento', 300),
('Saxofón', 'viento', 300);
GO

-- Servicios extra (contacto por WhatsApp; precio a coordinar)
INSERT INTO ServicioExtra (nombre, descripcion, telefono_contacto, tiene_precio_fijo, precio) VALUES
('Alquiler de proyector', 'Proyector para el evento.', '993771153', 0, NULL),
('Edición de video', 'Edición profesional del video del evento.', '993771153', 0, NULL);
GO

-- Próximos eventos (se muestran en la página pública; el admin los gestiona)
-- imagen_url es NVARCHAR(MAX) para soportar imágenes subidas desde el admin (data URL base64)
CREATE TABLE Evento (
    id          INT IDENTITY(1,1) PRIMARY KEY,
    titulo      NVARCHAR(150) NOT NULL,
    fecha_texto NVARCHAR(150) NOT NULL,
    fecha       DATE NOT NULL,
    lugar       NVARCHAR(200) NOT NULL,
    direccion   NVARCHAR(300) NOT NULL,
    imagen_url  NVARCHAR(MAX) NOT NULL,
    activo      BIT NOT NULL DEFAULT 1
);
GO

INSERT INTO Evento (titulo, fecha_texto, fecha, lugar, direccion, imagen_url) VALUES
('Fiestas Patrias con Segundo Meléndez',
 '11 y 12 de julio · desde la 1:00 PM',
 '2026-07-12',
 'Picantería "Huarique Piurano" — La Encantada',
 'Av. José Saco Rojas, Carabayllo, Lima',
 'evento1.png'),
('Domingos de Peña',
 'Todos los domingos · de 1:00 PM a 6:00 PM',
 '2026-12-31',
 'Picantería "Huarique Piurano" — La Encantada',
 'Av. José Saco Rojas, Carabayllo, Lima',
 'evento2.png');
GO

SELECT 'Paquete' AS tabla, COUNT(*) AS registros FROM Paquete
UNION ALL SELECT 'MusicoAdicional', COUNT(*) FROM MusicoAdicional
UNION ALL SELECT 'Distrito', COUNT(*) FROM Distrito
UNION ALL SELECT 'ServicioExtra', COUNT(*) FROM ServicioExtra
UNION ALL SELECT 'Evento', COUNT(*) FROM Evento;
GO
