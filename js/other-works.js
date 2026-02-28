document.addEventListener('DOMContentLoaded', () => {
    const lightbox = document.getElementById('lightbox-modal');
    if (!lightbox) return;

    const lbImg = document.getElementById('lightbox-img');
    const lbClose = document.getElementById('lightbox-close');
    const lbPrev = document.getElementById('lightbox-prev');
    const lbNext = document.getElementById('lightbox-next');
    const lbIndex = document.getElementById('lightbox-index');

    let currentGallery = [];
    let currentIndex = 0;

    function openLightbox(gallery, index) {
        currentGallery = gallery;
        currentIndex = index;
        updateLightbox();

        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeLightbox() {
        lightbox.classList.remove('active');
        // Give time for fade out before resetting
        setTimeout(() => {
            document.body.style.overflow = '';
            lbImg.src = '';
        }, 300);
    }

    function updateLightbox() {
        if (currentGallery.length === 0) return;
        lbImg.src = currentGallery[currentIndex];
        lbIndex.textContent = `${currentIndex + 1} / ${currentGallery.length}`;
    }

    function nextImg(e) {
        if (e) e.stopPropagation();
        currentIndex = (currentIndex + 1) % currentGallery.length;
        updateLightbox();
    }

    function prevImg(e) {
        if (e) e.stopPropagation();
        currentIndex = (currentIndex - 1 + currentGallery.length) % currentGallery.length;
        updateLightbox();
    }

    lbClose.addEventListener('click', closeLightbox);
    lbNext.addEventListener('click', nextImg);
    lbPrev.addEventListener('click', prevImg);
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) {
            closeLightbox();
        }
    });

    document.addEventListener('keydown', (e) => {
        if (!lightbox.classList.contains('active')) return;
        if (e.key === 'Escape') closeLightbox();
        if (e.key === 'ArrowRight') nextImg();
        if (e.key === 'ArrowLeft') prevImg();
    });

    // Bind Poster Wall clicks
    const posterItems = document.querySelectorAll('.poster-item');
    const posterGallery = Array.from(posterItems).map(item => item.getAttribute('data-src'));

    posterItems.forEach((item, index) => {
        item.addEventListener('click', () => {
            openLightbox(posterGallery, index);
        });
    });

    // Bind Series clicks
    const seriesButtons = document.querySelectorAll('.btn-view-series');
    seriesButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const dataAttr = btn.getAttribute('data-gallery');
            if (dataAttr) {
                try {
                    const gallery = JSON.parse(dataAttr);
                    if (gallery.length > 0) {
                        openLightbox(gallery, 0);
                    }
                } catch (err) {
                    console.error('Failed to parse gallery data:', err);
                }
            }
        });
    });
});
