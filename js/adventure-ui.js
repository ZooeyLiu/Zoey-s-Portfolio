// adventure-ui.js
// Centralized script for case study interactivity

document.addEventListener('DOMContentLoaded', () => {

    // 1. Initialize Storyboard Swiper
    if (typeof Swiper !== 'undefined') {
        new Swiper('.storyboard-swiper', {
            slidesPerView: 1,
            spaceBetween: 24,
            navigation: {
                nextEl: '.swiper-button-next',
                prevEl: '.swiper-button-prev',
            },
            breakpoints: {
                768: { slidesPerView: 2 }
            }
        });
    }

    // 2. Interactive Media Showcase Logic (Modeling Section)
    const thumbs = document.querySelectorAll('.thumb-item');
    const mainVideo = document.getElementById('modeling-video');
    const previewImg = document.getElementById('modeling-preview');
    let restoreTimeout;

    if (thumbs.length > 0 && mainVideo && previewImg) {
        thumbs.forEach(thumb => {
            thumb.addEventListener('click', () => {
                const img = thumb.querySelector('img');
                if (!img) return;

                const src = img.getAttribute('src');

                // Show Image, Hide Video
                previewImg.setAttribute('src', src);
                previewImg.style.display = 'block';

                mainVideo.style.display = 'none';
                mainVideo.pause();

                // Clear existing timeout
                if (restoreTimeout) clearTimeout(restoreTimeout);

                // Auto-restore video after 4 seconds
                restoreTimeout = setTimeout(() => {
                    previewImg.style.display = 'none';
                    mainVideo.style.display = 'block';
                    mainVideo.play();
                }, 4000);
            });
        });
    }

});
