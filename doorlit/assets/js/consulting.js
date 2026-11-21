/* ==========================================================================
   Sample 02 — 더결 인테리어: 시공사례 필터
   ========================================================================== */
(function () {
  "use strict";

  var buttons = Array.prototype.slice.call(document.querySelectorAll(".filter-btn"));
  var items = Array.prototype.slice.call(document.querySelectorAll(".c-work-item"));
  if (!buttons.length || !items.length) return;

  buttons.forEach(function (button) {
    button.addEventListener("click", function () {
      var filter = button.getAttribute("data-filter");

      buttons.forEach(function (other) {
        var active = other === button;
        other.classList.toggle("is-active", active);
        other.setAttribute("aria-pressed", String(active));
      });

      items.forEach(function (item) {
        var show = filter === "all" || item.getAttribute("data-cat") === filter;
        item.classList.toggle("is-hidden", !show);
        if (show) item.classList.add("is-visible");
      });
    });
  });
})();
