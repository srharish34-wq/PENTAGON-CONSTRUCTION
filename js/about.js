/* ==========================================================================
   PENTAGAN — About page: award poster lightbox
   Any button with data-lightbox="path/to/image.jpg" opens that image in a
   native <dialog>. Esc, the close button or a click outside closes it.
   ========================================================================== */
(function () {
  'use strict';

  var box = document.getElementById('lightbox');
  var img = document.getElementById('lightboxImg');
  if (!box || !img) return;

  var supportsModal = typeof box.showModal === 'function';
  var lastTrigger = null;

  document.addEventListener('click', function (e) {
    var open = e.target.closest('[data-lightbox]');
    if (open) {
      lastTrigger = open;
      img.src = open.getAttribute('data-lightbox');
      document.body.style.overflow = 'hidden';
      if (supportsModal) box.showModal(); else box.setAttribute('open', '');
      var close = box.querySelector('[data-lightbox-close]');
      if (close) close.focus();
      return;
    }
    if (e.target.closest('[data-lightbox-close]') || e.target === box) {
      if (supportsModal) box.close(); else box.removeAttribute('open');
    }
  });

  box.addEventListener('close', function () {
    document.body.style.overflow = '';
    if (lastTrigger) lastTrigger.focus();
  });
})();
