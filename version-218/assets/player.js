function initMoviePlayer(options) {
    const video = document.getElementById(options.videoId);
    const overlay = document.getElementById(options.overlayId);
    const sourceUrl = options.sourceUrl;
    let hls = null;
    let ready = false;

    if (!video || !overlay || !sourceUrl) {
        return;
    }

    const prepare = function () {
        if (ready) {
            return;
        }
        ready = true;

        if (window.Hls && window.Hls.isSupported()) {
            hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(sourceUrl);
            hls.attachMedia(video);
        } else {
            video.src = sourceUrl;
        }
    };

    const start = function () {
        prepare();
        const promise = video.play();
        overlay.classList.add('is-hidden');
        if (promise && typeof promise.catch === 'function') {
            promise.catch(function () {
                overlay.classList.remove('is-hidden');
            });
        }
    };

    overlay.addEventListener('click', start);

    video.addEventListener('click', function () {
        if (video.paused) {
            start();
        } else {
            video.pause();
            overlay.classList.remove('is-hidden');
        }
    });

    video.addEventListener('play', function () {
        overlay.classList.add('is-hidden');
    });

    video.addEventListener('pause', function () {
        overlay.classList.remove('is-hidden');
    });

    video.addEventListener('ended', function () {
        overlay.classList.remove('is-hidden');
    });

    window.addEventListener('pagehide', function () {
        if (hls) {
            hls.destroy();
            hls = null;
        }
    });

    prepare();
}
