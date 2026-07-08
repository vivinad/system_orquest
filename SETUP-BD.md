# Setup — Agua Cristalina (para correr en casa con la BD)

Guía rápida para levantar todo cuando tengas acceso al SQL Server.

## 1. Base de datos (una sola vez)

Ejecuta en SQL Server, sobre la base `ORQUESTA`:

```sql
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
('Agrupación 4 integrantes', '2 vocalistas, 1 tecladista, 1 timbalero. Incluye equipo de sonido.', 4, 1500, 5),
('Agrupación 5 integrantes', '2 vocalistas, 1 animador o conguero, 1 tecladista, 1 timbalero.', 5, 1800, 5),
('Agrupación 8 integrantes', '2 vocalistas, animador, tecladista, timbalero, conguero, trompeta, trombón.', 8, 3200, 5),
('Orquesta 11 músicos', '3 vocalistas, animador, tecladista, timbalero, conguero, bongó y 3 vientos.', 11, 5000, 5);
GO

-- Músicos adicionales (normal +250 / viento +300)
INSERT INTO MusicoAdicional (nombre, tipo, precio_adicional) VALUES
('Timbalero', 'normal', 250), ('Conguero', 'normal', 250),
('Animador', 'normal', 250),  ('Bongó', 'normal', 250),
('Trompeta', 'viento', 300),  ('Trombón', 'viento', 300),
('Saxofón', 'viento', 300);
GO

-- Servicios extra (contacto por WhatsApp; precio a coordinar)
INSERT INTO ServicioExtra (nombre, telefono_contacto, tiene_precio_fijo, precio) VALUES
('Alquiler de proyector', '993771153', 0, NULL),
('Edición de video',      '993771153', 0, NULL);
GO

-- Próximos eventos (se muestran en la página pública; el admin los gestiona)
CREATE TABLE Evento (
    id          INT IDENTITY(1,1) PRIMARY KEY,
    titulo      NVARCHAR(150) NOT NULL,
    fecha_texto NVARCHAR(150) NOT NULL,  -- texto para el público, ej: '11 y 12 de julio · desde la 1:00 PM'
    fecha       DATE NOT NULL,           -- último día del evento (para saber si sigue vigente)
    lugar       NVARCHAR(200) NOT NULL,
    direccion   NVARCHAR(300) NOT NULL,  -- dirección para el mapa de Google
    imagen_url  NVARCHAR(300) NOT NULL,  -- nombre de archivo del flyer, ej: 'evento1.png'
    activo      BIT NOT NULL DEFAULT 1
);
GO

INSERT INTO Evento (titulo, fecha_texto, fecha, lugar, direccion, imagen_url) VALUES
('Fiestas Patrias con Segundo Meléndez',
 '11 y 12 de julio · desde la 1:00 PM',
 '2026-07-12',
 'Picantería "Huarique Piurano" — La Encantada',
 'Av. José Saco Rojas, Carabayllo, Lima',
 'evento1.png');
GO
```

## 2. Backend (.NET 8)

1. Ajusta la cadena de conexión en `backend_orquesta/backend_orquesta/appsettings.json`
   (`Server=...` debe apuntar a tu SQL Server).
2. Corre:
   ```powershell
   cd backend_orquesta\backend_orquesta
   dotnet run
   ```
3. En Swagger crea el primer admin:
   `POST /api/auth/seed` → `{ "nombre":"Wendy", "email":"admin@aguacristalina.pe", "password":"tu_clave" }`
   (solo funciona si no existe ningún admin todavía).

## 3. Frontend (Angular 20)

```powershell
cd frontend-orquesta
npx ng serve --port 4300
```
Abrir: http://localhost:4300

### Cambiar de datos demo a la API real
En `frontend-orquesta/src/environments/environment.ts`:
- `useMock: true`  → datos de prueba en memoria (sin BD).  ← estado actual
- `useMock: false` → consume el backend real.
- Verifica que `url_api` apunte al puerto del backend (hoy `http://localhost:5161/api/`).

> Nota: el backend permite CORS desde `http://localhost:4200`. Si corres el frontend en otro
> puerto (4300) y usas `useMock: false`, agrega ese puerto en `Program.cs` (policy `AngularFrontend`).
