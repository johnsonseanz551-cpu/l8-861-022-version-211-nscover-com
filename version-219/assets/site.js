(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  }

  function setupMenu() {
    var button = document.querySelector('.menu-toggle');
    var panel = document.querySelector('.mobile-panel');
    if (!button || !panel) {
      return;
    }
    button.addEventListener('click', function () {
      var open = panel.classList.toggle('open');
      button.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  function setupHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
    if (!slides.length) {
      return;
    }
    var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
    var prev = document.querySelector('[data-hero-prev]');
    var next = document.querySelector('[data-hero-next]');
    var index = 0;
    var timer;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, current) {
        slide.classList.toggle('active', current === index);
      });
      dots.forEach(function (dot, current) {
        dot.classList.toggle('active', current === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    dots.forEach(function (dot, current) {
      dot.addEventListener('click', function () {
        show(current);
        start();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        start();
      });
    }

    show(0);
    start();
  }

  function setupGlobalSearch() {
    Array.prototype.slice.call(document.querySelectorAll('.global-search')).forEach(function (form) {
      form.addEventListener('submit', function (event) {
        var input = form.querySelector('input[name="q"]');
        if (!input) {
          return;
        }
        var query = input.value.trim();
        if (!query) {
          event.preventDefault();
          input.focus();
        }
      });
    });
  }

  function setupLocalFilter() {
    var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card'));
    var input = document.querySelector('[data-local-search]');
    var chips = Array.prototype.slice.call(document.querySelectorAll('.filter-chip'));
    if (!cards.length) {
      return;
    }
    var activeFilter = 'all';

    function apply() {
      var query = input ? input.value.trim().toLowerCase() : '';
      cards.forEach(function (card) {
        var text = card.getAttribute('data-search') || '';
        var searchable = !query || text.indexOf(query) !== -1;
        var filtered = activeFilter === 'all' ||
          card.getAttribute('data-year') === activeFilter ||
          card.getAttribute('data-type') === activeFilter ||
          card.getAttribute('data-category') === activeFilter ||
          text.indexOf(activeFilter.toLowerCase()) !== -1;
        card.classList.toggle('hidden-by-search', !searchable);
        card.classList.toggle('hidden-by-filter', !filtered);
      });
    }

    if (input) {
      input.addEventListener('input', apply);
    }

    chips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        chips.forEach(function (item) {
          item.classList.remove('active');
        });
        chip.classList.add('active');
        activeFilter = chip.getAttribute('data-filter') || 'all';
        apply();
      });
    });
  }

  function setupSearchPage() {
    var target = document.querySelector('[data-search-results]');
    if (!target || !window.SITE_MOVIES) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var query = (params.get('q') || '').trim();
    var input = document.querySelector('[data-search-input]');
    if (input) {
      input.value = query;
    }
    if (!query) {
      target.innerHTML = '<div class="empty-state">输入片名、类型、年份或题材关键词，即可查找相关影片。</div>';
      return;
    }
    var lowered = query.toLowerCase();
    var results = window.SITE_MOVIES.filter(function (movie) {
      return movie.search.indexOf(lowered) !== -1;
    }).slice(0, 120);
    if (!results.length) {
      target.innerHTML = '<div class="empty-state">没有找到相关影片，换个关键词再试试。</div>';
      return;
    }
    target.innerHTML = '<div class="movie-grid">' + results.map(function (movie) {
      var tags = movie.tags.slice(0, 3).map(function (tag) {
        return '<span class="tag-pill">' + escapeHtml(tag) + '</span>';
      }).join('');
      return '<article class="movie-card">' +
        '<a class="poster-link" href="./' + movie.file + '" aria-label="观看' + escapeHtml(movie.title) + '">' +
        '<img src="' + movie.image + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">' +
        '<span class="poster-shadow"></span>' +
        '<span class="poster-badge">' + escapeHtml(movie.year) + '</span>' +
        '</a>' +
        '<div class="movie-card-body">' +
        '<a class="movie-title" href="./' + movie.file + '">' + escapeHtml(movie.title) + '</a>' +
        '<p class="movie-meta">' + escapeHtml(movie.category) + ' · ' + escapeHtml(movie.type) + ' · ' + escapeHtml(movie.region) + '</p>' +
        '<p class="movie-one-line">' + escapeHtml(movie.oneLine) + '</p>' +
        '<div class="movie-tags">' + tags + '</div>' +
        '</div>' +
        '</article>';
    }).join('') + '</div>';
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function setupPlayers() {
    Array.prototype.slice.call(document.querySelectorAll('.player-box')).forEach(function (box) {
      var video = box.querySelector('video');
      var cover = box.querySelector('.play-cover');
      var stream = box.getAttribute('data-stream');
      var attached = false;
      var hls;

      function attach() {
        if (!video || !stream || attached) {
          return;
        }
        attached = true;
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = stream;
        } else if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: false
          });
          hls.loadSource(stream);
          hls.attachMedia(video);
        } else {
          video.src = stream;
        }
      }

      function play() {
        attach();
        if (cover) {
          cover.classList.add('is-hidden');
        }
        video.controls = true;
        var promise = video.play();
        if (promise && typeof promise.catch === 'function') {
          promise.catch(function () {
            if (cover) {
              cover.classList.remove('is-hidden');
            }
          });
        }
      }

      if (cover && video) {
        cover.addEventListener('click', play);
        video.addEventListener('click', function () {
          if (!attached) {
            play();
          }
        });
      }

      window.addEventListener('pagehide', function () {
        if (hls && typeof hls.destroy === 'function') {
          hls.destroy();
        }
      });
    });
  }

  ready(function () {
    setupMenu();
    setupHero();
    setupGlobalSearch();
    setupLocalFilter();
    setupSearchPage();
    setupPlayers();
  });
}());
