/* ==========================================================================
   SAMPLE 03 — 바른홈케어: 빠른 견적 연결 (서비스 미리 선택, 카톡 시연 모달)
   ========================================================================== */
(function () {
  "use strict";

  /* ---------- 서비스 카드 → 견적 폼 미리 선택 ---------- */
  var serviceSelect = document.getElementById("q-service");
  var quoteSection = document.getElementById("quote");

  if (serviceSelect) {
    document.querySelectorAll("[data-package]").forEach(function (link) {
      link.addEventListener("click", function () {
        var value = link.getAttribute("data-package") || "";
        Array.prototype.forEach.call(serviceSelect.options, function (option) {
          if (option.text === value || option.value === value) {
            serviceSelect.selectedIndex = option.index;
          }
        });
      });
    });
  }

  /* ---------- 카톡 상담: 시연 안내 모달 ---------- */
  var kakaoModal = document.getElementById("kakao-modal");

  if (kakaoModal) {
    document.querySelectorAll("[data-demo-kakao]").forEach(function (trigger) {
      trigger.addEventListener("click", function (event) {
        event.preventDefault();
        if (window.NaruUI) {
          window.NaruUI.showModal(kakaoModal);
        } else {
          kakaoModal.hidden = false;
        }
      });
    });
  }

  /* ---------- 날짜 최소값: 오늘 ---------- */
  var dateInput = document.getElementById("q-date");
  if (dateInput) {
    var now = new Date();
    var iso = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 10);
    dateInput.setAttribute("min", iso);
  }

  /* ---------- 견적 폼으로 이동할 때 폼에 포커스 ---------- */
  if (quoteSection) {
    document.querySelectorAll('a[href="#quote"]').forEach(function (link) {
      link.addEventListener("click", function () {
        window.setTimeout(function () {
          var first = serviceSelect && !serviceSelect.value ? document.getElementById("q-size") : null;
          if (first) first.focus({ preventScroll: true });
        }, 500);
      });
    });
  }
})();
