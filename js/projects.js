document.addEventListener('DOMContentLoaded', () => {
    const projectsData = [
        {
            id: 1,
            title: "Shaman",
            subtitle: "The Call of Alien Civilization",
            category: "Interactive Design / Projection",
            description: "A large-scale interactive projection mapping installation combining TouchDesigner and real-time audio reactivity. Explores themes of extraterrestrial communication.",
            image: "images/截屏2023-09-18-14.10.10.png",
            tags: ["TouchDesigner", "Projection", "Interactive"],
            bgColor: "linear-gradient(180deg, rgba(100,20,50,0.4) 0%, rgba(0,0,0,0) 100%)",
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
            link: "find-the-way-home.html"
        },
        {
            id: 3,
            title: "Deep Spacey",
            subtitle: "Sci-Fi 3D Animation created in Unreal Engine 5",
            category: "Animation / Unreal Engine / motion capture",
            description: "An exploration of Niagara particle systems and chaos physics in Unreal Engine 5, creating realistic destruction and gravity manipulation effects.",
            image: "images/CG00008361.png",
            tags: ["UE5", "Niagara", "Chaos Physics"],
            bgColor: "linear-gradient(180deg, rgba(50,100,20,0.4) 0%, rgba(0,0,0,0) 100%)",
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
            link: "playdate-demo.html"
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
            // We use the image as the background for the card
            const bgStyle = `background-image: url('${project.image}'); background-size: cover; background-position: center;`;

            // Updated HTML to include image background on the card itself or inner
            card.innerHTML = `
                <div class="card-inner" style="${bgStyle}">
                    <div class="card-overlay" style="background: ${project.bgColor}; position: absolute; inset: 0; opacity: 0.6;"></div>
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
        cards.forEach((card, index) => {
            const offset = index - activeIndex;
            const absOffset = Math.abs(offset);

            // Base transformations
            let rotateY = 0;
            let rotateZ = 0;
            let translateX = offset * 140; // Spacing
            let translateZ = -absOffset * 150; // Depth
            let scale = 1 - (absOffset * 0.15);
            let opacity = 1 - (absOffset * 0.3);
            let zIndex = 10 - absOffset;

            if (offset < 0) {
                // Left side
                rotateY = 30; // Turn towards center
                rotateZ = -5;
                translateX = offset * 180 + 50; // Compress slightly
            } else if (offset > 0) {
                // Right side
                rotateY = -30;
                rotateZ = 5;
                translateX = offset * 180 - 50;
            } else {
                // Center
                scale = 1.1;
                opacity = 1;
                translateZ = 100; // Pop out
            }

            // Apply styles
            card.style.zIndex = zIndex;
            card.style.opacity = Math.max(opacity, 0.2);
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
                     <div class="modal-img-placeholder" style="background-image: url('${project.image}'); background-size: cover; background-position: center;">
                        ${!project.image || project.image.includes('placeholder') ? 'Image Placeholder' : ''}
                     </div>
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

    // Init
    if (container) {
        renderCards();
    }
});
