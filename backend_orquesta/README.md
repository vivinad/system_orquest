# backend_orquesta

API .NET 8 de la orquesta **Agua Cristalina**. Sigue la misma arquitectura en capas que
`BackEnd_PaymentPeru`: varios proyectos de biblioteca de clases, acceso a datos con **Dapper**
sobre **procedimientos almacenados** (`usp_...`) y sin Entity Framework.

## Estructura de la solución (`backend_orquesta.sln`)

| Proyecto | Qué contiene | Sufijo |
|---|---|---|
| **WebApiOrquesta** | API web: `Program.cs` + `Startup.cs`, `Controllers/`, `AutomapperHelper.cs`, `appsettings.json`. Referencia a `DTO`, `Entity` y `Service`. | `XxxController` |
| **Service** | Lógica de negocio (cálculo de la cotización, validaciones, login, contrato PDF). Crea las clases `Data.*DA` con `new`. | `XxxSER` |
| **Data** | Acceso a datos: cada clase recibe la cadena de conexión y llama a procedimientos almacenados con Dapper. `Data/Scripts/` guarda los scripts SQL. | `XxxDA` |
| **Entity** | Entidades que devuelven los procedimientos (una por tabla / result set) y `Entity/Map/` con los mapeos columna -> propiedad (Dapper.FluentMap). | `XxxBE`, `XxxMAP` |
| **DTO** | Lo que entra y sale por la API. `DTO/Result/` tiene `Result<T>` y las respuestas especiales. | `XxxDTO` |
| **Common** | Utilidades compartidas (`Fecha.cs`). | |
| **Type** | Valores fijos: estados de la cotización, tipos de finanza y de media, roles. | |

Flujo de una petición:

```
Controller  ->  Service (XxxSER)  ->  Data (XxxDA)  ->  procedimiento usp_xxx  ->  SQL Server
                    ^ AutoMapper BE <-> DTO           ^ Dapper.FluentMap columna -> BE
```

Para agregar una funcionalidad nueva sigue la misma cadena de nombres:
`XxxController` -> `XxxSER` -> `XxxDA` -> `usp_xxx_...`, más `XxxBE` + `XxxMAP` + `XxxDTO`,
y registra el mapeo en `Startup.cs` (FluentMapper) y en `AutomapperHelper.cs`.

## Base de datos

Ejecuta en SQL Server, en orden, los scripts de `Data/Scripts/`:

1. `01_crear_bd_y_tablas.sql` (solo si la base `ORQUESTA` aún no existe)
2. `02` a `06`: cambios de columnas y datos iniciales (solo los que no hayas ejecutado antes)
3. **`07_procedimientos_almacenados.sql`** (obligatorio: crea todos los `usp_...` que usa la API;
   se puede volver a ejecutar sin problema)

## Ejecutar

1. Ajusta la cadena `ConnectionStrings:cn_bd_orquesta` en `WebApiOrquesta/appsettings.json`.
2. Abre `backend_orquesta.sln` en Visual Studio, marca **WebApiOrquesta** como proyecto de inicio
   y usa el perfil **http** (puerto 5161, el mismo que usa el frontend), o desde consola:

   ```powershell
   dotnet run --project WebApiOrquesta\WebApiOrquesta.csproj --launch-profile http
   ```
3. Swagger: http://localhost:5161/swagger — primero `POST /api/auth/login`, copia el `token` y
   pégalo en el botón **Authorize** para probar los endpoints del admin.

## Configuración por PC (`appsettings.Local.json`)

Si en una PC la base no está en `localhost` (por ejemplo, se usa SQL Server LocalDB), crea
`WebApiOrquesta/appsettings.Local.json` solo con lo que cambia. La API lo carga encima de
`appsettings.json` y git lo ignora, así cada PC conserva su propia cadena:

```json
{
  "ConnectionStrings": {
    "cn_bd_orquesta": "Server=(localdb)\\MSSQLLocalDB;Database=ORQUESTA;Trusted_Connection=True;TrustServerCertificate=True"
  }
}
```

## Seguridad

Todos los endpoints exigen el token JWT del login, salvo los que usa la web pública
(marcados con `[AllowAnonymous]`): catálogos (`GET`), eventos vigentes, medios del home,
calcular/crear cotización, fecha ocupada, descargar contrato, login y seed.
