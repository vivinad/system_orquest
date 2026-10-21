using System;

namespace Common
{
    // Utilidades de fechas compartidas por todas las capas.
    public static class Fecha
    {
        private static readonly string[] DIAS =
            { "Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado" };

        // Nombre del día en español, ej: 2026-07-12 -> "Domingo"
        public static string DiaSemana(DateTime fecha)
        {
            return DIAS[(int)fecha.DayOfWeek];
        }

        public static bool EsFinDeSemana(DateTime fecha)
        {
            return fecha.DayOfWeek == DayOfWeek.Saturday || fecha.DayOfWeek == DayOfWeek.Sunday;
        }
    }
}
