USE ORQUESTA;
GO

-- Datos del cliente necesarios para generar el contrato PDF
-- (01_crear_bd_y_tablas.sql ya las crea en una instalación nueva: solo se agregan si faltan)
IF COL_LENGTH('Cotizacion', 'dni_cliente') IS NULL
    ALTER TABLE Cotizacion ADD dni_cliente NVARCHAR(20) NULL;
GO
IF COL_LENGTH('Cotizacion', 'direccion_cliente') IS NULL
    ALTER TABLE Cotizacion ADD direccion_cliente NVARCHAR(300) NULL;
GO
