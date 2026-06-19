
import { H as Hls } from "./hls-vendor-dru42stk.js";

export function setupPlayer(videoId, overlayId, playId, source) {
  var video = document.getElementById(videoId);
  var overlay = document.getElementById(overlayId);
  var button = document.getElementById(playId);
  var ready = false;
  var hls = null;

  if (!video || !source) {
    return;
  }

  function prepare() {
    if (ready) {
      return;
    }
    ready = true;
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = source;
    } else if (Hls && Hls.isSupported()) {
      hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      });
      hls.loadSource(source);
      hls.attachMedia(video);
    } else {
      video.src = source;
    }
  }

  function start() {
    prepare();
    if (overlay) {
      overlay.classList.add("is-hidden");
    }
    var result = video.play();
    if (result && typeof result.catch === "function") {
      result.catch(function () {});
    }
  }

  if (button) {
    button.addEventListener("click", start);
  }
  if (overlay) {
    overlay.addEventListener("click", start);
  }
  video.addEventListener("play", function () {
    if (overlay) {
      overlay.classList.add("is-hidden");
    }
  });
  window.addEventListener("beforeunload", function () {
    if (hls) {
      hls.destroy();
    }
  });
}
