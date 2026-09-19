/* ==========================================================================
   PENTAGAN — inner pages: image fallbacks + scroll reveal
   Load after js/script.js. Does not touch nav, counters, FAQ or modal code.
   ========================================================================== */
(function () {
  'use strict';

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------------------------------------------------------
     1. Missing images never show a broken icon.
        - img[data-optional]: the whole <figure> is removed.
        - any other img: its parent gets .img-missing (green block).
  ---------------------------------------------------------------- */
  function handleMissing(img) {
    if (img.hasAttribute('data-optional')) {
      var fig = img.closest('figure');
      if (fig && fig.parentNode) { fig.parentNode.removeChild(fig); return; }
    }
    var parent = img.parentElement;
    if (parent) parent.classList.add('img-missing');
    img.style.display = 'none';
  }

  Array.prototype.forEach.call(document.querySelectorAll('img'), function (img) {
    // Skip logos in header/footer and the client marquee; only content images.
    if (!img.closest('main')) return;
    img.addEventListener('error', function () { handleMissing(img); }, { once: true });
    if (img.complete && img.naturalWidth === 0 && img.getAttribute('src')) handleMissing(img);
  });

  /* ---------------------------------------------------------------
     2. Reveal on scroll ([data-reveal] targets).
        The .fx class is added here, so nothing is hidden without JS.
  ---------------------------------------------------------------- */
  var targets = document.querySelectorAll('[data-reveal]');
  if (!targets.length || reduce || !('IntersectionObserver' in window)) return;

  var io = new IntersectionObserver(function (entries, obs) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      var el = entry.target;
      el.classList.add('is-visible');
      // drop the stagger delay so later hover transitions are instant
      setTimeout(function () { el.style.transitionDelay = ''; }, 900);
      obs.unobserve(el);
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  Array.prototype.forEach.call(targets, function (el, i) {
    el.classList.add('fx');
    el.style.transitionDelay = (Math.min(i % 3, 2) * 60) + 'ms';
    io.observe(el);
  });
})();
