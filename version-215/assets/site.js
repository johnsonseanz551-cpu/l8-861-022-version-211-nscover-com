
document.addEventListener("DOMContentLoaded", function () {
  var toggle = document.querySelector("[data-nav-toggle]");
  var mobileNav = document.querySelector("[data-mobile-nav]");
  if (toggle && mobileNav) {
    toggle.addEventListener("click", function () {
      mobileNav.classList.toggle("is-open");
      var expanded = mobileNav.classList.contains("is-open");
      toggle.setAttribute("aria-expanded", expanded ? "true" : "false");
    });
  }

  document.querySelectorAll("[data-card-filter]").forEach(function (input) {
    var target = input.getAttribute("data-target") || "[data-card]";
    var scope = input.closest("[data-filter-scope]") || document;
    var cards = Array.prototype.slice.call(scope.querySelectorAll(target));
    input.addEventListener("input", function () {
      var value = input.value.trim().toLowerCase();
      cards.forEach(function (card) {
        var text = (card.getAttribute("data-search") || card.textContent || "").toLowerCase();
        card.hidden = value.length > 0 && text.indexOf(value) === -1;
      });
    });
  });

  var hero = document.querySelector("[data-hero]");
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var copies = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-copy]"));
    var active = 0;
    var show = function (index) {
      if (!slides.length) {
        return;
      }
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === active);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === active);
      });
      copies.forEach(function (copy, i) {
        copy.classList.toggle("is-active", i === active);
      });
    };
    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        show(i);
      });
    });
    show(0);
    if (slides.length > 1) {
      window.setInterval(function () {
        show(active + 1);
      }, 5200);
    }
  }
});
