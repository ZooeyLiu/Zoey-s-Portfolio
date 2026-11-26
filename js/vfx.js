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
    //   breakdown: optional process steps
    //            [{ src, title?, text?, points?: [...], caption? }]
    // ------------------------------------------------------------------
    const vfxData = [
        {
            title: "Magic Ball",
            category: "Material / Niagara",
            cover: "ShadersVFX/MB.jpeg",
            preview: "ShadersVFX/magicball.mp4",
            hd: "ShadersVFX/magicball.mp4",
            tags: ["UE5", "Material Graph", "Niagara", "Translucency"],
            description: "A crystal orb with a living energy core, built in Unreal Engine 5. The core problem was readability: the shell had to feel like solid, reflective glass at the edges, yet stay clear enough in the centre to show the energy inside. I split it into two independent layers — a lightweight translucent shell material and a multi-emitter Niagara system — so look and motion could be tuned separately.",
            breakdown: [
                {
                    src: "ShadersVFX/MB1.png",
                    title: "01 — Shell material: faked reflections, Fresnel-driven opacity",
                    text: "Translucent surfaces in UE don't get reliable screen-space reflections, so the reflection is faked: a Reflection Vector samples an HDRI environment map and goes into Emissive. One Fresnel term does double duty — it scales the reflection and drives Opacity — so the rim reads as dense, reflective glass while the centre stays almost fully transparent.",
                    points: [
                        "Environment map divided by 5 to tame HDR values, so reflections never overpower the purple core",
                        "Fresnel exponent 2.0 for a wide, soft rim; a Power node after it exposes the falloff as one tweakable value",
                        "Near-black purple Base Color tints the glass without competing with the emissive particles",
                        "Refraction left off — a handful of instructions instead of an expensive translucency setup"
                    ]
                },
                {
                    src: "ShadersVFX/MB2.png",
                    title: "02 — Niagara: five emitters, one contained volume",
                    text: "NS_MagicBall layers five emitters, each owning a single visual job. A one-shot Minimal emitter renders the orb as a mesh particle, keeping shell and effect in one system asset. The moving sprite layers are clamped with Kill Particles in Volume (Sphere), so nothing ever escapes the glass.",
                    points: [
                        "Fountain — torus-shaped spawn with outward velocity and curl noise: the swirling band around the core",
                        "Fountain003 — sphere-volume spawn for the fine dust that fills the orb",
                        "Fountain001 — initial velocity disabled; motion comes purely from curl noise, giving the drifting energy filaments",
                        "Fountain002 — no noise, no kill volume: a calm glow that anchors the centre",
                        "Scale Sprite Size by Speed stretches fast particles into streaks, so motion reads even in a still frame"
                    ]
                }
            ]
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
                    <figure${b.title || b.text ? ' class="vfx-step"' : ''}>
                        ${b.title ? `<h3 class="vfx-step-title">${b.title}</h3>` : ''}
                        ${b.text ? `<p class="vfx-step-text">${b.text}</p>` : ''}
                        ${b.points && b.points.length ? `<ul class="vfx-step-points">${b.points.map(p => `<li>${p}</li>`).join('')}</ul>` : ''}
                        <img src="${b.src}" alt="${b.title || b.caption || ''}" loading="lazy">
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
