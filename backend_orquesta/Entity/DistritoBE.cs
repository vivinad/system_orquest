namespace Entity
{
    public class DistritoBE
    {
        public int Id { get; set; }
        public string Nombre { get; set; }
        public string Zona { get; set; } // 'sin_costo', 'zona_50', 'zona_150', 'fuera_lima'
        public decimal CostoMovilidad { get; set; }
        public bool EsATratar { get; set; }
    }
}
