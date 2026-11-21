/* ==========================================================================
   Sample 01 — 온유 필라테스: 예약 폼 보조
   ========================================================================== */
(function () {
  "use strict";

  var dateInput = document.getElementById("rs-date");
  if (!dateInput) return;

  function iso(date) {
    var offset = date.getTimezoneOffset() * 60000;
    return new Date(date.getTime() - offset).toISOString().slice(0, 10);
  }

  var today = new Date();
  var limit = new Date();
  limit.setDate(limit.getDate() + 60);

  dateInput.min = iso(today);
  dateInput.max = iso(limit);

  /* 일요일은 휴무 — 고르면 안내 문구를 띄웁니다 */
  var field = dateInput.closest(".field");
  var hint = document.createElement("span");
  hint.className = "form-note";
  hint.style.color = "#8a6a52";
  hint.hidden = true;
  hint.textContent = "일요일은 휴무입니다. 다른 날짜를 골라 주세요.";
  if (field) field.appendChild(hint);

  dateInput.addEventListener("change", function () {
    if (!dateInput.value) {
      hint.hidden = true;
      return;
    }
    var picked = new Date(dateInput.value + "T00:00:00");
    hint.hidden = picked.getDay() !== 0;
  });

  var form = document.getElementById("reserve-form");
  if (form) {
    form.addEventListener("reset", function () {
      hint.hidden = true;
    });
  }
})();
