(() => {
    const ready = (fn) => {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", fn);
        } else {
            fn();
        }
    };

    ready(() => {
        const menuButton = document.querySelector(".mobile-menu-button");
        const mobileMenu = document.querySelector(".mobile-menu");
        if (menuButton && mobileMenu) {
            menuButton.addEventListener("click", () => {
                const opened = mobileMenu.hasAttribute("hidden");
                if (opened) {
                    mobileMenu.removeAttribute("hidden");
                    menuButton.setAttribute("aria-expanded", "true");
                    menuButton.textContent = "×";
                } else {
                    mobileMenu.setAttribute("hidden", "");
                    menuButton.setAttribute("aria-expanded", "false");
                    menuButton.textContent = "☰";
                }
            });
        }

        const slides = Array.from(document.querySelectorAll(".hero-slide"));
        const dots = Array.from(document.querySelectorAll(".hero-dot"));
        if (slides.length > 1 && dots.length === slides.length) {
            let current = 0;
            const show = (index) => {
                current = index;
                slides.forEach((slide, i) => slide.classList.toggle("is-active", i === current));
                dots.forEach((dot, i) => dot.classList.toggle("is-active", i === current));
            };
            dots.forEach((dot, index) => dot.addEventListener("click", () => show(index)));
            setInterval(() => show((current + 1) % slides.length), 5000);
        }

        const searchInput = document.getElementById("page-search");
        const typeFilter = document.getElementById("type-filter");
        const yearFilter = document.getElementById("year-filter");
        const cards = Array.from(document.querySelectorAll(".searchable-grid .movie-card-item"));
        if (cards.length) {
            const types = new Set();
            const years = new Set();
            cards.forEach((card) => {
                const meta = card.getAttribute("data-meta") || "";
                const yearMatch = meta.match(/(?:^|\s)(19\d{2}|20\d{2})(?:\s|$)/);
                if (yearMatch) years.add(yearMatch[1]);
                const typeMatch = meta.match(/(电影|剧集|电视剧|短剧|动漫|纪录片|综艺)/);
                if (typeMatch) types.add(typeMatch[1]);
            });
            if (typeFilter) {
                Array.from(types).sort().forEach((type) => {
                    const option = document.createElement("option");
                    option.value = type;
                    option.textContent = type;
                    typeFilter.appendChild(option);
                });
            }
            if (yearFilter) {
                Array.from(years).sort((a, b) => Number(b) - Number(a)).forEach((year) => {
                    const option = document.createElement("option");
                    option.value = year;
                    option.textContent = year;
                    yearFilter.appendChild(option);
                });
            }
            const params = new URLSearchParams(location.search);
            if (searchInput && params.get("q")) searchInput.value = params.get("q");
            const apply = () => {
                const q = (searchInput && searchInput.value ? searchInput.value : "").trim().toLowerCase();
                const type = typeFilter && typeFilter.value ? typeFilter.value : "";
                const year = yearFilter && yearFilter.value ? yearFilter.value : "";
                cards.forEach((card) => {
                    const meta = (card.getAttribute("data-meta") || "").toLowerCase();
                    const matchQuery = !q || meta.includes(q);
                    const matchType = !type || meta.includes(type.toLowerCase());
                    const matchYear = !year || meta.includes(year);
                    card.classList.toggle("is-hidden", !(matchQuery && matchType && matchYear));
                });
            };
            [searchInput, typeFilter, yearFilter].forEach((node) => {
                if (node) node.addEventListener("input", apply);
                if (node) node.addEventListener("change", apply);
            });
            apply();
        }
    });

    window.MoviePlayer = {
        init(source) {
            ready(() => {
                const video = document.getElementById("movie-player");
                const cover = document.getElementById("player-cover");
                if (!video || !cover || !source) return;
                let prepared = false;
                let hls = null;
                const prepare = () => {
                    if (prepared) return;
                    prepared = true;
                    if (video.canPlayType("application/vnd.apple.mpegurl")) {
                        video.src = source;
                    } else if (window.Hls && window.Hls.isSupported()) {
                        hls = new window.Hls({ enableWorker: true });
                        hls.loadSource(source);
                        hls.attachMedia(video);
                    } else {
                        video.src = source;
                    }
                };
                const start = () => {
                    prepare();
                    cover.classList.add("is-hidden");
                    const attempt = video.play();
                    if (attempt && typeof attempt.catch === "function") {
                        attempt.catch(() => {
                            cover.classList.remove("is-hidden");
                        });
                    }
                };
                cover.addEventListener("click", start);
                video.addEventListener("click", () => {
                    if (video.paused) start();
                });
                window.addEventListener("pagehide", () => {
                    if (hls && typeof hls.destroy === "function") hls.destroy();
                });
            });
        }
    };
})();
