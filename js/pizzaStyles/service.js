export const service = {
    getStyles: () => {
        const url = `${window.location.origin}/database/pizzaStyles.json`;
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
};