(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  function getQuery(name) {
    return new URLSearchParams(window.location.search).get(name) || "";
  }

  function openMobileMenu() {
    var button = document.querySelector("[data-menu-toggle]");
    var panel = document.querySelector("[data-mobile-panel]");
    if (!button || !panel) {
      return;
    }
    button.addEventListener("click", function () {
      panel.classList.toggle("open");
    });
  }

  function setupHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var index = 0;
    var timer;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === index);
      });
    }

    function start() {
      clearInterval(timer);
      timer = setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
        start();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        start();
      });
    }

    start();
  }

  function setupSearch() {
    var page = document.querySelector("[data-search-page]");
    if (!page) {
      return;
    }
    var input = page.querySelector("[data-search-input]");
    var type = page.querySelector("[data-filter-type]");
    var region = page.querySelector("[data-filter-region]");
    var year = page.querySelector("[data-filter-year]");
    var clear = page.querySelector("[data-clear-filter]");
    var cards = Array.prototype.slice.call(page.querySelectorAll(".movie-card"));
    var empty = page.querySelector("[data-empty-state]");

    input.value = getQuery("q");
    if (getQuery("type")) {
      type.value = getQuery("type");
    }

    function filter() {
      var q = normalize(input.value);
      var t = normalize(type.value);
      var r = normalize(region.value);
      var y = normalize(year.value);
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = normalize([
          card.getAttribute("data-title"),
          card.getAttribute("data-region"),
          card.getAttribute("data-type"),
          card.getAttribute("data-year"),
          card.getAttribute("data-tags"),
          card.textContent
        ].join(" "));
        var matched = true;
        if (q && haystack.indexOf(q) === -1) {
          matched = false;
        }
        if (t && normalize(card.getAttribute("data-type")) !== t) {
          matched = false;
        }
        if (r && normalize(card.getAttribute("data-region")) !== r) {
          matched = false;
        }
        if (y && normalize(card.getAttribute("data-year")) !== y) {
          matched = false;
        }
        card.style.display = matched ? "" : "none";
        if (matched) {
          visible += 1;
        }
      });

      if (empty) {
        empty.classList.toggle("show", visible === 0);
      }
    }

    [input, type, region, year].forEach(function (node) {
      node.addEventListener("input", filter);
      node.addEventListener("change", filter);
    });

    clear.addEventListener("click", function () {
      input.value = "";
      type.value = "";
      region.value = "";
      year.value = "";
      filter();
    });

    filter();
  }

  function loadHls(callback) {
    if (window.Hls) {
      callback();
      return;
    }
    var existing = document.querySelector("script[data-hls-script]");
    if (existing) {
      existing.addEventListener("load", callback, { once: true });
      return;
    }
    var script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/hls.js@1/dist/hls.min.js";
    script.async = true;
    script.setAttribute("data-hls-script", "true");
    script.addEventListener("load", callback, { once: true });
    document.head.appendChild(script);
  }

  function setupPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));
    players.forEach(function (shell) {
      var video = shell.querySelector("video");
      var trigger = shell.querySelector("[data-player-trigger]");
      var status = shell.querySelector("[data-player-status]");
      var source = shell.getAttribute("data-src");
      var started = false;
      var hlsInstance = null;

      function setStatus(text) {
        if (status) {
          status.textContent = text || "";
        }
      }

      function playVideo() {
        var promise = video.play();
        if (promise && typeof promise.catch === "function") {
          promise.catch(function () {
            setStatus("点击视频画面继续播放");
          });
        }
      }

      function start() {
        if (!video || !source) {
          return;
        }
        shell.classList.add("is-playing");
        setStatus("正在加载高清播放源");

        if (started) {
          playVideo();
          return;
        }
        started = true;

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = source;
          video.addEventListener("loadedmetadata", function () {
            setStatus("");
            playVideo();
          }, { once: true });
          video.load();
          return;
        }

        loadHls(function () {
          if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new window.Hls({
              enableWorker: true,
              lowLatencyMode: true
            });
            hlsInstance.loadSource(source);
            hlsInstance.attachMedia(video);
            hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
              setStatus("");
              playVideo();
            });
            hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
              if (data && data.fatal) {
                if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                  hlsInstance.recoverMediaError();
                  setStatus("正在恢复播放");
                } else if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                  hlsInstance.startLoad();
                  setStatus("正在重新连接播放源");
                } else {
                  setStatus("当前播放源暂时无法加载");
                }
              }
            });
          } else {
            video.src = source;
            video.load();
            playVideo();
          }
        });
      }

      if (trigger) {
        trigger.addEventListener("click", start);
      }
      shell.addEventListener("click", function (event) {
        if (event.target === video && !started) {
          start();
        }
      });
      video.addEventListener("play", function () {
        shell.classList.add("is-playing");
      });
      window.addEventListener("beforeunload", function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    });
  }

  ready(function () {
    openMobileMenu();
    setupHero();
    setupSearch();
    setupPlayers();
  });
})();
