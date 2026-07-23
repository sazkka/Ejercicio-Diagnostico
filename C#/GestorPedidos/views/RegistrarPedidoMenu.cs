using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Reflection.PortableExecutable;
using System.Runtime.InteropServices;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using GestorPedidos.models;
using GestorPedidos.services;

namespace GestorPedidos.views
{

    public partial class RegistrarPedidoMenu
    {
        PedidoService pedidoService1 = new();
        public static void RegistrarPedidoInteractivo(PedidoService pedidoService1, List<Pedido> pedidos)
        {

            Console.Clear();
            Console.WriteLine("--- REGISTRAR NUEVO PEDIDO ---\n");


            Console.Write("Ingrese el código del pedido: ");
            string codigo = Console.ReadLine()!;
            if (string.IsNullOrWhiteSpace(codigo))
            {
                Console.WriteLine("El código no puede estar vacío.");
                Console.WriteLine("\nPresione Enter para continuar...");
                Console.ReadLine();
                return;
            }
            if (!MyRegex().IsMatch(codigo))
            {
                Console.WriteLine("El código debe tener el formato PED-001.");
                Console.WriteLine("\nPresione Enter para continuar...");
                Console.ReadLine();
                return;
            }
            if (pedidos.Any(p => p.Codigo.Equals(codigo, StringComparison.OrdinalIgnoreCase)))
            {
                Console.WriteLine($"Ya existe un pedido con el código {codigo}.");
                Console.WriteLine("\nPresione Enter para continuar...");
                Console.ReadLine();
                return;
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

            var pedido = new Pedido
            {
                Codigo = codigo,
                Producto = producto,
                Cliente = cliente,
                Cantidad = cantidad,
                PrecioUnitario = precioUnitario,
                TipoEntrega = tipoEntrega,
                Fecha = DateTime.Now
            };

            if (pedidoService1.CrearPedido(pedido, pedidos))
            {
                Console.WriteLine($"\nPedido {codigo} creado exitosamente.");
                Console.WriteLine($"Subtotal: ${pedido.Subtotal:F2}");
                Console.WriteLine($"Costo de entrega: ${pedido.CostoEntrega:F2}");
                Console.WriteLine($"Total: ${pedido.Total:F2}");
                Console.WriteLine("\nPresione Enter para continuar...");
                Console.ReadLine();
            }
            else
            {
                Console.WriteLine("Error al crear el pedido");
            }



        }

        [GeneratedRegex(@"^PED-\d{3}$")]
        private static partial Regex MyRegex();
    }
}