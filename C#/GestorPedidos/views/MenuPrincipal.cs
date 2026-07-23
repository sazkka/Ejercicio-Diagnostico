using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using GestorPedidos.models;
using GestorPedidos.enums;
using GestorPedidos.services;

namespace GestorPedidos.views
{
    public class MenuPrincipal
    {
        private static readonly List<Pedido> pedidos = [];

        public static void MostrarMenu(PedidoService pedidoService)
        {
            bool salir = false;

            while (!salir)
            {
                Console.Clear();
                Console.WriteLine("========================================");
                Console.WriteLine("SISTEMA DE GESTIÓN DE PEDIDOS");
                Console.WriteLine("========================================");
                Console.WriteLine("1. Registrar pedido");
                Console.WriteLine("2. Mostrar todos los pedidos");
                Console.WriteLine("3. Buscar pedido por código");
                Console.WriteLine("4. Cambiar estado de pedido");
                Console.WriteLine("5. Salir");
                Console.Write("\nSeleccione una opción: ");

                string? opcion = Console.ReadLine();

                switch (opcion)
                {
                    case "1":
                        RegistrarPedidoMenu.RegistrarPedidoInteractivo(pedidoService, pedidos);
                        break;
                    case "2":
                        MostrarPedidosMenu.MostrarPedidosInteeractivo(pedidoService, pedidos);
                        break;
                    case "3":
                        BuscarPedidoMenu.BuscarPedidointeractivo(pedidoService, pedidos);
                        break;
                    case "4":
                        CambiarEstadoMenu.CambiarEstadoInteractivo(pedidos);
                        break;
                    case "5":
                        ModificarMenuPedido.ModificarPedidoInteractivo(pedidos, pedidoService);
                        break;
                    case "6":
                        salir = true;
                        Console.WriteLine("Saliendo del sistema...");
                        break;
                    default:
                        Console.WriteLine("Opción no válida. Presione Enter para continuar...");
                        Console.ReadLine();
                        break;
                }
            }
        }



    

    }
}
