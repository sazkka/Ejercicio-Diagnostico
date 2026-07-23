using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using GestorPedidos.enums;
using GestorPedidos.interfaces;
using GestorPedidos.models;

namespace GestorPedidos.services
{
    public class PedidoService : IPedido
    {
        public bool CrearPedido(Pedido pedido, List<Pedido> pedidos)
        {
            if (pedido != null)
            {
                pedidos.Add(pedido);
                return true;
            }

            return false;

        }

        public Pedido? BuscarPedido(List<Pedido> pedidos, string codigo)
        {
            var pedido = pedidos.FirstOrDefault(p => p.Codigo.Equals(codigo, StringComparison.OrdinalIgnoreCase));
            if (pedido != null)
            {
                return pedido;
            }

            return null;

        }


        public bool CambiarEstado(List<Pedido> pedidos, string codigo, EstadoPedido nuevoEstado)
        {
            var pedido = BuscarPedido(pedidos, codigo);

            if (pedido == null)
                return false;

            pedido.Estado = nuevoEstado;
            return true;
        }

        public bool ModificarPedido(Pedido pedido, List<Pedido> pedidos, string codigo)
        {
            var pedidoExistente = BuscarPedido(pedidos, codigo);

            if (pedidoExistente == null)
                return false;

            pedidoExistente.Cliente = pedido.Cliente;
            pedidoExistente.Estado = pedido.Estado;
            pedidoExistente.Producto = pedido.Producto;
            pedidoExistente.Cantidad = pedido.Cantidad;
            pedidoExistente.PrecioUnitario = pedido.PrecioUnitario;
            pedidoExistente.Fecha = pedido.Fecha;
        
            

            return true;
        }
    }
}