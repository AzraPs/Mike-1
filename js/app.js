
let carrito = [];

const listaCarrito = document.getElementById("lista-carrito");
const cantidadTickets = document.getElementById("cantidad-tickets");
const totalCarrito = document.getElementById("total-carrito");
const totalPago = document.getElementById("total-pago");
const botonVaciar = document.getElementById("vaciar-carrito");
const botonPagar = document.getElementById("btn-pagar");
const botonConfirmar = document.getElementById("confirmar-pago");
const mensajePago = document.getElementById("mensaje-pago");

const modalPago = new bootstrap.Modal(
    document.getElementById("modalPago")
);

function calcularTotal() {
    return carrito.reduce((total, conferencia) => {
        return total + conferencia.precio * conferencia.cantidad;
    }, 0);
}

function formatoPrecio(precio) {
    return precio.toLocaleString("es-MX", {
        style: "currency",
        currency: "MXN"
    });
}

function mostrarCarrito() {
    listaCarrito.innerHTML = "";

    if (carrito.length === 0) {
        listaCarrito.innerHTML =
            '<p class="text-muted">No hay conferencias agregadas.</p>';
    }

    carrito.forEach((conferencia) => {
        const producto = document.createElement("div");
        producto.className = "producto-carrito";

        const nombre = document.createElement("p");
        nombre.className = "mb-1";
        nombre.textContent = conferencia.nombre;

        const precio = document.createElement("p");
        precio.className = "mb-2";
        precio.textContent =
            `${conferencia.cantidad} ticket(s) × ${formatoPrecio(conferencia.precio)}`;

        const eliminar = document.createElement("button");
        eliminar.type = "button";
        eliminar.className = "btn btn-outline-danger btn-sm";
        eliminar.textContent = "Eliminar";

        eliminar.addEventListener("click", () => {
            carrito = carrito.filter(
                item => item.nombre !== conferencia.nombre
            );

            mostrarCarrito();
        });

        producto.appendChild(nombre);
        producto.appendChild(precio);
        producto.appendChild(eliminar);

        listaCarrito.appendChild(producto);
    });

    const cantidad = carrito.reduce(
        (total, conferencia) => total + conferencia.cantidad, 0
    );

    cantidadTickets.textContent = cantidad;
    totalCarrito.textContent = formatoPrecio(calcularTotal());
    totalPago.textContent = formatoPrecio(calcularTotal());

    botonPagar.disabled = carrito.length === 0;
}

document.querySelectorAll(".btn-agregar").forEach((boton) => {
    boton.addEventListener("click", () => {
        const nombre = boton.dataset.nombre;
        const precio = Number(boton.dataset.precio);

        const existente = carrito.find(
            conferencia => conferencia.nombre === nombre
        );

        if (existente) {
            existente.cantidad++;
        } else {
            carrito.push({
                nombre: nombre,
                precio: precio,
                cantidad: 1
            });
        }

        mostrarCarrito();
    });
});

botonVaciar.addEventListener("click", () => {
    carrito = [];
    mostrarCarrito();
});

botonPagar.addEventListener("click", () => {
    if (carrito.length === 0) {
        return;
    }

    mensajePago.textContent = "";

    document.querySelectorAll('input[name="tarjeta"]').forEach((radio) => {
        radio.checked = false;
    });

    totalPago.textContent = formatoPrecio(calcularTotal());
    modalPago.show();
});

botonConfirmar.addEventListener("click", () => {
    const tarjeta = document.querySelector(
        'input[name="tarjeta"]:checked'
    );

    if (!tarjeta) {
        mensajePago.textContent = "Selecciona una tarjeta para continuar.";
        return;
    }

    if (carrito.length === 0) {
        mensajePago.textContent = "Tu carrito está vacío.";
        return;
    }

    const total = calcularTotal();

    alert(
        `¡Compra realizada con éxito!\n\n` +
        `Tarjeta seleccionada: ${tarjeta.value}\n` +
        `Total pagado: ${formatoPrecio(total)}\n\n` +
        `Gracias por comprar tus tickets.`
    );

    carrito = [];
    mostrarCarrito();
    modalPago.hide();
});
