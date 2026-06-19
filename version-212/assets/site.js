(function () {
  var menuToggle = document.querySelector('[data-menu-toggle]');
  var mobilePanel = document.querySelector('[data-mobile-panel]');

  if (menuToggle && mobilePanel) {
    menuToggle.addEventListener('click', function () {
      mobilePanel.classList.toggle('is-open');
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var current = 0;
    var timer;

    function showSlide(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    function startTimer() {
      clearInterval(timer);
      timer = setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }

    if (slides.length > 0) {
      showSlide(0);
      startTimer();
    }

    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(current - 1);
        startTimer();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(current + 1);
        startTimer();
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        showSlide(index);
        startTimer();
      });
    });
  }

  var filterForms = Array.prototype.slice.call(document.querySelectorAll('[data-filter-form]'));

  filterForms.forEach(function (form) {
    var scope = form.getAttribute('data-filter-form');
    var target = document.querySelector('[data-filter-target="' + scope + '"]');
    var empty = document.querySelector('[data-empty-state="' + scope + '"]');

    if (!target) {
      return;
    }

    var cards = Array.prototype.slice.call(target.querySelectorAll('[data-movie-card]'));
    var keywordInput = form.querySelector('[data-filter-keyword]');
    var typeSelect = form.querySelector('[data-filter-type]');
    var yearSelect = form.querySelector('[data-filter-year]');
    var resetButton = form.querySelector('[data-filter-reset]');

    function normalize(value) {
      return String(value || '').trim().toLowerCase();
    }

    function applyFilter() {
      var keyword = normalize(keywordInput && keywordInput.value);
      var typeValue = normalize(typeSelect && typeSelect.value);
      var yearValue = normalize(yearSelect && yearSelect.value);
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = normalize([
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-type'),
          card.getAttribute('data-year'),
          card.getAttribute('data-tags')
        ].join(' '));
        var matchesKeyword = !keyword || haystack.indexOf(keyword) !== -1;
        var matchesType = !typeValue || normalize(card.getAttribute('data-type')) === typeValue;
        var matchesYear = !yearValue || normalize(card.getAttribute('data-year')) === yearValue;
        var show = matchesKeyword && matchesType && matchesYear;

        card.style.display = show ? '' : 'none';
        if (show) {
          visible += 1;
        }
      });

      if (empty) {
        empty.classList.toggle('is-visible', visible === 0);
      }
    }

    ['input', 'change'].forEach(function (eventName) {
      form.addEventListener(eventName, applyFilter);
    });

    if (resetButton) {
      resetButton.addEventListener('click', function () {
        if (keywordInput) {
          keywordInput.value = '';
        }
        if (typeSelect) {
          typeSelect.value = '';
        }
        if (yearSelect) {
          yearSelect.value = '';
        }
        applyFilter();
      });
    }

    var params = new URLSearchParams(window.location.search);
    var query = params.get('q');

    if (query && keywordInput) {
      keywordInput.value = query;
    }

    applyFilter();
  });
})();

function initMoviePlayer(source, videoId, overlayId, buttonId) {
  var video = document.getElementById(videoId);
  var overlay = document.getElementById(overlayId);
  var button = document.getElementById(buttonId);
  var started = false;

  if (!video || !source) {
    return;
  }

  if (window.Hls && window.Hls.isSupported()) {
    var hls = new window.Hls({
      enableWorker: true,
      lowLatencyMode: true
    });
    hls.loadSource(source);
    hls.attachMedia(video);
  } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
    video.src = source;
  }

  function hideOverlay() {
    if (overlay) {
      overlay.classList.add('is-hidden');
    }
  }

  function showOverlay() {
    if (overlay && video.paused) {
      overlay.classList.remove('is-hidden');
    }
  }

  function playVideo() {
    started = true;
    hideOverlay();
    var promise = video.play();

    if (promise && typeof promise.catch === 'function') {
      promise.catch(function () {
        showOverlay();
      });
    }
  }

  if (overlay) {
    overlay.addEventListener('click', playVideo);
  }

  if (button) {
    button.addEventListener('click', function (event) {
      event.stopPropagation();
      playVideo();
    });
  }

  video.addEventListener('click', function () {
    if (video.paused) {
      playVideo();
    } else {
      video.pause();
    }
  });

  video.addEventListener('play', hideOverlay);
  video.addEventListener('pause', function () {
    if (started) {
      showOverlay();
    }
  });
}
