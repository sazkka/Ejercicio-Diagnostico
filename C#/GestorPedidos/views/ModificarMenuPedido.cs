using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.InteropServices;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using GestorPedidos.models;
using GestorPedidos.services;

namespace GestorPedidos.views
{
    public class ModificarMenuPedido
    {
        public static void ModificarPedidoInteractivo(List<Pedido> pedidos, PedidoService pedidoService1)
        {
            Console.Clear();
            Console.WriteLine("--- MODIFICAR PEDIDO ---\n");

            Console.Write("Ingrese el código del pedido: ");
            string codigo = Console.ReadLine() ?? "";

            var pedido = pedidoService1.BuscarPedido(pedidos, codigo);

            if (pedido == null)
            {
                Console.WriteLine($"No se encontró el pedido con código: {codigo}");
            }

            Console.Write("Nombre del producto: ");
            string producto = Console.ReadLine() ?? "";
            if (string.IsNullOrWhiteSpace(producto))
            {
                Console.WriteLine("El nombre del producto no puede estar vacío.");
                Console.WriteLine("\nPresione Enter para continuar...");
                Console.ReadLine();
                return;
            }


            Console.Write("Nombre del cliente: ");
            string cliente = Console.ReadLine() ?? "";
            if (string.IsNullOrWhiteSpace(cliente))
            {
                Console.WriteLine("El nombre del cliente no puede estar vacío.");
                Console.WriteLine("\nPresione Enter para continuar...");
                Console.ReadLine();
                return;
            }

            Console.Write("Cantidad de productos: ");
            if (!int.TryParse(Console.ReadLine(), out int cantidad) || cantidad <= 0)
            {
                Console.WriteLine("La cantidad debe ser un número entero mayor a cero.");
                Console.WriteLine("\nPresione Enter para continuar...");
                Console.ReadLine();
                return;
            }

            Console.Write("Precio unitario: ");
            if (!decimal.TryParse(Console.ReadLine(), out decimal precioUnitario) || precioUnitario <= 0)
            {
                Console.WriteLine("El precio unitario debe ser un número decimal mayor a cero.");
                Console.WriteLine("\nPresione Enter para continuar...");
                Console.ReadLine();
                return;
            }

            Console.WriteLine("\nTipo de entrega:");
            Console.WriteLine("1. Retiro en tienda");
            Console.WriteLine("2. Entrega estándar");
            Console.WriteLine("3. Entrega rápida");
            Console.Write("Seleccione: ");
            string tipoEntrega = Console.ReadLine() switch
            {
                "1" => "Retiro en tienda",
                "2" => "Entrega estándar",
                "3" => "Entrega rápida",
                _ => "Retiro en tienda"
            };

            var pedidoNuevo = new Pedido
            {
                Codigo = pedido.Codigo,
                Producto = producto,
                Cliente = cliente,
                Cantidad = cantidad,
                PrecioUnitario = precioUnitario,
                TipoEntrega = tipoEntrega,
                Fecha = DateTime.Now
            };

            if (pedidoService1.ModificarPedido(pedidoNuevo, pedidos, codigo))
            {
                Console.WriteLine("Pedido modificado exitosamente");
                Console.WriteLine("\nPresione Enter para continuar...");
                Console.ReadLine();
            }
            else
            {
                Console.WriteLine("Error al modificar el pedido");
                Console.WriteLine("\nPresione Enter para continuar...");
                Console.ReadLine();
            }


        }

    }
    
}