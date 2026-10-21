/* Optional enhancement. Without JavaScript, the original gallery and its links remain. */
(function(){
  function init(){
    const gallery = document.getElementById('rx-gallery');
    const toggle = document.getElementById('rx-gallery-motion');
    if (!gallery || !toggle) return;
    toggle.addEventListener('click', function(){
      const paused = gallery.dataset.motionPaused !== 'true';
      gallery.dataset.motionPaused = String(paused);
      toggle.setAttribute('aria-pressed', String(paused));
      toggle.textContent = paused ? 'Resume moving figures' : 'Pause moving figures';
    });
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, {once:true});
  } else {
    init();
  }
})();
