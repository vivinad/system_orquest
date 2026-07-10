using System.Globalization;
using backend_orquesta.Models;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;

namespace backend_orquesta.Services
{
    /// <summary>
    /// Arma el contrato de presentación de servicios en PDF, con el mismo formato
    /// que usa Wendy manualmente (ver "13 diciembre smp.pdf"), rellenado con los
    /// datos de la cotización.
    /// </summary>
    public class ContratoPdfService
    {
        private static readonly CultureInfo EsPe = new("es-PE");

        private const string EmpresaNombre = "AGRUPACIÓN MUSICAL AGUA CRISTALINA";
        private const string EmpresaWhatsapp = "993771153 – 997437930";
        private const string EmpresaEmail = "orquesta.agua.cristalina@gmail.com";
        private const string EmpresaFacebook = "Wendy Y Su Agua Cristalina";
        private const string EmpresaTiktok = "Wendy_ agua.cristalina";
        private const string RepresentanteNombre = "WENDY MAYTE QUEREVALU SABALU";
        private const string RepresentanteDni = "41724235";
        private const string RepresentanteDomicilio = "Mz. J - Lote 22 Urb. El Álamo - Callao";

        public byte[] Generar(Cotizacion c)
        {
            var total = c.Total;
            var aCuenta = Math.Round(total * 0.30m, 2);
            var saldo = total - aCuenta;
            var dniCliente = string.IsNullOrWhiteSpace(c.DniCliente) ? "_______________" : c.DniCliente;
            var direccionCliente = string.IsNullOrWhiteSpace(c.DireccionCliente) ? "_______________" : c.DireccionCliente;
            var numIntegrantes = c.Paquete?.NumIntegrantes ?? 0;
            var fechaEventoTexto = c.FechaEvento.ToString("dd 'de' MMMM 'de' yyyy", EsPe);
            var fechaHoyTexto = DateTime.Now.ToString("dd 'de' MMMM 'de' yyyy", EsPe);

            var documento = Document.Create(container =>
            {
                container.Page(page =>
                {
                    page.Size(PageSizes.A4);
                    page.Margin(40);
                    page.DefaultTextStyle(x => x.FontSize(10.5f).FontFamily("Arial"));

                    page.Header().Column(col =>
                    {
                        col.Item().AlignCenter().Text(EmpresaNombre).FontSize(18).Bold().FontColor(Colors.Blue.Darken2);
                        col.Item().AlignCenter().Text($"WhatsApp: {EmpresaWhatsapp}").FontSize(9.5f);
                        col.Item().AlignCenter().Text($"Correo: {EmpresaEmail}").FontSize(9.5f);
                        col.Item().AlignCenter().Text($"Facebook: {EmpresaFacebook}").FontSize(9.5f);
                        col.Item().AlignCenter().Text($"TikTok: {EmpresaTiktok}").FontSize(9.5f);
                        col.Item().PaddingTop(10).LineHorizontal(1).LineColor(Colors.Grey.Lighten1);
                    });

                    page.Content().PaddingTop(14).Column(col =>
                    {
                        col.Spacing(8);

                        col.Item().Text(t =>
                        {
                            t.Justify();
                            t.Span("Conste por el presente Contrato de Presentación de Servicios, que celebran de una parte la ");
                            t.Span(EmpresaNombre).Bold();
                            t.Span(", representada por la Sra. ");
                            t.Span(RepresentanteNombre).Bold();
                            t.Span($", identificada con D.N.I. {RepresentanteDni}, con domicilio en {RepresentanteDomicilio}, que en adelante se denomina como ");
                            t.Span("CONTRATADO").Bold();
                            t.Span(" y de la otra parte el/la señor(a) ");
                            t.Span(c.NombreCliente).Bold();
                            t.Span($", identificado(a) con D.N.I. {dniCliente}, con domicilio en {direccionCliente}, que en adelante se denominará ");
                            t.Span("SOLICITANTE").Bold();
                            t.Span(", en los términos y condiciones siguientes:");
                        });

                        col.Item().PaddingTop(4).Text("CLÁUSULAS:").Bold().FontSize(11);

                        void Clausula(string numero, string texto)
                        {
                            col.Item().Text(t =>
                            {
                                t.Justify();
                                t.Span($"{numero}: ").Bold();
                                t.Span(texto);
                            });
                        }

                        Clausula("PRIMERO", "LA AGRUPACIÓN MUSICAL AGUA CRISTALINA asume la responsabilidad del servicio musical de género tropical.");
                        Clausula("SEGUNDO", "EL SOLICITANTE deberá abonar el 30% del importe tratado a la firma del presente contrato, en calidad de adelanto.");
                        Clausula("TERCERO", "EL SOLICITANTE deberá cancelar el 70% restante del importe tratado, dos horas antes de culminar la presentación del marco musical.");
                        Clausula("CUARTO", "EL SOLICITANTE deberá brindar las garantías necesarias durante la actividad para el buen funcionamiento y desenvolvimiento de la AGRUPACIÓN MUSICAL AGUA CRISTALINA.");
                        Clausula("QUINTO", "LA AGRUPACIÓN MUSICAL AGUA CRISTALINA no se responsabiliza por retrasos en el horario pactado o shows ajenos a la agrupación dentro del horario establecido.");
                        Clausula("SEXTO", "EL CONTRATADO no se responsabiliza a devolver el adelanto, si el evento es cancelado o postergado por parte del SOLICITANTE.");

                        col.Item().PaddingTop(6).Text("RESUMEN:").Bold().FontSize(11);

                        void Linea(string etiqueta, string valor)
                        {
                            col.Item().Row(row =>
                            {
                                row.ConstantItem(120).Text(etiqueta).Bold();
                                row.RelativeItem().Text(valor);
                            });
                        }

                        Linea("TRATADO:", $"S/ {total:0.00} — show de {c.HorasSolicitadas} horas por {numIntegrantes} músicos ({c.Paquete?.Nombre})");
                        Linea("A CUENTA (30%):", $"S/ {aCuenta:0.00}");
                        Linea("SALDO (70%):", $"S/ {saldo:0.00}");
                        Linea("Fecha del evento:", $"{fechaEventoTexto} ({c.DiaSemana}) · {c.HorasSolicitadas} horas de show");
                        Linea("Lugar del evento:", direccionCliente);

                        col.Item().PaddingTop(6).Text(
                            "Estando de acuerdo las partes con lo dispuesto en el presente contrato, firman ambos en calidad de conformidad.");

                        col.Item().PaddingTop(10).Text($"Callao, {fechaHoyTexto}");

                        col.Item().PaddingTop(50).Row(row =>
                        {
                            row.RelativeItem().Column(firma =>
                            {
                                firma.Item().LineHorizontal(1);
                                firma.Item().AlignCenter().Text(RepresentanteNombre).Bold();
                                firma.Item().AlignCenter().Text($"D.N.I.: {RepresentanteDni}");
                            });
                            row.ConstantItem(30);
                            row.RelativeItem().Column(firma =>
                            {
                                firma.Item().LineHorizontal(1);
                                firma.Item().AlignCenter().Text(c.NombreCliente).Bold();
                                firma.Item().AlignCenter().Text($"D.N.I.: {dniCliente}");
                            });
                        });
                    });
                });
            });

            return documento.GeneratePdf();
        }
    }
}
