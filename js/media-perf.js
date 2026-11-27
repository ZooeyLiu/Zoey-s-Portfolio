// Pause autoplaying videos while they are off screen and resume them when they
// come back, so the browser only decodes what the visitor can see.
// Only videos this script paused are resumed — a video the visitor paused
// with its controls stays paused.
(function () {
  if (!('IntersectionObserver' in window)) return;

  function init() {
    var videos = document.querySelectorAll('video[autoplay]');
    if (!videos.length) return;

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        var v = e.target;
        if (e.isIntersecting) {
          if (v.dataset.autoPaused) {
            delete v.dataset.autoPaused;
            var p = v.play();
            if (p && p.catch) p.catch(function () {});
          }
        } else if (!v.paused) {
          v.dataset.autoPaused = '1';
          v.pause();
        }
      });
    }, { rootMargin: '200px 0px' });

    videos.forEach(function (v) { io.observe(v); });

    // Also stop everything while the tab is hidden.
    document.addEventListener('visibilitychange', function () {
      videos.forEach(function (v) {
        if (document.hidden) {
          if (!v.paused) { v.dataset.tabPaused = '1'; v.pause(); }
        } else if (v.dataset.tabPaused) {
          delete v.dataset.tabPaused;
          var p = v.play();
          if (p && p.catch) p.catch(function () {});
        }
      });
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
