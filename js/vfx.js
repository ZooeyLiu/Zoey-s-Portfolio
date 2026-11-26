// Shader & VFX grid
// - Tiles show a lazy-loaded cover image; the preview <video> (muted, looping,
//   preload="none") only gets its src/poster the first time it needs to play.
// - Desktop (real hover): play on hover, pause + rewind on leave.
// - Touch (no hover): IntersectionObserver plays tiles in view, pauses the rest.
// - Click opens a modal whose HD player (local mp4, YouTube or Vimeo) is created
//   on open and destroyed on close.
document.addEventListener('DOMContentLoaded', () => {
    // ------------------------------------------------------------------
    // DATA — to add a piece: put the files in ShadersVFX/ and add an entry.
    //   cover:   poster image shown in the grid (png/jpg/webp)
    //   preview: short muted loop for the grid (mp4, ideally small, no audio)
    //   hd:      modal video — a local mp4 path, or a YouTube / Vimeo URL
    //            e.g. "https://www.youtube.com/watch?v=XXXXXXXXXXX",
    //                 "https://youtu.be/XXXXXXXXXXX",
    //                 "https://vimeo.com/123456789" (unlisted: ".../123456789/abcdef1234")
    //   breakdown: optional [{ src, caption }]
    // ------------------------------------------------------------------
    const vfxData = [
        {
            title: "Magic Ball",
            category: "Shader / VFX",
            cover: "ShadersVFX/magicball.png",
            preview: "ShadersVFX/magicball.mp4",
            hd: "ShadersVFX/magicball.mp4",
            tags: ["Shader", "Particles"], // placeholder
            description: "Placeholder — glass orb with refraction and an inner swirling particle core.",
            breakdown: []
        }
    ];

    const grid = document.querySelector('.vfx-grid');
    const modal = document.getElementById('vfx-modal');
    if (!grid || !modal) return;

    const modalBody = modal.querySelector('.vfx-modal-body');
    const modalContent = modal.querySelector('.vfx-modal-content');
    const closeBtn = modal.querySelector('.modal-close');
    const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

    let modalOpen = false;
    const visibleTiles = new Set(); // touch only: tiles currently in view

    // ---------------- Preview playback ----------------
    function loadPreview(video) {
        if (video.getAttribute('src')) return;
        video.poster = video.dataset.poster;
        video.src = video.dataset.src;
    }

    function playPreview(tile) {
        if (modalOpen) return;
        const video = tile.querySelector('.vfx-preview');
        tile.dataset.wantPlay = '1';
        loadPreview(video);
        video.play().then(() => {
            // play() resolves async — bail out if we were stopped meanwhile
            if (tile.dataset.wantPlay === '1' && !modalOpen) {
                tile.classList.add('is-playing');
            } else {
                video.pause();
            }
        }).catch(() => {});
    }

    function stopPreview(tile, rewind) {
        const video = tile.querySelector('.vfx-preview');
        tile.dataset.wantPlay = '0';
        tile.classList.remove('is-playing');
        video.pause();
        if (rewind && video.getAttribute('src')) video.currentTime = 0;
    }

    function stopAllPreviews() {
        grid.querySelectorAll('.vfx-tile').forEach(tile => stopPreview(tile, false));
    }

    // ---------------- Render tiles ----------------
    vfxData.forEach((item) => {
        const tile = document.createElement('button');
        tile.type = 'button';
        tile.className = 'vfx-tile';
        tile.setAttribute('aria-label', `Open ${item.title}`);
        tile.innerHTML = `
            <img class="vfx-cover" src="${item.cover}" alt="" loading="lazy">
            <video class="vfx-preview" muted loop playsinline preload="none"
                data-src="${item.preview}" data-poster="${item.cover}"></video>
            <div class="vfx-shade"></div>
            <div class="vfx-meta">
                <span class="category-tag">${item.category}</span>
                <h3 class="vfx-title">${item.title}</h3>
            </div>
        `;
        tile.querySelector('.vfx-preview').muted = true; // property too, for iOS autoplay

        if (canHover) {
            tile.addEventListener('mouseenter', () => playPreview(tile));
            tile.addEventListener('mouseleave', () => stopPreview(tile, true));
        }

        tile.addEventListener('click', () => openModal(item));
        grid.appendChild(tile);
    });

    // Touch devices: autoplay while on screen
    if (!canHover && 'IntersectionObserver' in window) {
        const io = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    visibleTiles.add(entry.target);
                    playPreview(entry.target);
                } else {
                    visibleTiles.delete(entry.target);
                    stopPreview(entry.target, false);
                }
            });
        }, { threshold: 0.5 });
        grid.querySelectorAll('.vfx-tile').forEach(tile => io.observe(tile));
    }

    // ---------------- HD source parsing ----------------
    function parseHd(url) {
        const yt = url.match(/(?:youtube(?:-nocookie)?\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/)|youtu\.be\/)([\w-]{11})/);
        if (yt) {
            return {
                type: 'embed',
                src: `https://www.youtube-nocookie.com/embed/${yt[1]}?autoplay=1&rel=0&playsinline=1`
            };
        }
        const vm = url.match(/vimeo\.com\/(?:video\/)?(\d+)(?:\/([0-9a-f]+))?/);
        if (vm) {
            const hash = vm[2] || (url.match(/[?&]h=([0-9a-f]+)/) || [])[1];
            return {
                type: 'embed',
                src: `https://player.vimeo.com/video/${vm[1]}?autoplay=1${hash ? `&h=${hash}` : ''}`
            };
        }
        return { type: 'file', src: url };
    }

    function createHdPlayer(item) {
        const hd = parseHd(item.hd);
        if (hd.type === 'embed') {
            const wrap = document.createElement('div');
            wrap.className = 'vfx-embed vfx-hd';
            const iframe = document.createElement('iframe');
            iframe.src = hd.src;
            iframe.title = item.title;
            iframe.allow = 'autoplay; fullscreen; picture-in-picture; encrypted-media';
            iframe.allowFullscreen = true;
            wrap.appendChild(iframe);
            return wrap;
        }
        const video = document.createElement('video');
        video.className = 'vfx-modal-video vfx-hd';
        video.controls = true;
        video.loop = true;
        video.playsInline = true;
        video.poster = item.cover;
        video.src = hd.src;
        // Click is a user gesture so sound is usually allowed; fall back to muted
        video.play().catch(() => { video.muted = true; video.play().catch(() => {}); });
        return video;
    }

    function destroyHdPlayer() {
        const player = modalBody.querySelector('.vfx-hd');
        if (!player) return;
        // Same-size black block so the modal doesn't jump while fading out
        const spacer = document.createElement('div');
        spacer.style.cssText = `height:${player.offsetHeight}px;border-radius:12px;background:#000;`;
        if (player.tagName === 'VIDEO') {
            player.pause();
            player.removeAttribute('src');
            player.load(); // aborts the download
        } else {
            const iframe = player.querySelector('iframe');
            if (iframe) iframe.src = 'about:blank';
        }
        player.replaceWith(spacer);
    }

    // ---------------- Modal ----------------
    let lastFocus = null;

    function openModal(item) {
        lastFocus = document.activeElement;
        modalOpen = true;
        stopAllPreviews();

        modalBody.innerHTML = `
            <div class="vfx-modal-info">
                <div class="modal-tags">
                    ${(item.tags || []).map(tag => `<span class="tag">${tag}</span>`).join('')}
                </div>
                <h2 class="modal-title">${item.title}</h2>
                <h4 class="modal-subtitle">${item.category}</h4>
                <p class="modal-desc">${item.description || ''}</p>
            </div>
            ${item.breakdown && item.breakdown.length ? `
            <div class="vfx-breakdown">
                <h5 class="vfx-breakdown-label">Breakdown</h5>
                ${item.breakdown.map(b => `
                    <figure>
                        <img src="${b.src}" alt="${b.caption || ''}" loading="lazy">
                        ${b.caption ? `<figcaption>${b.caption}</figcaption>` : ''}
                    </figure>`).join('')}
            </div>` : ''}
        `;
        modalBody.prepend(createHdPlayer(item));

        modal.classList.add('visible');
        modal.setAttribute('aria-hidden', 'false');
        document.documentElement.style.overflow = 'hidden';
        document.body.style.overflow = 'hidden';
        modalContent.scrollTop = 0;
        closeBtn.focus();
    }

    function closeModal() {
        if (!modalOpen) return;
        modalOpen = false;
        destroyHdPlayer();

        modal.classList.remove('visible');
        modal.setAttribute('aria-hidden', 'true');
        document.documentElement.style.overflow = '';
        document.body.style.overflow = '';
        setTimeout(() => { if (!modalOpen) modalBody.innerHTML = ''; }, 400);

        // Touch: resume previews that are still on screen
        visibleTiles.forEach(tile => playPreview(tile));
        if (lastFocus) lastFocus.focus();
    }

    closeBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });
});
