USE ORQUESTA;
GO

-- Hora de inicio del evento (formato HH:mm)
ALTER TABLE Cotizacion ADD hora_inicio NVARCHAR(10) NULL;
GO

-- Tipo de evento (boda, cumpleaños, fiestas patrias...) — define la vestimenta de la orquesta
ALTER TABLE Cotizacion ADD tipo_evento NVARCHAR(100) NULL;
GO
