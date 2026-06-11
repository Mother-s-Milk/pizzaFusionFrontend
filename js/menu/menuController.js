import { menuService } from './menuService.js';

export const menuController = {
    allPizzas: [],         // copia completa del JSON
    filteredPizzas: [],    // resultado de filtro + búsqueda
    currentFilter: 'todas',
    searchQuery: '',
    pagination: {
        currentPage: 1,
        itemsPerPage: window.innerWidth >= 1024 ? 6 : 4,
    },

    /* ─────────────────────────────────────── */
    /* UTILS                                   */
    /* ─────────────────────────────────────── */
    get totalItems() {
        return menuController.filteredPizzas.length;
    },

    get totalPages() {
        return Math.ceil(menuController.totalItems / menuController.pagination.itemsPerPage);
    },

    getPagesToShow() {
        const { currentPage } = menuController.pagination;
        const total = menuController.totalPages;
        const pages = [];

        if (total <= 3) {
            for (let i = 1; i <= total; i++) pages.push(i);
            return pages;
        }

        let start, end;

        if (currentPage === 1) { start = 1; end = 3; }
        else if (currentPage === total) { start = total - 2; end = total; }
        else { start = currentPage - 1; end = currentPage + 1; }

        // guardar límites
        start = Math.max(1, start);
        end = Math.min(total, end);

        for (let i = start; i <= end; i++) pages.push(i);
        return pages;
    },

    /* Categorías con contadores para los filtros */
    getCategoryCounts() {
        const counts = { todas: menuController.allPizzas.length };
        menuController.allPizzas.forEach(p => {
            counts[p.badge] = (counts[p.badge] || 0) + 1;
        });
        return counts;
    },

    /* ─────────────────────────────────────── */
    /* CARGA INICIAL                           */
    /* ─────────────────────────────────────── */
    init() {
        menuService.getMenu()
            .then(response => {
                menuController.allPizzas = response.pizzas;

                // Leer parámetro ?estilo= de la URL
                const urlParams = new URLSearchParams(window.location.search);
                const styleParam = urlParams.get('pizzaStyle');
                const validBadges = ['clasica', 'blanca', 'carnivora', 'veggie', 'gourmet'];

                if (styleParam && validBadges.includes(styleParam)) {
                    menuController.currentFilter = styleParam;
                    // Marcar el botón correspondiente como activo
                    document.querySelectorAll('.menu-filter-btn, .menu-chip-btn').forEach(btn => {
                        btn.classList.toggle('active', btn.dataset.filter === styleParam);
                    });
                }

                menuController._applyFiltersAndRender();
                menuController.renderFilterCounts();
            })
            .catch(error => {
                console.error('Error al cargar las pizzas:', error);
                const grid = document.getElementById('grid-menu');
                if (grid) {
                    grid.innerHTML = `
                        <div class="menu-empty">
                            <span class="menu-empty-icon"><i class="fa-solid fa-triangle-exclamation"></i></span>
                            <p class="menu-empty-text">No pudimos cargar el menú. Intentá de nuevo más tarde.</p>
                        </div>`;
                }
            });
    },

    /* ─────────────────────────────────────── */
    /* FILTRADO + BÚSQUEDA                     */
    /* ─────────────────────────────────────── */
    applyFilter(filter) {
        menuController.currentFilter = filter;
        menuController.pagination.currentPage = 1;
        menuController._applyFiltersAndRender();
        menuController.updateToolbarTitle();
    },

    applySearch(query) {
        menuController.searchQuery = query.trim().toLowerCase();
        menuController.pagination.currentPage = 1;
        menuController._applyFiltersAndRender();
    },

    _applyFiltersAndRender() {
        const { currentFilter, searchQuery, allPizzas } = menuController;

        let result = currentFilter === 'todas'
            ? [...allPizzas]
            : allPizzas.filter(p => p.badge === currentFilter);

        if (searchQuery) {
            result = result.filter(p =>
                p.name.toLowerCase().includes(searchQuery) ||
                p.description.toLowerCase().includes(searchQuery) ||
                p.ingredientes.some(i => i.toLowerCase().includes(searchQuery))
            );
        }

        menuController.filteredPizzas = result;
        menuController.renderMenu();
        menuController.renderPagination();
        menuController.updateToolbarTitle();
    },

    /* ─────────────────────────────────────── */
    /* RENDER: CARDS                           */
    /* ─────────────────────────────────────── */
    renderMenu() {
        const grid = document.getElementById('grid-menu');
        if (!grid) return;

        const { currentPage, itemsPerPage } = menuController.pagination;
        const start = (currentPage - 1) * itemsPerPage;
        const end = start + itemsPerPage;
        const pagina = menuController.filteredPizzas.slice(start, end);

        grid.innerHTML = '';

        if (pagina.length === 0) {
            grid.innerHTML = `
                <div class="menu-empty">
                    <span class="menu-empty-icon"><i class="fa-solid fa-pizza-slice"></i></span>
                    <p class="menu-empty-text">No encontramos pizzas con ese criterio.</p>
                </div>`;
            return;
        }

        const badgeLabel = {
            clasica: 'Clásica',
            blanca: 'Blanca',
            carnivora: 'Carnívora',
            veggie: 'Veggie',
            gourmet: 'Gourmet',
        };

        pagina.forEach(pizza => {
            const ingredientesHTML = pizza.ingredientes
                .map(i => `<li class="chip">${i}</li>`)
                .join('');

            const card = `
                <article class="menu-card" data-id="${pizza.id}">
                    <header class="card-media">
                        <img
                            src="../${pizza.imgUrl}"
                            class="card-img"
                            alt="Foto de ${pizza.name}"
                            loading="lazy"
                        />
                        <span class="badge badge-${pizza.badge}">
                            ${badgeLabel[pizza.badge] ?? pizza.badge}
                        </span>
                        <button
                            type="button"
                            class="fav"
                            aria-label="Agregar a favoritos"
                            data-id="${pizza.id}"
                        >
                            <i class="fa-regular fa-heart"></i>
                        </button>
                    </header>

                    <section class="card-body">
                        <div class="card-info">
                            <h3 class="card-title">${pizza.name}</h3>
                            <p class="card-desc">${pizza.description}</p>
                        </div>

                        <ul class="chips" aria-label="Ingredientes">
                            ${ingredientesHTML}
                        </ul>

                        <footer class="card-footer">
                            <div class="price">
                                <span class="price-label">Precio</span>
                                <span class="price-value">$\u00a0${pizza.price.toLocaleString('es-AR')}</span>
                            </div>
                            <button
                                type="button"
                                class="menu-card-btn"
                                data-id="${pizza.id}"
                                data-name="${pizza.name}"
                                data-price="${pizza.price}"
                                data-img="${pizza.imgUrl}"
                                aria-label="Agregar ${pizza.name} al carrito"
                            >
                                <span class="menu-card-btn-icon" aria-hidden="true">
                                    <i class="fa-solid fa-cart-shopping"></i>
                                </span>
                                Agregar
                            </button>
                        </footer>
                    </section>
                </article>`;

            grid.insertAdjacentHTML('beforeend', card);
        });
    },

    /* ─────────────────────────────────────── */
    /* RENDER: PAGINACIÓN                      */
    /* ─────────────────────────────────────── */
    renderPagination() {
        const container = document.getElementById('pagination');
        if (!container) return;

        container.innerHTML = '';

        if (menuController.totalPages <= 1) return;

        const { currentPage } = menuController.pagination;
        const total = menuController.totalPages;

        const createBtn = (label, page, disabled = false, isCurrent = false) => {
            const li = document.createElement('li');
            const btn = document.createElement('button');
            btn.className = 'page-btn' + (isCurrent ? ' current' : '');
            btn.dataset.page = page;
            btn.disabled = disabled;
            btn.innerHTML = label;
            btn.setAttribute('aria-label', typeof page === 'number' ? `Página ${page}` : label);
            if (isCurrent) btn.setAttribute('aria-current', 'page');
            li.appendChild(btn);
            return li;
        };

        // Anterior
        container.appendChild(createBtn('&laquo;', 'prev', currentPage === 1));

        // Números
        menuController.getPagesToShow().forEach(p => {
            container.appendChild(createBtn(p, p, false, p === currentPage));
        });

        // Siguiente
        container.appendChild(createBtn('&raquo;', 'next', currentPage === total));
    },

    /* ─────────────────────────────────────── */
    /* RENDER: CONTADORES EN FILTROS           */
    /* ─────────────────────────────────────── */
    renderFilterCounts() {
        const counts = menuController.getCategoryCounts();
        // Solo los botones del sidebar tienen .filter-btn-count
        document.querySelectorAll('.menu-filter-btn').forEach(btn => {
            const filter = btn.dataset.filter;
            const countEl = btn.querySelector('.filter-btn-count');
            if (countEl && counts[filter] !== undefined) {
                countEl.textContent = counts[filter];
            }
        });
    },

    /* ─────────────────────────────────────── */
    /* TOOLBAR: título dinámico                */
    /* ─────────────────────────────────────── */
    updateToolbarTitle() {
        const titleEl = document.getElementById('menu-toolbar-title');
        const countEl = document.getElementById('menu-toolbar-count');
        if (!titleEl || !countEl) return;

        const labelMap = {
            todas: 'Todas las pizzas',
            clasica: 'Clásicas',
            blanca: 'Blancas',
            carnivora: 'Carnívoras',
            veggie: 'Veggie',
            gourmet: 'Gourmet',
        };

        titleEl.textContent = labelMap[menuController.currentFilter] ?? 'Pizzas';
        const n = menuController.totalItems;
        countEl.textContent = `${n} opción${n !== 1 ? 'es' : ''} disponible${n !== 1 ? 's' : ''}`;
    },

    /* ─────────────────────────────────────── */
    /* TOAST                                   */
    /* ─────────────────────────────────────── */
    showToast(message) {
        const toast = document.getElementById('toast-notification');
        if (!toast) return;
        // Actualiza solo el <span> para no destruir el <i> del ícono
        const textNode = toast.querySelector('span');
        if (textNode) textNode.textContent = message;
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 2800);
    },

    /* ─────────────────────────────────────── */
    /* FAVORITOS (toggle visual)               */
    /* ─────────────────────────────────────── */
    toggleFav(btn) {
        const isActive = btn.classList.toggle('active');
        const icon = btn.querySelector('i');
        if (icon) {
            icon.className = isActive ? 'fa-solid fa-heart' : 'fa-regular fa-heart';
        }
    },
};