(function () {
    var menuButton = document.querySelector('[data-menu-button]');
    var mobileNav = document.querySelector('[data-mobile-nav]');

    if (menuButton && mobileNav) {
        menuButton.addEventListener('click', function () {
            mobileNav.classList.toggle('is-open');
        });
    }

    var hero = document.querySelector('[data-hero-slider]');

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var index = 0;

        function showSlide(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === index);
            });
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
            });
        });

        if (slides.length > 1) {
            setInterval(function () {
                showSlide(index + 1);
            }, 5200);
        }
    }

    document.querySelectorAll('[data-filter-area]').forEach(function (area) {
        var input = area.querySelector('.js-card-search');
        var cards = Array.prototype.slice.call(area.querySelectorAll('.movie-card'));
        var buttons = Array.prototype.slice.call(area.querySelectorAll('[data-filter-value]'));
        var activeValue = 'all';

        function normalize(value) {
            return String(value || '').toLowerCase().trim();
        }

        function applyFilter() {
            var keyword = normalize(input ? input.value : '');
            cards.forEach(function (card) {
                var text = normalize(card.getAttribute('data-filter-text'));
                var type = normalize(card.getAttribute('data-type'));
                var year = normalize(card.getAttribute('data-year'));
                var active = normalize(activeValue);
                var matchText = !keyword || text.indexOf(keyword) !== -1;
                var matchType = active === 'all' || type.indexOf(active) !== -1 || year === active;
                card.hidden = !(matchText && matchType);
            });
        }

        if (input) {
            input.addEventListener('input', applyFilter);
        }

        buttons.forEach(function (button) {
            button.addEventListener('click', function () {
                activeValue = button.getAttribute('data-filter-value') || 'all';
                buttons.forEach(function (item) {
                    item.classList.toggle('is-active', item === button);
                });
                applyFilter();
            });
        });
    });
}());
