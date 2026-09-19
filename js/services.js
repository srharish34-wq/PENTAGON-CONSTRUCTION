/* ==========================================================================
   PENTAGAN — Services page
   1. "Explore Service" opens a detail dialog built from the card itself
      (title, text and image come from the card; the scope list comes from
      the card's data-scope attribute, items separated by "|").
   2. Arriving with #housing, #roads, etc. briefly highlights that card.
   ========================================================================== */
(function () {
  'use strict';

  var dialog = document.getElementById('svcDialog');
  if (!dialog) return;

  var titleEl = document.getElementById('svcDialogTitle');
  var textEl  = document.getElementById('svcDialogText');
  var scopeEl = document.getElementById('svcDialogScope');
  var imgEl   = document.getElementById('svcDialogImg');
  var mediaEl = imgEl.parentElement;
  var lastTrigger = null;

  var supportsModal = typeof dialog.showModal === 'function';

  imgEl.addEventListener('error', function () {
    imgEl.style.display = 'none';
  });

  function fill(card) {
    var srcImg = card.querySelector('.svc__media img');
    titleEl.textContent = card.querySelector('h3').textContent;
    textEl.textContent = card.querySelector('.svc__body p').textContent;

    scopeEl.innerHTML = '';
    (card.getAttribute('data-scope') || '').split('|').forEach(function (item) {
      item = item.trim();
      if (!item) return;
      var li = document.createElement('li');
      li.textContent = item;
      scopeEl.appendChild(li);
    });

    imgEl.style.display = '';
    if (srcImg && srcImg.getAttribute('src')) {
      imgEl.src = srcImg.getAttribute('src');
      imgEl.alt = srcImg.getAttribute('alt') || '';
    } else {
      imgEl.removeAttribute('src');
      imgEl.style.display = 'none';
    }
    mediaEl.hidden = false;
  }

  function openFor(trigger) {
    var card = trigger.closest('.svc');
    if (!card) return;
    lastTrigger = trigger;
    fill(card);
    document.body.classList.add('dialog-open');
    if (supportsModal) dialog.showModal();
    else dialog.setAttribute('open', '');
    var close = dialog.querySelector('.svc-dialog__close');
    if (close) close.focus();
  }

  function closeDialog() {
    if (supportsModal) dialog.close();
    else dialog.removeAttribute('open');
  }

  dialog.addEventListener('close', function () {
    document.body.classList.remove('dialog-open');
    if (lastTrigger) lastTrigger.focus();
  });

  document.addEventListener('click', function (e) {
    var open = e.target.closest('[data-service]');
    if (open) { openFor(open); return; }
    if (e.target.closest('[data-dialog-close]')) { closeDialog(); return; }
    // click on the backdrop (the dialog element itself, outside its content box)
    if (e.target === dialog) closeDialog();
  });

  /* Highlight the card named in the URL hash */
  function highlightFromHash() {
    var id = window.location.hash.replace('#', '');
    if (!id) return;
    var card = document.querySelector('.svc#' + CSS.escape(id));
    if (!card) return;
    card.classList.add('is-target');
    setTimeout(function () { card.classList.remove('is-target'); }, 2400);
  }
  highlightFromHash();
  window.addEventListener('hashchange', highlightFromHash);
})();
