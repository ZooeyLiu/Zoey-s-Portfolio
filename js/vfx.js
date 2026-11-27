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
    //   poster:  optional full-frame poster for the modal video
    //   hd:      modal video — a local mp4 path, or a YouTube / Vimeo URL
    //            e.g. "https://www.youtube.com/watch?v=XXXXXXXXXXX",
    //                 "https://youtu.be/XXXXXXXXXXX",
    //                 "https://vimeo.com/123456789" (unlisted: ".../123456789/abcdef1234")
    //   breakdown: optional process steps
    //            [{ src, title?, text?, points?: [...], caption? }]
    //            (empty src shows a "Screenshot coming soon" placeholder)
    //   breakdownLabel: optional heading for the steps (default "Breakdown")
    //   chapters: optional [{ time: seconds, label }] — seek buttons under a local HD video
    //   params:   optional [{ name, value, note }] — "Artist controls" list
    // ------------------------------------------------------------------
    const vfxData = [
        {
            title: "Magic Ball",
            category: "Material / Niagara",
            cover: "ShadersVFX/magicball-cover.jpg",      // MB.jpeg cropped so the orb is centred
            preview: "ShadersVFX/magicball-preview.mp4",  // same crop, 640px, muted
            hd: "ShadersVFX/magicball-web.mp4",
            poster: "ShadersVFX/MB.webp",                 // full-frame poster for the modal
            tags: ["UE5", "Material Graph", "Niagara", "Translucency"],
            description: "A crystal orb with a living energy core, built in Unreal Engine 5. The core problem was readability: the shell had to feel like solid, reflective glass at the edges, yet stay clear enough in the centre to show the energy inside. I split it into two independent layers — a lightweight translucent shell material and a multi-emitter Niagara system — so look and motion could be tuned separately.",
            breakdown: [
                {
                    src: "ShadersVFX/MB1.webp",
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
                    src: "ShadersVFX/MB2.webp",
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
        },
        {
            title: "Interactive Snow",
            category: "Material / Shader",
            cover: "ShadersVFX/snow-cover.jpg",
            preview: "ShadersVFX/snow-preview.mp4",
            hd: "ShadersVFX/snow-hd.mp4", // H.264 re-encode of "snow shader_En.mp4" (HEVC doesn't play in every browser)
            tags: ["UE5", "Material Graph", "Deformation", "Real-time"],
            description: "Render-target snow deformation in UE5. Props and characters press into the surface, and trail depth comes from how far the character actually sinks — the same setup gives footprints in shallow snow and a ploughed trench in deep snow. Any mesh using the material picks it up.",
            // Jump points under the HD video (seconds). Local mp4 only.
            chapters: [
                { time: 0, label: "Objects pressing into snow" },
                { time: 20, label: "Character trails at different depths" },
                { time: 46, label: "Reusing the shader on other meshes" }
            ],
            breakdownLabel: "How it works",
            breakdown: [
                {
                    src: "ShadersVFX/SnowDiagrams/01_capture_pipeline.webp",
                    title: "01 — Contact → render target",
                    text: "Each frame the character writes two stamps into a ping-pong RT: the body segment and the latest footprint. The snow material only reads the RT.",
                    points: [
                        "RT instead of a fixed point array — no limit on trail length",
                        "1024² RGBA16F over 10 m ≈ 1 cm per texel; R = depth, G = freshness",
                        "RTs allocate on first contact; idle surfaces update at 5 Hz"
                    ]
                },
                {
                    src: "ShadersVFX/SnowCode/01_stamp_sdf.webp",
                    title: "02 — Stamp shader",
                    text: "Stamps are capsule SDFs, so fast movement leaves no gaps between frames. max() blending means a trail never gets shallower when it's walked over again.",
                    points: [
                        "Footprint stamp narrows at the heel and lifts at the arch",
                        "Noise on the distance breaks up the edge"
                    ]
                },
                {
                    src: "ShadersVFX/SnowDiagrams/02_depth_cross_section.webp",
                    title: "03 — Depth from geometry",
                    text: "Depth = (SurfaceZ − FootZ) × Compression. The snow mesh ignores the Pawn, so the character stands on the real ground and snow thickness decides the trail.",
                    points: [
                        "Raise the snow mesh → deeper trail. No per-level tuning",
                        "Trench strength = smoothstep(8, 25 cm): footprints in shallow snow, a continuous trench in deep snow",
                        "WPO: offset.z = −R · MaxDepthCm + berm · BermHeight, berm = blur(R) − R"
                    ]
                },
                {
                    src: "ShadersVFX/SnowCode/04_normal.webp",
                    title: "04 — Normals from the RT",
                    text: "Normals are rebuilt from the depth RT with central differences, so dents light correctly without a normal map.",
                    points: [
                        "2.5-texel sample offset removes per-texel stripes",
                        "Gradient is soft-clamped to soften steep trench walls"
                    ]
                }
            ],
            params: [
                { name: "MaxDepthCm", value: "40 cm", note: "Deepest press; maps RT depth to world units" },
                { name: "Compression", value: "0.85", note: "Share of snow thickness that gets packed down" },
                { name: "ShallowDepthCm / DeepDepthCm", value: "8 / 25 cm", note: "Blend range from footprints to trench" },
                { name: "BermHeight", note: "Height of the pushed-up rim" },
                { name: "RefillSeconds / FreshSeconds", note: "How fast trails fill back in and lose the fresh look" }
            ]
        },
        {
            title: "Portal",
            category: "Niagara Fluids",
            cover: "ShadersVFX/portal-cover.jpg",
            preview: "ShadersVFX/portal-preview.mp4",
            hd: "ShadersVFX/portal-hd.mp4", // H.264 re-encode of portal.mp4 (HEVC)
            tags: ["UE5", "Niagara", "Niagara Fluids", "3D Gas Sim"],
            description: "A smoke portal driven by a real-time 3D gas simulation. The smoke is sourced by particles that are never rendered; a separate sprite layer draws the glowing ring.",
            breakdown: [
                {
                    src: "ShadersVFX/PortalTechDetail.webp",
                    title: "NS_Portal — two torus emitters, one gas grid",
                    text: "Both particle emitters spawn on the same torus with vortex motion, but split the work: one is what you see, the other only feeds the fluid sim.",
                    points: [
                        "particle_glowing — visible sparks with vortex + curl noise; fluid sourcing off, so they don't disturb the smoke",
                        "emitter_particles — renderer off; Set Fluid Source Attributes splats them into the grid as smoke sources",
                        "Grid3D gas — pressure solve and scalar advection shape the smoke; scatter blur fakes light scattering; drawn with the Volume Renderer"
                    ]
                }
            ]
        },
        {
            title: "Shockwave",
            category: "Niagara",
            cover: "ShadersVFX/shockwave-cover.jpg",
            preview: "ShadersVFX/shockwave-preview.mp4",
            hd: "ShadersVFX/shockwave-hd.mp4", // H.264 re-encode of shockwave.mp4 (HEVC)
            tags: ["UE5", "Niagara", "Flipbook", "One-shot"],
            description: "A one-shot energy burst. Four emitters fire on the same frame from the same ring, each adding one layer: smoke rings, radial streaks and lit sparks.",
            breakdown: [
                {
                    src: "ShadersVFX/ShockWaveTechDetail.webp",
                    title: "NS_ShockWave — four layers, one burst",
                    text: "Every emitter is a single instantaneous burst from a ring/disc shape, so all layers start from the same silhouette and stay in sync.",
                    points: [
                        "EnergyBrust + EnergyBrust_Wider — flipbook smoke rings at two radii (Sub UV, rotation, curl noise)",
                        "BrustLines — radial streaks that sell the initial speed",
                        "Sparks — CPU sim so it can use the Light Renderer; collision on",
                        "Point Attraction + Drag pull the expansion back, so the ring holds its shape before fading"
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
    vfxData.forEach((item, i) => {
        const tile = document.createElement('button');
        tile.type = 'button';
        tile.className = 'vfx-tile';
        tile.style.setProperty('--i', i); // stagger index for the reveal
        tile.setAttribute('aria-label', `Open ${item.title} — ${item.category}`);
        tile.innerHTML = `
            <img class="vfx-cover" src="${item.cover}" alt="" loading="lazy">
            <video class="vfx-preview" muted loop playsinline preload="none"
                data-src="${item.preview}" data-poster="${item.cover}"></video>
            <div class="vfx-shade"></div>
            <div class="vfx-meta">
                <h3 class="vfx-title">${item.title}<span class="vfx-arrow" aria-hidden="true">&rarr;</span></h3>
            </div>
        `;
        tile.querySelector('.vfx-preview').muted = true; // property too, for iOS autoplay

        if (canHover) {
            tile.addEventListener('mouseenter', () => playPreview(tile));
            tile.addEventListener('mouseleave', () => stopPreview(tile, true));
            // Cursor-following spotlight (read by .vfx-tile::after)
            tile.addEventListener('pointermove', (e) => {
                const r = tile.getBoundingClientRect();
                tile.style.setProperty('--mx', `${e.clientX - r.left}px`);
                tile.style.setProperty('--my', `${e.clientY - r.top}px`);
            });
        }

        tile.addEventListener('click', () => openModal(item));
        grid.appendChild(tile);
    });

    // Staggered fade-up the first time the grid scrolls into view
    if ('IntersectionObserver' in window) {
        grid.classList.add('will-reveal');
        const revealIo = new IntersectionObserver((entries) => {
            if (entries.some(e => e.isIntersecting)) {
                grid.classList.add('is-revealed');
                revealIo.disconnect();
            }
        }, { threshold: 0.15 });
        revealIo.observe(grid);
    }

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
        if (item.poster) video.poster = item.poster; // covers are cropped for the grid, so no fallback
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

    // Chapter buttons under a local HD video: click to seek, highlight current
    function createChapters(video, chapters) {
        const fmt = s => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
        const nav = document.createElement('div');
        nav.className = 'vfx-chapters';
        nav.setAttribute('role', 'group');
        nav.setAttribute('aria-label', 'Video chapters');
        nav.innerHTML = chapters.map((c, i) => `
            <button type="button" class="vfx-chapter${i === 0 ? ' is-active' : ''}" data-time="${c.time}">
                <span class="vfx-chapter-time">${fmt(c.time)}</span>
                <span class="vfx-chapter-label">${c.label}</span>
            </button>`).join('');

        const buttons = [...nav.querySelectorAll('.vfx-chapter')];
        buttons.forEach(btn => btn.addEventListener('click', () => {
            video.currentTime = Number(btn.dataset.time);
            video.play().catch(() => {});
        }));
        video.addEventListener('timeupdate', () => {
            let current = 0;
            chapters.forEach((c, i) => { if (video.currentTime >= c.time) current = i; });
            buttons.forEach((btn, i) => btn.classList.toggle('is-active', i === current));
        });
        return nav;
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
                <h5 class="vfx-breakdown-label">${item.breakdownLabel || 'Breakdown'}</h5>
                ${item.breakdown.map(b => `
                    <figure${b.title || b.text ? ' class="vfx-step"' : ''}>
                        ${b.title ? `<h3 class="vfx-step-title">${b.title}</h3>` : ''}
                        ${b.text ? `<p class="vfx-step-text">${b.text}</p>` : ''}
                        ${b.src
                            ? `<img src="${b.src}" alt="${b.title || b.caption || ''}" loading="lazy">`
                            : `<div class="vfx-step-placeholder">Screenshot coming soon</div>`}
                        ${b.points && b.points.length ? `<ul class="vfx-step-points">${b.points.map(p => `<li>${p}</li>`).join('')}</ul>` : ''}
                        ${b.caption ? `<figcaption>${b.caption}</figcaption>` : ''}
                    </figure>`).join('')}
            </div>` : ''}
            ${item.params && item.params.length ? `
            <div class="vfx-params">
                <h5 class="vfx-breakdown-label">Artist controls</h5>
                <dl>
                    ${item.params.map(p => `
                        <div class="vfx-param">
                            <dt><code>${p.name}</code>${p.value ? `<span class="vfx-param-value">${p.value}</span>` : ''}</dt>
                            <dd>${p.note || ''}</dd>
                        </div>`).join('')}
                </dl>
            </div>` : ''}
        `;
        const player = createHdPlayer(item);
        modalBody.prepend(player);
        if (player.tagName === 'VIDEO' && item.chapters && item.chapters.length) {
            player.after(createChapters(player, item.chapters));
        }

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
