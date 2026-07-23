using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using GestorPedidos.enums;


namespace GestorPedidos.models
{
    public class Pedido
    {
        public required string Codigo { get; set; }
        public required string Cliente { get; set; }

        public required string Producto { get; set; }
        public int Cantidad { get; set; }
        public decimal PrecioUnitario { get; set; }
        public required string TipoEntrega { get; set; }
        public DateTime Fecha { get; set; }
        public EstadoPedido Estado { get; set; } = EstadoPedido.Pendiente;

        public decimal CostoEntrega
        {
            get
            {
                switch (TipoEntrega)
                {
                    case "Retiro en tienda":
                        return 0m;
                    case "Entrega estándar":
                        return 2.50m;
                    case "Entrega rápida":
                        return 5m;
                    default:
                        return 0m;
                }
            }
        }

        public decimal Subtotal => Cantidad * PrecioUnitario;

        public decimal Total => Subtotal + CostoEntrega;

        public static EstadoPedido LeerEstado()
        {
            Console.WriteLine("1. Pendiente");
            Console.WriteLine("2. En preparación");
            Console.WriteLine("3. Enviado");
            Console.WriteLine("4. Entregado");
            Console.WriteLine("5. Cancelado");

            Console.Write("Seleccione: ");

            return (Console.ReadLine() ?? "") switch
            {
                "1" => EstadoPedido.Pendiente,
                "2" => EstadoPedido.Enpreparación,
                "3" => EstadoPedido.Enviado,
                "4" => EstadoPedido.Entregado,
                "5" => EstadoPedido.Cancelado,
                _ => EstadoPedido.Pendiente
            };
        }
    }


}