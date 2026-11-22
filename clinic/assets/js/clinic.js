/* ==========================================================================
   DANAHAN 한의원 — interactions & motion
   scroll progress · parallax · stagger reveal · count-up · pointer glow
   program tabs · review filters & board · booking flow
   ========================================================================== */
(function () {
  "use strict";

  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var $ = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); };

  /* ------------------------------------------------------------------ *
   * 1. scroll progress bar
   * ------------------------------------------------------------------ */
  var progress = $(".c-progress");
  if (progress) {
    var setProgress = function () {
      var doc = document.documentElement;
      var max = doc.scrollHeight - window.innerHeight;
      var ratio = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      progress.style.setProperty("--sp", ratio.toFixed(4));
    };
    setProgress();
    window.addEventListener("scroll", setProgress, { passive: true });
    window.addEventListener("resize", setProgress);
  }

  /* ------------------------------------------------------------------ *
   * 2. hero parallax (저속 스크롤 이동 + 배경 톤)
   * ------------------------------------------------------------------ */
  var parallaxItems = $$("[data-parallax]");
  if (parallaxItems.length && !reduced) {
    var ticking = false;
    var runParallax = function () {
      var vh = window.innerHeight;
      parallaxItems.forEach(function (el) {
        var rect = el.getBoundingClientRect();
        if (rect.bottom < -200 || rect.top > vh + 200) return;
        var speed = parseFloat(el.getAttribute("data-parallax")) || 0.12;
        var offset = (rect.top + rect.height / 2 - vh / 2) * -speed;
        el.style.transform = "translate3d(0," + offset.toFixed(1) + "px,0)";
      });
      ticking = false;
    };
    runParallax();
    window.addEventListener("scroll", function () {
      if (!ticking) {
        ticking = true;
        window.requestAnimationFrame(runParallax);
      }
    }, { passive: true });
    window.addEventListener("resize", runParallax);
  }

  /* ------------------------------------------------------------------ *
   * 3. reveal + stagger
   * ------------------------------------------------------------------ */
  $$("[data-stagger]").forEach(function (group) {
    Array.prototype.forEach.call(group.children, function (child, i) {
      if (child.hasAttribute("data-reveal")) {
        child.style.transitionDelay = Math.min(i * 0.075, 0.6).toFixed(3) + "s";
      }
    });
  });

  /* ------------------------------------------------------------------ *
   * 4. count-up numbers
   * ------------------------------------------------------------------ */
  var countEls = $$("[data-count]");
  var easeOut = function (t) { return 1 - Math.pow(1 - t, 3); };

  function runCount(el) {
    var target = parseFloat(el.getAttribute("data-count"));
    var decimals = parseInt(el.getAttribute("data-decimals") || "0", 10);
    var duration = parseInt(el.getAttribute("data-duration") || "1700", 10);
    if (isNaN(target)) return;
    if (reduced) {
      el.textContent = target.toFixed(decimals);
      return;
    }
    var start = null;
    var step = function (stamp) {
      if (!start) start = stamp;
      var p = Math.min(1, (stamp - start) / duration);
      var value = target * easeOut(p);
      el.textContent = decimals
        ? value.toFixed(decimals)
        : Math.round(value).toLocaleString("en-US");
      if (p < 1) window.requestAnimationFrame(step);
      else el.textContent = decimals ? target.toFixed(decimals) : target.toLocaleString("en-US");
    };
    window.requestAnimationFrame(step);
  }

  if (countEls.length) {
    if (!("IntersectionObserver" in window)) {
      countEls.forEach(runCount);
    } else {
      var countObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            runCount(entry.target);
            countObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.4 });
      countEls.forEach(function (el) { countObserver.observe(el); });
    }
  }

  /* ------------------------------------------------------------------ *
   * 5. pointer-follow glow
   * ------------------------------------------------------------------ */
  $$("[data-glow]").forEach(function (card) {
    card.addEventListener("pointermove", function (event) {
      var rect = card.getBoundingClientRect();
      var x = ((event.clientX - rect.left) / rect.width) * 100;
      var y = ((event.clientY - rect.top) / rect.height) * 100;
      card.style.setProperty("--mx", x.toFixed(1) + "%");
      card.style.setProperty("--my", y.toFixed(1) + "%");
    });
  });

  /* ------------------------------------------------------------------ *
   * 6. floating quick bar
   * ------------------------------------------------------------------ */
  var floatBar = $(".c-float");
  if (floatBar) {
    var toggleFloat = function () {
      floatBar.classList.toggle("is-on", window.scrollY > 420);
    };
    toggleFloat();
    window.addEventListener("scroll", toggleFloat, { passive: true });
  }

  /* ------------------------------------------------------------------ *
   * 7. program tabs
   * ------------------------------------------------------------------ */
  var tabbar = $("[data-tabs]");
  if (tabbar) {
    var tabs = $$(".tab", tabbar);
    var panels = $$("[data-panel]");
    var indicator = $(".tab-indicator", tabbar);

    var moveIndicator = function (tab) {
      if (!indicator || !tab) return;
      indicator.style.width = tab.offsetWidth + "px";
      indicator.style.transform = "translateX(" + tab.offsetLeft + "px)";
    };

    var activate = function (id, focus) {
      tabs.forEach(function (tab) {
        var on = tab.getAttribute("data-tab") === id;
        tab.setAttribute("aria-selected", on ? "true" : "false");
        tab.tabIndex = on ? 0 : -1;
        if (on && focus) tab.focus();
        if (on) moveIndicator(tab);
      });
      panels.forEach(function (panel) {
        var on = panel.getAttribute("data-panel") === id;
        panel.hidden = !on;
        panel.classList.remove("is-animating");
        if (on) {
          void panel.offsetWidth;
          panel.classList.add("is-animating");
        }
      });
      if (window.history && window.history.replaceState) {
        window.history.replaceState(null, "", "#" + id);
      }
    };

    tabs.forEach(function (tab, index) {
      tab.addEventListener("click", function () {
        activate(tab.getAttribute("data-tab"), false);
      });
      tab.addEventListener("keydown", function (event) {
        var next = null;
        if (event.key === "ArrowRight") next = tabs[(index + 1) % tabs.length];
        if (event.key === "ArrowLeft") next = tabs[(index - 1 + tabs.length) % tabs.length];
        if (event.key === "Home") next = tabs[0];
        if (event.key === "End") next = tabs[tabs.length - 1];
        if (next) {
          event.preventDefault();
          activate(next.getAttribute("data-tab"), true);
        }
      });
    });

    var initial = (window.location.hash || "").replace("#", "");
    var validInitial = tabs.some(function (tab) { return tab.getAttribute("data-tab") === initial; });
    var activeTab = $('.tab[aria-selected="true"]', tabbar) || tabs[0];
    activate(validInitial ? initial : activeTab.getAttribute("data-tab"), false);
    window.addEventListener("hashchange", function () {
      var key = (window.location.hash || "").replace("#", "");
      if (tabs.some(function (tab) { return tab.getAttribute("data-tab") === key; })) activate(key, false);
    });
    window.addEventListener("resize", function () {
      moveIndicator($('.tab[aria-selected="true"]', tabbar));
    });
  }

  /* ------------------------------------------------------------------ *
   * 8. review board — filter + accordion
   * ------------------------------------------------------------------ */
  var filterWrap = $("[data-filters]");
  if (filterWrap) {
    var filterButtons = $$(".rv-filter", filterWrap);
    var items = $$(".board-item");
    var countOut = $("[data-rv-count]");
    var empty = $("[data-rv-empty]");

    var applyFilter = function (key) {
      var shown = 0;
      items.forEach(function (item) {
        var match = key === "all" || item.getAttribute("data-cat") === key;
        item.classList.toggle("is-hidden", !match);
        if (match) shown += 1;
      });
      if (countOut) countOut.textContent = shown;
      if (empty) empty.hidden = shown !== 0;
    };

    filterButtons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        filterButtons.forEach(function (other) {
          other.classList.toggle("is-active", other === btn);
          other.setAttribute("aria-pressed", other === btn ? "true" : "false");
        });
        applyFilter(btn.getAttribute("data-filter"));
      });
    });

    $$(".board-row").forEach(function (row) {
      row.addEventListener("click", function () {
        var item = row.closest(".board-item");
        var open = item.classList.toggle("is-open");
        row.setAttribute("aria-expanded", open ? "true" : "false");
      });
    });

    applyFilter("all");
  }

  /* ------------------------------------------------------------------ *
   * 9. booking
   * ------------------------------------------------------------------ */
  var booking = $("[data-booking]");
  if (booking) {
    var DAY_NAMES = ["일", "월", "화", "수", "목", "금", "토"];
    var WEEK_SLOTS = ["09:30", "10:20", "11:10", "14:00", "14:50", "15:40", "16:30", "17:20", "18:10"];
    var SAT_SLOTS = ["09:30", "10:20", "11:10", "12:00"];

    var dateScroller = $("[data-dates]", booking);
    var slotWrap = $("[data-slots]", booking);
    var slotHead = $("[data-slot-date]", booking);
    var form = $("form", booking);
    var success = $("[data-success]", booking);
    var state = { date: null, time: null };

    var fmtDate = function (d) {
      return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
    };
    var prettyDate = function (d) {
      return d.getFullYear() + ". " + (d.getMonth() + 1) + ". " + d.getDate() + ". (" + DAY_NAMES[d.getDay()] + ")";
    };

    var today = new Date();
    today.setHours(0, 0, 0, 0);
    var days = [];
    for (var i = 0; i < 21; i += 1) {
      var d = new Date(today.getTime() + i * 86400000);
      days.push(d);
    }

    var slotsFor = function (d) {
      if (d.getDay() === 0) return [];
      if (d.getDay() === 6) return SAT_SLOTS.slice();
      return WEEK_SLOTS.slice();
    };

    var isTaken = function (d, slot, slotIndex) {
      var seed = d.getDate() * 31 + d.getMonth() * 7 + slotIndex * 13;
      return seed % 5 === 0 || seed % 11 === 0;
    };

    var renderSlots = function (d) {
      state.time = null;
      slotWrap.innerHTML = "";
      var base = slotsFor(d);
      if (slotHead) slotHead.textContent = prettyDate(d);
      if (!base.length) {
        slotWrap.innerHTML = '<p class="slot-hint">선택하신 날짜는 휴진일입니다. 다른 날짜를 선택해 주세요.</p>';
        syncSummary();
        return;
      }
      var now = new Date();
      base.forEach(function (slot, index) {
        var btn = document.createElement("button");
        btn.type = "button";
        btn.className = "slot";
        btn.textContent = slot;
        var parts = slot.split(":");
        var slotDate = new Date(d.getTime());
        slotDate.setHours(parseInt(parts[0], 10), parseInt(parts[1], 10), 0, 0);
        var past = slotDate.getTime() < now.getTime();
        var taken = isTaken(d, slot, index);
        if (past || taken) {
          btn.disabled = true;
          btn.title = past ? "지난 시간" : "예약 마감";
        }
        btn.addEventListener("click", function () {
          $$(".slot", slotWrap).forEach(function (el) { el.classList.remove("is-selected"); });
          btn.classList.add("is-selected");
          state.time = slot;
          clearError("bk-time");
          syncSummary();
        });
        slotWrap.appendChild(btn);
      });
      syncSummary();
    };

    days.forEach(function (d, index) {
      var chip = document.createElement("button");
      chip.type = "button";
      chip.className = "date-chip" + (d.getDay() === 0 ? " is-off" : "");
      chip.innerHTML =
        "<b>" + DAY_NAMES[d.getDay()] + "</b>" +
        "<strong>" + d.getDate() + "</strong>" +
        "<span>" + (d.getMonth() + 1) + "월</span>";
      if (d.getDay() === 0) {
        chip.disabled = true;
        chip.setAttribute("aria-disabled", "true");
      }
      chip.addEventListener("click", function () {
        $$(".date-chip", dateScroller).forEach(function (el) { el.classList.remove("is-active"); });
        chip.classList.add("is-active");
        state.date = d;
        clearError("bk-date");
        renderSlots(d);
      });
      if (index === 0 && d.getDay() !== 0) {
        chip.classList.add("is-active");
        state.date = d;
      }
      dateScroller.appendChild(chip);
    });

    if (!state.date) {
      for (var k = 1; k < days.length; k += 1) {
        if (days[k].getDay() !== 0) {
          state.date = days[k];
          var chips = $$(".date-chip", dateScroller);
          chips[k].classList.add("is-active");
          break;
        }
      }
    }
    if (state.date) renderSlots(state.date);

    /* ---- live summary ---- */
    var sumDate = $("[data-sum-date]");
    var sumTime = $("[data-sum-time]");
    var sumType = $("[data-sum-type]");
    var sumProgram = $("[data-sum-program]");
    var sumName = $("[data-sum-name]");
    var sumPhone = $("[data-sum-phone]");

    function setSum(el, value, fallback) {
      if (!el) return;
      el.textContent = value || fallback;
      el.classList.toggle("is-empty", !value);
    }

    function syncSummary() {
      setSum(sumDate, state.date ? prettyDate(state.date) : "", "날짜를 선택해 주세요");
      setSum(sumTime, state.time ? state.time + " 예약" : "", "시간을 선택해 주세요");
      var type = form.querySelector('input[name="visit"]:checked');
      var typeText = type ? type.getAttribute("data-label") : "";
      setSum(sumType, typeText, "초진 / 재진");
      var program = form.querySelector('select[name="program"]');
      setSum(sumProgram, program && program.value ? program.options[program.selectedIndex].text : "", "진료과목");
      var name = form.querySelector('input[name="name"]').value.trim();
      var phone = form.querySelector('input[name="phone"]').value.trim();
      setSum(sumName, name, "성함");
      setSum(sumPhone, phone, "연락처");
    }

    booking.addEventListener("input", syncSummary);
    booking.addEventListener("change", syncSummary);

    /* ---- errors ---- */
    function fieldWrap(id) {
      var input = document.getElementById(id);
      return input ? input.closest(".field") || input.closest(".bk-step") : null;
    }
    function setError(id, message) {
      var wrap = fieldWrap(id);
      if (!wrap) return;
      wrap.classList.add("has-error");
      var box = wrap.querySelector(".field-error[data-for='" + id + "'], .field-error");
      if (box && message) box.textContent = message;
    }
    function clearError(id) {
      var wrap = fieldWrap(id);
      if (!wrap) return;
      wrap.classList.remove("has-error");
    }

    /* ---- phone auto hyphen ---- */
    var phoneInput = form.querySelector('input[name="phone"]');
    if (phoneInput) {
      phoneInput.addEventListener("input", function () {
        var digits = phoneInput.value.replace(/[^0-9]/g, "").slice(0, 11);
        var out = digits;
        if (digits.indexOf("02") === 0) {
          if (digits.length > 6) out = digits.slice(0, 2) + "-" + digits.slice(2, digits.length - 4) + "-" + digits.slice(digits.length - 4);
          else if (digits.length > 2) out = digits.slice(0, 2) + "-" + digits.slice(2);
        } else if (digits.length > 7) {
          out = digits.slice(0, 3) + "-" + digits.slice(3, digits.length - 4) + "-" + digits.slice(digits.length - 4);
        } else if (digits.length > 3) {
          out = digits.slice(0, 3) + "-" + digits.slice(3);
        }
        phoneInput.value = out;
      });
    }

    var nameInput = form.querySelector('input[name="name"]');
    if (nameInput) {
      nameInput.addEventListener("input", function () {
        if (nameInput.value.trim()) clearError("bk-name");
      });
      nameInput.addEventListener("blur", function () {
        if (!nameInput.value.trim()) setError("bk-name", "성함을 입력해 주세요.");
        else clearError("bk-name");
      });
    }
    if (phoneInput) {
      phoneInput.addEventListener("input", function () {
        if (phoneInput.value.replace(/[^0-9]/g, "").length >= 9) clearError("bk-phone");
      });
      phoneInput.addEventListener("blur", function () {
        var digits = phoneInput.value.replace(/[^0-9]/g, "");
        if (!digits) setError("bk-phone", "연락처를 입력해 주세요.");
        else if (digits.length < 9) setError("bk-phone", "올바른 연락처를 입력해 주세요.");
        else clearError("bk-phone");
      });
    }
    var agreeInput = form.querySelector('input[name="agree"]');
    if (agreeInput) {
      agreeInput.addEventListener("change", function () {
        if (agreeInput.checked) clearError("bk-agree");
      });
    }
    $$('input[name="visit"]', form).forEach(function (radio) {
      radio.addEventListener("change", function () { clearError("bk-visit"); });
    });

    /* ---- submit ---- */
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var firstInvalid = null;

      if (!form.querySelector('input[name="visit"]:checked')) {
        setError("bk-visit", "초진 / 재진을 선택해 주세요.");
        firstInvalid = firstInvalid || document.getElementById("bk-visit");
      }
      if (!state.date) {
        setError("bk-date", "예약 날짜를 선택해 주세요.");
        firstInvalid = firstInvalid || dateScroller;
      }
      if (!state.time) {
        setError("bk-time", "예약 시간을 선택해 주세요.");
        firstInvalid = firstInvalid || slotWrap;
      }
      var name = form.querySelector('input[name="name"]');
      if (!name.value.trim()) {
        setError("bk-name", "성함을 입력해 주세요.");
        firstInvalid = firstInvalid || name;
      }
      var phone = form.querySelector('input[name="phone"]');
      if (phone.value.replace(/[^0-9]/g, "").length < 9) {
        setError("bk-phone", "올바른 연락처를 입력해 주세요.");
        firstInvalid = firstInvalid || phone;
      }
      var agree = form.querySelector('input[name="agree"]');
      if (!agree.checked) {
        setError("bk-agree", "개인정보 수집·이용에 동의해 주세요.");
        firstInvalid = firstInvalid || agree;
      }

      if (firstInvalid) {
        if (firstInvalid.scrollIntoView) {
          firstInvalid.scrollIntoView({ behavior: "smooth", block: "center" });
        }
        if (firstInvalid.focus && firstInvalid.tagName !== "DIV") firstInvalid.focus({ preventScroll: true });
        return;
      }

      var type = form.querySelector('input[name="visit"]:checked');
      var program = form.querySelector('select[name="program"]');
      var now = new Date();
      var serial = String(now.getTime()).slice(-3);
      var no = "DN-" + fmtDate(state.date).replace(/-/g, "").slice(2) + "-" + serial;

      var write = function (sel, value) {
        var el = $(sel, booking);
        if (el) el.textContent = value;
      };
      write("[data-ok-no]", no);
      write("[data-ok-date]", prettyDate(state.date) + " " + state.time);
      write("[data-ok-type]", type ? type.getAttribute("data-label") : "");
      write("[data-ok-program]", program && program.value ? program.options[program.selectedIndex].text : "미선택");
      write("[data-ok-name]", name.value.trim());
      write("[data-ok-phone]", phone.value.trim());

      form.hidden = true;
      var head = $(".bk-panel-head", booking);
      if (head) head.hidden = true;
      success.classList.add("is-on");
      success.scrollIntoView({ behavior: "smooth", block: "center" });

      var again = $("[data-restart]", booking);
      if (again) {
        again.addEventListener("click", function () {
          success.classList.remove("is-on");
          form.hidden = false;
          if (head) head.hidden = false;
          form.reset();
          state.time = null;
          $$(".slot", slotWrap).forEach(function (el) { el.classList.remove("is-selected"); });
          $$(".field", form).forEach(function (el) { el.classList.remove("has-error"); });
          if (state.date) renderSlots(state.date);
          form.scrollIntoView({ behavior: "smooth", block: "start" });
        }, { once: true });
      }
    });

    syncSummary();
  }

  /* ------------------------------------------------------------------ *
   * 10. today highlight in hours table
   * ------------------------------------------------------------------ */
  var hours = $("[data-hours]");
  if (hours) {
    var dayIndex = new Date().getDay();
    var row = hours.querySelector('[data-day="' + dayIndex + '"]');
    if (row) row.classList.add("is-today");
  }

  /* ------------------------------------------------------------------ *
   * 11. gentle title entrance
   * ------------------------------------------------------------------ */
  if (!reduced) {
    $$(".c-hero-title, .p-hero h1").forEach(function (title) {
      title.style.animation = "c-fade-up 1.15s cubic-bezier(0.16,0.68,0.34,1) 0.12s both";
    });
  }
})();
