namespace Type
{
    // Valores fijos de la columna MediaHome.tipo.
    public static class MediaHome
    {
        public static class Tipo
        {
            public const string Video = "video"; // ID de YouTube
            public const string Foto = "foto";   // nombre de archivo o base64
        }

        public static readonly string[] TiposValidos = { Tipo.Video, Tipo.Foto };
    }
}
