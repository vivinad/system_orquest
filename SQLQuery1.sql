
CREATE DATABASE ORQUESTA;
GO

USE ORQUESTA;
GO

-- TABLA: Paquete

CREATE TABLE Paquete (
    id              INT IDENTITY(1,1) PRIMARY KEY,
    nombre          NVARCHAR(100)   NOT NULL,
    num_integrantes INT             NOT NULL,
    precio_base     DECIMAL(10,2)   NOT NULL,
    horas_base      INT             NOT NULL DEFAULT 5,
    activo          BIT             NOT NULL DEFAULT 1
);
GO

-- =============================================
-- TABLA: MusicoAdicional
-- =============================================
CREATE TABLE MusicoAdicional (
    id                  INT IDENTITY(1,1) PRIMARY KEY,
    nombre              NVARCHAR(100)   NOT NULL,
    tipo                NVARCHAR(50)    NOT NULL, -- 'normal' o 'viento'
    precio_adicional    DECIMAL(10,2)   NOT NULL,
    activo              BIT             NOT NULL DEFAULT 1
);
GO

-- =============================================
-- TABLA: Distrito
-- =============================================
CREATE TABLE Distrito (
    id               INT IDENTITY(1,1) PRIMARY KEY,
    nombre           NVARCHAR(100)  NOT NULL,
    zona             NVARCHAR(50)   NOT NULL, -- 'sin_costo', 'zona_50', 'zona_150', 'a_tratar', 'fuera_lima'
    costo_movilidad  DECIMAL(10,2)  NOT NULL DEFAULT 0,
    es_a_tratar      BIT            NOT NULL DEFAULT 0
);
GO

-- =============================================
-- TABLA: ServicioExtra
-- =============================================
CREATE TABLE ServicioExtra (
    id                  INT IDENTITY(1,1) PRIMARY KEY,
    nombre              NVARCHAR(100)   NOT NULL,
    descripcion         NVARCHAR(255)   NULL,
    telefono_contacto   NVARCHAR(20)    NULL,
    tiene_precio_fijo   BIT             NOT NULL DEFAULT 0,
    precio              DECIMAL(10,2)   NULL,
    activo              BIT             NOT NULL DEFAULT 1
);
GO

-- =============================================
-- TABLA: UsuarioAdmin
-- =============================================
CREATE TABLE UsuarioAdmin (
    id              INT IDENTITY(1,1) PRIMARY KEY,
    nombre          NVARCHAR(100)   NOT NULL,
    email           NVARCHAR(150)   NOT NULL UNIQUE,
    password_hash   NVARCHAR(255)   NOT NULL,
    rol             NVARCHAR(50)    NOT NULL DEFAULT 'admin',
    activo          BIT             NOT NULL DEFAULT 1,
    fecha_creacion  DATETIME        NOT NULL DEFAULT GETDATE()
);
GO

-- =============================================
-- TABLA: Cotizacion
-- =============================================
CREATE TABLE Cotizacion (
    id                  INT IDENTITY(1,1) PRIMARY KEY,
    nombre_cliente      NVARCHAR(150)   NOT NULL,
    telefono_cliente    NVARCHAR(20)    NOT NULL,
    email_cliente       NVARCHAR(150)   NULL,
    paquete_id          INT             NOT NULL REFERENCES Paquete(id),
    distrito_id         INT             NOT NULL REFERENCES Distrito(id),
    fecha_evento        DATE            NOT NULL,
    dia_semana          NVARCHAR(20)    NOT NULL,
    horas_solicitadas   INT             NOT NULL,
    costo_paquete       DECIMAL(10,2)   NOT NULL,
    costo_musicos_extra DECIMAL(10,2)   NOT NULL DEFAULT 0,
    costo_movilidad     DECIMAL(10,2)   NOT NULL DEFAULT 0,
    subtotal            DECIMAL(10,2)   NOT NULL,
    total               DECIMAL(10,2)   NOT NULL,
    estado              NVARCHAR(30)    NOT NULL DEFAULT 'pendiente',
    tiene_a_tratar      BIT             NOT NULL DEFAULT 0,
    motivo_a_tratar     NVARCHAR(255)   NULL,
    observaciones       NVARCHAR(500)   NULL,
    fecha_creacion      DATETIME        NOT NULL DEFAULT GETDATE()
);
GO

-- =============================================
-- TABLA: CotizacionMusico
-- =============================================
CREATE TABLE CotizacionMusico (
    id                  INT IDENTITY(1,1) PRIMARY KEY,
    cotizacion_id       INT             NOT NULL REFERENCES Cotizacion(id),
    musico_id           INT             NOT NULL REFERENCES MusicoAdicional(id),
    cantidad            INT             NOT NULL DEFAULT 1,
    precio_aplicado     DECIMAL(10,2)   NOT NULL
);
GO

-- =============================================
-- TABLA: CotizacionExtra
-- =============================================
CREATE TABLE CotizacionExtra (
    id              INT IDENTITY(1,1) PRIMARY KEY,
    cotizacion_id   INT NOT NULL REFERENCES Cotizacion(id),
    servicio_id     INT NOT NULL REFERENCES ServicioExtra(id)
);
GO

-- =============================================
-- TABLA: ContratoPdf
-- =============================================
CREATE TABLE ContratoPdf (
    id                  INT IDENTITY(1,1) PRIMARY KEY,
    cotizacion_id       INT             NOT NULL REFERENCES Cotizacion(id),
    ruta_archivo        NVARCHAR(500)   NOT NULL,
    fecha_generacion    DATETIME        NOT NULL DEFAULT GETDATE()
);
GO

-- =============================================
-- TABLA: Finanza
-- =============================================
CREATE TABLE Finanza (
    id              INT IDENTITY(1,1) PRIMARY KEY,
    admin_id        INT             NOT NULL REFERENCES UsuarioAdmin(id),
    cotizacion_id   INT             NULL REFERENCES Cotizacion(id),
    tipo            NVARCHAR(10)    NOT NULL, -- 'ingreso' o 'gasto'
    monto           DECIMAL(10,2)   NOT NULL,
    descripcion     NVARCHAR(255)   NOT NULL,
    categoria       NVARCHAR(100)   NULL,
    fecha           DATE            NOT NULL DEFAULT GETDATE(),
    fecha_registro  DATETIME        NOT NULL DEFAULT GETDATE()
);
GO

-- =============================================
-- SOLO SE INSERTAN LOS DISTRITOS (son fijos)
-- Los precios y paquetes los configura el admin
-- =============================================

-- Sin costo de movilidad
INSERT INTO Distrito (nombre, zona, costo_movilidad, es_a_tratar) VALUES
('Miraflores',              'sin_costo', 0, 0),
('San Isidro',              'sin_costo', 0, 0),
('Surco',                   'sin_costo', 0, 0),
('San Borja',               'sin_costo', 0, 0),
('La Molina',               'sin_costo', 0, 0),
('Barranco',                'sin_costo', 0, 0),
('Chorrillos',              'sin_costo', 0, 0),
('Surquillo',               'sin_costo', 0, 0),
('Lince',                   'sin_costo', 0, 0),
('Pueblo Libre',            'sin_costo', 0, 0),
('Magdalena',               'sin_costo', 0, 0),
('Jesus Maria',             'sin_costo', 0, 0),
('Breña',                   'sin_costo', 0, 0),
('Lima Cercado',            'sin_costo', 0, 0),
('La Victoria',             'sin_costo', 0, 0),
('San Luis',                'sin_costo', 0, 0),
('San Miguel',              'sin_costo', 0, 0),
('Callao',                  'sin_costo', 0, 0),
('Bellavista',              'sin_costo', 0, 0),
('La Perla',                'sin_costo', 0, 0),
('Ventanilla',              'sin_costo', 0, 0),
('Los Olivos',              'sin_costo', 0, 0),
('San Martin de Porres',    'sin_costo', 0, 0),
('Independencia',           'sin_costo', 0, 0),
('Rimac',                   'sin_costo', 0, 0),
('El Agustino',             'sin_costo', 0, 0),
('Santa Anita',             'sin_costo', 0, 0),
('Ate',                     'sin_costo', 0, 0),
('Vitarte',                 'sin_costo', 0, 0),
('San Juan de Lurigancho',  'sin_costo', 0, 0),
('San Juan de Miraflores',  'sin_costo', 0, 0),
('Villa Maria del Triunfo', 'sin_costo', 0, 0),
('Villa El Salvador',       'sin_costo', 0, 0),
('Puente Piedra',           'sin_costo', 0, 0),
('Comas',                   'sin_costo', 0, 0);

-- +S/50 movilidad (configurable desde admin)
INSERT INTO Distrito (nombre, zona, costo_movilidad, es_a_tratar) VALUES
('Santa Rosa',  'zona_50', 0, 0),
('Ancon',       'zona_50', 0, 0),
('Carabayllo',  'zona_50', 0, 0);

-- +S/150 movilidad (configurable desde admin)
INSERT INTO Distrito (nombre, zona, costo_movilidad, es_a_tratar) VALUES
('Cieneguilla',          'zona_150', 0, 0),
('Chosica - Lurigancho', 'zona_150', 0, 0),
('Pachacamac',           'zona_150', 0, 0),
('Lurin',                'zona_150', 0, 0),
('Punta Hermosa',        'zona_150', 0, 0),
('Punta Negra',          'zona_150', 0, 0),
('San Bartolo',          'zona_150', 0, 0),
('Santa Maria del Mar',  'zona_150', 0, 0);

-- Fuera de Lima = a tratar siempre
INSERT INTO Distrito (nombre, zona, costo_movilidad, es_a_tratar) VALUES
('Fuera de Lima / Provincia', 'fuera_lima', 0, 1);
GO

-- =============================================
-- VERIFICACION FINAL
-- =============================================
SELECT 'Paquete'          AS tabla, COUNT(*) AS registros FROM Paquete
UNION ALL
SELECT 'MusicoAdicional',            COUNT(*) FROM MusicoAdicional
UNION ALL
SELECT 'Distrito',                   COUNT(*) FROM Distrito
UNION ALL
SELECT 'ServicioExtra',              COUNT(*) FROM ServicioExtra
UNION ALL
SELECT 'UsuarioAdmin',               COUNT(*) FROM UsuarioAdmin;
GO