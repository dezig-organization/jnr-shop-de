// ===================================
// DOM REFERENCES
// ===================================

const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');
const navButtons = document.querySelector('.nav-buttons');
const navLinks = document.querySelectorAll('.nav-link');
const header = document.querySelector('.header');
const warnBar = document.querySelector('.warn');
const footerCitiesToggle = document.getElementById('footerCitiesToggle');
const footerCitiesList = document.getElementById('footerCitiesList');
const seeMoreBtn = document.getElementById('seeMoreBtn');
const hiddenDescriptions = document.querySelectorAll('.description-hidden');
const ageModal = document.getElementById('ageModal');
const yesBtn = document.getElementById('yesBtn');
const noBtn = document.getElementById('noBtn');
const yearSpan = document.querySelector('#year');
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ===================================
// MOBILE MENU
// ===================================

function toggleMenu(forceClose = false) {
    const shouldClose = forceClose || (navMenu && navMenu.classList.contains('active'));

    if (hamburger) hamburger.classList.toggle('active', !shouldClose);
    if (navMenu) navMenu.classList.toggle('active', !shouldClose);
    if (navButtons) navButtons.classList.toggle('active', !shouldClose);

    document.body.style.overflow = shouldClose ? '' : 'hidden';
}

if (hamburger) {
    hamburger.addEventListener('click', () => {
        const isOpen = navMenu && navMenu.classList.contains('active');
        toggleMenu(isOpen);
    });
}

if (navLinks.length) {
    navLinks.forEach((link) => {
        link.addEventListener('click', () => {
            if (navMenu && navMenu.classList.contains('active')) {
                toggleMenu(true);
            }
        });
    });
}

document.addEventListener('click', (e) => {
    if (
        navMenu &&
        navMenu.classList.contains('active') &&
        !navMenu.contains(e.target) &&
        !(hamburger && hamburger.contains(e.target)) &&
        !(navButtons && navButtons.contains(e.target))
    ) {
        toggleMenu(true);
    }
});

// ===================================
// SMOOTH SCROLL
// ===================================

document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: prefersReducedMotion ? 'auto' : 'smooth',
                block: 'start'
            });
        }
    });
});

// ===================================
// REVEAL ANIMATIONS
// ===================================

function setupRevealAnimations() {
    const revealGroups = [
        { selector: '.hero-left', extraClass: 'slide-right' },
        { selector: '.hero-right', extraClass: 'slide-left' },
        { selector: '.partner-logo', extraClass: '' },
        { selector: '.nft-card', extraClass: '' },
        { selector: '.seller-card', extraClass: '' },
        { selector: '.artwork-card', extraClass: '' },
        { selector: '.description-item', extraClass: '' },
        { selector: '.social > div', extraClass: '' },
        { selector: '.foot-cont-one .cont-col', extraClass: '' },
        { selector: '.foot-cont-two div', extraClass: '' }
    ];

    const revealTargets = [];

    revealGroups.forEach(({ selector, extraClass }) => {
        document.querySelectorAll(selector).forEach((el, index) => {
            el.classList.add('reveal');
            if (extraClass) el.classList.add(extraClass);
            el.style.setProperty('--reveal-order', index.toString());
            revealTargets.push(el);
        });
    });

    if (prefersReducedMotion || !('IntersectionObserver' in window)) {
        revealTargets.forEach((el) => el.classList.add('is-visible'));
        return;
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.12,
        rootMargin: '0px 0px -8% 0px'
    });

    revealTargets.forEach((el) => observer.observe(el));
}

// ===================================
// HEADER SCROLL STATE
// ===================================

function setupHeaderState() {
    if (!header) return;

    const updateMobileHeaderState = () => {
        const isMobile = window.innerWidth <= 768;

        document.body.classList.toggle('mobile-fixed-nav', isMobile);

        if (!isMobile) {
            document.body.classList.remove('mobile-warn-hidden');
            document.documentElement.style.removeProperty('--warn-height');
            document.documentElement.style.removeProperty('--header-height');
            return;
        }

        const warnHeight = warnBar ? warnBar.offsetHeight : 0;
        const headerHeight = header.offsetHeight;

        document.documentElement.style.setProperty('--warn-height', `${warnHeight}px`);
        document.documentElement.style.setProperty('--header-height', `${headerHeight}px`);
        document.body.classList.toggle('mobile-warn-hidden', window.pageYOffset > 8);
    };

    const updateHeader = () => {
        if (window.pageYOffset > 40) {
            header.style.boxShadow = '0 14px 30px rgba(0, 0, 0, 0.24)';
        } else {
            header.style.boxShadow = 'none';
        }

        updateMobileHeaderState();
    };

    updateHeader();
    window.addEventListener('scroll', updateHeader, { passive: true });
    window.addEventListener('resize', updateMobileHeaderState, { passive: true });
}

// ===================================
// CARD GLOW + TILT
// ===================================

function setupInteractiveCards() {
    const cards = document.querySelectorAll('.nft-card, .seller-card, .featured-nft-card');

    cards.forEach((card) => {
        const reset = () => {
            card.classList.remove('card-hover');
            if (!prefersReducedMotion && card.classList.contains('featured-nft-card')) {
                card.style.transform = '';
            }
        };

        card.addEventListener('mouseenter', () => {
            card.classList.add('card-hover');
        });

        card.addEventListener('mouseleave', reset);

        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const relativeX = ((e.clientX - rect.left) / rect.width) * 100;
            const relativeY = ((e.clientY - rect.top) / rect.height) * 100;
            card.style.setProperty('--pointer-x', `${relativeX}%`);
            card.style.setProperty('--pointer-y', `${relativeY}%`);

            if (prefersReducedMotion || !card.classList.contains('featured-nft-card')) {
                return;
            }

            const rotateX = ((relativeY - 50) / 50) * -5;
            const rotateY = ((relativeX - 50) / 50) * 6;
            card.style.transform = `perspective(1200px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-6px)`;
        });
    });
}

// ===================================
// HERO PARALLAX
// ===================================

function setupHeroParallax() {
    if (prefersReducedMotion) return;

    const hero = document.querySelector('.hero-content');
    const heroImage = document.querySelector('.hero-right');
    const heroStats = document.querySelector('.stats');

    if (!hero || !heroImage || !heroStats) return;

    hero.addEventListener('mousemove', (e) => {
        const rect = hero.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;

        heroImage.style.transform = `translate3d(${x * 14}px, ${y * 14}px, 0)`;
        heroStats.style.transform = `translate3d(${x * -10}px, ${y * -10}px, 0)`;
    });

    hero.addEventListener('mouseleave', () => {
        heroImage.style.transform = '';
        heroStats.style.transform = '';
    });
}

// ===================================
// FOOTER TOGGLE
// ===================================

function toggleCont() {
    if (!footerCitiesToggle || !footerCitiesList) return;

    const shouldOpen = !footerCitiesList.classList.contains('is-open');

    footerCitiesList.classList.toggle('is-open', shouldOpen);
    footerCitiesList.style.maxHeight = shouldOpen ? `${footerCitiesList.scrollHeight}px` : '0px';
    footerCitiesToggle.setAttribute('aria-expanded', String(shouldOpen));
    footerCitiesToggle.textContent = shouldOpen ? 'Städte ausblenden' : 'Städte anzeigen';
}

if (footerCitiesToggle) {
    footerCitiesToggle.addEventListener('click', toggleCont);
}

// ===================================
// DESCRIPTION EXPAND
// ===================================

if (seeMoreBtn) {
    seeMoreBtn.addEventListener('click', () => {
        hiddenDescriptions.forEach((desc) => {
            desc.classList.remove('description-hidden');
            desc.classList.add('description-visible', 'expanded');
        });

        seeMoreBtn.classList.add('hidden');
    });
}

// ===================================
// AGE MODAL
// ===================================

if (ageModal) {
    window.addEventListener('load', () => {
        ageModal.style.display = localStorage.getItem('ageConfirmed') === 'true' ? 'none' : 'flex';
    });

    if (yesBtn) {
        yesBtn.addEventListener('click', () => {
            localStorage.setItem('ageConfirmed', 'true');
            ageModal.style.display = 'none';
        });
    }

    if (noBtn) {
        noBtn.addEventListener('click', () => {
            alert('Zugriff nicht erlaubt. Diese Seite ist nur für Personen ab 18 Jahren bestimmt.');
            try { window.close(); } catch (e) {}
            window.location.href = 'https://www.google.pl';
        });
    }
}

// ===================================
// RESIZE
// ===================================

let resizeTimer;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
        if (window.innerWidth > 768 && navMenu && navMenu.classList.contains('active')) {
            toggleMenu(true);
        }

        if (footerCitiesList && footerCitiesList.classList.contains('is-open')) {
            footerCitiesList.style.maxHeight = `${footerCitiesList.scrollHeight}px`;
        }
    }, 250);
});

// ===================================
// INIT
// ===================================

window.addEventListener('DOMContentLoaded', () => {
    setupRevealAnimations();
    setupHeaderState();
    setupInteractiveCards();
    setupHeroParallax();
});

if (yearSpan) {
    yearSpan.innerText = new Date().getFullYear();
}
