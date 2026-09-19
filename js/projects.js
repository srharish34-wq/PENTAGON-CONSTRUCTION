/* PENTAGAN PROJECT PAGE FILTER */
(function () {
  "use strict";

  document.querySelectorAll(".filter-buttons").forEach(function (bar) {
    var gridId = bar.getAttribute("data-grid");
    var grid = document.getElementById(gridId);
    if (!grid) return;

    var cards = Array.prototype.slice.call(grid.querySelectorAll(".project-card"));
    var buttons = bar.querySelectorAll(".filter-btn");

    buttons.forEach(function (button) {
      button.addEventListener("click", function () {
        var filter = button.getAttribute("data-filter");

        buttons.forEach(function (b) { b.classList.remove("active"); });
        button.classList.add("active");

        var visible = 0;
        cards.forEach(function (card) {
          var show = filter === "all" || card.getAttribute("data-category") === filter;
          card.classList.toggle("is-hidden", !show);
          if (show) visible++;
        });

        var count = document.getElementById(gridId === "ongoingGrid" ? "ongoingCount" : "completedCount");
        if (count) count.textContent = visible;
      });
    });
  });
})();