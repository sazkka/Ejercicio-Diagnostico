using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using GestorPedidos.enums;
using GestorPedidos.models;
using GestorPedidos.services;

namespace GestorPedidos.views
{
    public class CambiarEstadoMenu
    {
        public static void CambiarEstadoInteractivo(List<Pedido> pedidos)
        {
            PedidoService pedidoService = new();

            Console.Write("Código: ");
            string codigo = Console.ReadLine() ?? "";
            Console.Clear();
            EstadoPedido estado = Pedido.LeerEstado();
            
            

            bool actualizado = pedidoService.CambiarEstado(pedidos, codigo, estado);

            if (actualizado)
                Console.WriteLine("Estado actualizado correctamente.");
            else
                Console.WriteLine("Pedido no encontrado.");
            Console.WriteLine("\nPresione Enter para continuar...");
            Console.ReadLine();

        }
    }
}