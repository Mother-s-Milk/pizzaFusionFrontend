const carritoController = {
    pedido: {
        nombre: '',
        tipoPedido: '',
        barrio: '',
        direccion: '' ,
        metodoPago: '' ,
        precioDelivery: 0,
        detallesPedido: '',
        total: 0
    },
    barrios: [],
    consultarBarrios: () => {
        carritoService.consultarBarrios()
            .then(response => {
                carritoController.barrios = response;
                carritoController.cargarBarrios(carritoController.barrios);
            })
            .catch(error => {
                console.log("Error al querer cargar los barrios")
            });
    },
    cargarBarrios: (barrios) => {
        const pedidoBarrio = document.getElementById("pedido-barrio");
        pedidoBarrio.innerHTML = '<option value="" disabled selected hidden>Seleccione un barrio...</option>';
    
        if (barrios.length === 0) {
            const option = document.createElement("option");
            option.value = "";
            option.textContent = "No hay barrios disponibles";
            pedidoBarrio.appendChild(option);
        } else {
            barrios.forEach(barrio => {
                const option = document.createElement("option");
                option.value = barrio.barrio;
                option.textContent = barrio.barrio;
                pedidoBarrio.appendChild(option);
            });
        }
    },
    save: (producto) => {
        let productos = carritoService.list();
    
        const Toast = Swal.mixin({
            toast: true,
            position: "top",
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: false,
            customClass: {
                popup: 'custom-toast'
            },
            didOpen: (toast) => {
                toast.onmouseenter = Swal.stopTimer;
                toast.onmouseleave = Swal.resumeTimer;
            }
        });

        if (producto.categoria === "Plato principal") {
            let idUnico = producto.idUnico;
            let existe = productos.find(p => p.idUnico === idUnico);

            if (existe) {
                carritoController.agregarUno(idUnico, 'idUnico');
                
            }
            else {
                let nuevo = {
                    id: producto.id,
                    idUnico: idUnico, // Guardar el identificador único
                    nombre: producto.nombre,
                    categoria: producto.categoria,
                    precioUnitario: Number(producto.precioUnitario),
                    urlImagen: producto.urlImagen,
                    cantidad: 1
                };
                // Solo agregar extras si existe y tiene contenido
                if (producto.extras && producto.extras.length > 0) {
                    nuevo.extras = [...producto.extras]; // Agregar la propiedad extras solo si hay
                }
                carritoService.save(nuevo);
                carritoController.actualizarContador();
            }
    
        }
        else {
            let id = producto.id;
            let existe = productos.find(p => p.id === id);

            if (existe) {
                carritoController.agregarUno(id);
            }
            else {
                let nuevo = {
                    id: producto.id,
                    nombre: producto.nombre,
                    categoria: producto.categoria,
                    precioUnitario: Number(producto.precioUnitario),
                    urlImagen: producto.urlImagen,
                    cantidad: 1
                };

                carritoService.save(nuevo);
                carritoController.actualizarContador();
            }
        }
    
        Toast.fire({
            icon: 'success',
            title: `Se ha agregado ${producto.nombre}`
        });
    
        carritoController.list();
    },
    agregarUno: (id, tipoId) => {
        carritoService.agregarUno(id, tipoId);
        carritoController.list();
    },
    restarUno: (id, tipoId) => {
        carritoService.restarUno(id, tipoId);
        carritoController.list();
        
    },
    list: () => {
    carritoController.pedido = carritoController.pedido || {
        tipoPedido: '',
        barrio: '',
        direccion: '',
        precioDelivery: 0
    };

    let productosCarrito = carritoService.list();
    let carritoFooter = document.getElementById('carrito-footer');

    // Mostrar u ocultar el pie del carrito
    carritoFooter.classList.toggle('hidden', productosCarrito.length === 0);

    // Crear un objeto para organizar productos por categorías
    let categorias = {
        "Plato principal": [],
        "Acompañante": [],
        "Bebida": [],
        "Promoción": []
    };

    productosCarrito.forEach(producto => {
        if (categorias[producto.categoria]) {
            categorias[producto.categoria].push(producto);
        }
    });

    let subtotalProductos = 0;

    const generarHTMLCategoria = (categoria, productos, contenedor) => {
        contenedor.innerHTML = '';
        if (productos.length > 0) {
            productos.forEach(producto => {
                let totalExtras = 0;

                if (producto.extras && producto.extras.length > 0) {
                    producto.extras.forEach(extra => {
                        totalExtras += extra.precioUnitario * extra.cantidad;
                    });
                }

                let precioTotalProducto = (producto.precioUnitario * producto.cantidad) + (totalExtras * producto.cantidad);

                let id = producto.idUnico || producto.id;
                let tipoId = producto.idUnico ? "idUnico" : "id";

                let tarjeta = `
                    <div class="tarjeta-carrito">
                        <img src="${producto.urlImagen}" alt="${producto.nombre}">
                        <div>
                            <div class="info-producto">
                                <div class="info-producto-nombre">
                                    <p>${producto.nombre}</p>
                                    ${totalExtras > 0 ? `<span>(Extras)</span>` : ""}
                                </div>
                                <p>Subtotal: $${precioTotalProducto.toFixed(2)}</p>
                            </div>
                            <div class="botones-producto-carrito">
                                <button type="button" class="plus-minus agregar-borrar" onclick="carritoController.restarUno('${id}', '${tipoId}')"><i class="fa-solid fa-minus"></i></button>
                                <div class="cart-cantidad">${producto.cantidad}</div>
                                <button type="button" class="plus-minus" onclick="carritoController.agregarUno('${id}', '${tipoId}')"><i class="fa-solid fa-plus"></i></button>
                            </div>
                        </div>
                        <button type="button" class="btn-trash" onclick="carritoController.delete('${id}', '${tipoId}')"><i class="fa-solid fa-trash-can"></i></button>
                    </div>
                `;

                contenedor.insertAdjacentHTML('beforeend', tarjeta);
                subtotalProductos += precioTotalProducto;
            });
        } else {
            contenedor.innerHTML = `<h2 class="mensaje-categoria-carro">No hay ${categoria.toLowerCase()} cargados</h2>`;
        }
    };

    generarHTMLCategoria("Platos principales", categorias["Plato principal"], document.getElementById('platos-principales-carrito'));
    generarHTMLCategoria("Acompañantes", categorias["Acompañante"], document.getElementById('acompañantes-carrito'));
    generarHTMLCategoria("Bebidas", categorias["Bebida"], document.getElementById('bebidas-carrito'));
    generarHTMLCategoria("Promociones", categorias["Promoción"], document.getElementById('promociones-carrito'));

    let totalProductos = document.getElementById('total-productos');
    if (totalProductos) totalProductos.textContent = `$${subtotalProductos.toFixed(2)}`;

    let delivery = carritoController.pedido.precioDelivery || 0;
    let totalFinal = subtotalProductos + delivery;

    let totalDelivery = document.getElementById('total-delivery');
    if (totalDelivery) totalDelivery.textContent = `$${delivery.toFixed(2)}`;

    let totalCarrito = document.getElementById('total-carrito');
    if (totalCarrito) totalCarrito.textContent = `$${totalFinal.toFixed(2)}`;

    document.getElementById("pedido-tipo").addEventListener("change", function() {
        let tipoPedido = this.value;
        carritoController.pedido.tipoPedido = tipoPedido;

        let seccionDireccionPedido = document.getElementById('seccion-direccion-pedido');

        if (tipoPedido === "Delivery") {
            seccionDireccionPedido.style.display = "block";
        } else {
            seccionDireccionPedido.style.display = "none";
            document.getElementById('pedido-barrio').value = "";
            document.getElementById('pedido-direccion').value = "";
            carritoController.pedido.barrio = '';
            carritoController.pedido.precioDelivery = 0;
            carritoController.pedido.direccion = '';

            document.getElementById('error-pedido-barrio').textContent = "";
            document.getElementById('error-pedido-direccion').textContent = "";
        }

        delivery = carritoController.pedido.precioDelivery || 0;
        totalFinal = subtotalProductos + delivery;

        if (totalDelivery) totalDelivery.textContent = `$${delivery.toFixed(2)}`;
        if (totalCarrito) totalCarrito.textContent = `$${totalFinal.toFixed(2)}`;

        console.log(carritoController.pedido.tipoPedido);
    });

    document.getElementById("pedido-barrio").addEventListener("change", function() {
        let barrioSeleccionado = this.value;

        let precioDelivery = carritoController.obtenerPrecioDelivery(barrioSeleccionado);
        carritoController.pedido.barrio = barrioSeleccionado;
        carritoController.pedido.precioDelivery = precioDelivery;

        if (totalDelivery) totalDelivery.textContent = `$${precioDelivery.toFixed(2)}`;

        totalFinal = subtotalProductos + precioDelivery;

        if (totalCarrito) totalCarrito.textContent = `$${totalFinal.toFixed(2)}`;
        console.log(carritoController.pedido.precioDelivery);
    });
},
    // Función que obtiene el precio de delivery basado en el barrio
    obtenerPrecioDelivery: (barrio) => {
        // Buscamos el barrio en el array
        const barrioSeleccionado = carritoController.barrios.find(item => item.barrio === barrio);
        
        if (barrioSeleccionado) {
            // Retornamos el precio de delivery
            return barrioSeleccionado.precio;
        } else {
            console.log("Barrio no encontrado");
            return 0; // Precio por defecto si no encontramos el barrio
        }
    },
    delete: (id, tipoId) => {
        carritoService.delete(id, tipoId);
        carritoController.actualizarContador();
        carritoController.list();
    },
    actualizarContador: () => {
        let count = document.getElementById('cart-count');
        let carrito = carritoService.list();
        let carritoCount = carrito.length;
        count.textContent = carritoCount;
    },
    clear: () => {
        carritoService.clear();
        carritoController.list();
        carritoController.actualizarContador();
    },
    validacion: (pedido) => {
        const errores = {};
    
        if (!pedido.nombre?.trim()) {
            errores.nombre = "El nombre es obligatorio.";
        } else if (pedido.nombre.length < 3) {
            errores.nombre = "El nombre debe tener al menos 3 caracteres.";
        }
    
        if (!pedido.tipoPedido?.trim()) {
            errores.tipoPedido = "Debe seleccionar un tipo de pedido.";
        } else if (pedido.tipoPedido === "Delivery") {
            // 🔹 Validar que el barrio sea un valor válido
            if (!pedido.barrio?.trim() || pedido.barrio === "-" || pedido.barrio === "Seleccione un barrio") {
                errores.barrio = "Debe seleccionar un barrio válido.";
            }
            if (!pedido.direccion?.trim()) {
                errores.direccion = "Debe ingresar una dirección.";
            } else if (pedido.direccion.length < 5) {
                errores.direccion = "La dirección debe tener al menos 5 caracteres.";
            }
        }
    
        if (!pedido.metodoPago?.trim()) {
            errores.metodoPago = "Debe seleccionar un método de pago.";
        }
    
        return errores;
    },
    mostrarErrores: (errores) => {
        document.getElementById("error-pedido-nombre").textContent = errores.nombre || "";
        document.getElementById("error-pedido-tipo").textContent = errores.tipoPedido || "";
        document.getElementById("error-pedido-barrio").textContent = errores.barrio || "";
        document.getElementById("error-pedido-direccion").textContent = errores.direccion || "";
        document.getElementById("error-pedido-metodo-pago").textContent = errores.metodoPago || "";
    },
    limpiarCamposErrores: () => {
        const camposError = document.querySelectorAll(".error");
        camposError.forEach((campo) => {
            campo.textContent = "";
        });
    },
    enviarMensaje: () => {
        // Recoger los valores
        carritoController.pedido.nombre = document.getElementById('pedido-nombre').value;
        carritoController.pedido.tipoPedido = document.getElementById('pedido-tipo').value;
        carritoController.pedido.metodoPago = document.getElementById('pedido-metodo-pago').value;
        carritoController.pedido.detallesPedido = document.getElementById('pedido-detalles').value;
    
        // Si el pedido es delivery, agregar el barrio y dirección
        if (carritoController.pedido.tipoPedido === "Delivery") {
            carritoController.pedido.barrio = document.getElementById('pedido-barrio').value || "-";
            carritoController.pedido.direccion = document.getElementById('pedido-direccion').value || "-";
        } else {
            carritoController.pedido.barrio = "-";
            carritoController.pedido.direccion = "-";
        }
    
        // Validar los datos
        const validacionErrores = carritoController.validacion(carritoController.pedido);
        if (Object.keys(validacionErrores).length > 0) {
            carritoController.mostrarErrores(validacionErrores);
            return;  // Detener la ejecución si hay errores
        }
    
        carritoController.limpiarCamposErrores();
    
        if (carritoController.pedido.detallesPedido === '') {
            carritoController.pedido.detallesPedido = '-';
        }
    
        const productos = carritoService.list();
    
        // Mapeo de categorías
        const categorias = {
            "Plato principal": "Hamburguesas",
            "Acompañante": "Acompañantes",
            "Bebida": "Bebidas",
            "Promoción": "Promociones"
        };
    
        // Función para formatear productos por categoría
        const formatearProductos = (categoriaKey) => {
            const items = productos
                .filter(item => item.categoria === categoriaKey)
                .map(item => {
                    let extrasTexto = "";
                    if (item.extras && item.extras.length > 0) {
                        extrasTexto = item.extras
                            .map(extra => `    + *${extra.nombre}* (x${extra.cantidad}) - $${extra.precioUnitario * extra.cantidad}`)
                            .join("\n");
                        extrasTexto = `\n${extrasTexto}`; // Solo agregamos un salto de línea si hay extras
                    }
        
                    return `- *${item.nombre}* (x${item.cantidad}) - $${item.precioUnitario * item.cantidad}${extrasTexto}`;
                })
                .join("\n");
        
            return items ? `*${categorias[categoriaKey]}:*\n${items}\n` : "";
        };
    
        const hamburguesas = formatearProductos("Plato principal");
        const papas = formatearProductos("Acompañante");
        const bebidas = formatearProductos("Bebida");
        const promociones = formatearProductos("Promoción");
    
        // Total de productos incluyendo extras
        const precioTotal = productos.reduce((total, item) => {
            let precioExtras = 0;

            if (item.extras && item.extras.length > 0) {
                precioExtras = item.extras.reduce((subtotal, extra) => subtotal + (extra.precioUnitario * extra.cantidad), 0);
            }

            return total + (item.precioUnitario * item.cantidad) + (precioExtras * item.cantidad);
        }, 0);
    
        // Calcular el precio de delivery si es necesario
        let precioDelivery = 0;
        let totalConDelivery = precioTotal;
    
        if (carritoController.pedido.tipoPedido === "Delivery") {
            carritoService.consultarBarrios()
                .then(response => {
                    const barrios = response;
                    const barrioSeleccionado = barrios.find(barrio => barrio.barrio === carritoController.pedido.barrio);
                    if (barrioSeleccionado) {
                        precioDelivery = barrioSeleccionado.precio;  // Precio del delivery
                    }
                    totalConDelivery += precioDelivery;
    
                    // Enviar el mensaje con el precio de delivery actualizado
                    carritoController.enviarMensajeWhatsApp(precioDelivery, totalConDelivery, hamburguesas, papas, bebidas, promociones);
                })
                .catch(error => {
                    console.error("Error al obtener los barrios:", error);
                });
        } else {
            // Si el pedido es para retiro, enviar el mensaje sin delivery
            carritoController.enviarMensajeWhatsApp(precioDelivery, totalConDelivery, hamburguesas, papas, bebidas, promociones);
        }
    },
    enviarMensajeWhatsApp: (precioDelivery, totalConDelivery, hamburguesas, papas, bebidas, promociones) => {
        const mensaje =
            `*Club de la Hamburguesa - Nuevo pedido*\n` +
            `———————————————————\n` +
            `*Detalles del pedido*\n` +
            `- *Tipo de pedido:* ${carritoController.pedido.tipoPedido}\n` +
            `- *Nombre:* ${carritoController.pedido.nombre}\n` +
            `- *Método de pago:* ${carritoController.pedido.metodoPago}\n` +
            (carritoController.pedido.tipoPedido === "Delivery" ? `- *Barrio:* ${carritoController.pedido.barrio}\n` : "") +
            (carritoController.pedido.tipoPedido === "Delivery" ? `- *Dirección:* ${carritoController.pedido.direccion}\n` : "") +
            `- *Detalles:* ${carritoController.pedido.detallesPedido}\n` +
            `———————————————————\n` +
            `${hamburguesas}${papas}${bebidas}${promociones}` +
            `———————————————————\n` +
            (carritoController.pedido.tipoPedido === "Delivery" ? `*Delivery:* $${precioDelivery.toFixed(2)}\n` : "") +
            `*Total a pagar:* $${totalConDelivery.toFixed(2)}\n` +
            `———————————————————\n`;
    
        const numeroWhatsApp = '5492974047992'; // Reemplaza con el número de WhatsApp del negocio
        const url = `https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(mensaje)}`;
    
        //console.log(mensaje);
        // Abrir WhatsApp
        window.open(url, '_blank');
    }
}

document.addEventListener("DOMContentLoaded", () => {
    //carritoController.clear(); //Para vaciar el carro

    let carritoProductos = document.getElementById('carrito-section-productos');
    let carritoFormulario = document.getElementById('carrito-formulario-section');

    let botonesProductos = document.getElementById('botones-productos');
    let botonesFormulario = document.getElementById('botones-formulario');

    let btnConfirmarPedido = document.getElementById('btn-confirmar-pedido');

    if (btnConfirmarPedido != null) {
        btnConfirmarPedido.onclick = () => {
            carritoProductos.classList.add('hidden');

            carritoFormulario.classList.remove('hidden');

            botonesProductos.classList.add('hidden');
            botonesFormulario.classList.remove('hidden');
        }
    }

    let carritoContainer = document.querySelector('.carrito-container');

    let btnCerrarCarrito = document.querySelectorAll('.btn-cerrar-carrito');
    btnCerrarCarrito.forEach(btn => {
        btn.addEventListener('click', () => {
            carritoContainer.classList.remove('show');
            document.body.style.overflow = "";
        });
    });

    let btnVolver = document.getElementById('btn-volver');

    if (btnVolver != null) {
        btnVolver.onclick = () => {
            carritoFormulario.classList.add('hidden');

            carritoProductos.classList.remove('hidden');

            botonesFormulario.classList.add('hidden');
            botonesProductos.classList.remove('hidden');
        }
    }

    let btnEnviarPedido = document.getElementById('btn-enviar-pedido');
    if(btnEnviarPedido != null){
        btnEnviarPedido.addEventListener('click',()=>{
            carritoController.enviarMensaje();
        })
    }

    /*Barrios*/
    carritoController.consultarBarrios();

});