
const CLAVE_CARRITO = "carritoConferencias2026";

// Recuperar el carrito guardado
let carrito = cargarCarrito();

// Elementos HTML
const listaCarrito = document.getElementById("lista-carrito");
const cantidadTickets = document.getElementById("cantidad-tickets");
const totalCarrito = document.getElementById("total-carrito");
const totalPago = document.getElementById("total-pago");

const botonVaciar = document.getElementById("vaciar-carrito");
const botonPagar = document.getElementById("btn-pagar");
const botonConfirmar = document.getElementById("confirmar-pago");

const mensajePago = document.getElementById("mensaje-pago");
const buscador = document.getElementById("buscador");
const mensajeSinResultados =
    document.getElementById("mensaje-sin-resultados");

const contenidoComprobante =
    document.getElementById("contenido-comprobante");

// Modales de Bootstrap
const modalPago = new bootstrap.Modal(
    document.getElementById("modalPago")
);

const modalComprobante = new bootstrap.Modal(
    document.getElementById("modalComprobante")
);

// CARGAR CARRITO

function cargarCarrito() {
    try {
        const guardado = localStorage.getItem(CLAVE_CARRITO);

        if (!guardado) {
            return [];
        }

        const datos = JSON.parse(guardado);

        // Validar que los datos guardados sean utilizables
        if (!Array.isArray(datos)) {
            return [];
        }

        return datos.filter(item =>
            item &&
            typeof item.nombre === "string" &&
            Number.isFinite(item.precio) &&
            item.precio >= 0 &&
            Number.isInteger(item.cantidad) &&
            item.cantidad > 0
        );

    } catch (error) {
        console.error("No se pudo recuperar el carrito:", error);
        return [];
    }
}

// GUARDAR CARRITO

function guardarCarrito() {
    try {
        localStorage.setItem(
            CLAVE_CARRITO,
            JSON.stringify(carrito)
        );
    } catch (error) {
        console.error("No se pudo guardar el carrito:", error);
    }
}

// CALCULAR TOTAL
function calcularTotal() {
    return carrito.reduce((total, conferencia) => {
        return total +
            conferencia.precio * conferencia.cantidad;
    }, 0);
}

// FORMATEAR PRECIOS
function formatoPrecio(precio) {
    return precio.toLocaleString("es-MX", {
        style: "currency",
        currency: "MXN"
    });
}

// CREAR BOTONES DEL CARRITO
function crearBoton(texto, clases, accion, etiqueta) {
    const boton = document.createElement("button");

    boton.type = "button";
    boton.className = clases;
    boton.textContent = texto;
    boton.setAttribute("aria-label", etiqueta);

    boton.addEventListener("click", accion);

    return boton;
}

// AUMENTAR O DISMINUIR CANTIDAD

function cambiarCantidad(nombre, cambio) {
    const conferencia = carrito.find(
        item => item.nombre === nombre
    );

    if (!conferencia) {
        return;
    }

    conferencia.cantidad += cambio;

    // Eliminar la conferencia si llega a cero
    if (conferencia.cantidad <= 0) {
        carrito = carrito.filter(
            item => item.nombre !== nombre
        );
    }

    mostrarCarrito();
}

// ELIMINAR UNA CONFERENCIA
function eliminarConferencia(nombre) {
    carrito = carrito.filter(
        item => item.nombre !== nombre
    );

    mostrarCarrito();
}

// MOSTRAR EL CARRITO
function mostrarCarrito() {
    listaCarrito.innerHTML = "";

    if (carrito.length === 0) {
        const mensaje = document.createElement("p");

        mensaje.className = "text-muted";
        mensaje.textContent =
            "No hay conferencias agregadas.";

        listaCarrito.appendChild(mensaje);
    }

    carrito.forEach(conferencia => {
        const producto = document.createElement("div");

        producto.className = "producto-carrito";

        // Nombre
        const nombre = document.createElement("p");

        nombre.className = "fw-bold mb-1";
        nombre.textContent = conferencia.nombre;

        // Precio individual
        const precio = document.createElement("p");

        precio.className = "small mb-1";
        precio.textContent =
            `${formatoPrecio(conferencia.precio)} por ticket`;

        // Controles de cantidad
        const controles = document.createElement("div");

        controles.className = "controles-cantidad";

        // Botón para disminuir
        controles.appendChild(
            crearBoton(
                "−",
                "btn btn-outline-secondary btn-sm",
                () => cambiarCantidad(conferencia.nombre, -1),
                `Disminuir cantidad de ${conferencia.nombre}`
            )
        );

        // Cantidad actual
        const cantidad = document.createElement("span");

        cantidad.textContent = conferencia.cantidad;
        cantidad.setAttribute(
            "aria-label",
            "Cantidad de tickets"
        );

        controles.appendChild(cantidad);

        // Botón para aumentar
        controles.appendChild(
            crearBoton(
                "+",
                "btn btn-outline-secondary btn-sm",
                () => cambiarCantidad(conferencia.nombre, 1),
                `Aumentar cantidad de ${conferencia.nombre}`
            )
        );

        // Subtotal
        const subtotal = document.createElement("p");

        subtotal.className = "mb-2";

        subtotal.textContent =
            `Subtotal: ${formatoPrecio(
                conferencia.precio * conferencia.cantidad
            )}`;

        // Botón eliminar
        const eliminar = crearBoton(
            "Eliminar conferencia",
            "btn btn-outline-danger btn-sm",
            () => eliminarConferencia(conferencia.nombre),
            `Eliminar ${conferencia.nombre} del carrito`
        );

        producto.append(
            nombre,
            precio,
            controles,
            subtotal,
            eliminar
        );

        listaCarrito.appendChild(producto);
    });

    // Total de boletos
    const cantidadTotal = carrito.reduce(
        (total, conferencia) => total + conferencia.cantidad,
        0
    );

    cantidadTickets.textContent = cantidadTotal;

    // Actualizar importes
    totalCarrito.textContent = formatoPrecio(calcularTotal());
    totalPago.textContent = formatoPrecio(calcularTotal());

    // Deshabilitar botones si el carrito está vacío
    botonPagar.disabled = carrito.length === 0;
    botonVaciar.disabled = carrito.length === 0;

    // Guardar los cambios
    guardarCarrito();
}

// AGREGAR CONFERENCIAS
document.querySelectorAll(".btn-agregar").forEach(boton => {

    boton.addEventListener("click", () => {

        const nombre = boton.dataset.nombre;
        const precio = Number(boton.dataset.precio);

        // Buscar si ya existe
        const existente = carrito.find(
            conferencia => conferencia.nombre === nombre
        );

        if (existente) {
            // Aumentar cantidad
            existente.cantidad++;
        } else {
            // Agregar nueva conferencia
            carrito.push({
                nombre: nombre,
                precio: precio,
                cantidad: 1
            });
        }

        mostrarCarrito();

        // Mostrar confirmación visual
        const textoOriginal = boton.textContent;

        boton.textContent = "¡Agregado!";

        boton.classList.replace(
            "btn-primary",
            "btn-success"
        );

        setTimeout(() => {
            boton.textContent = textoOriginal;

            boton.classList.replace(
                "btn-success",
                "btn-primary"
            );
        }, 900);
    });

});

// VACIAR CARRITO
botonVaciar.addEventListener("click", () => {

    carrito = [];

    mostrarCarrito();
});

// BUSCADOR DE CONFERENCIAS
buscador.addEventListener("input", () => {

    const consulta = buscador.value
        .trim()
        .toLocaleLowerCase("es-MX");

    const tarjetas = document.querySelectorAll(
        ".tarjeta-conferencia"
    );

    let visibles = 0;

    tarjetas.forEach(tarjeta => {

        const texto = (
            tarjeta.dataset.busqueda + " " +
            tarjeta.textContent
        ).toLocaleLowerCase("es-MX");

        const coincide = texto.includes(consulta);

        tarjeta.classList.toggle(
            "d-none",
            !coincide
        );

        if (coincide) {
            visibles++;
        }
    });

    // Mostrar mensaje si no hay resultados
    mensajeSinResultados.classList.toggle(
        "d-none",
        visibles !== 0
    );
});

// ABRIR VENTANA DE PAGO

botonPagar.addEventListener("click", () => {

    // Evitar pagar con el carrito vacío
    if (carrito.length === 0) {
        return;
    }

    mensajePago.textContent = "";

    // Quitar selección anterior de tarjeta
    document.querySelectorAll(
        'input[name="tarjeta"]'
    ).forEach(radio => {
        radio.checked = false;
    });

    // Actualizar total
    totalPago.textContent = formatoPrecio(calcularTotal());

    modalPago.show();
});

// CONFIRMAR COMPRA

botonConfirmar.addEventListener("click", () => {

    const tarjeta = document.querySelector(
        'input[name="tarjeta"]:checked'
    );

    // Validar carrito
    if (carrito.length === 0) {
        mensajePago.textContent =
            "Tu carrito está vacío.";

        return;
    }

    // Validar selección de tarjeta
    if (!tarjeta) {
        mensajePago.textContent =
            "Selecciona una tarjeta para continuar.";

        return;
    }

    // Copiar los productos antes de vaciar el carrito
    const compra = carrito.map(item => ({
        ...item
    }));

    const total = calcularTotal();

    // Crear folio de compra
    const folio =
        `CONF-${Date.now().toString().slice(-8)}`;

    // Limpiar comprobante anterior
    contenidoComprobante.innerHTML = "";

    // Mensaje de confirmación
    const aviso = document.createElement("p");

    aviso.className = "alert alert-success";

    aviso.textContent =
        "La compra se registró correctamente.";

    // Folio
    const folioTexto = document.createElement("p");

    const folioNegrita = document.createElement("strong");

    folioNegrita.textContent = "Folio: ";

    folioTexto.append(
        folioNegrita,
        document.createTextNode(folio)
    );

    // Método de pago
    const tarjetaTexto = document.createElement("p");

    tarjetaTexto.textContent =
        `Método seleccionado: ${tarjeta.value}`;

    // Título del detalle
    const titulo = document.createElement("h3");

    titulo.className = "h6 mt-3";
    titulo.textContent = "Detalle de los tickets";

    // Lista de productos
    const lista = document.createElement("ul");

    lista.className = "list-group mb-3";

    compra.forEach(item => {

        const linea = document.createElement("li");

        linea.className =
            "list-group-item d-flex justify-content-between gap-3";

        const descripcion = document.createElement("span");

        descripcion.textContent =
            `${item.nombre} × ${item.cantidad}`;

        const subtotal = document.createElement("strong");

        subtotal.textContent = formatoPrecio(
            item.precio * item.cantidad
        );

        linea.append(descripcion, subtotal);

        lista.appendChild(linea);
    });

    // Total de la compra
    const totalTexto = document.createElement("h4");

    totalTexto.className = "h5 text-end";

    totalTexto.textContent =
        `Total: ${formatoPrecio(total)}`;

    // Insertar información en el comprobante
    contenidoComprobante.append(
        aviso,
        folioTexto,
        tarjetaTexto,
        titulo,
        lista,
        totalTexto
    );

    // Cerrar pago
    modalPago.hide();

    // Vaciar carrito
    carrito = [];

    mostrarCarrito();

    // Mostrar comprobante
    modalComprobante.show();
});

// IMPRIMIR COMPROBANTE
document.getElementById(
    "imprimir-comprobante"
).addEventListener("click", () => {

    window.print();
});

// Mostrar el carrito recuperado al cargar
mostrarCarrito();
