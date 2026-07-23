using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using GestorPedidos.models;
using GestorPedidos.services;

namespace GestorPedidos.views
{
    public class MostrarPedidosMenu
    {
        public static void MostrarPedidosInteeractivo(PedidoService pedidoService1, List<Pedido> pedidos)
        {
            Console.Clear();
            Console.WriteLine("--- LISTA DE PEDIDOS ---\n");

            if (pedidos.Count == 0)
            {
                Console.WriteLine("No hay pedidos registrados.");
            }
            else
            {
                foreach (var p in pedidos)
                {
                    Console.WriteLine($"Código: {p.Codigo}");
                    Console.WriteLine($"Código: {p.Producto}");
                    Console.WriteLine($"Cliente: {p.Cliente}");
                    Console.WriteLine($"Cantidad: {p.Cantidad}");
                    Console.WriteLine($"Precio Unit.: ${p.PrecioUnitario:F2}");
                    Console.WriteLine($"Subtotal: ${p.Subtotal:F2}");
                    Console.WriteLine($"Entrega: {p.TipoEntrega} (${p.CostoEntrega:F2})");
                    Console.WriteLine($"Total: ${p.Total:F2}");
                    Console.WriteLine($"Estado: {p.Estado}");
                    Console.WriteLine($"Fecha: {p.Fecha}");
                    Console.WriteLine("----------------------------");
                }
            }

            Console.WriteLine("\nPresione Enter para continuar...");
            Console.ReadLine();
        }
    }
}