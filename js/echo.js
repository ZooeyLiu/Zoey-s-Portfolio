/* ============================================================
   Echo — Page Interactions (Vanilla JS)
   - Scroll-triggered nav shadow
   - Back-to-Contents bar show/hide
   - Lightbox for images
   ============================================================ */

(function () {
    'use strict';

    // Cache DOM references
    const backBar = document.getElementById('backBar');
    const backBtn = document.getElementById('backBarBtn');
    const tocEl = document.getElementById('contents');

    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightboxImg');
    const lightboxClose = document.getElementById('lightboxClose');

    // -----------------------------------------------------------
    // 1. Scroll-triggered elements
    // -----------------------------------------------------------
    function onScroll() {

        // Back-to-Contents bar: show after scrolling past TOC
        if (tocEl) {
            const tocBottom = tocEl.getBoundingClientRect().bottom;
            if (tocBottom < 0) {
                backBar.classList.add('echo-back-bar--visible');
            } else {
                backBar.classList.remove('echo-back-bar--visible');
            }
        }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    // Run once on load in case page is already scrolled
    onScroll();

    // -----------------------------------------------------------
    // 2. Back-to-Contents button
    // -----------------------------------------------------------
    if (backBtn) {
        backBtn.addEventListener('click', function () {
            if (tocEl) {
                tocEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    }

    // -----------------------------------------------------------
    // 3. Stills horizontal scroll navigation
    // -----------------------------------------------------------
    const stillsTrack = document.getElementById('stillsTrack');
    const stillsPrev = document.querySelector('.echo-stills__nav--prev');
    const stillsNext = document.querySelector('.echo-stills__nav--next');

    if (stillsTrack && stillsPrev && stillsNext) {
        // Calculate scroll amount: one item width + gap
        function getScrollAmount() {
            const item = stillsTrack.querySelector('.echo-stills__item');
            if (!item) return 300;
            const style = window.getComputedStyle(stillsTrack);
            const gap = parseFloat(style.gap) || 16;
            return item.offsetWidth + gap;
        }

        // Manual Navigation
        stillsPrev.addEventListener('click', () => {
            stillsTrack.scrollBy({ left: -getScrollAmount(), behavior: 'smooth' });
        });

        stillsNext.addEventListener('click', () => {
            stillsTrack.scrollBy({ left: getScrollAmount(), behavior: 'smooth' });
        });

        // Auto Scroll Logic
        let autoScrollSpeed = 0.5; // pixels per frame
        let isPaused = false;
        let animationFrameId;

        function autoScroll() {
            if (!isPaused) {
                // If we reach the end, optionally snap back to start (or just let it hit the end)
                if (stillsTrack.scrollLeft >= (stillsTrack.scrollWidth - stillsTrack.clientWidth) - 1) {
                    stillsTrack.scrollLeft = 0;
                } else {
                    stillsTrack.scrollLeft += autoScrollSpeed;
                }
            }
            animationFrameId = requestAnimationFrame(autoScroll);
        }

        // Pause on hover or touch
        stillsTrack.addEventListener('mouseenter', () => isPaused = true);
        stillsTrack.addEventListener('mouseleave', () => isPaused = false);
        stillsTrack.addEventListener('touchstart', () => isPaused = true, { passive: true });
        stillsTrack.addEventListener('touchend', () => isPaused = false);

        // Pause when using navigation buttons
        stillsPrev.addEventListener('mouseenter', () => isPaused = true);
        stillsPrev.addEventListener('mouseleave', () => isPaused = false);
        stillsNext.addEventListener('mouseenter', () => isPaused = true);
        stillsNext.addEventListener('mouseleave', () => isPaused = false);

        // Start the loop
        autoScroll();
    }

    // -----------------------------------------------------------
    // 4. Lightbox
    // -----------------------------------------------------------
    // Collect all elements with [data-lightbox]
    const lightboxTriggers = document.querySelectorAll('[data-lightbox]');
    let previouslyFocused = null;

    function openLightbox(src, alt) {
        previouslyFocused = document.activeElement;
        lightboxImg.src = src;
        lightboxImg.alt = alt || '';
        lightbox.classList.add('echo-lightbox--open');
        document.body.style.overflow = 'hidden';
        // Focus the close button for accessibility
        setTimeout(function () {
            lightboxClose.focus();
        }, 100);
    }

    function closeLightbox() {
        lightbox.classList.remove('echo-lightbox--open');
        document.body.style.overflow = '';
        lightboxImg.src = '';
        if (previouslyFocused) {
            previouslyFocused.focus();
        }
    }

    lightboxTriggers.forEach(function (trigger) {
        trigger.addEventListener('click', function () {
            var img = trigger.querySelector('img');
            if (img) {
                openLightbox(img.src, img.alt);
            }
        });

        // Make keyboard accessible
        trigger.setAttribute('tabindex', '0');
        trigger.setAttribute('role', 'button');
        trigger.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                var img = trigger.querySelector('img');
                if (img) {
                    openLightbox(img.src, img.alt);
                }
            }
        });
    });

    // Close lightbox via button
    if (lightboxClose) {
        lightboxClose.addEventListener('click', closeLightbox);
    }

    // Close lightbox on backdrop click
    if (lightbox) {
        lightbox.addEventListener('click', function (e) {
            if (e.target === lightbox) {
                closeLightbox();
            }
        });
    }

    // Close lightbox on Escape key
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && lightbox.classList.contains('echo-lightbox--open')) {
            closeLightbox();
        }
    });

})();
