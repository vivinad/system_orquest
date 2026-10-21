namespace Entity
{
    public class MusicoAdicionalBE
    {
        public int Id { get; set; }
        public string Nombre { get; set; }
        public string Tipo { get; set; } // 'normal' o 'viento'
        public decimal PrecioAdicional { get; set; }
        public bool Activo { get; set; }
    }
}
