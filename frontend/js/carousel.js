/**
 * Dron-AI Tactile Metallic Carousel & Mechanical Scroll Controller
 * Pure vanilla JavaScript module for smooth tactile slider behavior,
 * scroll-snap pagination, drag-to-scroll, and mechanical scroll-reveal effects.
 */

document.addEventListener('DOMContentLoaded', () => {
    initMetallicCarousels();
    initMechanicalScrollReveals();
    initSmoothScrollAndActiveNav();
    initBackToTopButton();
});

function initMetallicCarousels() {
    const wrappers = document.querySelectorAll('.metallic-carousel-wrapper');
    
    wrappers.forEach((wrapper) => {
        const track = wrapper.querySelector('.metallic-carousel-track');
        const prevBtn = wrapper.querySelector('.carousel-prev');
        const nextBtn = wrapper.querySelector('.carousel-next');
        const pagination = wrapper.querySelector('.carousel-pagination');
        
        if (!track) return;
        
        const slides = track.querySelectorAll('.metallic-carousel-slide');
        if (slides.length === 0) return;

        // Build pagination dots
        if (pagination) {
            pagination.innerHTML = '';
            slides.forEach((_, index) => {
                const dot = document.createElement('button');
                dot.className = `carousel-dot ${index === 0 ? 'active' : ''}`;
                dot.setAttribute('aria-label', `Go to slide ${index + 1}`);
                dot.setAttribute('data-slide-index', index);
                dot.addEventListener('click', () => {
                    const slideWidth = slides[0].offsetWidth + 24;
                    track.scrollTo({ left: slideWidth * index, behavior: 'smooth' });
                });
                pagination.appendChild(dot);
            });
        }

        // Prev & Next Buttons
        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                const slideWidth = slides[0].offsetWidth + 24;
                track.scrollBy({ left: -slideWidth, behavior: 'smooth' });
            });
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                const slideWidth = slides[0].offsetWidth + 24;
                track.scrollBy({ left: slideWidth, behavior: 'smooth' });
            });
        }

        // Drag-to-Scroll support (Touch / Mouse)
        let isDown = false;
        let startX, scrollLeftPos;

        track.addEventListener('mousedown', (e) => {
            isDown = true;
            track.classList.add('is-dragging');
            startX = e.pageX - track.offsetLeft;
            scrollLeftPos = track.scrollLeft;
        });

        track.addEventListener('mouseleave', () => {
            isDown = false;
            track.classList.remove('is-dragging');
        });

        track.addEventListener('mouseup', () => {
            isDown = false;
            track.classList.remove('is-dragging');
        });

        track.addEventListener('mousemove', (e) => {
            if (!isDown) return;
            e.preventDefault();
            const x = e.pageX - track.offsetLeft;
            const walk = (x - startX) * 1.5;
            track.scrollLeft = scrollLeftPos - walk;
        });

        // Active Dot Tracking on Scroll
        track.addEventListener('scroll', () => {
            if (!pagination) return;
            const dots = pagination.querySelectorAll('.carousel-dot');
            const scrollLeft = track.scrollLeft;
            const slideWidth = slides[0].offsetWidth + 24;
            const activeIndex = Math.min(slides.length - 1, Math.max(0, Math.round(scrollLeft / slideWidth)));
            
            dots.forEach((dot, idx) => {
                dot.classList.toggle('active', idx === activeIndex);
            });
        }, { passive: true });

        // Auto-play (pauses on hover)
        let autoPlayTimer = null;
        const startAutoPlay = () => {
            if (autoPlayTimer) clearInterval(autoPlayTimer);
            autoPlayTimer = setInterval(() => {
                const slideWidth = slides[0].offsetWidth + 24;
                const maxScroll = track.scrollWidth - track.clientWidth;
                if (track.scrollLeft >= maxScroll - 10) {
                    track.scrollTo({ left: 0, behavior: 'smooth' });
                } else {
                    track.scrollBy({ left: slideWidth, behavior: 'smooth' });
                }
            }, 5000);
        };

        const stopAutoPlay = () => {
            if (autoPlayTimer) clearInterval(autoPlayTimer);
        };

        wrapper.addEventListener('mouseenter', stopAutoPlay);
        wrapper.addEventListener('mouseleave', startAutoPlay);
        wrapper.addEventListener('touchstart', stopAutoPlay, { passive: true });
        
        startAutoPlay();
    });
}

function initMechanicalScrollReveals() {
    const revealItems = document.querySelectorAll('.scroll-reveal-item, .fade-in-element');
    if (revealItems.length === 0) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-revealed');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.08,
        rootMargin: '0px 0px -40px 0px'
    });

    revealItems.forEach((item) => observer.observe(item));
}

function initSmoothScrollAndActiveNav() {
    const navLinks = document.querySelectorAll('.landing-nav-link, .nav-link');
    const sections = document.querySelectorAll('section[id], header[id]');

    if (sections.length > 0 && navLinks.length > 0) {
        window.addEventListener('scroll', () => {
            let current = '';
            const scrollY = window.pageYOffset;

            sections.forEach(section => {
                const sectionTop = section.offsetTop - 120;
                const sectionHeight = section.offsetHeight;
                if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
                    current = section.getAttribute('id');
                }
            });

            navLinks.forEach(link => {
                const href = link.getAttribute('href');
                if (href && href.startsWith('#')) {
                    link.classList.toggle('active', href.substring(1) === current);
                }
            });
        }, { passive: true });
    }
}

function initBackToTopButton() {
    let btn = document.getElementById('back-to-top-btn');
    if (!btn) {
        btn = document.createElement('button');
        btn.id = 'back-to-top-btn';
        btn.className = 'back-to-top-btn';
        btn.setAttribute('aria-label', 'Back to top');
        btn.innerHTML = '<i class="fa-solid fa-arrow-up"></i>';
        document.body.appendChild(btn);

        btn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 400) {
            btn.classList.add('visible');
        } else {
            btn.classList.remove('visible');
        }
    }, { passive: true });
}

