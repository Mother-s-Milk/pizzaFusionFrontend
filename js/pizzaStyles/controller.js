import { service } from './service.js';

export const controller = {
    styles: [],

    getStyles: () => {
        service.getStyles()
            .then((response) => {
                controller.styles = response.styles.filter((s) => s.active);
                controller.renderStyles();
            })
            .catch(console.error);
    },

    renderStyles: () => {
        const container = document.getElementById("styles-container");

        container.innerHTML = "";

        // El atributo data-count le dice al CSS qué layout aplicar.
        // Si mañana el cliente tiene 3 o 7 categorías, el grid se adapta solo.
        const count = controller.styles.length;
        container.setAttribute("data-count", Math.min(count, 10));

        controller.styles.forEach((style) => {
            container.insertAdjacentHTML("beforeend", controller.getStyleCard(style));
        });
    },

    getStyleCard: (style) => `
        <a  href="views/menu.html?pizzaStyle=${style.slug}#menuComponent"
            class="style-card"
            aria-label="Ver pizzas ${style.title.toLowerCase()}"
            data-filter="${style.slug}"
        >
            ${style.badge ? `<span class="style-card-badge">${style.badge}</span>` : ""}

            <img
                src="${style.imgUrl}"
                alt="Pizzas ${style.title.toLowerCase()}"
                loading="lazy"
            >

            <span class="style-card-overlay"></span>

            <span class="style-card-label">
                <span class="style-card-title">${style.title}</span>
                <span class="style-card-sub">${style.subtitle}</span>
                <span class="style-card-cta">Ver menú →</span>
            </span>
        </a>
    `,
};