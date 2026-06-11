import { menuController } from './menuController.js';

document.addEventListener('DOMContentLoaded', () => {

    /* ─────────────────────────────────────── */
    /* INIT                                    */
    /* ─────────────────────────────────────── */
    menuController.init();

    /* ─────────────────────────────────────── */
    /* BUSCADOR                                */
    /* ─────────────────────────────────────── */
    const searchInput = document.getElementById('menu-search-input');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            menuController.applySearch(e.target.value);
        });
    }

    /* ─────────────────────────────────────── */
    /* DELEGACIÓN DE EVENTOS (click global)    */
    /* ─────────────────────────────────────── */
    document.addEventListener('click', (e) => {

        /* FILTROS: sidebar y chips mobile */
        const filterBtn = e.target.closest('.menu-filter-btn, .menu-chip-btn');
        if (filterBtn) {
            const filter = filterBtn.dataset.filter;

            // Actualizar estado visual en sidebar Y mobile chips simultáneamente
            document.querySelectorAll('.menu-filter-btn, .menu-chip-btn').forEach(btn => {
                btn.classList.toggle('active', btn.dataset.filter === filter);
            });

            menuController.applyFilter(filter);
            return;
        }

        /* PAGINACIÓN */
        const pageBtn = e.target.closest('.page-btn');
        if (pageBtn && !pageBtn.disabled) {
            const pageValue = pageBtn.dataset.page;
            const current = menuController.pagination.currentPage;
            const totalPages = menuController.totalPages;
            let newPage = current;

            if (pageValue === 'prev' && current > 1) newPage = current - 1;
            else if (pageValue === 'next' && current < totalPages) newPage = current + 1;
            else if (!isNaN(pageValue)) newPage = parseInt(pageValue);

            if (newPage !== current) {
                menuController.pagination.currentPage = newPage;
                menuController.renderMenu();
                menuController.renderPagination();

                // scroll suave al inicio de la sección
                document.getElementById('grid-menu')
                    ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
            return;
        }

        /* AGREGAR AL CARRITO */
        const cartBtn = e.target.closest('.menu-card-btn');
        if (cartBtn) {
            // TODO: integrar con módulo de carrito
            const { name } = cartBtn.dataset;
            menuController.showToast(`¡${name} agregada al carrito! 🍕`);
            return;
        }

        /* FAVORITOS */
        const favBtn = e.target.closest('.fav');
        if (favBtn) {
            menuController.toggleFav(favBtn);
            return;
        }
    });
});