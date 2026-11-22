/* ==========================================================================
   DOORLIT — IROOM Academy (sample 04) interactions
   탭 · 게시판 필터/펼치기 · 카운트업 · 신청 폼(검증 + 완료 피드백)
   ========================================================================== */
(function () {
  "use strict";

  var reduceMotion =
    window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- 1. 커리큘럼 탭 ---------- */
  document.querySelectorAll("[data-tabs]").forEach(function (group) {
    var tabs = Array.prototype.slice.call(group.querySelectorAll('[role="tab"]'));
    if (!tabs.length) return;

    function select(tab) {
      tabs.forEach(function (t) {
        var on = t === tab;
        t.setAttribute("aria-selected", on ? "true" : "false");
        t.tabIndex = on ? 0 : -1;
        var panel = document.getElementById(t.getAttribute("aria-controls"));
        if (panel) {
          panel.hidden = !on;
          if (on) {
            panel.classList.remove("is-entered");
            void panel.offsetWidth;
            panel.classList.add("is-entered");
          }
        }
      });
    }

    tabs.forEach(function (tab, i) {
      tab.addEventListener("click", function () {
        select(tab);
      });
      tab.addEventListener("keydown", function (e) {
        var next = null;
        if (e.key === "ArrowRight") next = tabs[(i + 1) % tabs.length];
        if (e.key === "ArrowLeft") next = tabs[(i - 1 + tabs.length) % tabs.length];
        if (e.key === "Home") next = tabs[0];
        if (e.key === "End") next = tabs[tabs.length - 1];
        if (next) {
          e.preventDefault();
          next.focus();
          select(next);
        }
      });
    });
  });

  /* ---------- 2. 게시판 카테고리 필터 ---------- */
  document.querySelectorAll("[data-board]").forEach(function (board) {
    var chips = Array.prototype.slice.call(board.querySelectorAll("[data-filter]"));
    var rows = Array.prototype.slice.call(board.querySelectorAll(".board-row"));
    var empty = board.querySelector(".board-empty");

    function apply(filter) {
      var shown = 0;
      rows.forEach(function (row) {
        var hit = filter === "all" || row.getAttribute("data-cat") === filter;
        row.hidden = !hit;
        if (hit) shown += 1;
      });
      if (empty) empty.hidden = shown !== 0;
    }

    chips.forEach(function (chip) {
      chip.addEventListener("click", function () {
        chips.forEach(function (c) {
          var on = c === chip;
          c.classList.toggle("is-active", on);
          c.setAttribute("aria-pressed", on ? "true" : "false");
        });
        apply(chip.getAttribute("data-filter"));
      });
    });
  });

  /* ---------- 3. 게시판 행 펼치기 ---------- */
  document.querySelectorAll(".board-summary").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var row = btn.closest(".board-row");
      var detail = row ? row.querySelector(".board-detail") : null;
      if (!detail) return;
      var open = btn.getAttribute("aria-expanded") === "true";
      btn.setAttribute("aria-expanded", open ? "false" : "true");
      row.classList.toggle("is-open", !open);
      detail.hidden = open;
    });
  });

  /* ---------- 4. 숫자 카운트업 ---------- */
  var counters = Array.prototype.slice.call(document.querySelectorAll("[data-countup]"));
  function format(el, value) {
    var decimals = parseInt(el.getAttribute("data-decimals") || "0", 10);
    var text = value.toFixed(decimals);
    if (decimals === 0 && value >= 1000) {
      text = text.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }
    el.textContent = text;
  }

  function runCounter(el) {
    var to = parseFloat(el.getAttribute("data-countup")) || 0;
    if (reduceMotion) {
      format(el, to);
      return;
    }
    var duration = 1400;
    var start = null;
    function step(ts) {
      if (start === null) start = ts;
      var p = Math.min((ts - start) / duration, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      format(el, to * eased);
      if (p < 1) requestAnimationFrame(step);
      else format(el, to);
    }
    requestAnimationFrame(step);
  }

  if (counters.length) {
    if (!("IntersectionObserver" in window) || reduceMotion) {
      counters.forEach(runCounter);
    } else {
      var io = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              runCounter(entry.target);
              io.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.4 }
      );
      counters.forEach(function (el) {
        io.observe(el);
      });
    }
  }

  /* ---------- 5. 신청 폼 (레벨테스트 · 입학상담) ---------- */
  var form = document.querySelector("[data-academy-form]");
  if (form) {
    var success = document.querySelector("[data-form-success]");
    var fields = Array.prototype.slice.call(
      form.querySelectorAll("input, select, textarea")
    );

    function wrapOf(field) {
      return field.closest(".field") || field.parentElement;
    }

    function setError(field, hasError, message) {
      var wrap = wrapOf(field);
      if (wrap) wrap.classList.toggle("has-error", hasError);
      field.setAttribute("aria-invalid", hasError ? "true" : "false");
      var slot = wrap ? wrap.querySelector(".field-error") : null;
      if (slot && message) slot.textContent = message;
    }

    function validate(field) {
      if (!field.name) return true;
      var value = (field.value || "").trim();
      var ok = true;
      var message = "";

      if (field.hasAttribute("required")) {
        ok = field.type === "checkbox" ? field.checked : value !== "";
        if (!ok) message = field.getAttribute("data-error") || "필수 항목입니다.";
      }

      if (ok && field.type === "tel") {
        var digits = value.replace(/[^0-9]/g, "");
        ok = digits.length >= 9 && digits.length <= 11;
        if (!ok) message = "연락 가능한 번호를 정확히 입력해 주세요.";
      }

      if (ok && field.name === "studentName") {
        ok = value.length >= 2;
        if (!ok) message = "이름을 2자 이상 입력해 주세요.";
      }

      if (ok && field.type === "date" && value) {
        var today = new Date();
        today.setHours(0, 0, 0, 0);
        var picked = new Date(value + "T00:00:00");
        ok = picked >= today;
        if (!ok) message = "오늘 이후 날짜를 선택해 주세요.";
      }

      setError(field, !ok, message);
      return ok;
    }

    fields.forEach(function (field) {
      field.addEventListener("input", function () {
        if (wrapOf(field).classList.contains("has-error")) validate(field);
      });
      field.addEventListener("change", function () {
        if (wrapOf(field).classList.contains("has-error")) validate(field);
      });
      field.addEventListener("blur", function () {
        if (field.value) validate(field);
      });
    });

    function labelOf(field) {
      var label = field.id ? form.querySelector('label[for="' + field.id + '"]') : null;
      if (!label) {
        var wrap = wrapOf(field);
        label = wrap ? wrap.querySelector(".field-label, label") : null;
      }
      if (!label) return field.name;
      return label.textContent.replace(/\s+/g, " ").trim();
    }

    function readValue(field) {
      if (field.type === "checkbox") return field.checked ? "동의함" : "";
      if (field.tagName === "SELECT") {
        return field.value ? field.options[field.selectedIndex].text.trim() : "";
      }
      if (field.type === "date") {
        if (!field.value) return "";
        var p = field.value.split("-");
        return p.length === 3 ? p[0] + ". " + Number(p[1]) + ". " + Number(p[2]) + "." : field.value;
      }
      return (field.value || "").trim();
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var firstBad = null;
      fields.forEach(function (field) {
        if (!validate(field) && !firstBad) firstBad = field;
      });
      if (firstBad) {
        firstBad.focus({ preventScroll: true });
        firstBad.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "center" });
        return;
      }

      var rows = [];
      fields.forEach(function (field) {
        if (!field.name || field.type === "checkbox") return;
        var value = readValue(field);
        if (!value) return;
        rows.push([labelOf(field), value]);
      });

      var ticket = "IR-" + String(new Date().getFullYear()).slice(2) +
        String(new Date().getMonth() + 1).padStart(2, "0") + "-" +
        String(Math.floor(Math.random() * 9000) + 1000);

      if (success) {
        var box = success.querySelector("[data-success-rows]");
        if (box) {
          box.innerHTML = "";
          rows.forEach(function (row) {
            var div = document.createElement("div");
            var dt = document.createElement("dt");
            var dd = document.createElement("dd");
            dt.textContent = row[0];
            dd.textContent = row[1];
            div.appendChild(dt);
            div.appendChild(dd);
            box.appendChild(div);
          });
        }
        var no = success.querySelector("[data-success-ticket]");
        if (no) no.textContent = ticket;
        success.hidden = false;
        success.classList.add("is-visible");
        form.hidden = true;
        success.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "center" });
      }

      form.reset();
      fields.forEach(function (field) {
        setError(field, false);
      });
    });

    var again = document.querySelector("[data-form-again]");
    if (again && success) {
      again.addEventListener("click", function () {
        success.hidden = true;
        success.classList.remove("is-visible");
        form.hidden = false;
        var first = form.querySelector("input, select, textarea");
        if (first) first.focus();
      });
    }
  }
})();
