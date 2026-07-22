'use strict';

/* ============================================================
   ESTADO GLOBAL Y CONSTANTES
   ============================================================ */

// Arreglo principal: única fuente de verdad de los pedidos.
const pedidos = [];

// Código del pedido que se está editando actualmente (null = modo registro).
let codigoEnEdicion = null;

// Página actual de la paginación de la tabla de "Registros".
let paginaActual = 1;

// Temporizador para ocultar automáticamente el mensaje de la parte superior.
let temporizadorMensaje = null;
const DURACION_MENSAJE_MS = 3000;

// Costo de entrega según el tipo seleccionado.
const COSTOS_ENTREGA = {
    'Retiro en tienda': 0,
    'Entrega estándar': 2.5,
    'Entrega rápida': 5
};

// Estados válidos y a qué estados puede pasar cada uno.
const TRANSICIONES_ESTADO = {
    'Pendiente': ['En preparación', 'Cancelado'],
    'En preparación': ['Enviado', 'Cancelado'],
    'Enviado': ['Entregado'],
    'Entregado': [],
    'Cancelado': []
};

const ORDEN_ESTADOS = ['Pendiente', 'En preparación', 'Enviado', 'Entregado', 'Cancelado'];
const ESTADO_INICIAL = 'Pendiente';

/* ============================================================
   REFERENCIAS AL DOM
   ============================================================ */

const dom = {
    navItems: document.querySelectorAll('.nav-item'),
    pages: document.querySelectorAll('.page'),

    form: document.getElementById('pedidoForm'),
    messageArea: document.getElementById('messageArea'),

    formIcon: document.getElementById('formIcon'),
    formTitle: document.getElementById('formTitle'),
    formSubtitle: document.getElementById('formSubtitle'),

    codigo: document.getElementById('codigo'),
    cliente: document.getElementById('cliente'),
    producto: document.getElementById('producto'),
    cantidad: document.getElementById('cantidad'),
    precioUnitario: document.getElementById('precioUnitario'),
    tipoEntrega: document.getElementById('tipoEntrega'),
    fecha: document.getElementById('fecha'),

    btnRegistrar: document.getElementById('btnRegistrar'),
    btnActualizar: document.getElementById('btnActualizar'),
    btnCancelar: document.getElementById('btnCancelar'),

    busqueda: document.getElementById('busqueda'),
    btnBuscar: document.getElementById('btnBuscar'),
    quickChips: document.getElementById('quickChips'),
    resultadosInfo: document.getElementById('resultadosInfo'),
    tablaBusquedaBody: document.getElementById('tablaBusquedaBody'),

    filterEstado: document.getElementById('filterEstado'),
    filterEntrega: document.getElementById('filterEntrega'),
    filterTotal: document.getElementById('filterTotal'),
    ordenamiento: document.getElementById('ordenamiento'),
    btnLimpiarFiltros: document.getElementById('btnLimpiarFiltros'),

    tablePedidos: document.getElementById('tablePedidos'),
    totalBadgeNumero: document.getElementById('totalBadgeNumero'),

    paginacionInfo: document.getElementById('paginacionInfo'),
    paginacionControles: document.getElementById('paginacionControles'),
    tamanoPagina: document.getElementById('tamanoPagina'),

    modalOverlay: document.getElementById('modalOverlay'),
    modalTitle: document.getElementById('modalTitle'),
    modalBody: document.getElementById('modalBody'),
    modalActions: document.getElementById('modalActions'),

    statTotalPedidos: document.getElementById('statTotalPedidos'),
    statPendientes: document.getElementById('statPendientes'),
    statPreparacion: document.getElementById('statPreparacion'),
    statEnviados: document.getElementById('statEnviados'),
    statEntregados: document.getElementById('statEntregados'),
    statCancelados: document.getElementById('statCancelados'),
    pctPendientes: document.getElementById('pctPendientes'),
    pctPreparacion: document.getElementById('pctPreparacion'),
    pctEnviados: document.getElementById('pctEnviados'),
    pctEntregados: document.getElementById('pctEntregados'),
    pctCancelados: document.getElementById('pctCancelados'),
    statTotalVendido: document.getElementById('statTotalVendido'),
    statIngresoEntregas: document.getElementById('statIngresoEntregas'),
    statPromedio: document.getElementById('statPromedio'),
    statMayorValor: document.getElementById('statMayorValor'),
    statMenorValor: document.getElementById('statMenorValor'),
    listaPorEstado: document.getElementById('listaPorEstado'),
    listaPorEntrega: document.getElementById('listaPorEntrega'),
    statTop3: document.getElementById('statTop3')
};

/* ============================================================
   NAVEGACIÓN ENTRE PÁGINAS
   ============================================================ */

function mostrarPagina(nombre) {
    dom.pages.forEach(pagina => {
        pagina.classList.toggle('active', pagina.id === `page-${nombre}`);
    });
    dom.navItems.forEach(boton => {
        boton.classList.toggle('active', boton.dataset.page === nombre);
    });
}

function inicializarNavegacion() {
    dom.navItems.forEach(boton => {
        boton.addEventListener('click', () => mostrarPagina(boton.dataset.page));
    });
}

/* ============================================================
   UTILIDADES
   ============================================================ */

function formatearMoneda(valor) {
    return '$' + valor.toFixed(2);
}

function formatearFecha(fechaISO) {
    // fechaISO llega como "YYYY-MM-DD" desde <input type="date">
    const partes = fechaISO.split('-');
    if (partes.length !== 3) return fechaISO;
    return `${partes[2]}/${partes[1]}/${partes[0]}`;
}

function claseBadgeEstado(estado) {
    return 'badge-estado badge-' + estado.replace(/\s+/g, '-');
}

function obtenerPedidoPorCodigo(codigo) {
    return pedidos.find(p => p.codigo.toLowerCase() === codigo.toLowerCase());
}

function mostrarMensaje(texto, tipo) {
    dom.messageArea.className = 'message-area message-' + tipo;
    dom.messageArea.innerHTML = '';
    const caja = document.createElement('div');
    caja.className = 'message-box';
    caja.textContent = texto;
    dom.messageArea.appendChild(caja);
    programarOcultamientoMensaje();
}

function mostrarErrores(errores) {
    dom.messageArea.className = 'message-area message-error';
    dom.messageArea.innerHTML = '';
    const caja = document.createElement('div');
    caja.className = 'message-box';
    const titulo = document.createElement('strong');
    titulo.textContent = 'Corrige los siguientes datos:';
    const lista = document.createElement('ul');
    errores.forEach(err => {
        const li = document.createElement('li');
        li.textContent = err;
        lista.appendChild(li);
    });
    caja.appendChild(titulo);
    caja.appendChild(lista);
    dom.messageArea.appendChild(caja);
    programarOcultamientoMensaje();
}

function ocultarMensaje() {
    dom.messageArea.className = 'message-area';
    dom.messageArea.innerHTML = '';
}

function programarOcultamientoMensaje() {
    if (temporizadorMensaje !== null) {
        clearTimeout(temporizadorMensaje);
    }
    temporizadorMensaje = setTimeout(ocultarMensaje, DURACION_MENSAJE_MS);
}

/* ============================================================
   VALIDACIONES
   ============================================================ */

function validarPedido(datos, codigoOriginal) {
    const errores = [];

    const codigo = datos.codigo.trim();
    const cliente = datos.cliente.trim();
    const producto = datos.producto.trim();

    if (codigo === '') {
        errores.push('El código es obligatorio.');
    } else {
        const existente = obtenerPedidoPorCodigo(codigo);
        const esDuplicado = existente && (codigoOriginal === null || existente.codigo.toLowerCase() !== codigoOriginal.toLowerCase());
        if (esDuplicado) {
            errores.push('Ya existe un pedido registrado con ese código.');
        }
    }

    if (cliente === '') {
        errores.push('El nombre del cliente es obligatorio.');
    }

    if (producto === '') {
        errores.push('El producto es obligatorio.');
    }

    const cantidad = Number(datos.cantidad);
    if (datos.cantidad === '' || Number.isNaN(cantidad) || !Number.isInteger(cantidad) || cantidad <= 0) {
        errores.push('La cantidad debe ser un número entero mayor que cero.');
    }

    const precioUnitario = Number(datos.precioUnitario);
    if (datos.precioUnitario === '' || Number.isNaN(precioUnitario) || precioUnitario <= 0) {
        errores.push('El precio unitario debe ser mayor que cero.');
    }

    if (!Object.prototype.hasOwnProperty.call(COSTOS_ENTREGA, datos.tipoEntrega)) {
        errores.push('Debes seleccionar un tipo de entrega válido.');
    }

    if (datos.fecha.trim() === '') {
        errores.push('La fecha es obligatoria.');
    }

    return errores;
}

/* ============================================================
   CÁLCULOS DEL PEDIDO
   ============================================================ */

function calcularValoresPedido(cantidad, precioUnitario, tipoEntrega) {
    const subtotal = cantidad * precioUnitario;
    const costoEntrega = COSTOS_ENTREGA[tipoEntrega];
    const total = subtotal + costoEntrega;
    return { subtotal, costoEntrega, total };
}

function leerDatosFormulario() {
    return {
        codigo: dom.codigo.value,
        cliente: dom.cliente.value,
        producto: dom.producto.value,
        cantidad: dom.cantidad.value,
        precioUnitario: dom.precioUnitario.value,
        tipoEntrega: dom.tipoEntrega.value,
        fecha: dom.fecha.value
    };
}

/* ============================================================
   REGISTRO Y EDICIÓN DE PEDIDOS
   ============================================================ */

function manejarSubmitFormulario(evento) {
    evento.preventDefault();
    if (codigoEnEdicion === null) {
        registrarPedido();
    } else {
        actualizarPedido();
    }
}

function registrarPedido() {
    const datos = leerDatosFormulario();
    const errores = validarPedido(datos, null);

    if (errores.length > 0) {
        mostrarErrores(errores);
        return;
    }

    const cantidad = parseInt(datos.cantidad, 10);
    const precioUnitario = Number(datos.precioUnitario);
    const { subtotal, costoEntrega, total } = calcularValoresPedido(cantidad, precioUnitario, datos.tipoEntrega);

    const nuevoPedido = {
        codigo: datos.codigo.trim(),
        cliente: datos.cliente.trim(),
        producto: datos.producto.trim(),
        cantidad,
        precioUnitario,
        tipoEntrega: datos.tipoEntrega,
        costoEntrega,
        subtotal,
        total,
        estado: ESTADO_INICIAL,
        fecha: datos.fecha
    };

    pedidos.push(nuevoPedido);
    dom.form.reset();
    mostrarMensaje(`Pedido ${nuevoPedido.codigo} registrado correctamente.`, 'success');
    paginaActual = 1;
    actualizarVista();
}

function iniciarEdicion(codigo) {
    const pedido = obtenerPedidoPorCodigo(codigo);
    if (!pedido) return;

    codigoEnEdicion = pedido.codigo;

    dom.codigo.value = pedido.codigo;
    dom.codigo.disabled = true;
    dom.cliente.value = pedido.cliente;
    dom.producto.value = pedido.producto;
    dom.cantidad.value = pedido.cantidad;
    dom.precioUnitario.value = pedido.precioUnitario;
    dom.tipoEntrega.value = pedido.tipoEntrega;
    dom.fecha.value = pedido.fecha;

    dom.btnRegistrar.classList.add('hidden');
    dom.btnActualizar.classList.remove('hidden');
    dom.btnCancelar.classList.remove('hidden');

    dom.formIcon.innerHTML = '<span class="icon icon-edit" aria-hidden="true"></span>';
    dom.formTitle.textContent = `Editar Pedido: ${pedido.codigo}`;
    dom.formSubtitle.textContent = 'El código no puede modificarse. Actualiza los demás datos y guarda los cambios.';

    mostrarPagina('inicio');
    mostrarMensaje(`Editando el pedido ${pedido.codigo}.`, 'info');
}

function actualizarPedido() {
    const pedido = obtenerPedidoPorCodigo(codigoEnEdicion);
    if (!pedido) return;

    const datos = leerDatosFormulario();
    datos.codigo = pedido.codigo; // el código permanece bloqueado
    const errores = validarPedido(datos, pedido.codigo);

    if (errores.length > 0) {
        mostrarErrores(errores);
        return;
    }

    const cantidad = parseInt(datos.cantidad, 10);
    const precioUnitario = Number(datos.precioUnitario);
    const { subtotal, costoEntrega, total } = calcularValoresPedido(cantidad, precioUnitario, datos.tipoEntrega);

    pedido.cliente = datos.cliente.trim();
    pedido.producto = datos.producto.trim();
    pedido.cantidad = cantidad;
    pedido.precioUnitario = precioUnitario;
    pedido.tipoEntrega = datos.tipoEntrega;
    pedido.fecha = datos.fecha;
    pedido.subtotal = subtotal;
    pedido.costoEntrega = costoEntrega;
    pedido.total = total;

    const codigoActualizado = pedido.codigo;
    cancelarEdicion();
    mostrarMensaje(`Pedido ${codigoActualizado} actualizado correctamente.`, 'success');
    actualizarVista();
}

function cancelarEdicion() {
    codigoEnEdicion = null;
    dom.form.reset();
    dom.codigo.disabled = false;
    dom.btnRegistrar.classList.remove('hidden');
    dom.btnActualizar.classList.add('hidden');
    dom.btnCancelar.classList.add('hidden');

    dom.formIcon.innerHTML = '<span class="icon icon-plus" aria-hidden="true"></span>';
    dom.formTitle.textContent = 'Registrar Nuevo Pedido';
    dom.formSubtitle.textContent = 'Completa la información del pedido para registrarlo en el sistema.';
}

/* ============================================================
   CAMBIO DE ESTADO
   ============================================================ */

function abrirModalCambiarEstado(codigo) {
    const pedido = obtenerPedidoPorCodigo(codigo);
    if (!pedido) return;

    const siguientesEstados = TRANSICIONES_ESTADO[pedido.estado];

    dom.modalTitle.textContent = `Cambiar estado — ${pedido.codigo}`;
    dom.modalBody.innerHTML = '';
    const pEstadoActual = document.createElement('p');
    pEstadoActual.textContent = `Estado actual: ${pedido.estado}`;
    dom.modalBody.appendChild(pEstadoActual);

    dom.modalActions.innerHTML = '';

    if (siguientesEstados.length === 0) {
        const aviso = document.createElement('p');
        aviso.textContent = 'Este pedido no puede cambiar de estado.';
        dom.modalBody.appendChild(aviso);
    } else {
        siguientesEstados.forEach(estado => {
            const boton = document.createElement('button');
            boton.type = 'button';
            boton.className = 'btn btn-primary';
            boton.textContent = `Marcar como "${estado}"`;
            boton.addEventListener('click', () => {
                cambiarEstadoPedido(pedido.codigo, estado);
                cerrarModal();
            });
            dom.modalActions.appendChild(boton);
        });
    }

    const btnCerrar = document.createElement('button');
    btnCerrar.type = 'button';
    btnCerrar.className = 'btn btn-secondary';
    btnCerrar.textContent = 'Cerrar';
    btnCerrar.addEventListener('click', cerrarModal);
    dom.modalActions.appendChild(btnCerrar);

    abrirModal();
}

function cambiarEstadoPedido(codigo, nuevoEstado) {
    const pedido = obtenerPedidoPorCodigo(codigo);
    if (!pedido) return;

    const transicionesPermitidas = TRANSICIONES_ESTADO[pedido.estado];
    if (!transicionesPermitidas.includes(nuevoEstado)) {
        mostrarMensaje(`No se puede cambiar el pedido ${pedido.codigo} de "${pedido.estado}" a "${nuevoEstado}".`, 'error');
        return;
    }

    pedido.estado = nuevoEstado;
    mostrarMensaje(`El pedido ${pedido.codigo} ahora está "${nuevoEstado}".`, 'success');
    actualizarVista();
}

/* ============================================================
   ELIMINACIÓN
   ============================================================ */

function abrirModalEliminar(codigo) {
    const pedido = obtenerPedidoPorCodigo(codigo);
    if (!pedido) return;

    dom.modalTitle.textContent = 'Confirmar eliminación';
    dom.modalBody.innerHTML = '';
    [
        `Código: ${pedido.codigo}`,
        `Cliente: ${pedido.cliente}`,
        `Producto: ${pedido.producto}`,
        `Total: ${formatearMoneda(pedido.total)}`
    ].forEach(linea => {
        const p = document.createElement('p');
        p.textContent = linea;
        dom.modalBody.appendChild(p);
    });
    const advertencia = document.createElement('p');
    advertencia.innerHTML = '<strong>¿Deseas eliminar este pedido? Esta acción no se puede deshacer.</strong>';
    dom.modalBody.appendChild(advertencia);

    dom.modalActions.innerHTML = '';

    const btnConfirmar = document.createElement('button');
    btnConfirmar.type = 'button';
    btnConfirmar.className = 'btn btn-warning';
    btnConfirmar.textContent = 'Sí, eliminar';
    btnConfirmar.addEventListener('click', () => {
        eliminarPedido(pedido.codigo);
        cerrarModal();
    });

    const btnCancelar = document.createElement('button');
    btnCancelar.type = 'button';
    btnCancelar.className = 'btn btn-secondary';
    btnCancelar.textContent = 'Cancelar';
    btnCancelar.addEventListener('click', cerrarModal);

    dom.modalActions.appendChild(btnConfirmar);
    dom.modalActions.appendChild(btnCancelar);

    abrirModal();
}

function eliminarPedido(codigo) {
    const indice = pedidos.findIndex(p => p.codigo === codigo);
    if (indice === -1) return;

    pedidos.splice(indice, 1);
    if (codigoEnEdicion === codigo) {
        cancelarEdicion();
    }
    mostrarMensaje(`Pedido ${codigo} eliminado correctamente.`, 'success');
    actualizarVista();
}

/* ============================================================
   MODAL GENÉRICO (abrir / cerrar)
   ============================================================ */

function abrirModal() {
    dom.modalOverlay.classList.remove('hidden');
}

function cerrarModal() {
    dom.modalOverlay.classList.add('hidden');
    dom.modalBody.innerHTML = '';
    dom.modalActions.innerHTML = '';
}

/* ============================================================
   BÚSQUEDA, FILTROS Y ORDENAMIENTO
   (una sola fuente de estado: los propios controles del DOM)
   ============================================================ */

function obtenerPedidosFiltrados() {
    const texto = dom.busqueda.value.trim().toLowerCase();
    const estado = dom.filterEstado.value;
    const tipoEntrega = dom.filterEntrega.value;
    const totalMinimo = dom.filterTotal.value !== '' ? Number(dom.filterTotal.value) : null;

    let resultado = pedidos.filter(pedido => {
        const coincideTexto = texto === '' ||
            pedido.codigo.toLowerCase().includes(texto) ||
            pedido.cliente.toLowerCase().includes(texto) ||
            pedido.producto.toLowerCase().includes(texto);

        const coincideEstado = estado === '' || pedido.estado === estado;
        const coincideEntrega = tipoEntrega === '' || pedido.tipoEntrega === tipoEntrega;
        const coincideTotal = totalMinimo === null || pedido.total > totalMinimo;

        return coincideTexto && coincideEstado && coincideEntrega && coincideTotal;
    });

    resultado = ordenarPedidos(resultado, dom.ordenamiento.value);
    return resultado;
}

function ordenarPedidos(lista, criterio) {
    // Se ordena una copia para no alterar el arreglo original.
    const copia = lista.slice();

    switch (criterio) {
        case 'clienteAZ':
            copia.sort((a, b) => a.cliente.localeCompare(b.cliente));
            break;
        case 'totalMayor':
            copia.sort((a, b) => b.total - a.total);
            break;
        case 'totalMenor':
            copia.sort((a, b) => a.total - b.total);
            break;
        case 'fechaReciente':
            copia.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
            break;
        case 'fechaAntigua':
            copia.sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
            break;
        default:
            break;
    }

    return copia;
}

function limpiarFiltros() {
    dom.busqueda.value = '';
    dom.filterEstado.value = '';
    dom.filterEntrega.value = '';
    dom.filterTotal.value = '';
    dom.ordenamiento.value = '';
    paginaActual = 1;
    actualizarVista();
}

/* ============================================================
   CHIPS RÁPIDOS DE ESTADO (página Búsqueda)
   ============================================================ */

function inicializarChips() {
    const opciones = ['', ...ORDEN_ESTADOS];
    dom.quickChips.innerHTML = '';

    opciones.forEach(estado => {
        const chip = document.createElement('button');
        chip.type = 'button';
        chip.className = 'chip';
        chip.textContent = estado === '' ? 'Todos' : estado;
        chip.dataset.estado = estado;
        chip.addEventListener('click', () => {
            dom.filterEstado.value = estado;
            paginaActual = 1;
            actualizarVista();
        });
        dom.quickChips.appendChild(chip);
    });
}

function actualizarChipsActivos() {
    const estadoActual = dom.filterEstado.value;
    dom.quickChips.querySelectorAll('.chip').forEach(chip => {
        chip.classList.toggle('active', chip.dataset.estado === estadoActual);
    });
}

/* ============================================================
   RENDERIZADO DE TABLAS (Registros paginado + Búsqueda completa)
   ============================================================ */

function renderizarTablas() {
    const listaCompleta = obtenerPedidosFiltrados();

    renderizarResultadosBusqueda(listaCompleta);
    renderizarTablaRegistros(listaCompleta);
    actualizarChipsActivos();
}

function renderizarResultadosBusqueda(lista) {
    dom.tablaBusquedaBody.innerHTML = '';

    const hayFiltrosActivos = dom.busqueda.value.trim() !== '' || dom.filterEstado.value !== '' ||
        dom.filterEntrega.value !== '' || dom.filterTotal.value !== '';

    if (!hayFiltrosActivos) {
        dom.resultadosInfo.textContent = 'Aún no has realizado ninguna búsqueda. Escribe o elige un filtro rápido.';
    } else {
        dom.resultadosInfo.textContent = `${lista.length} pedido(s) encontrado(s).`;
    }

    if (lista.length === 0) {
        const filaVacia = crearFilaVacia(hayFiltrosActivos ? 'Ningún pedido coincide con tu búsqueda.' : 'No hay pedidos registrados.');
        dom.tablaBusquedaBody.appendChild(filaVacia);
        return;
    }

    lista.forEach((pedido, indice) => {
        dom.tablaBusquedaBody.appendChild(crearFilaPedido(pedido, indice + 1));
    });
}

function renderizarTablaRegistros(listaFiltrada) {
    dom.totalBadgeNumero.textContent = pedidos.length;
    dom.tablePedidos.innerHTML = '';

    if (listaFiltrada.length === 0) {
        const mensaje = pedidos.length === 0 ? 'No hay pedidos registrados' : 'Ningún pedido coincide con los filtros aplicados';
        dom.tablePedidos.appendChild(crearFilaVacia(mensaje));
        renderizarPaginacion(0);
        return;
    }

    const tamano = Number(dom.tamanoPagina.value);
    const totalPaginas = Math.max(1, Math.ceil(listaFiltrada.length / tamano));
    paginaActual = Math.min(paginaActual, totalPaginas);

    const inicio = (paginaActual - 1) * tamano;
    const paginaDeItems = listaFiltrada.slice(inicio, inicio + tamano);

    paginaDeItems.forEach((pedido, indice) => {
        dom.tablePedidos.appendChild(crearFilaPedido(pedido, inicio + indice + 1));
    });

    renderizarPaginacion(listaFiltrada.length);
}

function crearFilaVacia(texto) {
    const fila = document.createElement('tr');
    const celda = document.createElement('td');
    celda.colSpan = 11;
    celda.className = 'text-center';
    celda.textContent = texto;
    fila.appendChild(celda);
    return fila;
}

function crearFilaPedido(pedido, numero) {
    const fila = document.createElement('tr');

    const valores = [
        numero,
        pedido.codigo,
        pedido.cliente,
        pedido.producto,
        pedido.cantidad,
        formatearMoneda(pedido.precioUnitario),
        pedido.tipoEntrega
    ];

    valores.forEach(valor => {
        const celda = document.createElement('td');
        celda.textContent = valor;
        fila.appendChild(celda);
    });

    const celdaEstado = document.createElement('td');
    const badge = document.createElement('span');
    badge.className = claseBadgeEstado(pedido.estado);
    badge.textContent = pedido.estado;
    celdaEstado.appendChild(badge);
    fila.appendChild(celdaEstado);

    const celdaFecha = document.createElement('td');
    celdaFecha.textContent = formatearFecha(pedido.fecha);
    fila.appendChild(celdaFecha);

    const celdaTotal = document.createElement('td');
    celdaTotal.textContent = formatearMoneda(pedido.total);
    fila.appendChild(celdaTotal);

    fila.appendChild(crearCeldaAcciones(pedido));

    return fila;
}

function crearCeldaAcciones(pedido) {
    const celda = document.createElement('td');
    const contenedor = document.createElement('div');
    contenedor.className = 'row-actions';

    const btnEditar = document.createElement('button');
    btnEditar.type = 'button';
    btnEditar.className = 'btn-icon btn-edit';
    btnEditar.title = 'Editar pedido';
    btnEditar.innerHTML = '<span class="icon icon-edit" aria-hidden="true"></span>';
    btnEditar.addEventListener('click', () => iniciarEdicion(pedido.codigo));

    const btnEstado = document.createElement('button');
    btnEstado.type = 'button';
    btnEstado.className = 'btn-icon btn-status';
    btnEstado.title = 'Cambiar estado';
    btnEstado.innerHTML = '<span class="icon icon-exchange-alt" aria-hidden="true"></span>';
    btnEstado.addEventListener('click', () => abrirModalCambiarEstado(pedido.codigo));

    const btnEliminar = document.createElement('button');
    btnEliminar.type = 'button';
    btnEliminar.className = 'btn-icon btn-delete';
    btnEliminar.title = 'Eliminar pedido';
    btnEliminar.innerHTML = '<span class="icon icon-trash" aria-hidden="true"></span>';
    btnEliminar.addEventListener('click', () => abrirModalEliminar(pedido.codigo));

    contenedor.appendChild(btnEditar);
    contenedor.appendChild(btnEstado);
    contenedor.appendChild(btnEliminar);
    celda.appendChild(contenedor);

    return celda;
}

/* ============================================================
   PAGINACIÓN (página Registros)
   ============================================================ */

function renderizarPaginacion(totalItems) {
    const tamano = Number(dom.tamanoPagina.value);
    const totalPaginas = Math.max(1, Math.ceil(totalItems / tamano));

    if (totalItems === 0) {
        dom.paginacionInfo.textContent = 'Mostrando 0 de 0 pedidos';
        dom.paginacionControles.innerHTML = '';
        return;
    }

    const inicio = (paginaActual - 1) * tamano + 1;
    const fin = Math.min(paginaActual * tamano, totalItems);
    dom.paginacionInfo.textContent = `Mostrando ${inicio} a ${fin} de ${totalItems} pedidos`;

    dom.paginacionControles.innerHTML = '';

    dom.paginacionControles.appendChild(crearBotonPagina('<span class="icon icon-chevron-left" aria-hidden="true"></span>', paginaActual - 1, paginaActual === 1));

    obtenerNumerosDePagina(paginaActual, totalPaginas).forEach(item => {
        if (item === '...') {
            const puntos = document.createElement('span');
            puntos.className = 'page-ellipsis';
            puntos.textContent = '…';
            dom.paginacionControles.appendChild(puntos);
        } else {
            const boton = crearBotonPagina(String(item), item, false, item === paginaActual);
            dom.paginacionControles.appendChild(boton);
        }
    });

    dom.paginacionControles.appendChild(crearBotonPagina('<span class="icon icon-chevron-right" aria-hidden="true"></span>', paginaActual + 1, paginaActual === totalPaginas));
}

function crearBotonPagina(contenidoHtml, numeroPagina, deshabilitado, activo) {
    const boton = document.createElement('button');
    boton.type = 'button';
    boton.className = 'page-btn' + (activo ? ' active' : '');
    boton.innerHTML = contenidoHtml;
    boton.disabled = deshabilitado;
    boton.addEventListener('click', () => {
        paginaActual = numeroPagina;
        renderizarTablas();
    });
    return boton;
}

function obtenerNumerosDePagina(actual, total) {
    if (total <= 7) {
        const numeros = [];
        for (let i = 1; i <= total; i++) numeros.push(i);
        return numeros;
    }

    const numeros = new Set([1, 2, total - 1, total, actual - 1, actual, actual + 1]);
    const ordenados = [...numeros].filter(n => n >= 1 && n <= total).sort((a, b) => a - b);

    const resultado = [];
    let anterior = null;
    ordenados.forEach(n => {
        if (anterior !== null && n - anterior > 1) {
            resultado.push('...');
        }
        resultado.push(n);
        anterior = n;
    });
    return resultado;
}

/* ============================================================
   ESTADÍSTICAS (página Reportes)
   ============================================================ */

function calcularEstadisticas() {
    const stats = {
        total: pedidos.length,
        porEstado: { 'Pendiente': 0, 'En preparación': 0, 'Enviado': 0, 'Entregado': 0, 'Cancelado': 0 },
        porEntrega: { 'Retiro en tienda': 0, 'Entrega estándar': 0, 'Entrega rápida': 0 },
        totalVendido: 0,
        totalEntregas: 0,
        mayorValor: null,
        menorValor: null
    };

    for (let i = 0; i < pedidos.length; i++) {
        const pedido = pedidos[i];

        stats.porEstado[pedido.estado]++;
        stats.porEntrega[pedido.tipoEntrega]++;

        stats.totalVendido += pedido.subtotal;
        stats.totalEntregas += pedido.costoEntrega;

        if (stats.mayorValor === null || pedido.total > stats.mayorValor.total) {
            stats.mayorValor = pedido;
        }
        if (stats.menorValor === null || pedido.total < stats.menorValor.total) {
            stats.menorValor = pedido;
        }
    }

    stats.promedio = stats.total > 0 ? (stats.totalVendido + stats.totalEntregas) / stats.total : 0;

    return stats;
}

function porcentaje(cantidad, total) {
    if (total === 0) return '0%';
    return ((cantidad / total) * 100).toFixed(1) + '%';
}

function obtenerTop3PorTotal() {
    // Copia ordenada de mayor a menor total, sin mutar el arreglo original.
    const copia = pedidos.slice().sort((a, b) => b.total - a.total);
    return copia.slice(0, 3);
}

function actualizarPanelEstadisticas() {
    const stats = calcularEstadisticas();

    dom.statTotalPedidos.textContent = stats.total;
    dom.statPendientes.textContent = stats.porEstado['Pendiente'];
    dom.statPreparacion.textContent = stats.porEstado['En preparación'];
    dom.statEnviados.textContent = stats.porEstado['Enviado'];
    dom.statEntregados.textContent = stats.porEstado['Entregado'];
    dom.statCancelados.textContent = stats.porEstado['Cancelado'];

    dom.pctPendientes.textContent = porcentaje(stats.porEstado['Pendiente'], stats.total);
    dom.pctPreparacion.textContent = porcentaje(stats.porEstado['En preparación'], stats.total);
    dom.pctEnviados.textContent = porcentaje(stats.porEstado['Enviado'], stats.total);
    dom.pctEntregados.textContent = porcentaje(stats.porEstado['Entregado'], stats.total);
    dom.pctCancelados.textContent = porcentaje(stats.porEstado['Cancelado'], stats.total);

    dom.statTotalVendido.textContent = formatearMoneda(stats.totalVendido);
    dom.statIngresoEntregas.textContent = formatearMoneda(stats.totalEntregas);
    dom.statPromedio.textContent = formatearMoneda(stats.promedio);
    dom.statMayorValor.textContent = stats.mayorValor
        ? `${formatearMoneda(stats.mayorValor.total)} (${stats.mayorValor.codigo})`
        : formatearMoneda(0);
    dom.statMenorValor.textContent = stats.menorValor
        ? `${formatearMoneda(stats.menorValor.total)} (${stats.menorValor.codigo})`
        : formatearMoneda(0);

    renderizarListaReporte(dom.listaPorEstado, stats.porEstado, stats.total, {
        'Pendiente': 'var(--amber)',
        'En preparación': 'var(--blue-light)',
        'Enviado': 'var(--indigo)',
        'Entregado': 'var(--green)',
        'Cancelado': 'var(--red)'
    });

    renderizarListaReporte(dom.listaPorEntrega, stats.porEntrega, stats.total, {
        'Retiro en tienda': 'var(--text-muted)',
        'Entrega estándar': 'var(--blue-light)',
        'Entrega rápida': 'var(--indigo)'
    });

    renderizarTop3();
}

function renderizarListaReporte(contenedor, datosPorClave, total, colores) {
    contenedor.innerHTML = '';

    if (total === 0) {
        const vacio = document.createElement('p');
        vacio.className = 'empty-list';
        vacio.textContent = 'Sin pedidos registrados';
        contenedor.appendChild(vacio);
        return;
    }

    Object.keys(datosPorClave).forEach(clave => {
        const cantidad = datosPorClave[clave];
        const fila = document.createElement('div');
        fila.className = 'report-list-row';

        const punto = document.createElement('span');
        punto.className = 'report-dot';
        punto.style.background = colores[clave] || 'var(--text-muted)';

        const etiqueta = document.createElement('span');
        etiqueta.className = 'report-list-label';
        etiqueta.textContent = clave;

        const conteo = document.createElement('span');
        conteo.className = 'report-list-count';
        conteo.textContent = cantidad;

        const pct = document.createElement('span');
        pct.className = 'report-list-pct';
        pct.textContent = porcentaje(cantidad, total);

        fila.appendChild(punto);
        fila.appendChild(etiqueta);
        fila.appendChild(conteo);
        fila.appendChild(pct);
        contenedor.appendChild(fila);
    });
}

function renderizarTop3() {
    const top3 = obtenerTop3PorTotal();
    dom.statTop3.innerHTML = '';

    if (top3.length === 0) {
        const vacio = document.createElement('p');
        vacio.className = 'empty-list';
        vacio.textContent = 'Sin pedidos';
        dom.statTop3.appendChild(vacio);
        return;
    }

    top3.forEach((pedido, indice) => {
        const linea = document.createElement('p');
        linea.textContent = `${indice + 1}. ${pedido.codigo} — ${pedido.cliente} — ${formatearMoneda(pedido.total)}`;
        dom.statTop3.appendChild(linea);
    });
}

/* ============================================================
   ACTUALIZACIÓN GENERAL DE LA VISTA
   ============================================================ */

function actualizarVista() {
    guardarPedidosEnLocalStorage();
    renderizarTablas();
    actualizarPanelEstadisticas();
}

/* ============================================================
   PERSISTENCIA EN LOCALSTORAGE
   (funcionalidad adicional: los pedidos sobreviven a recargar la página)
   ============================================================ */

const CLAVE_LOCAL_STORAGE = 'gestionPedidos.pedidos';

function guardarPedidosEnLocalStorage() {
    try {
        localStorage.setItem(CLAVE_LOCAL_STORAGE, JSON.stringify(pedidos));
    } catch (error) {
        console.warn('No se pudo guardar en localStorage:', error);
    }
}

function cargarPedidosDesdeLocalStorage() {
    try {
        const datosGuardados = localStorage.getItem(CLAVE_LOCAL_STORAGE);
        if (!datosGuardados) return;

        const pedidosGuardados = JSON.parse(datosGuardados);
        if (Array.isArray(pedidosGuardados)) {
            pedidosGuardados.forEach(pedido => pedidos.push(pedido));
        }
    } catch (error) {
        console.warn('No se pudo leer localStorage:', error);
    }
}

/* ============================================================
   INICIALIZACIÓN Y EVENTOS
   ============================================================ */

function inicializarEventos() {
    dom.form.addEventListener('submit', manejarSubmitFormulario);
    dom.btnActualizar.addEventListener('click', actualizarPedido);
    dom.btnCancelar.addEventListener('click', cancelarEdicion);

    dom.busqueda.addEventListener('input', () => { paginaActual = 1; renderizarTablas(); });
    dom.btnBuscar.addEventListener('click', () => { paginaActual = 1; renderizarTablas(); });

    dom.filterEstado.addEventListener('change', () => { paginaActual = 1; renderizarTablas(); });
    dom.filterEntrega.addEventListener('change', () => { paginaActual = 1; renderizarTablas(); });
    dom.filterTotal.addEventListener('input', () => { paginaActual = 1; renderizarTablas(); });
    dom.ordenamiento.addEventListener('change', () => renderizarTablas());
    dom.tamanoPagina.addEventListener('change', () => { paginaActual = 1; renderizarTablas(); });
    dom.btnLimpiarFiltros.addEventListener('click', limpiarFiltros);

    dom.modalOverlay.addEventListener('click', (evento) => {
        if (evento.target === dom.modalOverlay) {
            cerrarModal();
        }
    });
}

function inicializarAplicacion() {
    cargarPedidosDesdeLocalStorage();
    inicializarNavegacion();
    inicializarChips();
    inicializarEventos();
    actualizarVista();
}

document.addEventListener('DOMContentLoaded', inicializarAplicacion);
