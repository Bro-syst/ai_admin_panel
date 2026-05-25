document.documentElement.classList.add('js-enabled');

const header = document.querySelector('.site-header');
const toggle = document.querySelector('.menu-toggle');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const canHover = window.matchMedia('(hover: hover) and (pointer: fine)');

if (header && toggle) {
    toggle.addEventListener('click', () => {
        const isOpen = header.classList.toggle('is-open');
        toggle.setAttribute('aria-expanded', String(isOpen));
    });
}

if (header) {
    let ticking = false;

    const syncHeaderState = () => {
        header.classList.toggle('is-scrolled', window.scrollY > 8);
        ticking = false;
    };

    syncHeaderState();
    window.addEventListener('scroll', () => {
        if (ticking) {
            return;
        }

        ticking = true;
        window.requestAnimationFrame(syncHeaderState);
    }, { passive: true });
}

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

function setPointerVars(element, event) {
    const rect = element.getBoundingClientRect();
    const x = clamp(event.clientX - rect.left, 0, rect.width);
    const y = clamp(event.clientY - rect.top, 0, rect.height);
    const xp = rect.width ? (x / rect.width) * 100 : 50;
    const yp = rect.height ? (y / rect.height) * 100 : 50;

    element.style.setProperty('--pointer-x', `${xp}%`);
    element.style.setProperty('--pointer-y', `${yp}%`);
}

function initHeroMotion() {
    if (reduceMotion.matches || !canHover.matches) {
        return;
    }

    const hero = document.querySelector('.hero-section');
    const visual = document.querySelector('.visual-shell');

    if (hero) {
        hero.addEventListener('pointermove', (event) => setPointerVars(hero, event));
        hero.addEventListener('pointerleave', () => {
            hero.style.removeProperty('--pointer-x');
            hero.style.removeProperty('--pointer-y');
        });
    }

    if (visual) {
        visual.addEventListener('pointermove', (event) => {
            const rect = visual.getBoundingClientRect();
            const x = clamp(event.clientX - rect.left, 0, rect.width);
            const y = clamp(event.clientY - rect.top, 0, rect.height);
            const tiltX = ((x / rect.width) - 0.5) * 5;
            const tiltY = ((0.5 - (y / rect.height)) * 5);

            setPointerVars(visual, event);
            visual.style.setProperty('--tilt-x', `${tiltX.toFixed(2)}deg`);
            visual.style.setProperty('--tilt-y', `${tiltY.toFixed(2)}deg`);
        });

        visual.addEventListener('pointerleave', () => {
            visual.style.removeProperty('--pointer-x');
            visual.style.removeProperty('--pointer-y');
            visual.style.removeProperty('--tilt-x');
            visual.style.removeProperty('--tilt-y');
        });
    }
}

function initCardSpotlights() {
    if (reduceMotion.matches || !canHover.matches) {
        return;
    }

    const cards = document.querySelectorAll([
        '.scenario-card',
        '.pilot-role-card',
        '.pilot-path-steps article',
        '.value-card',
        '.launch-steps article',
        '.confidence-stack article',
        '.feature-card',
        '.agent-card',
        '.wide-panel',
        '.contact-form',
    ].join(','));

    cards.forEach((card) => {
        card.addEventListener('pointermove', (event) => setPointerVars(card, event));
        card.addEventListener('pointerleave', () => {
            card.style.removeProperty('--pointer-x');
            card.style.removeProperty('--pointer-y');
        });
    });
}

function initReveal() {
    if (reduceMotion.matches || !('IntersectionObserver' in window)) {
        return;
    }

    const revealItems = document.querySelectorAll([
        '.trust-strip span',
        '.section-heading',
        '.scenario-card',
        '.value-card',
        '.launch-steps article',
        '.confidence-stack article',
        '.feature-card',
        '.agent-card',
        '.wide-panel',
        '.pilot-role-card',
        '.pilot-path-grid > div:first-child',
        '.pilot-path-steps article',
        '.proof-grid > *',
        '.split-section > *',
        '.contact-form',
        '.final-cta .container',
    ].join(','));

    revealItems.forEach((item, index) => {
        item.classList.add('reveal-ready');
        item.style.setProperty('--reveal-delay', `${Math.min(index % 6, 5) * 55}ms`);

        const rect = item.getBoundingClientRect();
        if (rect.top < window.innerHeight * 0.95 && rect.bottom > 0) {
            item.classList.add('is-visible');
        }
    });

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) {
                return;
            }

            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
        });
    }, {
        rootMargin: '0px 0px -12% 0px',
        threshold: 0.12,
    });

    revealItems.forEach((item) => {
        if (!item.classList.contains('is-visible')) {
            observer.observe(item);
        }
    });
}

initHeroMotion();
initCardSpotlights();
initReveal();
