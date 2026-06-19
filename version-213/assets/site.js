document.addEventListener("DOMContentLoaded", function () {
  var menuButton = document.querySelector("[data-menu-toggle]");
  var mobilePanel = document.querySelector("[data-mobile-panel]");

  if (menuButton && mobilePanel) {
    menuButton.addEventListener("click", function () {
      mobilePanel.classList.toggle("is-open");
    });
  }

  document.querySelectorAll(".js-site-search").forEach(function (form) {
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var input = form.querySelector("input[name='q']");
      var value = input ? input.value.trim() : "";
      var target = "./search.html";

      if (value) {
        target += "?q=" + encodeURIComponent(value);
      }

      window.location.href = target;
    });
  });

  document.querySelectorAll("[data-hero]").forEach(function (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var previousButton = hero.querySelector("[data-hero-prev]");
    var nextButton = hero.querySelector("[data-hero-next]");
    var current = 0;
    var timer = null;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }

      current = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
      });
    }

    function restart() {
      if (timer) {
        clearInterval(timer);
      }

      timer = setInterval(function () {
        showSlide(current + 1);
      }, 5000);
    }

    if (previousButton) {
      previousButton.addEventListener("click", function () {
        showSlide(current - 1);
        restart();
      });
    }

    if (nextButton) {
      nextButton.addEventListener("click", function () {
        showSlide(current + 1);
        restart();
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        showSlide(dotIndex);
        restart();
      });
    });

    showSlide(0);
    restart();
  });

  document.querySelectorAll("[data-filter-panel]").forEach(function (panel) {
    var searchInput = panel.querySelector(".local-filter-input");
    var typeFilter = panel.querySelector(".type-filter");
    var yearFilter = panel.querySelector(".year-filter");
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-card]"));
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get("q") || "";

    if (searchInput && initialQuery) {
      searchInput.value = initialQuery;
    }

    function applyFilters() {
      var query = searchInput ? searchInput.value.trim().toLowerCase() : "";
      var type = typeFilter ? typeFilter.value : "";
      var year = yearFilter ? yearFilter.value : "";

      cards.forEach(function (card) {
        var searchable = (card.getAttribute("data-search") || "").toLowerCase();
        var cardType = card.getAttribute("data-type") || "";
        var cardYear = card.getAttribute("data-year") || "";
        var matchedQuery = !query || searchable.indexOf(query) !== -1;
        var matchedType = !type || cardType.indexOf(type) !== -1;
        var matchedYear = !year || cardYear === year;

        card.classList.toggle("is-hidden-card", !(matchedQuery && matchedType && matchedYear));
      });
    }

    [searchInput, typeFilter, yearFilter].forEach(function (element) {
      if (element) {
        element.addEventListener("input", applyFilters);
        element.addEventListener("change", applyFilters);
      }
    });

    applyFilters();
  });

  document.querySelectorAll(".js-video-player").forEach(function (shell) {
    var video = shell.querySelector("video");
    var button = shell.querySelector(".video-launch");
    var streamUrl = shell.getAttribute("data-stream");
    var player = null;
    var prepared = false;

    function attachStream() {
      if (!video || !streamUrl || prepared) {
        return;
      }

      prepared = true;

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = streamUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        player = new window.Hls({
          maxBufferLength: 30,
          backBufferLength: 30
        });
        player.loadSource(streamUrl);
        player.attachMedia(video);
      } else {
        video.src = streamUrl;
      }
    }

    function startPlayback() {
      attachStream();

      if (button) {
        button.classList.add("is-hidden");
      }

      var promise = video.play();

      if (promise && typeof promise.catch === "function") {
        promise.catch(function () {
          if (button) {
            button.classList.remove("is-hidden");
          }
        });
      }
    }

    if (button && video) {
      button.addEventListener("click", startPlayback);
      video.addEventListener("play", function () {
        button.classList.add("is-hidden");
      });
    }

    window.addEventListener("pagehide", function () {
      if (player && typeof player.destroy === "function") {
        player.destroy();
      }
    });
  });
});
