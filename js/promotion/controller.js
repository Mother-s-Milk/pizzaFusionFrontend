import { service } from './service.js';

const PROMOTIONS_PER_PAGE =
    window.innerWidth <= 768 ? 4 : 3;

export const controller = {
    promotions: [],
    currentIndex: 0,
    expanded: false,

    getPromotions: () => {
        service.getPromotions()
            .then(response => {
                controller.promotions = response.promotions.filter(p => p.active);
                controller.resetPromotions();
            })
            .catch(console.error);
    },

    resetPromotions: () => {
        const grid = document.getElementById("promotions-grid");
        const btn = document.getElementById("load-more-promotions");

        grid.innerHTML = "";
        controller.currentIndex = 0;
        controller.expanded = false;

        controller.renderNextPromotions();

        btn.textContent = "Ver más promociones";
        btn.style.display = controller.promotions.length > PROMOTIONS_PER_PAGE
            ? "inline-flex"
            : "none";
    },

    renderNextPromotions: () => {
        const grid = document.getElementById("promotions-grid");
        const btn = document.getElementById("load-more-promotions");

        const next = controller.promotions.slice(
            controller.currentIndex,
            controller.currentIndex + PROMOTIONS_PER_PAGE
        );

        next.forEach(promotion => {
            grid.insertAdjacentHTML("beforeend", controller.getPromotionCard(promotion));
        });

        controller.currentIndex += PROMOTIONS_PER_PAGE;

        if (controller.currentIndex >= controller.promotions.length) {
            controller.expanded = true;
            btn.textContent = "Ver menos promociones";
        }
    },

    togglePromotions: () => {
        if (controller.expanded) {
            controller.resetPromotions();

            document
                .getElementById("promotions")
                .scrollIntoView({ behavior: "smooth" });
        } else {
            controller.renderNextPromotions();
        }
    },

    getBadgeClass: (badge) => {
        const map = {
            "Combo": "combo",
            "Oferta": "offer",
            "Especial": "special",
            "Veggie": "veggie",
            "Quesos": "cheese",
        };
        return map[badge] || "default";
    },

    getPromotionCard: (promotion) => `
        <article class="promotion-card">
            <div class="promotion-media">
                <img src="${promotion.imgUrl}" alt="${promotion.title}">
                ${promotion.badge
            ? `<span class="promotion-badge promotion-badge--${controller.getBadgeClass(promotion.badge)}">${promotion.badge}</span>`
            : ""}
            </div>

            <div class="promotion-body">
                <div class="promotion-info">
                    <h3 class="promotion-title">${promotion.title}</h3>
                    <p class="promotion-description">${promotion.description}</p>
                </div>

                <div class="promotion-actions">
                    ${promotion.price ? `<span class="promotion-price">$ ${promotion.price}</span>` : ``}
                    <button class="promotion-btn" data-id="${promotion.id}">
                        Pedir ahora
                    </button>
                </div>
            </div>
        </article>
    `
};