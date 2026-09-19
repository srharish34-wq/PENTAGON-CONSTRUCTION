document.addEventListener('DOMContentLoaded', function () {

  /* ---------- Shared-row accordion for the packages table ---------- */
  var hcTable = document.getElementById('hcTable');
  if (!hcTable) return;

  var rowButtons = hcTable.querySelectorAll('.hc-row');

  rowButtons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var rowKey = btn.getAttribute('data-row');
      var isOpen = btn.getAttribute('aria-expanded') === 'true';
      var nextState = !isOpen;

      /* Toggle every button + panel that share this row index,
         across all three package columns, so comparisons line up. */
      var matchingButtons = hcTable.querySelectorAll('.hc-row[data-row="' + rowKey + '"]');
      var matchingPanels = hcTable.querySelectorAll('.hc-panel[data-panel="' + rowKey + '"]');

      matchingButtons.forEach(function (b) {
        b.setAttribute('aria-expanded', nextState ? 'true' : 'false');
      });
      matchingPanels.forEach(function (p) {
        p.classList.toggle('is-open', nextState);
      });
    });
  });

});