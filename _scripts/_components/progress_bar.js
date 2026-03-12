function initNavbarProgress() {
    const header = document.querySelector("header");
    if (!header) return;

    let ticking = false;

    const updateProgress = () => {
        const scrollTop = window.scrollY || window.pageYOffset;
        const scrollableHeight =
            document.documentElement.scrollHeight - window.innerHeight;

        const progress =
            scrollableHeight > 0 ? Math.min(scrollTop / scrollableHeight, 1) : 0;

        header.style.setProperty("--scroll-progress", progress.toString());
        ticking = false;
    };

    const requestUpdate = () => {
        if (ticking) return;
        ticking = true;
        window.requestAnimationFrame(updateProgress);
    };

    updateProgress();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);
}