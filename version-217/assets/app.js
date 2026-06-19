document.addEventListener("DOMContentLoaded", function () {
  initializeMobileNavigation();
  initializeHeroCarousel();
  initializePageFilters();
  initializeImageFallbacks();
});

function initializeMobileNavigation() {
  var button = document.querySelector("[data-mobile-menu-button]");
  var nav = document.querySelector("[data-mobile-nav]");

  if (!button || !nav) {
    return;
  }

  button.addEventListener("click", function () {
    nav.classList.toggle("is-open");
  });
}

function initializeHeroCarousel() {
  var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
  var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
  var thumbs = Array.prototype.slice.call(document.querySelectorAll("[data-hero-thumb]"));
  var nextButton = document.querySelector("[data-hero-next]");
  var previousButton = document.querySelector("[data-hero-prev]");

  if (!slides.length) {
    return;
  }

  var currentIndex = 0;
  var timer = null;

  function setActive(index) {
    currentIndex = (index + slides.length) % slides.length;

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle("is-active", slideIndex === currentIndex);
    });

    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle("is-active", dotIndex === currentIndex);
    });

    thumbs.forEach(function (thumb, thumbIndex) {
      thumb.classList.toggle("is-active", thumbIndex === currentIndex);
    });
  }

  function startTimer() {
    stopTimer();
    timer = window.setInterval(function () {
      setActive(currentIndex + 1);
    }, 5600);
  }

  function stopTimer() {
    if (timer) {
      window.clearInterval(timer);
      timer = null;
    }
  }

  dots.forEach(function (dot) {
    dot.addEventListener("click", function () {
      setActive(Number(dot.dataset.heroDot));
      startTimer();
    });
  });

  thumbs.forEach(function (thumb) {
    thumb.addEventListener("mouseenter", function () {
      setActive(Number(thumb.dataset.heroThumb));
      stopTimer();
    });

    thumb.addEventListener("mouseleave", startTimer);
  });

  if (nextButton) {
    nextButton.addEventListener("click", function () {
      setActive(currentIndex + 1);
      startTimer();
    });
  }

  if (previousButton) {
    previousButton.addEventListener("click", function () {
      setActive(currentIndex - 1);
      startTimer();
    });
  }

  setActive(0);
  startTimer();
}

function initializePageFilters() {
  var input = document.querySelector("[data-search-input]");
  var cards = Array.prototype.slice.call(document.querySelectorAll("[data-card]"));
  var filterButtons = Array.prototype.slice.call(document.querySelectorAll("[data-filter-button]"));
  var emptyMessage = document.querySelector("[data-no-results]");
  var activeFilter = "all";

  if (!cards.length) {
    return;
  }

  function normalize(value) {
    return String(value || "").trim().toLowerCase();
  }

  function cardMatchesFilter(card) {
    if (activeFilter === "all") {
      return true;
    }

    var fields = [
      card.dataset.type,
      card.dataset.region,
      card.dataset.genre,
      card.dataset.year,
      card.dataset.search
    ].map(normalize).join(" ");

    return fields.indexOf(normalize(activeFilter)) !== -1;
  }

  function cardMatchesTerm(card, term) {
    if (!term) {
      return true;
    }

    var searchable = normalize(card.dataset.search || card.textContent);
    return searchable.indexOf(term) !== -1;
  }

  function applyFilters() {
    var term = normalize(input ? input.value : "");
    var visibleCount = 0;

    cards.forEach(function (card) {
      var visible = cardMatchesFilter(card) && cardMatchesTerm(card, term);
      card.hidden = !visible;

      if (visible) {
        visibleCount += 1;
      }
    });

    if (emptyMessage) {
      emptyMessage.hidden = visibleCount !== 0;
    }
  }

  if (input) {
    input.addEventListener("input", applyFilters);
  }

  filterButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      activeFilter = button.dataset.filterButton || "all";

      filterButtons.forEach(function (item) {
        item.classList.toggle("is-active", item === button);
      });

      applyFilters();
    });
  });

  applyFilters();
}

function initializeImageFallbacks() {
  var images = Array.prototype.slice.call(document.querySelectorAll("img"));

  images.forEach(function (image) {
    image.addEventListener("error", function () {
      image.classList.add("image-missing");
      image.removeAttribute("src");
    }, { once: true });
  });
}
