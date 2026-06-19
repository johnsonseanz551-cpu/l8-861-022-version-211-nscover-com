import { H as Hls } from "./hls-vendor-dru42stk.js";

document.addEventListener("DOMContentLoaded", function () {
  var players = Array.prototype.slice.call(document.querySelectorAll("[data-hls-player]"));
  players.forEach(setupPlayer);
});

function setupPlayer(wrapper) {
  var video = wrapper.querySelector("video");
  var startButton = wrapper.querySelector("[data-player-start]");
  var status = wrapper.querySelector("[data-player-status]");
  var source = wrapper.dataset.src;
  var initialized = false;
  var hls = null;

  if (!video || !source) {
    setStatus("播放源不可用");
    return;
  }

  function setStatus(message) {
    if (status) {
      status.textContent = message;
    }
  }

  function attachSource() {
    if (initialized) {
      return Promise.resolve();
    }

    initialized = true;
    setStatus("正在加载播放源");

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = source;
      setStatus("已加载原生 HLS 播放源");
      return Promise.resolve();
    }

    if (Hls && Hls.isSupported()) {
      hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true
      });

      hls.loadSource(source);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, function () {
        setStatus("播放源加载完成");
      });

      hls.on(Hls.Events.ERROR, function (event, data) {
        if (data && data.fatal) {
          setStatus("播放遇到错误，正在尝试恢复");

          if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
            hls.startLoad();
          } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
            hls.recoverMediaError();
          } else {
            hls.destroy();
          }
        }
      });

      return Promise.resolve();
    }

    setStatus("当前浏览器不支持 HLS 播放");
    return Promise.reject(new Error("HLS is not supported"));
  }

  function playVideo() {
    attachSource().then(function () {
      wrapper.classList.add("is-playing");
      return video.play();
    }).then(function () {
      setStatus("正在播放");
    }).catch(function () {
      setStatus("点击视频控件即可继续播放");
    });
  }

  if (startButton) {
    startButton.addEventListener("click", playVideo);
  }

  video.addEventListener("play", function () {
    wrapper.classList.add("is-playing");
    setStatus("正在播放");
  });

  video.addEventListener("pause", function () {
    setStatus("已暂停");
  });

  video.addEventListener("error", function () {
    setStatus("播放失败，请稍后重试");
  });

  window.addEventListener("pagehide", function () {
    if (hls) {
      hls.destroy();
      hls = null;
    }
  });
}
