namespace Type
{
    // Valores fijos de la cotización (columna Cotizacion.estado).
    public static class Cotizacion
    {
        public static class Estado
        {
            public const string Pendiente = "pendiente";
            public const string Confirmada = "confirmada";
            public const string Pagada = "pagada";
            public const string Realizada = "realizada";
            public const string Rechazada = "rechazada";
            public const string Cancelada = "cancelada";
        }

        // Estados que bloquean la fecha: ya hay un contrato asegurado ese día.
        public static readonly string[] EstadosOcupados = { Estado.Confirmada, Estado.Pagada, Estado.Realizada };
    }
}
