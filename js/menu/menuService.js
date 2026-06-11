export const menuService = {
    getMenu: () => {
        const isGithubPages =
            window.location.hostname === "mother-s-milk.github.io";

        const BASE_PATH = isGithubPages
            ? "/pizzaFusionFrontend"
            : "";
            
        const url = `${window.location.origin}${BASE_PATH}/database/menu.json`;
        return fetch(url, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              "Accept": "application/json",
            },
            })
            .then((response) => {
                if (!response.ok) {
                    throw new Error(response.status);
                }
                return response.json();
            })
            .catch((error) => {
                console.error("Error en la petición: ", error);
                throw error;
            });
    },
    filterById: (filterId) => {
        return fetch(`pizza/filterById/${filterId}`) //Ajusta la URL según tu configuración
            .then(response => {
                //console.log("Respuesta completa del servidor:", response);
                if (!response.ok) {
                    throw new Error("Error en la respuesta del servidor");
                }
                return response.json();  //Devolvemos el JSON con las pizzas filtradas
                //return response.text();
            })
            .catch(error => {
                console.error("ERROR EN LA PETICIÓN DE FILTRADO", error);
            });
    }
};