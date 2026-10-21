namespace Entity
{
    public class PaqueteBE
    {
        public int Id { get; set; }
        public string Nombre { get; set; }
        public string Descripcion { get; set; }
        public int NumIntegrantes { get; set; }
        public decimal PrecioBase { get; set; }
        public int HorasBase { get; set; }
        public bool Activo { get; set; }
    }
}
