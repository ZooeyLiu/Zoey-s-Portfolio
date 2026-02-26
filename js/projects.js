document.addEventListener('DOMContentLoaded', () => {
    const projectsData = [
        {
            id: 1,
            title: "Shaman",
            subtitle: "The Call of Alien Civilization",
            category: "Interactive Design / Projection",
            description: "A large-scale interactive projection mapping installation combining TouchDesigner and real-time audio reactivity. Explores themes of extraterrestrial communication.",
            image: "ShamanIMG/cover.png",
            tags: ["TouchDesigner", "Projection", "Interactive"],
            bgColor: "linear-gradient(180deg, rgba(100,20,50,0.4) 0%, rgba(0,0,0,0) 100%)",
            bgPosition: "70% center", // Shifts the image left to center the sphere
            link: "shaman.html"
        },
        {
            id: 2,
            title: "Find the Way Home",
            subtitle: "System Design Archetype",
            category: "Game Dev",
            description: "A systems-heavy UE5 project focusing on inventory management, quest tracking, and non-linear narrative structures.",
            image: "images/截屏2023-08-26-20.47.50.png",
            tags: ["UE5", "C++", "Systems Design"],
            bgColor: "linear-gradient(180deg, rgba(20,50,100,0.4) 0%, rgba(0,0,0,0) 100%)",
            bgPosition: "center 80%", // Shifts the image up to show more of the bottom geometry
            link: "find-the-way-home.html"
        },
        {
            id: 3,
            title: "Deep Space",
            subtitle: "Sci-Fi 3D Animation created in Unreal Engine 5",
            category: "Animation / Unreal Engine / motion capture",
            description: "An exploration of Niagara particle systems and chaos physics in Unreal Engine 5, creating realistic destruction and gravity manipulation effects.",
            image: "images/CG00007970_1-p-800.png",
            tags: ["UE5", "Niagara", "Chaos Physics"],
            bgColor: "linear-gradient(180deg, rgba(20,20,20,0.4) 0%, rgba(0,0,0,0) 100%)",
            bgPosition: "center 10%",
            bgSize: "140%",
            link: "deep-space.html"
        },
        {
            id: 4,
            title: "Into the Unknown",
            subtitle: "First Person Mystery Game",
            category: "Game Demo",
            description: "First Person Mystery Game featuring advanced level design, scene setup, and blueprint development.",
            image: "images/cover-into-the-unknown.png",
            tags: ["Game Design", "Level Design", "Blueprint"],
            bgColor: "linear-gradient(180deg, rgba(80,80,80,0.4) 0%, rgba(0,0,0,0) 100%)",
            link: "into-the-unknown.html"
        },
        {
            id: 5,
            title: "Adventure of Little Blue Dragon",
            subtitle: "Live Action + CGI",
            category: "Animation / CGI",
            description: "Group project combining live action footage with CGI characters. Featured modeling, rigging, and post-production work.",
            image: "images/cv-1.png",
            tags: ["Maya", "CGI", "Live Action"],
            bgColor: "linear-gradient(180deg, rgba(60,20,80,0.4) 0%, rgba(0,0,0,0) 100%)",
            bgPosition: "20% center",
            link: "adventure-of.html"
        },
        {
            id: 6,
            title: "Playdate Demo",
            subtitle: "Handheld Game Dev",
            category: "Game Dev / Lua",
            description: "A game developed for the Playdate console using Lua and the Playdate SDK.",
            image: "images/Playdate/game%20control_2.png",
            tags: ["Lua", "Playdate", "Game Dev"],
            bgColor: "linear-gradient(180deg, rgba(255,200,50,0.2) 0%, rgba(0,0,0,0) 100%)",
            bgPosition: "40% 65%", // Pulled down horizontally a bit to move image right, pulled up vertically to move image up
            link: "playdate-demo.html"
        },
        {
            id: 7,
            title: "Pizza Delivery",
            subtitle: "Fast-paced Simulation Game",
            category: "Game Dev / Simulation",
            description: "Experience the hectic life of a pizza delivery driver! Navigate through busy streets, avoid Zombies, and deliver hot pizzas on time.",
            image: "images/PizzaDeliveryIMG/render.png",
            tags: ["UE5", "Game Dev", "Simulation"],
            bgColor: "linear-gradient(180deg, rgba(235,160,10,0.4) 0%, rgba(0,0,0,0) 100%)",
            link: "pizza-delivery.html"
        },
        {
            id: 8,
            title: "Echo",
            subtitle: "The call of civilization",
            category: "Short Film",
            description: "A derivative short film expanding the Deep Space universe — conceived and produced within 48 hours.",
            image: "images/Echo/3.png",
            tags: ["UE5", "Premiere", "After Effects"],
            bgColor: "linear-gradient(180deg, rgba(30,30,40,0.4) 0%, rgba(0,0,0,0) 100%)",
            link: "echo.html"
        },
        {
            id: 9,
            title: "Other Works",
            subtitle: "Various Projects",
            category: "Miscellaneous",
            description: "A collection of other creative works, experiments, and technical explorations.",
            image: "images/placeholder.png",
            tags: ["Various"],
            bgColor: "linear-gradient(180deg, rgba(50,50,50,0.4) 0%, rgba(0,0,0,0) 100%)",
            link: "content.html"
        }
    ];

    const container = document.querySelector('.cards-container');
    const modal = document.getElementById('project-modal');
    const modalContent = document.querySelector('.modal-content-inject');
    const closeModal = document.querySelector('.modal-close');
    let activeIndex = Math.floor(projectsData.length / 2); // Start middle

    // 1. Render Cards
    function renderCards() {
        container.innerHTML = '';
        projectsData.forEach((project, index) => {
            const card = document.createElement('div');
            card.className = `project-card ${index === activeIndex ? 'active' : ''}`;
            card.dataset.index = index;

            // Background gradient based on project
            const bgPos = project.bgPosition || 'center';
            const bgSize = project.bgSize || 'cover';

            const isVideo = project.image && project.image.endsWith('.mp4');
            const bgStyle = isVideo ? '' : `background-image: url('${project.image}'); background-size: ${bgSize}; background-position: ${bgPos};`;
            const videoElement = isVideo ? `<video class="fan-card-bg-video" autoplay loop muted playsinline src="${project.image}" style="position: absolute; width: 100%; height: 100%; object-fit: cover; border-radius: inherit; z-index: 0; pointer-events: none;"></video>` : '';

            const isPlaydate = project.title === 'Playdate Demo';
            card.innerHTML = `
                <div class="card-inner ${isPlaydate ? 'playdate-inner' : ''}" style="${bgStyle}">
                    ${videoElement}
                    <div class="card-overlay" style="background: ${project.bgColor}; position: absolute; inset: 0; opacity: 0.6; z-index: 1; border-radius: inherit;"></div>
                    <div class="card-content" style="position: relative; z-index: 2;">
                        <span class="category-tag">${project.category}</span>
                        <h3 class="project-title">${project.title}</h3>
                        <p class="punchline">${project.subtitle}</p>
                    </div>
                </div>
            `;

            // Events
            card.addEventListener('click', () => {
                if (index === activeIndex) {
                    openModal(project);
                } else {
                    updateActiveIndex(index);
                }
            });

            card.addEventListener('mouseenter', () => {
                // Optional: hovering non-active cards could peek them
                // For now, we stick to click-to-focus or simple hover effects
            });

            // 3D Tilt Effect
            card.addEventListener('mousemove', (e) => handleTilt(e, card));
            card.addEventListener('mouseleave', () => resetTilt(card));

            container.appendChild(card);
        });
        updateLayout();
    }

    // 2. Layout Logic (Fan Effect)
    function updateLayout() {
        const cards = document.querySelectorAll('.project-card');
        const numCards = cards.length;

        cards.forEach((card, index) => {
            // Circular offset logic
            let offset = index - activeIndex;

            // Normalize offset to be the shortest path around the circle
            if (offset > Math.floor(numCards / 2)) {
                offset -= numCards;
            } else if (offset < -Math.floor(numCards / 2)) {
                offset += numCards;
            }

            const absOffset = Math.abs(offset);

            // Base transformations
            let rotateY = 0;
            let rotateZ = 0;
            let translateX = offset * 130; // Spacing
            let translateZ = -absOffset * 150; // Depth
            let scale = 1 - (absOffset * 0.15);
            let opacity = 1 - (absOffset * 0.1);
            let zIndex = 10 - absOffset;

            if (offset < 0) {
                // Left side
                rotateY = 25; // Turn towards center
                rotateZ = -4;
                translateX = offset * 160 + 40; // Compress slightly
                if (absOffset >= 3) {
                    translateX += (absOffset - 2) * 50; // pull outer cards closer to center
                }
            } else if (offset > 0) {
                // Right side
                rotateY = -25;
                rotateZ = 4;
                translateX = offset * 160 - 40;
                if (absOffset >= 3) {
                    translateX -= (absOffset - 2) * 50; // pull outer cards closer to center
                }
            } else {
                // Center
                scale = 1.1;
                opacity = 1;
                translateZ = 100; // Pop out
            }

            // Apply styles
            card.style.zIndex = zIndex;
            card.style.opacity = Math.max(opacity, 0.4);
            card.style.transform = `
                translateX(${translateX}px) 
                translateZ(${translateZ}px) 
                rotateY(${rotateY}deg) 
                rotateZ(${rotateZ}deg) 
                scale(${scale})
            `;

            // Class updates
            if (index === activeIndex) {
                card.classList.add('active');
            } else {
                card.classList.remove('active');
            }
        });
    }

    function updateActiveIndex(newIndex) {
        activeIndex = newIndex;
        updateLayout();
    }

    // 3. Tilt Handler
    function handleTilt(e, card) {
        if (!card.classList.contains('active')) return;

        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = ((y - centerY) / centerY) * -10; // -10 to 10 deg
        const rotateY = ((x - centerX) / centerX) * 10;

        // Simpler approach: Apply tilt to .card-inner
        const inner = card.querySelector('.card-inner');
        inner.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    }

    function resetTilt(card) {
        const inner = card.querySelector('.card-inner');
        inner.style.transform = `rotateX(0) rotateY(0)`;
    }

    // 4. Modal Logic
    function openModal(project) {
        modalContent.innerHTML = `
            <div class="modal-left">
                <div class="modal-image-gallery">
                     ${project.image && project.image.endsWith('.mp4')
                ? `<video class="modal-video-preview" autoplay loop muted playsinline src="${project.image}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 12px;"></video>`
                : `<div class="modal-img-placeholder" style="background-image: url('${project.image}'); background-size: cover; background-position: center;">
                             ${!project.image || project.image.includes('placeholder') ? 'Image Placeholder' : ''}
                           </div>`
            }
                </div>
            </div>
            <div class="modal-right">
                <div class="modal-tags">
                    ${project.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                </div>
                <h2 class="modal-title">${project.title}</h2>
                <h4 class="modal-subtitle">${project.subtitle}</h4>
                <p class="modal-desc">${project.description}</p>
                <a href="${project.link}" class="view-project-btn">View Detailed Case Study</a>
            </div>
        `;
        modal.classList.add('visible');
    }

    closeModal.addEventListener('click', () => {
        modal.classList.remove('visible');
    });

    // Close on background click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('visible');
        }
    });

    // Keyboard Nav
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowRight') {
            if (activeIndex < projectsData.length - 1) updateActiveIndex(activeIndex + 1);
        } else if (e.key === 'ArrowLeft') {
            if (activeIndex > 0) updateActiveIndex(activeIndex - 1);
        } else if (e.key === 'Escape') {
            modal.classList.remove('visible');
        }
    });

    // Auto Play Logic for Fan Carousel
    let autoPlayInterval;
    const autoPlayDelay = 4000;

    function startAutoPlay() {
        stopAutoPlay();
        autoPlayInterval = setInterval(() => {
            let nextIndex = activeIndex + 1;
            if (nextIndex >= projectsData.length) {
                nextIndex = 0;
            }
            updateActiveIndex(nextIndex);
        }, autoPlayDelay);
    }

    function stopAutoPlay() {
        if (autoPlayInterval) {
            clearInterval(autoPlayInterval);
        }
    }

    // Pause auto play on hover over container
    const sectionContainer = document.getElementById('projects-fan');
    if (sectionContainer) {
        sectionContainer.addEventListener('mouseenter', stopAutoPlay);
        sectionContainer.addEventListener('mouseleave', startAutoPlay);
        sectionContainer.addEventListener('focusin', stopAutoPlay);
        sectionContainer.addEventListener('focusout', startAutoPlay);
    }

    // Navigation Buttons Logic
    const prevBtn = document.querySelector('.projects-nav-btn.prev');
    const nextBtn = document.querySelector('.projects-nav-btn.next');

    if (prevBtn && nextBtn) {
        prevBtn.addEventListener('click', () => {
            let prevIndex = activeIndex - 1;
            if (prevIndex < 0) {
                prevIndex = projectsData.length - 1;
            }
            updateActiveIndex(prevIndex);
        });

        nextBtn.addEventListener('click', () => {
            let nextIndex = activeIndex + 1;
            if (nextIndex >= projectsData.length) {
                nextIndex = 0;
            }
            updateActiveIndex(nextIndex);
        });
    }

    // Init
    if (container) {
        renderCards();
        startAutoPlay();
    }
});
