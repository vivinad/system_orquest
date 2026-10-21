USE ORQUESTA;
GO

-- Ubicación exacta del evento (local/dirección donde tocará la orquesta)
ALTER TABLE Cotizacion ADD direccion_evento NVARCHAR(300) NULL;
GO
