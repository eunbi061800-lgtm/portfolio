/* =========================================================
   BAREUN LEADERS ORTHOPEDIC CLINIC — interactions
   ========================================================= */
(function () {
  "use strict";

  var $ = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); };
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- header ---------- */
  var header = $(".site-header");
  function onScroll() {
    if (!header) return;
    header.classList.toggle("is-scrolled", window.scrollY > 10);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- mobile drawer ---------- */
  var burger = $(".burger");
  var drawer = $(".drawer");
  function closeDrawer() {
    document.body.classList.remove("drawer-open");
    if (burger) burger.setAttribute("aria-expanded", "false");
  }
  if (burger && drawer) {
    burger.addEventListener("click", function () {
      var open = document.body.classList.toggle("drawer-open");
      burger.setAttribute("aria-expanded", open ? "true" : "false");
    });
    $$("a", drawer).forEach(function (a) { a.addEventListener("click", closeDrawer); });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeDrawer();
    });
  }

  /* ---------- hero slider ---------- */
  var hero = $("[data-slider]");
  if (hero) {
    var slides = $$(".hero__slide", hero);
    var dots = $$(".hero__dot", hero);
    var current = 0;
    var timer = null;
    var DURATION = 6500;

    var go = function (i) {
      current = (i + slides.length) % slides.length;
      slides.forEach(function (s, n) { s.classList.toggle("is-active", n === current); });
      dots.forEach(function (d, n) {
        d.classList.toggle("is-active", n === current);
        d.setAttribute("aria-current", n === current ? "true" : "false");
      });
    };
    var play = function () {
      if (reduceMotion) return;
      stop();
      timer = window.setInterval(function () { go(current + 1); }, DURATION);
    };
    var stop = function () { if (timer) { window.clearInterval(timer); timer = null; } };

    dots.forEach(function (d, n) {
      d.addEventListener("click", function () { go(n); play(); });
    });
    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", play);
    hero.addEventListener("focusin", stop);
    hero.addEventListener("focusout", play);
    document.addEventListener("visibilitychange", function () {
      if (document.hidden) stop(); else play();
    });
    go(0);
    play();
  }

  /* ---------- reveal on scroll ---------- */
  var reveals = $$("[data-reveal]");
  if (reveals.length) {
    if (!("IntersectionObserver" in window) || reduceMotion) {
      reveals.forEach(function (el) { el.classList.add("is-in"); });
    } else {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            io.unobserve(entry.target);
          }
        });
      }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
      reveals.forEach(function (el) { io.observe(el); });
    }
  }

  /* ---------- modal helpers ---------- */
  function openModal(el) {
    if (!el) return;
    el.classList.add("is-open");
    el.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    var panel = el.querySelector(".modal__panel") || el;
    window.setTimeout(function () {
      if (panel && typeof panel.focus === "function") panel.focus({ preventScroll: true });
    }, 120);
  }
  function closeModal(el) {
    if (!el) return;
    el.classList.remove("is-open");
    el.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }
  $$("[data-modal-close]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      closeModal(btn.closest(".modal") || btn.closest(".lb"));
      document.body.style.overflow = "";
    });
  });
  $$(".modal").forEach(function (modal) {
    modal.addEventListener("click", function (e) {
      if (e.target === modal || e.target.classList.contains("modal__dim")) {
        closeModal(modal);
      }
    });
  });
  document.addEventListener("keydown", function (e) {
    if (e.key !== "Escape") return;
    $$(".modal.is-open").forEach(closeModal);
    var lb = $(".lb.is-open");
    if (lb) { lb.classList.remove("is-open"); document.body.style.overflow = ""; }
  });

  /* ---------- notice popup ---------- */
  var notice = $("#notice-modal");
  if (notice) {
    var KEY = "bareun-notice-hide";
    var hiddenUntil = null;
    try { hiddenUntil = window.localStorage.getItem(KEY); } catch (err) { hiddenUntil = null; }
    var today = new Date();
    var stamp = today.getFullYear() + "-" + (today.getMonth() + 1) + "-" + today.getDate();
    if (hiddenUntil !== stamp) {
      window.setTimeout(function () { openModal(notice); }, 1400);
    }
    var hideBox = $("#notice-hide");
    var closeBtn = $("#notice-close");
    if (closeBtn) {
      closeBtn.addEventListener("click", function () {
        if (hideBox && hideBox.checked) {
          try { window.localStorage.setItem(KEY, stamp); } catch (err) {}
        }
        closeModal(notice);
      });
    }
    $$("[data-open-notice]").forEach(function (b) {
      b.addEventListener("click", function () { openModal(notice); });
    });
  }

  /* ---------- tabs ---------- */
  $$("[data-tabs]").forEach(function (group) {
    var tabs = $$(".tab", group);
    var panels = $$(".tab-panel", group);
    tabs.forEach(function (tab, i) {
      tab.addEventListener("click", function () {
        tabs.forEach(function (t, n) {
          t.classList.toggle("is-on", n === i);
          t.setAttribute("aria-selected", n === i ? "true" : "false");
        });
        panels.forEach(function (p, n) { p.classList.toggle("is-on", n === i); });
      });
    });
  });

  /* ---------- symptom self-check ---------- */
  var check = $("#self-check");
  if (check) {
    var boxes = $$("input[type=checkbox]", check);
    var scoreEl = $("#check-score");
    var barEl = $("#check-bar");
    var resultEl = $("#check-result");
    var descEl = $("#check-desc");
    var levels = [
      { max: 2, title: "현재는 큰 이상 신호가 적습니다", desc: "가벼운 통증이라면 자세와 생활 습관을 먼저 점검해 보세요. 증상이 2주 이상 이어지면 진료를 권합니다." },
      { max: 5, title: "진료를 받아보시는 것이 좋습니다", desc: "통증의 원인을 정확히 확인하는 단계입니다. 방사선·초음파 검사 후 비수술 치료 가능성을 함께 상담해 드립니다." },
      { max: 7, title: "가능한 빠른 진료가 필요합니다", desc: "신경 증상이 동반될 수 있는 상태입니다. 가까운 시일 내 내원해 정밀 검사와 치료 계획을 세우시길 권합니다." },
      { max: 99, title: "오늘 바로 진료받으세요", desc: "저림·힘 빠짐이 동반된 경우 신경 압박을 확인해야 합니다. 온라인 예약 또는 전화로 당일 진료를 문의해 주세요." }
    ];
    var total = boxes.length;
    var update = function () {
      var n = boxes.filter(function (b) { return b.checked; }).length;
      if (scoreEl) scoreEl.textContent = String(n).padStart(2, "0");
      if (barEl) barEl.style.width = Math.round((n / total) * 100) + "%";
      var level = levels.filter(function (l) { return n <= l.max; })[0];
      if (resultEl) resultEl.textContent = n === 0 ? "항목을 체크해 주세요" : level.title;
      if (descEl) descEl.textContent = n === 0
        ? "해당되는 증상을 모두 선택하시면 권장 진료 시기를 안내해 드립니다."
        : level.desc;
      boxes.forEach(function (b) {
        var row = b.closest(".check__item");
        if (row) row.classList.toggle("is-on", b.checked);
      });
    };
    boxes.forEach(function (b) { b.addEventListener("change", update); });
    var reset = $("#check-reset");
    if (reset) {
      reset.addEventListener("click", function () {
        boxes.forEach(function (b) { b.checked = false; });
        update();
      });
    }
    update();
  }

  /* ---------- lightbox ---------- */
  var lb = $("#lightbox");
  if (lb) {
    var lbImg = $("img", lb);
    var lbCap = $(".lb__cap", lb);
    $$("[data-lightbox]").forEach(function (link) {
      link.addEventListener("click", function (e) {
        e.preventDefault();
        var target = $("img", link);
        if (!target) return;
        lbImg.src = target.currentSrc || target.src;
        lbImg.alt = target.alt || "";
        if (lbCap) lbCap.textContent = link.getAttribute("data-caption") || target.alt || "";
        lb.classList.add("is-open");
        document.body.style.overflow = "hidden";
      });
    });
  }

  /* ---------- toast ---------- */
  var toastEl = $("#toast");
  var toastTimer = null;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("is-on");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(function () { toastEl.classList.remove("is-on"); }, 2800);
  }
  $$("[data-toast]").forEach(function (el) {
    el.addEventListener("click", function (e) {
      e.preventDefault();
      toast(el.getAttribute("data-toast"));
    });
  });

  /* ---------- reservation form ---------- */
  var form = $("#reserve-form");
  if (form) {
    var done = $("#reserve-done");
    var name = $("#f-name");
    var phone = $("#f-phone");
    var dept = $("#f-dept");
    var date = $("#f-date");
    var time = $("#f-time");
    var agree = $("#f-agree");

    // keep the date picker from offering past days
    if (date) {
      var today = new Date();
      var iso = today.getFullYear() + "-" + String(today.getMonth() + 1).padStart(2, "0") + "-" + String(today.getDate()).padStart(2, "0");
      date.min = iso;
    }

    function fieldOf(input) { return input ? input.closest(".field") : null; }
    function setError(input, on) {
      var f = fieldOf(input);
      if (f) f.classList.toggle("has-error", !!on);
      if (input) input.setAttribute("aria-invalid", on ? "true" : "false");
    }

    function validate() {
      var ok = true;
      var firstBad = null;
      var checks = [
        [name, name && name.value.trim().length >= 2],
        [phone, phone && phone.value.replace(/[^0-9]/g, "").length >= 9],
        [dept, dept && dept.value !== ""],
        [date, date && date.value !== ""]
      ];
      checks.forEach(function (pair) {
        var input = pair[0];
        if (!input) return;
        var good = pair[1];
        setError(input, !good);
        if (!good) { ok = false; if (!firstBad) firstBad = input; }
      });
      var agreed = agree ? agree.checked : true;
      if (agree) agree.closest(".agree").classList.toggle("has-error", !agreed);
      if (!agreed) ok = false;
      if (!ok && firstBad) firstBad.focus();
      return { ok: ok, agreed: agreed };
    }

    [name, phone, dept, date].forEach(function (input) {
      if (!input) return;
      input.addEventListener("input", function () { setError(input, false); });
      input.addEventListener("change", function () { setError(input, false); });
    });
    if (agree) {
      agree.addEventListener("change", function () {
        agree.closest(".agree").classList.remove("has-error");
      });
    }
    if (phone) {
      phone.addEventListener("input", function () {
        var v = phone.value.replace(/[^0-9]/g, "").slice(0, 11);
        var out = v;
        if (v.length > 7) out = v.slice(0, 3) + "-" + v.slice(3, 7) + "-" + v.slice(7);
        else if (v.length > 3) out = v.slice(0, 3) + "-" + v.slice(3);
        phone.value = out;
      });
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var res = validate();
      if (!res.ok) return;

      var d = date.value ? date.value.replace(/-/g, ".") : "";
      var t = time && time.value ? time.value : "시간 미지정";
      var map = {
        "spine": "척추·허리 클리닉",
        "shoulder": "어깨 클리닉",
        "knee": "무릎·족부 클리닉",
        "pain": "비수술 통증 치료",
        "checkup": "정밀 검사·진단",
        "etc": "기타 상담"
      };
      var setText = function (id, val) {
        var el = document.getElementById(id);
        if (el) el.textContent = val;
      };
      setText("done-name", name.value.trim());
      setText("done-dept", map[dept.value] || "진료 상담");
      setText("done-date", d + " " + t);
      setText("done-phone", phone.value);

      openModal(done);
      form.reset();
      [name, phone, dept, date].forEach(function (i) { if (i) setError(i, false); });
    });
  }

  /* ---------- misc ---------- */
  $$("[data-year]").forEach(function (el) { el.textContent = String(new Date().getFullYear()); });
})();
