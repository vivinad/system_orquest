/* =====================================================================
   10 — Edición de cotizaciones, estado "realizada" automático,
        eventos ocultos y orden de videos/fotos.
   Se puede ejecutar varias veces sin problema.
   ===================================================================== */
USE ORQUESTA;
GO

/* ===================== EDICIÓN DE COTIZACIÓN (admin) ===================== */
-- Actualiza los datos de una cotización (el estado se cambia aparte)
CREATE OR ALTER PROCEDURE usp_cotizacion_actualizar
    @id                  INT,
    @nombre_cliente      NVARCHAR(150),
    @telefono_cliente    NVARCHAR(20),
    @email_cliente       NVARCHAR(150) = NULL,
    @dni_cliente         NVARCHAR(20)  = NULL,
    @direccion_cliente   NVARCHAR(300) = NULL,
    @paquete_id          INT,
    @distrito_id         INT,
    @fecha_evento        DATE,
    @direccion_evento    NVARCHAR(300) = NULL,
    @hora_inicio         NVARCHAR(10)  = NULL,
    @tipo_evento         NVARCHAR(100) = NULL,
    @dia_semana          NVARCHAR(20),
    @horas_solicitadas   INT,
    @costo_paquete       DECIMAL(10,2),
    @costo_musicos_extra DECIMAL(10,2),
    @costo_movilidad     DECIMAL(10,2),
    @subtotal            DECIMAL(10,2),
    @total               DECIMAL(10,2),
    @tiene_a_tratar      BIT,
    @motivo_a_tratar     NVARCHAR(1000) = NULL,
    @observaciones       NVARCHAR(500) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE Cotizacion
    SET nombre_cliente = @nombre_cliente, telefono_cliente = @telefono_cliente, email_cliente = @email_cliente,
        dni_cliente = @dni_cliente, direccion_cliente = @direccion_cliente, paquete_id = @paquete_id,
        distrito_id = @distrito_id, fecha_evento = @fecha_evento, direccion_evento = @direccion_evento,
        hora_inicio = @hora_inicio, tipo_evento = @tipo_evento, dia_semana = @dia_semana,
        horas_solicitadas = @horas_solicitadas, costo_paquete = @costo_paquete,
        costo_musicos_extra = @costo_musicos_extra, costo_movilidad = @costo_movilidad,
        subtotal = @subtotal, total = @total, tiene_a_tratar = @tiene_a_tratar,
        motivo_a_tratar = @motivo_a_tratar, observaciones = @observaciones
    WHERE id = @id;

    SELECT @@ROWCOUNT;
END
GO

-- Borra los músicos y servicios extra de una cotización (antes de volver a guardarlos)
CREATE OR ALTER PROCEDURE usp_cotizacion_detalle_limpiar
    @cotizacion_id INT
AS
BEGIN
    SET NOCOUNT ON;
    DELETE FROM CotizacionMusico WHERE cotizacion_id = @cotizacion_id;
    DELETE FROM CotizacionExtra  WHERE cotizacion_id = @cotizacion_id;
END
GO

-- Confirmadas o pagadas cuya fecha ya pasó -> realizada
CREATE OR ALTER PROCEDURE usp_cotizacion_marcar_realizadas
    @hoy DATE
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE Cotizacion
    SET estado = 'realizada'
    WHERE estado IN ('confirmada', 'pagada') AND fecha_evento < @hoy;

    SELECT @@ROWCOUNT;
END
GO

/* ========================== EVENTOS OCULTOS ========================== */
CREATE OR ALTER PROCEDURE usp_evento_listar_inactivos
AS
BEGIN
    SET NOCOUNT ON;
    SELECT id, titulo, fecha_texto, fecha, lugar, direccion, imagen_url, activo,
           categoria, horario, descripcion, servicios
    FROM Evento
    WHERE activo = 0
    ORDER BY fecha DESC;
END
GO

/* ===================== ORDEN DE VIDEOS Y FOTOS ===================== */
CREATE OR ALTER PROCEDURE usp_media_home_cambiar_orden
    @id    INT,
    @orden INT
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE MediaHome SET orden = @orden WHERE id = @id;
    SELECT @@ROWCOUNT;
END
GO

