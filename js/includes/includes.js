let isMobile = false;

document.addEventListener('DOMContentLoaded', () => {
    isMobile = window.innerWidth <= 768;
    console.log("Es mobile:", isMobile);

    console.log(window.location)
    
    /***************/
    /* MOBILE MENU */
    /***************/
    const toggleBtn = document.getElementById("menu-toggle-btn");
    const mobileMenu = document.getElementById("mobile-nav");

    if (!toggleBtn || !mobileMenu) return;

    const openMenu = () => {
        mobileMenu.classList.add("open");
        toggleBtn.classList.add("open");
        toggleBtn.setAttribute("aria-expanded", "true");
    };

    const closeMenu = () => {
        mobileMenu.classList.remove("open");
        toggleBtn.classList.remove("open");
        toggleBtn.setAttribute("aria-expanded", "false");
    };

    const toggleMenu = () => {
        const isOpen = mobileMenu.classList.contains("open");
        isOpen ? closeMenu() : openMenu();
    };

    // Abrir / cerrar con el botón hamburguesa
    toggleBtn.addEventListener("click", toggleMenu);

    // Cerrar al hacer click en un enlace
    mobileMenu.addEventListener("click", (e) => {
        if (e.target.tagName === "A") {
            closeMenu();
        }
    });

    document.addEventListener("click", (e) => {
        const clickedInside = mobileMenu.contains(e.target) || toggleBtn.contains(e.target);

        if (!clickedInside && mobileMenu.classList.contains("open")) {
            closeMenu();
        }
    });

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && mobileMenu.classList.contains("open")) {
            closeMenu();
        }
    });

    /* FOOTER */
    //document.getElementById("pf-year").textContent = new Date().getFullYear();
    
});