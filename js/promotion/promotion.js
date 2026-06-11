import { controller } from './controller.js';

document.addEventListener('DOMContentLoaded', () => {
    controller.getPromotions();

    document.getElementById("load-more-promotions")
        .addEventListener("click", controller.togglePromotions);
});