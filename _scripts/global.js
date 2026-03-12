// Wait until DOM is fully loaded
document.addEventListener("DOMContentLoaded", function () {

    // Initialize theme
    initTheme();

    // Set up theme toggle
    const themeToggle = document.getElementById("theme-toggle");
    if (themeToggle) {
        themeToggle.addEventListener("click", toggleTheme);
    }

    // Initialize scroll to top button
    initScrollToTop();

    // Initialize hamburger menu
    initHamburgerMenu();

    // Initialize navbar progress bar
    initNavbarProgress();

    // Set current year in footer
    const yearElement = document.getElementById("current-year");
    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }

});

// Hide loader when the entire page (including all images/fonts) is fully loaded
window.addEventListener("load", function () {
    const loaderWrapper = document.getElementById("loader-wrapper");
    if (loaderWrapper) {
        // Adding a slight delay ensures layout calculations (like masonry) are fully rendered before it's shown
        setTimeout(() => {
            loaderWrapper.classList.add("loaded");
        }, 100);
    }
});