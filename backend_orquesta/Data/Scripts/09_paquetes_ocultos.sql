/* =====================================================================
   09 — Procedimiento para ver los paquetes ocultos (Catálogo › Paquetes ocultos)
   Se puede ejecutar varias veces sin problema.
   ===================================================================== */
USE ORQUESTA;
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

