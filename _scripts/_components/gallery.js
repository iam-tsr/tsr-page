document.addEventListener('DOMContentLoaded', () => {
    const gallery = document.getElementById('gallery');
    if (!gallery) return;

    // Save all gallery items (wrappers)
    const items = Array.from(gallery.querySelectorAll('.gallery-item'));
    
    function renderMasonry() {
        let colsCount = window.innerWidth <= 480 ? 1 : window.innerWidth <= 768 ? 2 : 3;
        
        // Don't re-render if the column count hasn't changed and it's already structured
        if (gallery.children.length === colsCount && gallery.children[0].classList.contains('masonry-column')) {
            return;
        }

        // Clear gallery
        gallery.innerHTML = '';
        
        // Create columns
        const columns = [];
        for (let i = 0; i < colsCount; i++) {
            const col = document.createElement('div');
            col.className = 'masonry-column';
            gallery.appendChild(col);
            columns.push(col);
        }

        // Distribute items left-to-right
        items.forEach((item, index) => {
            columns[index % colsCount].appendChild(item);
        });
    }

    renderMasonry();
    window.addEventListener('resize', renderMasonry);

    // Lightbox
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightboxImg');
    const lightboxClose = document.getElementById('lightboxClose');

    if (!lightbox || !lightboxImg || !lightboxClose) return;

    gallery.addEventListener('click', (e) => {
        const item = e.target.closest('.gallery-item');
        const contentImg = e.target.closest('.content img');
        const img = item ? item.querySelector('img') : contentImg;
        if (!img) return;
        lightboxImg.src = img.src;
        lightboxImg.alt = img.alt;
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
    });

    lightboxClose.addEventListener('click', closeLightbox);

    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) closeLightbox();
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeLightbox();
    });

    function closeLightbox() {
        lightbox.classList.remove('active');
        document.body.style.overflow = '';
    }
});
