//let carrito = [] //Base de datos

let carritoKey = 'carrito'; // Clave para almacenar en localStorage

const carritoService = {
    save: (producto) => {
        let carrito = JSON.parse(localStorage.getItem(carritoKey)) || [];

        carrito.push(producto);
        localStorage.setItem(carritoKey, JSON.stringify(carrito));

        console.log(carrito)
    },
    agregarUno: (id, tipoId) => {
        let carrito = JSON.parse(localStorage.getItem(carritoKey)) || [];

        let producto = carrito.find(p => (tipoId === "idUnico" ? p.idUnico : p.id) === id);
        if (producto) {
            producto.cantidad++;
        }

        localStorage.setItem(carritoKey, JSON.stringify(carrito));
    },
    restarUno: (id, tipoId) => {
        let carrito = JSON.parse(localStorage.getItem(carritoKey)) || [];

        let producto = carrito.find(p => (tipoId === "idUnico" ? p.idUnico : p.id) === id);
        if (producto && producto.cantidad > 1) {
            producto.cantidad--;
        }

        localStorage.setItem(carritoKey, JSON.stringify(carrito));
    },
    list: () => {
        let carrito = JSON.parse(localStorage.getItem(carritoKey)) || [];
        return carrito;
    },
    delete: (id, tipoId) => {
        let carrito = JSON.parse(localStorage.getItem(carritoKey)) || [];
        carrito = carrito.filter(p => (tipoId === "idUnico" ? p.idUnico : p.id) !== id);

        localStorage.setItem(carritoKey, JSON.stringify(carrito));
    },
    // Limpiar el carrito
    clear: () => {
        localStorage.removeItem(carritoKey); // Eliminar el carrito del localStorage
    },
    consultarBarrios: () => {
        return fetch('app/json/barriosDeliveryPrecios.json')
        .then(response => {
            return response.json()
        })
        .then(data => {
            return data;
        })
        .catch((error) => {
            console.error("Error en la petición: ", error);
            throw error;
        });
    }
}