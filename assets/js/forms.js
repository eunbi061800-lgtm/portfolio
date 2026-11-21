/* ==========================================================================
   Studio Naru — form handling (validation, summary modal)
   사용법:
     <form data-form data-modal="#inquiry-modal" data-summary="#inquiry-summary">
   - required 필드와 체크박스를 검사하고, 입력값을 모달 요약으로 보여줍니다.
   - 실제 전송은 form의 action 또는 별도 스크립트로 연결하면 됩니다.
   ========================================================================== */
(function () {
  "use strict";

  function fieldLabel(field) {
    var id = field.getAttribute("id");
    var label = id ? document.querySelector('label[for="' + id + '"]') : null;
    if (!label) {
      var wrap = field.closest(".field");
      label = wrap ? wrap.querySelector(".field-label, label") : null;
    }
    if (!label) return field.getAttribute("name") || "";
    return label.textContent.replace(/\s+/g, " ").trim();
  }

  function fieldValue(field) {
    if (field.type === "checkbox") return field.checked ? "동의" : "";
    if (field.tagName === "SELECT") {
      return field.value ? field.options[field.selectedIndex].text.trim() : "";
    }
    if (field.type === "date") {
      var raw = field.value;
      if (!raw) return "";
      var parts = raw.split("-");
      return parts.length === 3 ? parts[0] + ". " + Number(parts[1]) + ". " + Number(parts[2]) + "." : raw;
    }
    return field.value.trim();
  }

  function setError(field, hasError) {
    var wrap = field.closest(".field");
    if (wrap) wrap.classList.toggle("has-error", hasError);
    field.setAttribute("aria-invalid", hasError ? "true" : "false");
  }

  function validateField(field) {
    var value = fieldValue(field);
    var ok = true;

    if (field.hasAttribute("required")) {
      ok = field.type === "checkbox" ? field.checked : value !== "";
    }

    if (ok && field.type === "tel" && value) {
      var digits = value.replace(/[^0-9]/g, "");
      ok = digits.length >= 9 && digits.length <= 11;
    }

    setError(field, !ok);
    return ok;
  }

  function collect(form) {
    var rows = [];
    form.querySelectorAll("input, select, textarea").forEach(function (field) {
      if (!field.name || field.type === "hidden") return;
      var value = fieldValue(field);
      if (!value) return;
      rows.push({ label: fieldLabel(field), value: value });
    });
    return rows;
  }

  function fillSummary(list, rows) {
    list.innerHTML = "";
    rows.forEach(function (row) {
      var wrap = document.createElement("div");
      var dt = document.createElement("dt");
      var dd = document.createElement("dd");
      dt.textContent = row.label;
      dd.textContent = row.value;
      wrap.appendChild(dt);
      wrap.appendChild(dd);
      list.appendChild(wrap);
    });
  }

  function init(form) {
    var modal = document.querySelector(form.getAttribute("data-modal") || "#inquiry-modal");
    var summary = document.querySelector(form.getAttribute("data-summary") || "#inquiry-summary");
    var fields = Array.prototype.slice.call(form.querySelectorAll("input, select, textarea"));

    fields.forEach(function (field) {
      var clear = function () {
        if (field.closest(".field") && field.closest(".field").classList.contains("has-error")) {
          validateField(field);
        }
      };
      field.addEventListener("input", clear);
      field.addEventListener("change", clear);
    });

    form.addEventListener("submit", function (event) {
      event.preventDefault();

      var firstInvalid = null;
      fields.forEach(function (field) {
        if (!validateField(field) && !firstInvalid) firstInvalid = field;
      });

      if (firstInvalid) {
        firstInvalid.focus({ preventScroll: true });
        firstInvalid.scrollIntoView({ behavior: "smooth", block: "center" });
        return;
      }

      if (summary) fillSummary(summary, collect(form));
      if (window.NaruUI && modal) window.NaruUI.showModal(modal);
      form.reset();
      fields.forEach(function (field) {
        setError(field, false);
      });
    });
  }

  document.querySelectorAll("form[data-form]").forEach(init);
})();
