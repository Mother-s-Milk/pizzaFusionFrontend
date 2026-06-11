export const service = {
    getPromotions: () => {
        const isGithubPages =
            window.location.hostname === "mother-s-milk.github.io";

        const BASE_PATH = isGithubPages
            ? "/pizzaFusionFrontend"
            : "";

        const url = `${window.location.origin}${BASE_PATH}/database/promotions.json`;
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
    }
};