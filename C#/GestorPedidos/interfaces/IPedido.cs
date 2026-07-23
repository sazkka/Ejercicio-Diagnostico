using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using GestorPedidos.enums;
using GestorPedidos.models;

namespace GestorPedidos.interfaces
{
    public interface IPedido
    {
        bool CrearPedido(Pedido pedido, List<Pedido> pedidos);

        Pedido BuscarPedido(List<Pedido> pedidos, string codigo);

        bool CambiarEstado(List<Pedido> pedidos, string codigo, EstadoPedido nuevoEstado);

        bool ModificarPedido(Pedido pedido, List<Pedido> pedidos, string codigo);
    }
}