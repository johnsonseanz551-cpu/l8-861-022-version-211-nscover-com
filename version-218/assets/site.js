(function () {
    const menuButton = document.querySelector('[data-menu-toggle]');
    const mobilePanel = document.querySelector('[data-mobile-panel]');

    if (menuButton && mobilePanel) {
        menuButton.addEventListener('click', function () {
            mobilePanel.classList.toggle('is-open');
        });
    }

    document.querySelectorAll('[data-search-form]').forEach(function (form) {
        form.addEventListener('submit', function (event) {
            event.preventDefault();
            const input = form.querySelector('input[name="q"]');
            const query = input ? input.value.trim() : '';
            const target = query ? 'search.html?q=' + encodeURIComponent(query) : 'search.html';
            window.location.href = target;
        });
    });

    const hero = document.querySelector('[data-hero]');

    if (hero) {
        const slides = Array.from(hero.querySelectorAll('.hero-slide'));
        const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
        const previous = hero.querySelector('[data-hero-prev]');
        const next = hero.querySelector('[data-hero-next]');
        let index = 0;
        let timer = null;

        const show = function (nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === index);
            });
        };

        const play = function () {
            if (timer) {
                clearInterval(timer);
            }
            timer = setInterval(function () {
                show(index + 1);
            }, 5200);
        };

        if (previous) {
            previous.addEventListener('click', function () {
                show(index - 1);
                play();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                show(index + 1);
                play();
            });
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                const dotIndex = Number(dot.getAttribute('data-hero-dot')) || 0;
                show(dotIndex);
                play();
            });
        });

        show(0);
        play();
    }

    const filterInput = document.querySelector('[data-filter-input]');
    const typeFilter = document.querySelector('[data-type-filter]');
    const yearFilter = document.querySelector('[data-year-filter]');
    const categoryFilter = document.querySelector('[data-category-filter]');
    const catalog = document.querySelector('[data-catalog]');

    const applyFilters = function () {
        if (!catalog) {
            return;
        }

        const query = filterInput ? filterInput.value.trim().toLowerCase() : '';
        const type = typeFilter ? typeFilter.value : '';
        const year = yearFilter ? yearFilter.value : '';
        const category = categoryFilter ? categoryFilter.value : '';
        const cards = Array.from(catalog.querySelectorAll('.movie-card'));

        cards.forEach(function (card) {
            const text = [
                card.getAttribute('data-title') || '',
                card.getAttribute('data-tags') || '',
                card.getAttribute('data-meta') || ''
            ].join(' ').toLowerCase();
            const cardType = card.getAttribute('data-type') || '';
            const cardYear = card.getAttribute('data-year') || '';
            const cardCategory = card.getAttribute('data-category') || '';
            const matchedQuery = !query || text.indexOf(query) !== -1;
            const matchedType = !type || cardType === type;
            const matchedYear = !year || cardYear === year;
            const matchedCategory = !category || cardCategory === category;
            card.classList.toggle('is-hidden', !(matchedQuery && matchedType && matchedYear && matchedCategory));
        });
    };

    if (filterInput || typeFilter || yearFilter || categoryFilter) {
        const params = new URLSearchParams(window.location.search);
        const query = params.get('q');
        if (query && filterInput) {
            filterInput.value = query;
        }
        [filterInput, typeFilter, yearFilter, categoryFilter].forEach(function (control) {
            if (control) {
                control.addEventListener('input', applyFilters);
                control.addEventListener('change', applyFilters);
            }
        });
        applyFilters();
    }
}());
