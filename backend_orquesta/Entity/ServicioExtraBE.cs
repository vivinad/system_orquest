namespace Entity
{
    public class ServicioExtraBE
    {
        public int Id { get; set; }
        public string Nombre { get; set; }
        public string Descripcion { get; set; }
        public string TelefonoContacto { get; set; }
        public bool TienePrecioFijo { get; set; }
        public decimal? Precio { get; set; }
        public bool Activo { get; set; }
    }
}
