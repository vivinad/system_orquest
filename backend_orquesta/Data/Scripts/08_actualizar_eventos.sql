/* =====================================================================
   08 — Actualiza la tabla Evento y sus procedimientos (cartelera)
   Ejecutar si al registrar un evento aparece:
   "Procedure or function usp_evento_insertar has too many arguments"
   (la base tiene la versión antigua de los procedimientos).
   Se puede ejecutar varias veces sin problema.
   ===================================================================== */
USE ORQUESTA;
GO

-- Datos opcionales del evento para la cartelera de la página principal
IF COL_LENGTH('Evento', 'categoria') IS NULL
    ALTER TABLE Evento ADD categoria NVARCHAR(60) NULL;
GO
IF COL_LENGTH('Evento', 'horario') IS NULL
    ALTER TABLE Evento ADD horario NVARCHAR(100) NULL;
GO
IF COL_LENGTH('Evento', 'descripcion') IS NULL
    ALTER TABLE Evento ADD descripcion NVARCHAR(400) NULL;
GO
IF COL_LENGTH('Evento', 'servicios') IS NULL
    ALTER TABLE Evento ADD servicios NVARCHAR(300) NULL;
GO

/* ============================= EVENTO ============================= */
CREATE OR ALTER PROCEDURE usp_evento_listar
AS
BEGIN
    SET NOCOUNT ON;
    SELECT id, titulo, fecha_texto, fecha, lugar, direccion, imagen_url, activo,
           categoria, horario, descripcion, servicios
    FROM Evento
    WHERE activo = 1
    ORDER BY fecha;
END
GO

CREATE OR ALTER PROCEDURE usp_evento_listar_vigentes
    @hoy DATE
AS
BEGIN
    SET NOCOUNT ON;
    SELECT id, titulo, fecha_texto, fecha, lugar, direccion, imagen_url, activo,
           categoria, horario, descripcion, servicios
    FROM Evento
    WHERE activo = 1 AND fecha >= @hoy
    ORDER BY fecha;
END
GO

CREATE OR ALTER PROCEDURE usp_evento_obtener
    @id INT
AS
BEGIN
    SET NOCOUNT ON;
    SELECT id, titulo, fecha_texto, fecha, lugar, direccion, imagen_url, activo,
           categoria, horario, descripcion, servicios
    FROM Evento
    WHERE id = @id;
END
GO

CREATE OR ALTER PROCEDURE usp_evento_insertar
    @titulo      NVARCHAR(150),
    @fecha_texto NVARCHAR(150),
    @fecha       DATE,
    @lugar       NVARCHAR(200),
    @direccion   NVARCHAR(300),
    @imagen_url  NVARCHAR(MAX),
    @activo      BIT,
    @categoria   NVARCHAR(60)  = NULL,
    @horario     NVARCHAR(100) = NULL,
    @descripcion NVARCHAR(400) = NULL,
    @servicios   NVARCHAR(300) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    INSERT INTO Evento (titulo, fecha_texto, fecha, lugar, direccion, imagen_url, activo,
                        categoria, horario, descripcion, servicios)
    VALUES (@titulo, @fecha_texto, @fecha, @lugar, @direccion, @imagen_url, @activo,
            @categoria, @horario, @descripcion, @servicios);

    SELECT CAST(SCOPE_IDENTITY() AS INT);
END
GO

CREATE OR ALTER PROCEDURE usp_evento_actualizar
    @id          INT,
    @titulo      NVARCHAR(150),
    @fecha_texto NVARCHAR(150),
    @fecha       DATE,
    @lugar       NVARCHAR(200),
    @direccion   NVARCHAR(300),
    @imagen_url  NVARCHAR(MAX),
    @activo      BIT,
    @categoria   NVARCHAR(60)  = NULL,
    @horario     NVARCHAR(100) = NULL,
    @descripcion NVARCHAR(400) = NULL,
    @servicios   NVARCHAR(300) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE Evento
    SET titulo = @titulo, fecha_texto = @fecha_texto, fecha = @fecha, lugar = @lugar,
        direccion = @direccion, imagen_url = @imagen_url, activo = @activo,
        categoria = @categoria, horario = @horario, descripcion = @descripcion, servicios = @servicios
    WHERE id = @id;

    SELECT @@ROWCOUNT;
END
GO

CREATE OR ALTER PROCEDURE usp_evento_desactivar
    @id INT
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE Evento SET activo = 0 WHERE id = @id;
    SELECT @@ROWCOUNT;
END
GO
