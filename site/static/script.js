document.documentElement.classList.add('js-enabled');

const header = document.querySelector('.site-header');
const toggle = document.querySelector('.menu-toggle');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

/* Mobile navigation toggle */
if (header && toggle) {
    toggle.addEventListener('click', () => {
        const isOpen = header.classList.toggle('is-open');
        toggle.setAttribute('aria-expanded', String(isOpen));
    });

    header.querySelectorAll('.site-nav a').forEach((link) => {
        link.addEventListener('click', () => {
            header.classList.remove('is-open');
            toggle.setAttribute('aria-expanded', 'false');
        });
    });
}

/* Language dropdown — close on outside click or Escape */
const lang = document.querySelector('.lang');
if (lang) {
    document.addEventListener('click', (event) => {
        if (!lang.contains(event.target)) {
            lang.removeAttribute('open');
        }
    });

    lang.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            lang.removeAttribute('open');
            const trigger = lang.querySelector('.lang-trigger');
            if (trigger) {
                trigger.focus();
            }
        }
    });
}

/* Hairline appears under the sticky header once the page is scrolled */
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

/* Subtle reveal-on-scroll for content blocks */
function initReveal() {
    if (reduceMotion.matches || !('IntersectionObserver' in window)) {
        return;
    }

    const items = document.querySelectorAll([
        '.section-head',
        '.matrix-card',
        '.spec > div',
        '.console',
        '.check-list li',
        '.trust-strip span',
        '.contact-form',
        '.split-section > article',
        '.final-cta .shell > *',
    ].join(','));

    items.forEach((item, index) => {
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
        rootMargin: '0px 0px -10% 0px',
        threshold: 0.1,
    });

    items.forEach((item) => {
        if (!item.classList.contains('is-visible')) {
            observer.observe(item);
        }
    });
}

initReveal();
