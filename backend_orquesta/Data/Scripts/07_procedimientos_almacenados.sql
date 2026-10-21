/* =====================================================================
   PROCEDIMIENTOS ALMACENADOS — ORQUESTA
   Mismo patrón que BackEnd_PaymentPeru: la capa Data (*DA.cs) solo llama
   a procedimientos usp_... con Dapper. Cada procedimiento devuelve las
   columnas con su nombre real (snake_case) y Entity/Map/*MAP.cs las
   convierte a las propiedades de los *BE.

   Requiere SQL Server 2016 SP1 o superior (CREATE OR ALTER y STRING_SPLIT).
   Se puede ejecutar varias veces: cada procedimiento se reemplaza.
   ===================================================================== */
USE ORQUESTA;
GO

-- El motivo "a tratar" puede juntar varios avisos (distrito + servicios): se amplía a 1000
IF COL_LENGTH('Cotizacion', 'motivo_a_tratar') < 2000  -- NVARCHAR(1000) = 2000 bytes
    ALTER TABLE Cotizacion ALTER COLUMN motivo_a_tratar NVARCHAR(1000) NULL;
GO

-- Código de acceso al contrato: sin él, nadie puede descargar el contrato de otro cliente
-- adivinando el número de cotización. Las cotizaciones antiguas reciben uno nuevo
-- (sus contratos los sigue descargando el admin con su sesión).
IF COL_LENGTH('Cotizacion', 'codigo_acceso') IS NULL
    ALTER TABLE Cotizacion ADD codigo_acceso UNIQUEIDENTIFIER NULL;
GO
UPDATE Cotizacion SET codigo_acceso = NEWID() WHERE codigo_acceso IS NULL;
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

/* ============================ PAQUETE ============================ */
CREATE OR ALTER PROCEDURE usp_paquete_listar
AS
BEGIN
    SET NOCOUNT ON;
    SELECT id, nombre, descripcion, num_integrantes, precio_base, horas_base, activo
    FROM Paquete
    WHERE activo = 1
    ORDER BY id;
END
GO

CREATE OR ALTER PROCEDURE usp_paquete_obtener
    @id INT
AS
BEGIN
    SET NOCOUNT ON;
    SELECT id, nombre, descripcion, num_integrantes, precio_base, horas_base, activo
    FROM Paquete
    WHERE id = @id;
END
GO

CREATE OR ALTER PROCEDURE usp_paquete_insertar
    @nombre          NVARCHAR(100),
    @descripcion     NVARCHAR(500) = NULL,
    @num_integrantes INT,
    @precio_base     DECIMAL(10,2),
    @horas_base      INT,
    @activo          BIT
AS
BEGIN
    SET NOCOUNT ON;
    INSERT INTO Paquete (nombre, descripcion, num_integrantes, precio_base, horas_base, activo)
    VALUES (@nombre, @descripcion, @num_integrantes, @precio_base, @horas_base, @activo);

    SELECT CAST(SCOPE_IDENTITY() AS INT);
END
GO

CREATE OR ALTER PROCEDURE usp_paquete_actualizar
    @id              INT,
    @nombre          NVARCHAR(100),
    @descripcion     NVARCHAR(500) = NULL,
    @num_integrantes INT,
    @precio_base     DECIMAL(10,2),
    @horas_base      INT,
    @activo          BIT
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE Paquete
    SET nombre = @nombre, descripcion = @descripcion, num_integrantes = @num_integrantes,
        precio_base = @precio_base, horas_base = @horas_base, activo = @activo
    WHERE id = @id;

    SELECT @@ROWCOUNT;
END
GO

CREATE OR ALTER PROCEDURE usp_paquete_desactivar
    @id INT
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE Paquete SET activo = 0 WHERE id = @id;
    SELECT @@ROWCOUNT;
END
GO

-- Paquetes ocultos (desactivados): el admin puede restaurarlos desde el Catálogo
CREATE OR ALTER PROCEDURE usp_paquete_listar_inactivos
AS
BEGIN
    SET NOCOUNT ON;
    SELECT id, nombre, descripcion, num_integrantes, precio_base, horas_base, activo
    FROM Paquete
    WHERE activo = 0
    ORDER BY nombre;
END
GO

/* ======================== MUSICO ADICIONAL ======================== */
CREATE OR ALTER PROCEDURE usp_musico_adicional_listar
AS
BEGIN
    SET NOCOUNT ON;
    SELECT id, nombre, tipo, precio_adicional, activo
    FROM MusicoAdicional
    WHERE activo = 1
    ORDER BY id;
END
GO

CREATE OR ALTER PROCEDURE usp_musico_adicional_obtener
    @id INT
AS
BEGIN
    SET NOCOUNT ON;
    SELECT id, nombre, tipo, precio_adicional, activo
    FROM MusicoAdicional
    WHERE id = @id;
END
GO

CREATE OR ALTER PROCEDURE usp_musico_adicional_insertar
    @nombre           NVARCHAR(100),
    @tipo             NVARCHAR(50),
    @precio_adicional DECIMAL(10,2),
    @activo           BIT
AS
BEGIN
    SET NOCOUNT ON;
    INSERT INTO MusicoAdicional (nombre, tipo, precio_adicional, activo)
    VALUES (@nombre, @tipo, @precio_adicional, @activo);

    SELECT CAST(SCOPE_IDENTITY() AS INT);
END
GO

CREATE OR ALTER PROCEDURE usp_musico_adicional_actualizar
    @id               INT,
    @nombre           NVARCHAR(100),
    @tipo             NVARCHAR(50),
    @precio_adicional DECIMAL(10,2),
    @activo           BIT
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE MusicoAdicional
    SET nombre = @nombre, tipo = @tipo, precio_adicional = @precio_adicional, activo = @activo
    WHERE id = @id;

    SELECT @@ROWCOUNT;
END
GO

CREATE OR ALTER PROCEDURE usp_musico_adicional_desactivar
    @id INT
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE MusicoAdicional SET activo = 0 WHERE id = @id;
    SELECT @@ROWCOUNT;
END
GO

/* ========================= SERVICIO EXTRA ========================= */
CREATE OR ALTER PROCEDURE usp_servicio_extra_listar
AS
BEGIN
    SET NOCOUNT ON;
    SELECT id, nombre, descripcion, telefono_contacto, tiene_precio_fijo, precio, activo
    FROM ServicioExtra
    WHERE activo = 1
    ORDER BY id;
END
GO

CREATE OR ALTER PROCEDURE usp_servicio_extra_obtener
    @id INT
AS
BEGIN
    SET NOCOUNT ON;
    SELECT id, nombre, descripcion, telefono_contacto, tiene_precio_fijo, precio, activo
    FROM ServicioExtra
    WHERE id = @id;
END
GO

CREATE OR ALTER PROCEDURE usp_servicio_extra_insertar
    @nombre            NVARCHAR(100),
    @descripcion       NVARCHAR(255) = NULL,
    @telefono_contacto NVARCHAR(20)  = NULL,
    @tiene_precio_fijo BIT,
    @precio            DECIMAL(10,2) = NULL,
    @activo            BIT
AS
BEGIN
    SET NOCOUNT ON;
    INSERT INTO ServicioExtra (nombre, descripcion, telefono_contacto, tiene_precio_fijo, precio, activo)
    VALUES (@nombre, @descripcion, @telefono_contacto, @tiene_precio_fijo, @precio, @activo);

    SELECT CAST(SCOPE_IDENTITY() AS INT);
END
GO

CREATE OR ALTER PROCEDURE usp_servicio_extra_actualizar
    @id                INT,
    @nombre            NVARCHAR(100),
    @descripcion       NVARCHAR(255) = NULL,
    @telefono_contacto NVARCHAR(20)  = NULL,
    @tiene_precio_fijo BIT,
    @precio            DECIMAL(10,2) = NULL,
    @activo            BIT
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE ServicioExtra
    SET nombre = @nombre, descripcion = @descripcion, telefono_contacto = @telefono_contacto,
        tiene_precio_fijo = @tiene_precio_fijo, precio = @precio, activo = @activo
    WHERE id = @id;

    SELECT @@ROWCOUNT;
END
GO

CREATE OR ALTER PROCEDURE usp_servicio_extra_desactivar
    @id INT
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE ServicioExtra SET activo = 0 WHERE id = @id;
    SELECT @@ROWCOUNT;
END
GO

/* ============================ DISTRITO ============================ */
CREATE OR ALTER PROCEDURE usp_distrito_listar
AS
BEGIN
    SET NOCOUNT ON;
    SELECT id, nombre, zona, costo_movilidad, es_a_tratar
    FROM Distrito
    ORDER BY nombre;
END
GO

CREATE OR ALTER PROCEDURE usp_distrito_obtener
    @id INT
AS
BEGIN
    SET NOCOUNT ON;
    SELECT id, nombre, zona, costo_movilidad, es_a_tratar
    FROM Distrito
    WHERE id = @id;
END
GO

CREATE OR ALTER PROCEDURE usp_distrito_actualizar
    @id              INT,
    @nombre          NVARCHAR(100),
    @zona            NVARCHAR(50),
    @costo_movilidad DECIMAL(10,2),
    @es_a_tratar     BIT
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE Distrito
    SET nombre = @nombre, zona = @zona, costo_movilidad = @costo_movilidad, es_a_tratar = @es_a_tratar
    WHERE id = @id;

    SELECT @@ROWCOUNT;
END
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

/* =========================== MEDIA HOME =========================== */
CREATE OR ALTER PROCEDURE usp_media_home_listar
    @tipo NVARCHAR(20) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    SELECT id, tipo, valor, orden
    FROM MediaHome
    WHERE (@tipo IS NULL OR tipo = @tipo)
    ORDER BY orden, id;
END
GO

-- Agrega al final de su tipo (orden = último + 1) y devuelve la fila creada
CREATE OR ALTER PROCEDURE usp_media_home_insertar
    @tipo  NVARCHAR(20),
    @valor NVARCHAR(MAX)
AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @orden INT = (SELECT ISNULL(MAX(orden), 0) + 1 FROM MediaHome WHERE tipo = @tipo);

    INSERT INTO MediaHome (tipo, valor, orden) VALUES (@tipo, @valor, @orden);

    SELECT id, tipo, valor, orden
    FROM MediaHome
    WHERE id = CAST(SCOPE_IDENTITY() AS INT);
END
GO

CREATE OR ALTER PROCEDURE usp_media_home_eliminar
    @id INT
AS
BEGIN
    SET NOCOUNT ON;
    DELETE FROM MediaHome WHERE id = @id;
    SELECT @@ROWCOUNT;
END
GO

/* ========================== USUARIO ADMIN ========================== */
CREATE OR ALTER PROCEDURE usp_usuario_admin_obtener_por_email
    @email NVARCHAR(150)
AS
BEGIN
    SET NOCOUNT ON;
    SELECT id, nombre, email, password_hash, rol, activo, fecha_creacion
    FROM UsuarioAdmin
    WHERE email = @email AND activo = 1;
END
GO

CREATE OR ALTER PROCEDURE usp_usuario_admin_contar
AS
BEGIN
    SET NOCOUNT ON;
    SELECT COUNT(*) FROM UsuarioAdmin;
END
GO

CREATE OR ALTER PROCEDURE usp_usuario_admin_primer_activo
AS
BEGIN
    SET NOCOUNT ON;
    SELECT TOP 1 id FROM UsuarioAdmin WHERE activo = 1 ORDER BY id;
END
GO

-- Cambia la clave (hash BCrypt) de un admin. @email NULL = el primer admin activo.
-- Devuelve el correo del admin actualizado (nada si no existe).
CREATE OR ALTER PROCEDURE usp_usuario_admin_actualizar_clave
    @email         NVARCHAR(150) = NULL,
    @password_hash NVARCHAR(255)
AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @id INT = (
        SELECT TOP 1 id FROM UsuarioAdmin
        WHERE (@email IS NULL AND activo = 1) OR email = @email
        ORDER BY id);

    IF @id IS NULL RETURN;

    UPDATE UsuarioAdmin SET password_hash = @password_hash, activo = 1 WHERE id = @id;
    SELECT email FROM UsuarioAdmin WHERE id = @id;
END
GO

CREATE OR ALTER PROCEDURE usp_usuario_admin_insertar
    @nombre        NVARCHAR(100),
    @email         NVARCHAR(150),
    @password_hash NVARCHAR(255),
    @rol           NVARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;
    INSERT INTO UsuarioAdmin (nombre, email, password_hash, rol, activo, fecha_creacion)
    VALUES (@nombre, @email, @password_hash, @rol, 1, GETDATE());

    SELECT CAST(SCOPE_IDENTITY() AS INT);
END
GO

/* ============================ FINANZA ============================ */
CREATE OR ALTER PROCEDURE usp_finanza_listar
AS
BEGIN
    SET NOCOUNT ON;
    SELECT f.id, f.admin_id, a.nombre AS admin_nombre, f.cotizacion_id, f.tipo, f.monto,
           f.descripcion, f.categoria, f.fecha, f.fecha_registro
    FROM Finanza f
    LEFT JOIN UsuarioAdmin a ON a.id = f.admin_id
    ORDER BY f.fecha DESC, f.id DESC;
END
GO

-- @anio y @mes en NULL = resumen de todo
CREATE OR ALTER PROCEDURE usp_finanza_resumen
    @anio INT = NULL,
    @mes  INT = NULL
AS
BEGIN
    SET NOCOUNT ON;
    SELECT
        ISNULL(SUM(CASE WHEN tipo = 'ingreso' THEN monto END), 0) AS ingresos,
        ISNULL(SUM(CASE WHEN tipo = 'gasto'   THEN monto END), 0) AS gastos
    FROM Finanza
    WHERE (@anio IS NULL OR YEAR(fecha) = @anio)
      AND (@mes  IS NULL OR MONTH(fecha) = @mes);
END
GO

CREATE OR ALTER PROCEDURE usp_finanza_insertar
    @admin_id      INT,
    @cotizacion_id INT = NULL,
    @tipo          NVARCHAR(10),
    @monto         DECIMAL(10,2),
    @descripcion   NVARCHAR(255),
    @categoria     NVARCHAR(100) = NULL,
    @fecha         DATE
AS
BEGIN
    SET NOCOUNT ON;
    INSERT INTO Finanza (admin_id, cotizacion_id, tipo, monto, descripcion, categoria, fecha, fecha_registro)
    VALUES (@admin_id, @cotizacion_id, @tipo, @monto, @descripcion, @categoria, @fecha, GETDATE());

    SELECT CAST(SCOPE_IDENTITY() AS INT);
END
GO

-- No cambia admin_id ni fecha_registro (quién y cuándo se registró)
CREATE OR ALTER PROCEDURE usp_finanza_actualizar
    @id            INT,
    @cotizacion_id INT = NULL,
    @tipo          NVARCHAR(10),
    @monto         DECIMAL(10,2),
    @descripcion   NVARCHAR(255),
    @categoria     NVARCHAR(100) = NULL,
    @fecha         DATE
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE Finanza
    SET cotizacion_id = @cotizacion_id, tipo = @tipo, monto = @monto,
        descripcion = @descripcion, categoria = @categoria, fecha = @fecha
    WHERE id = @id;

    SELECT @@ROWCOUNT;
END
GO

CREATE OR ALTER PROCEDURE usp_finanza_eliminar
    @id INT
AS
BEGIN
    SET NOCOUNT ON;
    DELETE FROM Finanza WHERE id = @id;
    SELECT @@ROWCOUNT;
END
GO

/* =========================== COTIZACION =========================== */
-- @estados: lista separada por comas, ej. 'confirmada,pagada,realizada'
-- (la define Type/Cotizacion.cs -> EstadosOcupados)
CREATE OR ALTER PROCEDURE usp_cotizacion_fecha_ocupada
    @fecha   DATE,
    @estados NVARCHAR(200)
AS
BEGIN
    SET NOCOUNT ON;
    SELECT CAST(CASE WHEN EXISTS (
        SELECT 1
        FROM Cotizacion
        WHERE fecha_evento = @fecha
          AND estado IN (SELECT LTRIM(RTRIM(value)) FROM STRING_SPLIT(@estados, ','))
    ) THEN 1 ELSE 0 END AS BIT);
END
GO

CREATE OR ALTER PROCEDURE usp_cotizacion_insertar
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
    @estado              NVARCHAR(30),
    @tiene_a_tratar      BIT,
    @motivo_a_tratar     NVARCHAR(1000) = NULL,
    @observaciones       NVARCHAR(500) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    INSERT INTO Cotizacion (
        nombre_cliente, telefono_cliente, email_cliente, dni_cliente, direccion_cliente,
        paquete_id, distrito_id, fecha_evento, direccion_evento, hora_inicio, tipo_evento,
        dia_semana, horas_solicitadas, costo_paquete, costo_musicos_extra, costo_movilidad,
        subtotal, total, estado, tiene_a_tratar, motivo_a_tratar, observaciones, fecha_creacion,
        codigo_acceso)
    VALUES (
        @nombre_cliente, @telefono_cliente, @email_cliente, @dni_cliente, @direccion_cliente,
        @paquete_id, @distrito_id, @fecha_evento, @direccion_evento, @hora_inicio, @tipo_evento,
        @dia_semana, @horas_solicitadas, @costo_paquete, @costo_musicos_extra, @costo_movilidad,
        @subtotal, @total, @estado, @tiene_a_tratar, @motivo_a_tratar, @observaciones, GETDATE(),
        NEWID());

    SELECT CAST(SCOPE_IDENTITY() AS INT);
END
GO

CREATE OR ALTER PROCEDURE usp_cotizacion_musico_insertar
    @cotizacion_id   INT,
    @musico_id       INT,
    @cantidad        INT,
    @precio_aplicado DECIMAL(10,2)
AS
BEGIN
    SET NOCOUNT ON;
    INSERT INTO CotizacionMusico (cotizacion_id, musico_id, cantidad, precio_aplicado)
    VALUES (@cotizacion_id, @musico_id, @cantidad, @precio_aplicado);
END
GO

CREATE OR ALTER PROCEDURE usp_cotizacion_extra_insertar
    @cotizacion_id INT,
    @servicio_id   INT
AS
BEGIN
    SET NOCOUNT ON;
    INSERT INTO CotizacionExtra (cotizacion_id, servicio_id)
    VALUES (@cotizacion_id, @servicio_id);
END
GO

-- Lista cotizaciones (filtro opcional por id o estado) y devuelve 5 result sets:
--   1) cotizaciones  2) sus paquetes  3) sus distritos  4) sus músicos  5) sus servicios extra
CREATE OR ALTER PROCEDURE usp_cotizacion_listar
    @id     INT          = NULL,
    @estado NVARCHAR(30) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    SELECT id, paquete_id, distrito_id
    INTO #cot
    FROM Cotizacion
    WHERE (@id IS NULL OR id = @id)
      AND (@estado IS NULL OR estado = @estado);

    -- 1) Cotizaciones
    SELECT c.id, c.nombre_cliente, c.telefono_cliente, c.email_cliente, c.dni_cliente,
           c.direccion_cliente, c.paquete_id, c.distrito_id, c.fecha_evento, c.direccion_evento,
           c.hora_inicio, c.tipo_evento, c.dia_semana, c.horas_solicitadas, c.costo_paquete,
           c.costo_musicos_extra, c.costo_movilidad, c.subtotal, c.total, c.estado,
           c.tiene_a_tratar, c.motivo_a_tratar, c.observaciones, c.fecha_creacion, c.codigo_acceso
    FROM Cotizacion c
    INNER JOIN #cot t ON t.id = c.id
    ORDER BY c.fecha_creacion DESC;

    -- 2) Paquetes
    SELECT p.id, p.nombre, p.descripcion, p.num_integrantes, p.precio_base, p.horas_base, p.activo
    FROM Paquete p
    WHERE p.id IN (SELECT paquete_id FROM #cot);

    -- 3) Distritos
    SELECT d.id, d.nombre, d.zona, d.costo_movilidad, d.es_a_tratar
    FROM Distrito d
    WHERE d.id IN (SELECT distrito_id FROM #cot);

    -- 4) Músicos de las cotizaciones
    SELECT cm.id, cm.cotizacion_id, cm.musico_id, cm.cantidad, cm.precio_aplicado,
           m.nombre AS musico_nombre, m.tipo AS musico_tipo,
           m.precio_adicional AS musico_precio_adicional, m.activo AS musico_activo
    FROM CotizacionMusico cm
    INNER JOIN #cot t ON t.id = cm.cotizacion_id
    INNER JOIN MusicoAdicional m ON m.id = cm.musico_id;

    -- 5) Servicios extra de las cotizaciones
    SELECT ce.id, ce.cotizacion_id, ce.servicio_id,
           s.nombre AS servicio_nombre, s.descripcion AS servicio_descripcion,
           s.telefono_contacto AS servicio_telefono_contacto,
           s.tiene_precio_fijo AS servicio_tiene_precio_fijo,
           s.precio AS servicio_precio, s.activo AS servicio_activo
    FROM CotizacionExtra ce
    INNER JOIN #cot t ON t.id = ce.cotizacion_id
    INNER JOIN ServicioExtra s ON s.id = ce.servicio_id;

    DROP TABLE #cot;
END
GO

-- @observaciones en NULL = no se cambian
CREATE OR ALTER PROCEDURE usp_cotizacion_cambiar_estado
    @id            INT,
    @estado        NVARCHAR(30),
    @observaciones NVARCHAR(500) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE Cotizacion
    SET estado = @estado,
        observaciones = ISNULL(@observaciones, observaciones)
    WHERE id = @id;

    SELECT @@ROWCOUNT;
END
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

/* ========================== CONTRATO PDF ========================== */
CREATE OR ALTER PROCEDURE usp_contrato_pdf_obtener
    @cotizacion_id INT
AS
BEGIN
    SET NOCOUNT ON;
    SELECT TOP 1 id, cotizacion_id, ruta_archivo, fecha_generacion
    FROM ContratoPdf
    WHERE cotizacion_id = @cotizacion_id
    ORDER BY id;
END
GO

CREATE OR ALTER PROCEDURE usp_contrato_pdf_insertar
    @cotizacion_id INT,
    @ruta_archivo  NVARCHAR(500)
AS
BEGIN
    SET NOCOUNT ON;
    INSERT INTO ContratoPdf (cotizacion_id, ruta_archivo, fecha_generacion)
    VALUES (@cotizacion_id, @ruta_archivo, GETDATE());

    SELECT CAST(SCOPE_IDENTITY() AS INT);
END
GO
