namespace DTO.Result
{
    // Respuesta estándar de la capa Service (mismo patrón que BackEnd_PaymentPeru).
    // errorCodigo: "OK" | "VAL" (validación) | "NOEXISTE" | "CONFLICTO" | "ERROR"
    public class Result<Tipo>
    {
        public Tipo value { get; set; }
        public string errorCodigo { get; set; } = "OK";
        public string errorMensaje { get; set; } = "";
    }
}
