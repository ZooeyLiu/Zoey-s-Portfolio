/**
 * Riot-style Games Carousel Logic
 * Handles dynamic card generation and infinite sliding
 */

document.addEventListener('DOMContentLoaded', () => {
    // Project Data (Shared/Duplicated from projects.js for reliability)
    const riotProjects = [
        {
            title: "Shaman",
            category: "Projection Mapping",
            image: "images/截屏2023-09-18-14.10.10.png",
            link: "shaman.html",
            platforms: ['ue5', 'python']
        },
        {
            title: "Find Way Home",
            category: "Game Dev / Systems",
            image: "images/截屏2023-08-26-20.47.50.png",
            link: "find-the-way-home.html",
            platforms: ['ue5', 'cpp']
        },
        {
            title: "Deep Space",
            category: "3D Animation",
            image: "images/CG00008361.png",
            link: "deep-space.html",
            platforms: ['ue5', 'maya']
        },
        {
            title: "Into Unknown",
            category: "Mystery Game",
            image: "images/cover-into-the-unknown.png",
            link: "into-the-unknown.html",
            platforms: ['ue5', 'blueprint']
        },
        {
            title: "Blue Dragon",
            category: "CGI Animation",
            image: "images/cv-1.png",
            link: "adventure-of.html",
            platforms: ['maya', 'cgi']
        },
        {
            title: "Playdate",
            category: "Handheld Game",
            image: "images/Playdate/game%20control_2.png",
            link: "playdate-demo.html",
            platforms: ['lua', 'sdk']
        },
        {
            title: "Pizza Delivery",
            category: "Game Dev / Simulation",
            image: "images/PizzaDeliveryIMG/render.png",
            link: "pizza-delivery.html",
            platforms: ['ue5', 'cpp']
        },
        {
            title: "Echo",
            category: "Short Film",
            image: "images/Echo/3.png",
            link: "echo.html",
            platforms: ['ue5', 'maya'] // Assuming UE5 based on 3D text
        }
    ];

    const carousel = document.querySelector('.riot-carousel-container');
    if (!carousel) return;

    // Platform Icon SVGs
    const iconSVGs = {
        ue5: '<path d="M8 0a8 8 0 1 0 8 8 8 8 0 0 0-8-8zm0 14.5a6.5 6.5 0 1 1 6.5-6.5 6.5 6.5 0 0 1-6.5 6.5zM8 4a4 4 0 1 0 4 4 4 4 0 0 0-4-4z"/>',
        cpp: '<path d="M4 11h2v3H4v-3zm0-8h2v7H4V3zm10 8h-2v3h2v-3zm0-8h-2v7h2V3z"/>',
        maya: '<path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>',
        python: '<path d="M10 2a2 2 0 0 0-2 2v2H4a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h4v-2H4V8h6v2h2V8a2 2 0 0 0-2-2h-2V4a2 2 0 0 0-2-2z"/>',
        lua: '<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>',
        default: '<path d="M12 2L2 19.77h20L12 2zm0 3.5l6.36 11.27H5.64L12 5.5z"/>'
    };

    function createRiotCard(project, index) {
        const card = document.createElement('div');
        card.className = 'riot-card';
        card.dataset.index = index;
        card.tabIndex = 0;
        card.onclick = (e) => {
            e.stopPropagation();
            // If it's already active, go to link. Otherwise, bring it to center.
            if (card.classList.contains('active')) {
                window.location.href = project.link;
            } else {
                updateCarousel(index);
            }
        };
        card.onkeydown = (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                if (card.classList.contains('active')) {
                    window.location.href = project.link;
                } else {
                    updateCarousel(index);
                }
            }
        };

        const platforms = project.platforms.map(p => `
            <svg class="platform-icon" viewBox="0 0 24 24">
                ${iconSVGs[p] || iconSVGs.default}
            </svg>
        `).join('');

        const isVideo = project.image && project.image.endsWith('.mp4');
        const bgElement = isVideo
            ? `<video class="riot-card-bg-video" autoplay loop muted playsinline src="${project.image}"></video>`
            : `<div class="riot-card-inner ${isPlaydate ? 'playdate-inner' : ''}" style="background-image: url('${project.image}')">`;

        card.innerHTML = `
            ${isVideo ? `<div class="riot-card-inner">` : bgElement}
                ${isVideo ? bgElement : ''}
                <div class="riot-card-overlay"></div>
                <div class="riot-card-content">
                    <div class="riot-card-category">${project.category}</div>
                    <h3 class="riot-card-title">${project.title}</h3>
                    <div class="riot-platform-icons">${platforms}</div>
                </div>
            </div>
        `;
        return card;
    }

    // Populate carousel (triple for infinite effect: prepended, original, appended)
    const baseCount = riotProjects.length;
    let allItems = [];

    // We clone elements to ensure seamless sliding
    // 0 to baseCount-1: prepended
    // baseCount to 2*baseCount-1: original center
    // 2*baseCount to 3*baseCount-1: appended

    for (let i = 0; i < 3; i++) {
        riotProjects.forEach(proj => {
            allItems.push(proj);
        });
    }

    allItems.forEach((proj, i) => {
        carousel.appendChild(createRiotCard(proj, i));
    });

    // Carousel Logic
    let activeIndex = baseCount + Math.floor(baseCount / 2); // Start at the middle of the original set
    const cardWidth = 320;
    const activeCardWidth = 440;
    const gap = 15;

    let isTransitioning = false;

    // We must ensure the container has a transition now
    carousel.style.transition = 'transform 0.5s cubic-bezier(0.25, 1, 0.5, 1)';

    function updateCarousel(newIndex, smooth = true) {
        if (isTransitioning && smooth) return;

        activeIndex = newIndex;

        // Update classes
        const cards = Array.from(carousel.children);
        cards.forEach((card, i) => {
            if (i === activeIndex) {
                card.classList.add('active');
            } else {
                card.classList.remove('active');
            }
        });

        // Calculate translation
        // The container holds all cards. We want the activeIndex card to be perfectly centered in the wrapper.
        // We know standard cards are `cardWidth`, and the active is `activeCardWidth`.

        let tx = 0;

        // Width of all cards before the active one
        for (let i = 0; i < activeIndex; i++) {
            tx += cardWidth + gap;
        }

        // Add half the active card width to get to its center
        tx += activeCardWidth / 2;

        // The wrapper width helps us center. We need to shift the carousel back by `tx`, 
        // and then forward by half the wrapper's width.
        const wrapperWidth = document.querySelector('.riot-carousel-outer').getBoundingClientRect().width;

        const finalTransform = -tx + (wrapperWidth / 2);

        if (smooth) {
            carousel.style.transition = 'transform 0.5s cubic-bezier(0.25, 1, 0.5, 1)';
            isTransitioning = true;

            // Handle infinite wrap after transition
            carousel.addEventListener('transitionend', handleTransitionEnd, { once: true });
        } else {
            carousel.style.transition = 'none';
        }

        carousel.style.transform = `translateX(${finalTransform}px)`;
    }

    function handleTransitionEnd() {
        isTransitioning = false;

        // If we moved into the "prepended" clone set, jump forward to original
        if (activeIndex < baseCount) {
            updateCarousel(activeIndex + baseCount, false);
        }
        // If we moved into the "appended" clone set, jump backward to original
        else if (activeIndex >= baseCount * 2) {
            updateCarousel(activeIndex - baseCount, false);
        }
    }

    // Initial render
    updateCarousel(activeIndex, false);

    // Auto-play logic
    let autoPlayInterval;
    const autoPlayDelay = 4000; // 4 seconds between slides

    function startAutoPlay() {
        stopAutoPlay(); // ensure no duplicates
        autoPlayInterval = setInterval(() => {
            updateCarousel(activeIndex + 1);
        }, autoPlayDelay);
    }

    function stopAutoPlay() {
        if (autoPlayInterval) {
            clearInterval(autoPlayInterval);
        }
    }

    // Start auto-play initially
    startAutoPlay();

    // Pause auto-play on hover or focus
    carousel.addEventListener('mouseenter', stopAutoPlay);
    carousel.addEventListener('mouseleave', startAutoPlay);
    carousel.addEventListener('focusin', stopAutoPlay);
    carousel.addEventListener('focusout', startAutoPlay);

    // Initial wrapper width dependency needs a handle on resize
    window.addEventListener('resize', () => {
        updateCarousel(activeIndex, false);
    });

    // Navigation Buttons
    const prevBtn = document.querySelector('.riot-nav-btn.prev');
    const nextBtn = document.querySelector('.riot-nav-btn.next');

    if (prevBtn && nextBtn) {
        // Pause auto-play when interacting with buttons too
        prevBtn.addEventListener('mouseenter', stopAutoPlay);
        prevBtn.addEventListener('mouseleave', startAutoPlay);
        nextBtn.addEventListener('mouseenter', stopAutoPlay);
        nextBtn.addEventListener('mouseleave', startAutoPlay);

        prevBtn.onclick = () => {
            updateCarousel(activeIndex - 1);
        };

        nextBtn.onclick = () => {
            updateCarousel(activeIndex + 1);
        };
    }
});
