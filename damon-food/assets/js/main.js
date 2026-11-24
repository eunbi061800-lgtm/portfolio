/* =========================================================
   DAMON FOOD — main.js
   ========================================================= */
(function () {
  'use strict';

  var $ = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); };
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------- header ---------------- */
  var header = $('.site-header');
  var transparent = document.body.classList.contains('has-hero');
  var lastY = 0;

  function onScroll() {
    if (!header) return;
    var y = window.scrollY || window.pageYOffset;
    header.classList.toggle('is-solid', y > 40);
    header.classList.toggle('is-transparent', transparent && y <= 40);

    /* hide on scroll down, reveal on scroll up */
    if (Math.abs(y - lastY) > 4) {
      if (y > 320 && y > lastY) header.classList.add('is-hidden');
      else if (y < lastY || y <= 320) header.classList.remove('is-hidden');
      lastY = y;
    }
  }
  if (header) {
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ---------------- drawer ---------------- */
  var drawer = $('.drawer');
  var burger = $('.burger');
  var drawerClose = $('.drawer-close');

  function openDrawer() {
    if (!drawer) return;
    drawer.classList.add('is-open');
    drawer.setAttribute('aria-hidden', 'false');
    document.body.classList.add('is-locked');
    if (burger) burger.setAttribute('aria-expanded', 'true');
  }
  function closeDrawer() {
    if (!drawer) return;
    drawer.classList.remove('is-open');
    drawer.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('is-locked');
    if (burger) burger.setAttribute('aria-expanded', 'false');
  }
  if (burger) burger.addEventListener('click', openDrawer);
  if (drawerClose) drawerClose.addEventListener('click', closeDrawer);
  if (drawer) {
    $$('.drawer-nav a', drawer).forEach(function (a) {
      a.addEventListener('click', closeDrawer);
    });
  }

  /* ---------------- hero slider ---------------- */
  var hero = $('.hero');
  if (hero) {
    var slides = $$('.hero-slide', hero);
    var tabs = $$('.hero-tab', hero);
    var curEl = $('.hero-count .cur', hero);
    var idx = 0;
    var timer = null;
    var DURATION = 7000;

    function pad(n) { return n < 10 ? '0' + n : String(n); }

    function goTo(i, user) {
      if (!slides.length) return;
      idx = (i + slides.length) % slides.length;
      slides.forEach(function (s, k) { s.classList.toggle('is-active', k === idx); });
      tabs.forEach(function (t, k) {
        var active = k === idx;
        if (active) {
          t.classList.remove('is-active');
          /* restart the progress bar animation */
          void t.offsetWidth;
          t.classList.add('is-active');
        } else {
          t.classList.remove('is-active');
        }
      });
      if (curEl) curEl.textContent = pad(idx + 1);
      if (user) restart();
    }

    function restart() {
      window.clearTimeout(timer);
      if (reduceMotion) return;
      timer = window.setTimeout(function () { goTo(idx + 1); }, DURATION);
    }

    tabs.forEach(function (t, k) {
      t.addEventListener('click', function () { goTo(k, true); });
    });

    /* swipe */
    var sx = 0, sy = 0;
    hero.addEventListener('touchstart', function (e) {
      sx = e.touches[0].clientX; sy = e.touches[0].clientY;
    }, { passive: true });
    hero.addEventListener('touchend', function (e) {
      var dx = e.changedTouches[0].clientX - sx;
      var dy = e.changedTouches[0].clientY - sy;
      if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) goTo(idx + (dx < 0 ? 1 : -1), true);
    }, { passive: true });

    goTo(0);
    restart();
  }

  /* ---------------- reveal on scroll ---------------- */
  var revealEls = $$('[data-reveal]');
  if ('IntersectionObserver' in window && !reduceMotion) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add('is-in');
          io.unobserve(en.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('is-in'); });
  }

  /* ---------------- number counters ---------------- */
  var counters = $$('[data-count]');
  function runCounter(el) {
    var target = parseFloat(el.getAttribute('data-count'));
    var dec = el.getAttribute('data-dec') ? parseInt(el.getAttribute('data-dec'), 10) : 0;
    var start = performance.now();
    var dur = 1400;
    function tick(now) {
      var p = Math.min((now - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      var val = target * eased;
      el.textContent = dec ? val.toFixed(dec) : Math.round(val).toLocaleString('ko-KR');
      if (p < 1) requestAnimationFrame(tick);
      else el.textContent = dec ? target.toFixed(dec) : Math.round(target).toLocaleString('ko-KR');
    }
    requestAnimationFrame(tick);
  }
  if (counters.length && 'IntersectionObserver' in window && !reduceMotion) {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { runCounter(en.target); cio.unobserve(en.target); }
      });
    }, { threshold: 0.4 });
    counters.forEach(function (c) { cio.observe(c); });
  }

  /* ---------------- marquee (duplicate for seamless loop) ---------------- */
  $$('.marquee-track').forEach(function (track) {
    var items = Array.prototype.slice.call(track.children);
    items.forEach(function (node) {
      var clone = node.cloneNode(true);
      clone.setAttribute('aria-hidden', 'true');
      track.appendChild(clone);
    });
  });

  /* ---------------- modal helpers ---------------- */
  function openModal(modal) {
    if (!modal) return;
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('is-locked');
    var focusable = modal.querySelector('.modal-close');
    if (focusable) focusable.focus({ preventScroll: true });
  }
  function closeModal(modal) {
    if (!modal) return;
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('is-locked');
  }
  $$('.modal').forEach(function (modal) {
    modal.addEventListener('click', function (e) {
      if (e.target.hasAttribute('data-close') || e.target.closest('[data-close]')) closeModal(modal);
    });
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      closeDrawer();
      $$('.modal.is-open').forEach(closeModal);
      closeNotice();
    }
  });

  /* ---------------- lightbox (gallery) ---------------- */
  var lightbox = $('#lightbox');
  $$('[data-lightbox]').forEach(function (fig) {
    fig.addEventListener('click', function () {
      if (!lightbox) return;
      var img = fig.querySelector('img');
      var lb = $('#lightbox-img');
      if (img && lb) {
        lb.src = img.getAttribute('data-full') || img.src;
        lb.alt = img.alt || '';
      }
      openModal(lightbox);
    });
  });

  /* ---------------- product filter ---------------- */
  var filterTabs = $$('[data-filter]');
  var pItems = $$('.p-item');
  var countEl = $('[data-count-target]');
  if (filterTabs.length) {
    filterTabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        var f = tab.getAttribute('data-filter');
        filterTabs.forEach(function (t) { t.classList.toggle('is-active', t === tab); });
        var shown = 0;
        pItems.forEach(function (item) {
          var ok = f === 'all' || item.getAttribute('data-cat') === f;
          item.classList.toggle('is-hidden', !ok);
          if (ok) {
            shown++;
            item.style.animation = 'none';
            void item.offsetWidth;
            item.style.animation = '';
          }
        });
        if (countEl) countEl.textContent = shown;
      });
    });
  }

  /* ---------------- product detail modal ---------------- */
  var pModal = $('#product-modal');
  $$('[data-product]').forEach(function (card) {
    card.addEventListener('click', function (e) {
      if (!pModal) return;
      e.preventDefault();
      var tpl = card.querySelector('template');
      var img = card.querySelector('img');
      var body = pModal.querySelector('.modal-body');
      var media = pModal.querySelector('.modal-media');
      if (img && media) {
        var mi = media.querySelector('img');
        mi.src = img.getAttribute('src');
        mi.alt = img.getAttribute('alt') || '';
      }
      if (tpl && body) body.innerHTML = tpl.innerHTML;
      openModal(pModal);
    });
  });

  /* ---------------- news filter + modal ---------------- */
  var newsChips = $$('[data-news-filter]');
  var newsRows = $$('.news-row');
  var newsModal = $('#news-modal');
  if (newsChips.length) {
    newsChips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        var f = chip.getAttribute('data-news-filter');
        newsChips.forEach(function (c) { c.classList.toggle('is-active', c === chip); });
        newsRows.forEach(function (row) {
          var ok = f === 'all' || row.getAttribute('data-kind') === f;
          row.style.display = ok ? '' : 'none';
        });
      });
    });
  }
  newsRows.forEach(function (row) {
    row.addEventListener('click', function () {
      if (!newsModal) return;
      var tpl = row.querySelector('template');
      var body = newsModal.querySelector('.modal-body');
      if (tpl && body) body.innerHTML = tpl.innerHTML;
      openModal(newsModal);
    });
  });

  /* ---------------- FAQ ---------------- */
  $$('.faq-item').forEach(function (item) {
    var q = item.querySelector('.faq-q');
    var a = item.querySelector('.faq-a');
    if (!q || !a) return;
    q.addEventListener('click', function () {
      var isOpen = item.classList.contains('is-open');
      var group = item.closest('.faq');
      if (group) {
        $$('.faq-item.is-open', group).forEach(function (other) {
          if (other !== item) {
            other.classList.remove('is-open');
            other.querySelector('.faq-q').setAttribute('aria-expanded', 'false');
            other.querySelector('.faq-a').style.maxHeight = '0px';
          }
        });
      }
      item.classList.toggle('is-open', !isOpen);
      q.setAttribute('aria-expanded', String(!isOpen));
      a.style.maxHeight = isOpen ? '0px' : a.scrollHeight + 'px';
    });
  });

  /* ---------------- notice popup ---------------- */
  var notice = $('#notice-popup');
  var NOTICE_KEY = 'damon-notice-2026winter';

  function closeNotice() {
    if (!notice) return;
    notice.classList.remove('is-on');
    notice.setAttribute('aria-hidden', 'true');
  }
  if (notice) {
    var hidden = false;
    try { hidden = sessionStorage.getItem(NOTICE_KEY) === 'hide'; } catch (err) { hidden = false; }
    if (!hidden) {
      window.setTimeout(function () {
        notice.classList.add('is-on');
        notice.setAttribute('aria-hidden', 'false');
      }, 1600);
    }
    $$('[data-notice-close]', notice).forEach(function (b) {
      b.addEventListener('click', function () {
        if (b.getAttribute('data-notice-close') === 'today') {
          try { sessionStorage.setItem(NOTICE_KEY, 'hide'); } catch (err) {}
        }
        closeNotice();
      });
    });
  }

  /* ---------------- contact form ---------------- */
  var form = $('#contact-form');
  if (form) {
    var done = $('#form-done');

    function setError(field, on) {
      if (!field) return;
      field.classList.toggle('has-error', on);
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var ok = true;
      $$('[data-required]', form).forEach(function (input) {
        var wrap = input.closest('.field') || input.closest('.check-row');
        var val = (input.value || '').trim();
        var bad = !val;
        if (input.type === 'checkbox') bad = !input.checked;
        if (!bad && input.getAttribute('data-required') === 'email') {
          bad = !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(val);
        }
        if (!bad && input.getAttribute('data-required') === 'phone') {
          bad = !/^[0-9\-+() ]{8,20}$/.test(val);
        }
        setError(wrap, bad);
        if (bad) ok = false;
      });

      if (!ok) {
        var firstBad = form.querySelector('.has-error input, .has-error textarea, .has-error select');
        if (firstBad) firstBad.focus({ preventScroll: false });
        return;
      }
      form.style.display = 'none';
      if (done) {
        done.classList.add('is-on');
        done.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });
      }
    });

    $$('[data-required]', form).forEach(function (input) {
      input.addEventListener('input', function () {
        var wrap = input.closest('.field') || input.closest('.check-row');
        setError(wrap, false);
      });
    });

    var again = $('#form-reset');
    if (again) {
      again.addEventListener('click', function (e) {
        e.preventDefault();
        form.reset();
        form.style.display = '';
        if (done) done.classList.remove('is-on');
      });
    }
  }

  /* ---------------- year ---------------- */
  $$('[data-year]').forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });
})();
