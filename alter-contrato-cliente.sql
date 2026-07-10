USE ORQUESTA;
GO

-- Datos del cliente necesarios para generar el contrato PDF
ALTER TABLE Cotizacion ADD dni_cliente NVARCHAR(20) NULL;
GO
ALTER TABLE Cotizacion ADD direccion_cliente NVARCHAR(300) NULL;
GO
