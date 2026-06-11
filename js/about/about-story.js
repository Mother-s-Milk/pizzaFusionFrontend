/**
 * about-story.js
 * Stepped Story Viewer — navegación del componente .story-section
 * ----------------------------------------------------------------
 * - Dots laterales generados dinámicamente
 * - Flechas prev / next
 * - Barra de progreso
 * - Contador "01 / 04"
 * - Soporte de teclado (← →)
 * - Respeta prefers-reduced-motion
 */

(function () {
    'use strict';

    /* ── Selección de nodos ── */
    const track = document.getElementById('storyTrack');
    const nav = document.getElementById('storyNav');
    const fill = document.getElementById('storyFill');
    const progress = document.getElementById('storyProgress');
    const counter = document.getElementById('storyCounter');
    const prevBtn = document.getElementById('storyPrev');
    const nextBtn = document.getElementById('storyNext');

    /* Si la sección no existe en esta página, salir sin errores */
    if (!track) return;

    const slides = Array.from(track.querySelectorAll('.story-slide'));
    const total = slides.length;
    let current = 0;

    /* ── Respetar prefers-reduced-motion ── */
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        slides.forEach(slide => {
            slide.style.transition = 'opacity 0.01ms';
        });
    }

    /* ── Generar dots laterales dinámicamente ── */
    slides.forEach((_, i) => {
        const dot = document.createElement('button');
        dot.className = 'story-nav__dot' + (i === 0 ? ' is-active' : '');
        dot.setAttribute('role', 'tab');
        dot.setAttribute('aria-label', `Ir a sección ${i + 1}`);
        dot.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
        dot.setAttribute('aria-controls', `story-title-${i + 1}`);
        dot.addEventListener('click', () => goTo(i));
        nav.appendChild(dot);
    });

    /* ── Función principal de navegación ── */
    function goTo(index) {
        if (index === current || index < 0 || index >= total) return;

        /* Desactivar slide y dot actuales */
        slides[current].classList.remove('is-active');
        nav.children[current].classList.remove('is-active');
        nav.children[current].setAttribute('aria-selected', 'false');

        /* Activar nuevo */
        current = index;
        slides[current].classList.add('is-active');
        nav.children[current].classList.add('is-active');
        nav.children[current].setAttribute('aria-selected', 'true');

        updateUI();
    }

    /* ── Actualizar barra, contador y flechas ── */
    function updateUI() {
        fill.style.width = ((current + 1) / total * 100) + '%';
        progress.setAttribute('aria-valuenow', current + 1);
        counter.textContent = pad(current + 1) + ' / ' + pad(total);
        prevBtn.disabled = current === 0;
        nextBtn.disabled = current === total - 1;
    }

    /* ── Helper ── */
    function pad(n) {
        return String(n).padStart(2, '0');
    }

    /* ── Event listeners ── */
    prevBtn.addEventListener('click', () => goTo(current - 1));
    nextBtn.addEventListener('click', () => goTo(current + 1));

    /* Navegación con teclado cuando el componente tiene foco */
    document.getElementById('story')?.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
            e.preventDefault();
            goTo(current + 1);
        }
        if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
            e.preventDefault();
            goTo(current - 1);
        }
    });

    /* ── Estado inicial — sin pasar por goTo para evitar el guard index === current ── */
    function init() {
        fill.style.width = (1 / total * 100) + '%';
        progress.setAttribute('aria-valuenow', 1);
        counter.textContent = pad(1) + ' / ' + pad(total);
        prevBtn.disabled = true;
        nextBtn.disabled = total === 1;
    }

    init();

}());