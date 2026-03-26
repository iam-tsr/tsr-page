document.addEventListener('DOMContentLoaded', () => {
    const gallery = document.getElementById('gallery');
    
    if (gallery) {
        const items = Array.from(gallery.querySelectorAll('.gallery-item'));
        
        function renderMasonry() {
            let colsCount = window.innerWidth <= 480 ? 1 : window.innerWidth <= 768 ? 2 : 3;
            
            if (gallery.children.length === colsCount && gallery.children[0].classList.contains('masonry-column')) {
                return;
            }

            gallery.innerHTML = '';
            
            const columns = [];
            for (let i = 0; i < colsCount; i++) {
                const col = document.createElement('div');
                col.className = 'masonry-column';
                gallery.appendChild(col);
                columns.push(col);
            }

            items.forEach((item, index) => {
                columns[index % colsCount].appendChild(item);
            });
        }

        renderMasonry();
        window.addEventListener('resize', renderMasonry);
    }

    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightboxImg');
    const lightboxClose = document.getElementById('lightboxClose');

    if (!lightbox || !lightboxImg || !lightboxClose) return;

    document.addEventListener('click', (e) => {
        const item = e.target.closest('.gallery-item');
        const contentImg = e.target.tagName === 'IMG' && e.target.closest('.content') ? e.target : null;
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
