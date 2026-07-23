using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using GestorPedidos.models;
using GestorPedidos.services;

namespace GestorPedidos.views
{
    public class BuscarPedidoMenu
    {
        public static void BuscarPedidointeractivo(PedidoService pedidoService1, List<Pedido> pedidos)
        {
            Console.Clear();
            Console.Write("Ingrese el código del pedido: ");
            string codigo = Console.ReadLine() ?? "";

            var pedido = pedidoService1.BuscarPedido(pedidos, codigo);

            if (pedido == null)
            {
                Console.WriteLine($"No se encontró el pedido con código: {codigo}");
            }
            else
            {
                Console.WriteLine($"\nCódigo: {pedido.Codigo}");
                Console.WriteLine($"Cliente: {pedido.Cliente}");
                Console.WriteLine($"Cantidad: {pedido.Cantidad}");
                Console.WriteLine($"Precio Unit.: ${pedido.PrecioUnitario:F2}");
                Console.WriteLine($"Subtotal: ${pedido.Subtotal:F2}");
                Console.WriteLine($"Entrega: {pedido.TipoEntrega} (${pedido.CostoEntrega:F2})");
                Console.WriteLine($"Total: ${pedido.Total:F2}");
                Console.WriteLine($"Estado: {pedido.Estado}");
                Console.WriteLine($"Fecha: {pedido.Fecha}");
            }

            Console.WriteLine("\nPresione Enter para continuar...");
            Console.ReadLine();
        }

    }
}
