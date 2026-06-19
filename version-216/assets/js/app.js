(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobileMenu = document.querySelector('[data-mobile-menu]');

  if (menuButton && mobileMenu) {
    menuButton.addEventListener('click', function () {
      mobileMenu.classList.toggle('open');
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prevButton = hero.querySelector('[data-hero-prev]');
    var nextButton = hero.querySelector('[data-hero-next]');
    var index = 0;
    var timer = null;

    function showSlide(nextIndex) {
      if (!slides.length) {
        return;
      }

      index = (nextIndex + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === index);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === index);
      });
    }

    function startTimer() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        showSlide(index + 1);
      }, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
        startTimer();
      });
    });

    if (prevButton) {
      prevButton.addEventListener('click', function () {
        showSlide(index - 1);
        startTimer();
      });
    }

    if (nextButton) {
      nextButton.addEventListener('click', function () {
        showSlide(index + 1);
        startTimer();
      });
    }

    showSlide(0);
    startTimer();
  }

  var filterInputs = Array.prototype.slice.call(document.querySelectorAll('.movie-filter'));
  var categorySelect = document.querySelector('[data-category-select]');
  var filterChips = Array.prototype.slice.call(document.querySelectorAll('[data-filter]'));
  var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card'));
  var emptyResult = document.querySelector('[data-empty-result]');
  var activeChip = '全部';

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function applyFilter() {
    var keyword = normalize(filterInputs.map(function (input) {
      return input.value;
    }).join(' '));
    var selectedCategory = categorySelect ? categorySelect.value : 'all';
    var visibleCount = 0;

    cards.forEach(function (card) {
      var haystack = normalize(card.getAttribute('data-search'));
      var cardCategory = card.getAttribute('data-category') || '';
      var matchKeyword = !keyword || haystack.indexOf(keyword) !== -1;
      var matchCategory = !selectedCategory || selectedCategory === 'all' || selectedCategory === cardCategory;
      var matchChip = activeChip === '全部' || haystack.indexOf(normalize(activeChip)) !== -1;
      var isVisible = matchKeyword && matchCategory && matchChip;

      card.hidden = !isVisible;

      if (isVisible) {
        visibleCount += 1;
      }
    });

    if (emptyResult) {
      emptyResult.hidden = visibleCount !== 0;
    }
  }

  filterInputs.forEach(function (input) {
    input.addEventListener('input', applyFilter);
  });

  if (categorySelect) {
    categorySelect.addEventListener('change', applyFilter);
  }

  filterChips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      filterChips.forEach(function (item) {
        item.classList.remove('active');
      });

      chip.classList.add('active');
      activeChip = chip.getAttribute('data-filter') || '全部';
      applyFilter();
    });
  });

  function initializePlayer() {
    var player = document.querySelector('[data-player]');

    if (!player) {
      return;
    }

    var video = player.querySelector('video');
    var button = player.querySelector('.play-button');
    var state = player.querySelector('[data-player-state]');
    var src = player.getAttribute('data-src');
    var prepared = false;
    var hls = null;

    function setState(text) {
      if (state) {
        state.textContent = text;
      }
    }

    function prepare() {
      if (prepared || !video || !src) {
        return;
      }

      prepared = true;
      setState('正在加载');

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = src;
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          maxBufferLength: 60,
          enableWorker: true
        });

        hls.loadSource(src);
        hls.attachMedia(video);
        return;
      }

      video.src = src;
    }

    function playVideo() {
      prepare();
      video.controls = true;
      player.classList.add('playing');

      var playPromise = video.play();

      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {
          player.classList.remove('playing');
          setState('再次点击播放');
        });
      }
    }

    if (button) {
      button.addEventListener('click', playVideo);
    }

    player.addEventListener('click', function (event) {
      if (event.target === button || event.target.closest('.play-button')) {
        return;
      }

      if (video.paused) {
        playVideo();
      }
    });

    video.addEventListener('play', function () {
      player.classList.add('playing');
      setState('播放中');
    });

    video.addEventListener('pause', function () {
      if (!video.ended) {
        player.classList.remove('playing');
        setState('点击继续播放');
      }
    });

    video.addEventListener('ended', function () {
      player.classList.remove('playing');
      setState('播放结束');
    });

    video.addEventListener('error', function () {
      player.classList.remove('playing');
      setState('播放源加载失败');
    });

    window.addEventListener('beforeunload', function () {
      if (hls) {
        hls.destroy();
      }
    });
  }

  initializePlayer();
})();
