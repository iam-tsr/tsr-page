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

    // Set current year in footer
    const yearElement = document.getElementById("current-year");
    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }

});