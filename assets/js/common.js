/* ==========================================================================
   DOORLIT — common UI (header, mobile nav, reveal, modal helpers)
   ========================================================================== */
(function () {
  "use strict";

  /* ---------- sticky header state ---------- */
  var header = document.querySelector(".site-header");
  if (header) {
    var onScroll = function () {
      header.classList.toggle("is-scrolled", window.scrollY > 8);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ---------- mobile navigation ---------- */
  var toggle = document.querySelector(".nav-toggle");
  var mobileNav = document.getElementById("mobile-nav");

  function setNav(open) {
    if (!toggle || !mobileNav) return;
    document.body.classList.toggle("nav-open", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "메뉴 닫기" : "메뉴 열기");
    mobileNav.setAttribute("aria-hidden", String(!open));
  }

  if (toggle && mobileNav) {
    toggle.addEventListener("click", function () {
      setNav(!document.body.classList.contains("nav-open"));
    });
    mobileNav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        setNav(false);
      });
    });
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && document.body.classList.contains("nav-open")) {
        setNav(false);
        toggle.focus();
      }
    });
  }

  /* ---------- reveal on scroll ---------- */
  var items = Array.prototype.slice.call(document.querySelectorAll("[data-reveal]"));
  if (items.length) {
    if (!("IntersectionObserver" in window)) {
      items.forEach(function (item) {
        item.classList.add("is-visible");
      });
    } else {
      var observer = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-visible");
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.08, rootMargin: "0px 0px -6% 0px" }
      );
      items.forEach(function (item) {
        observer.observe(item);
      });
    }
  }

  /* ---------- modal ---------- */
  var openModal = null;
  var lastFocus = null;

  function trapFocus(event, modal) {
    if (event.key !== "Tab") return;
    var focusables = modal.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    if (!focusables.length) return;
    var first = focusables[0];
    var last = focusables[focusables.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  function show(modal) {
    if (!modal) return;
    lastFocus = document.activeElement;
    modal.hidden = false;
    document.documentElement.style.overflow = "hidden";
    openModal = modal;
    var close = modal.querySelector(".modal-close");
    if (close) close.focus();
  }

  function hide() {
    if (!openModal) return;
    openModal.hidden = true;
    document.documentElement.style.overflow = "";
    openModal = null;
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  document.addEventListener("click", function (event) {
    var closer = event.target.closest("[data-modal-close]");
    if (closer) {
      event.preventDefault();
      hide();
    }
  });

  document.addEventListener("keydown", function (event) {
    if (!openModal) return;
    if (event.key === "Escape") hide();
    else trapFocus(event, openModal);
  });

  /* ---------- package shortcut → preselect in inquiry form ---------- */
  var packageSelect = document.getElementById("inq-package");
  if (packageSelect) {
    document.querySelectorAll("[data-package]").forEach(function (link) {
      link.addEventListener("click", function () {
        var value = link.getAttribute("data-package");
        Array.prototype.forEach.call(packageSelect.options, function (option) {
          if (option.value === value || option.text === value) {
            packageSelect.value = option.value || option.text;
          }
        });
      });
    });
  }

  window.DoorlitUI = { showModal: show, hideModal: hide };
})();
