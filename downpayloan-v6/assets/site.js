/* ==========================================================================
   다운페이론 v6 — interaction
   절제된 금융사 인터랙션만: 스크롤 진행바 · 리빌 · 카운트업 · 계산기 · 위자드
   ========================================================================== */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── 스크롤 진행바 + 헤더 상태 ───────────────────────────── */
  var bar = document.querySelector('.progress__bar');
  var header = document.querySelector('.site-header');
  function onScroll() {
    var h = document.documentElement;
    var max = h.scrollHeight - h.clientHeight;
    var y = window.scrollY || h.scrollTop || 0;
    if (bar) bar.style.width = (max > 0 ? (y / max) * 100 : 0) + '%';
    if (header) header.classList.toggle('is-scrolled', y > 8);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  onScroll();

  /* ── 모바일 메뉴 ─────────────────────────────────────────── */
  var burger = document.querySelector('.burger');
  if (burger) {
    burger.addEventListener('click', function () {
      var open = document.body.classList.toggle('nav-open');
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    document.querySelectorAll('.mobile-nav a').forEach(function (a) {
      a.addEventListener('click', function () {
        document.body.classList.remove('nav-open');
        burger.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ── 스크롤 리빌 ─────────────────────────────────────────── */
  var reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reduceMotion) {
    var ro = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add('is-in');
          ro.unobserve(e.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    reveals.forEach(function (el) { ro.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('is-in'); });
  }

  /* ── 카운트업 ────────────────────────────────────────────── */
  function countUp(el) {
    var target = parseFloat(el.getAttribute('data-count')) || 0;
    var suffix = el.getAttribute('data-suffix') || '';
    var dur = 1100;
    if (reduceMotion) { el.textContent = target.toLocaleString('ko-KR') + suffix; return; }
    var start = null;
    function frame(t) {
      if (!start) start = t;
      var p = Math.min((t - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      var val = Math.round(target * eased);
      el.textContent = val.toLocaleString('ko-KR') + suffix;
      if (p < 1) requestAnimationFrame(frame);
      else el.textContent = target.toLocaleString('ko-KR') + suffix;
    }
    requestAnimationFrame(frame);
  }
  var counters = document.querySelectorAll('[data-count]');
  if ('IntersectionObserver' in window) {
    var co = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { countUp(e.target); co.unobserve(e.target); }
      });
    }, { threshold: 0.25 });
    counters.forEach(function (el) {
      el.textContent = '0' + (el.getAttribute('data-suffix') || '');
      el.setAttribute('aria-label', '0');
      co.observe(el);
    });
  } else {
    counters.forEach(countUp);
  }

  /* ── 계산기 ──────────────────────────────────────────────── */
  var won = function (n) { return Math.round(n).toLocaleString('ko-KR'); };
  var man = function (wonv) { return (wonv / 10000).toLocaleString('ko-KR'); };

  function paintRange(input) {
    var min = parseFloat(input.min), max = parseFloat(input.max), v = parseFloat(input.value);
    var pct = ((v - min) / (max - min)) * 100;
    input.style.setProperty('--fill', pct + '%');
  }

  function calc(card) {
    var amountEl = card.querySelector('[data-calc-amount]');
    var termEl = card.querySelector('[data-calc-term]');
    var rateEl = card.querySelector('[data-calc-rate]');
    if (!amountEl || !termEl || !rateEl) return;

    var out = {
      amount: card.querySelector('[data-out-amount]'),
      term: card.querySelector('[data-out-term]'),
      rate: card.querySelector('[data-out-rate]'),
      monthly: card.querySelector('[data-out-monthly]'),
      interest: card.querySelector('[data-out-interest]'),
      total: card.querySelector('[data-out-total]')
    };

    function render() {
      var P = parseFloat(amountEl.value);
      var n = parseInt(termEl.value, 10);
      var annual = parseFloat(rateEl.value);

      if (out.amount) out.amount.textContent = man(P);
      if (out.term) out.term.textContent = n;
      if (out.rate) out.rate.textContent = annual.toFixed(1).replace(/\.0$/, '');

      var r = annual / 100 / 12;
      var monthly = r === 0 ? P / n : (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
      var total = monthly * n;
      var interest = total - P;

      if (out.monthly) out.monthly.textContent = won(monthly);
      if (out.interest) out.interest.textContent = won(interest);
      if (out.total) out.total.textContent = won(total);

      paintRange(amountEl); paintRange(termEl); paintRange(rateEl);
    }

    [amountEl, termEl, rateEl].forEach(function (el) {
      el.addEventListener('input', render);
      el.addEventListener('change', render);
    });
    render();
  }
  document.querySelectorAll('[data-calc]').forEach(calc);

  /* ── 입력 검증/포맷 헬퍼 ─────────────────────────────────── */
  function digits(v) { return (v || '').replace(/\D/g, ''); }

  function formatPhone(v) {
    var d = digits(v).slice(0, 11);
    if (d.length <= 3) return d;
    if (d.length <= 7) return d.slice(0, 3) + '-' + d.slice(3);
    if (d.length === 10) return d.slice(0, 3) + '-' + d.slice(3, 6) + '-' + d.slice(6);
    return d.slice(0, 3) + '-' + d.slice(3, 7) + '-' + d.slice(7);
  }

  function validPhone(v) {
    var d = digits(v);
    return /^0\d{9,10}$/.test(d);
  }

  function validName(v) {
    return (v || '').trim().length >= 2;
  }

  function setInvalid(field, bad) {
    if (!field) return;
    field.classList.toggle('is-invalid', !!bad);
    var input = field.querySelector('input');
    if (input) input.setAttribute('aria-invalid', bad ? 'true' : 'false');
  }

  document.querySelectorAll('input[type="tel"]').forEach(function (input) {
    input.addEventListener('input', function () {
      var atEnd = input.selectionStart === input.value.length;
      input.value = formatPhone(input.value);
      if (atEnd) input.setSelectionRange(input.value.length, input.value.length);
      var field = input.closest('.field');
      if (field && field.classList.contains('is-invalid') && validPhone(input.value)) setInvalid(field, false);
    });
  });

  /* ── 메인 히어로 간편 조회 (1단계 폼) ───────────────────── */
  var quick = document.querySelector('#quickForm');
  if (quick) {
    var qName = quick.querySelector('[name="name"]');
    var qPhone = quick.querySelector('[name="phone"]');
    var qAgree = quick.querySelector('[name="agree"]');
    var qDone = document.querySelector('#quickSuccess');
    var qBody = document.querySelector('#quickBody');

    qName.addEventListener('blur', function () {
      if (qName.value.trim()) setInvalid(qName.closest('.field'), !validName(qName.value));
    });
    qPhone.addEventListener('blur', function () {
      if (qPhone.value.trim()) setInvalid(qPhone.closest('.field'), !validPhone(qPhone.value));
    });

    quick.addEventListener('submit', function (e) {
      e.preventDefault();
      var okName = validName(qName.value);
      var okPhone = validPhone(qPhone.value);
      var okAgree = qAgree.checked;
      setInvalid(qName.closest('.field'), !okName);
      setInvalid(qPhone.closest('.field'), !okPhone);
      if (!okAgree) {
        var err = quick.querySelector('[data-consent-error]');
        if (err) err.style.display = 'block';
      } else {
        var errOk = quick.querySelector('[data-consent-error]');
        if (errOk) errOk.style.display = 'none';
      }
      if (!(okName && okPhone && okAgree)) {
        var firstBad = quick.querySelector('.field.is-invalid input');
        if (firstBad) firstBad.focus();
        return;
      }
      if (typeof window.DP6 !== 'undefined' && typeof window.DP6.onSubmit === 'function') {
        window.DP6.onSubmit({
          form: 'quick',
          name: qName.value.trim(),
          phone: digits(qPhone.value),
          field: (quick.querySelector('input[name="qfield"]:checked') || {}).value || ''
        });
      }
      if (qBody) qBody.style.display = 'none';
      var qSub = document.querySelector('.quick-card__sub');
      if (qSub) qSub.textContent = '접수 내용을 확인하고 순서대로 연락드립니다.';
      if (qDone) qDone.classList.add('is-on');
      qDone.setAttribute('tabindex', '-1');
      qDone.focus({ preventScroll: true });
    });
  }

  /* ── 3단계 간편 한도 조회 위자드 ─────────────────────────── */
  var wiz = document.querySelector('#limitWizard');
  if (wiz) {
    var steps = Array.prototype.slice.call(wiz.querySelectorAll('.wiz-step'));
    var current = 0;
    var wizCard = wiz.closest('.wizard-card');
    var progressFill = wizCard ? wizCard.querySelector('.wiz-progress__bar i') : null;
    var progressText = wizCard ? wizCard.querySelector('.wiz-progress span') : null;
    var wizError = wiz.querySelector('.wiz-error');
    var wizDone = wizCard ? wizCard.querySelector('.wiz-done') : null;
    var wizBody = wiz.querySelector('.wiz-body');

    function showStep(i) {
      steps.forEach(function (s, idx) { s.classList.toggle('is-active', idx === i); });
      if (progressFill) progressFill.style.width = ((i + 1) / steps.length) * 100 + '%';
      if (progressText) progressText.textContent = (i + 1) + ' / ' + steps.length + ' 단계';
      if (wizError) wizError.classList.remove('is-on');
      wiz.querySelectorAll('[data-next]').forEach(function (b) {
        b.style.display = i === steps.length - 1 ? 'none' : '';
      });
      current = i;
      var focusEl = steps[i].querySelector('input');
      if (focusEl && i === 2) {
        var nameInput = steps[2].querySelector('[name="name"]');
        if (nameInput) nameInput.focus({ preventScroll: true });
      }
    }

    function stepValid(i) {
      var step = steps[i];
      var radios = step.querySelectorAll('input[type="radio"]');
      if (radios.length) {
        return Array.prototype.some.call(radios, function (r) { return r.checked; });
      }
      return true;
    }

    wiz.querySelectorAll('[data-next]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        if (!stepValid(current)) {
          if (wizError) wizError.classList.add('is-on');
          return;
        }
        if (current < steps.length - 1) showStep(current + 1);
      });
    });

    wiz.querySelectorAll('[data-back]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        if (current > 0) showStep(current - 1);
      });
    });

    wiz.querySelectorAll('input[type="radio"]').forEach(function (r) {
      r.addEventListener('change', function () {
        if (wizError) wizError.classList.remove('is-on');
      });
    });

    var wName = wiz.querySelector('[name="name"]');
    var wPhone = wiz.querySelector('[name="phone"]');
    if (wName) wName.addEventListener('blur', function () {
      if (wName.value.trim()) setInvalid(wName.closest('.field'), !validName(wName.value));
    });
    if (wPhone) wPhone.addEventListener('blur', function () {
      if (wPhone.value.trim()) setInvalid(wPhone.closest('.field'), !validPhone(wPhone.value));
    });

    wiz.addEventListener('submit', function (e) {
      e.preventDefault();
      var okName = validName(wName.value);
      var okPhone = validPhone(wPhone.value);
      var agree = wiz.querySelector('[name="agree"]');
      setInvalid(wName.closest('.field'), !okName);
      setInvalid(wPhone.closest('.field'), !okPhone);
      var consentErr = wiz.querySelector('[data-consent-error]');
      if (!agree.checked) {
        if (consentErr) consentErr.style.display = 'block';
        return;
      }
      if (consentErr) consentErr.style.display = 'none';
      if (!(okName && okPhone)) {
        var bad = wiz.querySelector('.field.is-invalid input');
        if (bad) bad.focus();
        return;
      }

      var picked = function (name) {
        var el = wiz.querySelector('input[name="' + name + '"]:checked');
        return el ? el.getAttribute('data-label') || el.value : '';
      };
      var payload = {
        form: 'wizard',
        field: picked('field'),
        situation: picked('situation'),
        name: wName.value.trim(),
        phone: digits(wPhone.value)
      };
      if (window.DP6 && typeof window.DP6.onSubmit === 'function') window.DP6.onSubmit(payload);

      if (wizDone) {
        var sum = wizDone.querySelector('[data-summary]');
        if (sum) {
          sum.innerHTML = '<div><span>희망 분야</span><b>' + payload.field +
            '</b></div><div><span>카드 상황</span><b>' + payload.situation +
            '</b></div><div><span>연락처</span><b>' + payload.phone.replace(/^(\d{3})(\d{3,4})(\d{4})$/, '$1-$2-$3') + '</b></div>';
        }
        if (wizBody) wizBody.style.display = 'none';
        wizDone.classList.add('is-on');
        var cardHead = wizCard.querySelector('.wizard-card__head');
        if (cardHead) cardHead.style.display = 'none';
        wizDone.setAttribute('tabindex', '-1');
        wizDone.focus({ preventScroll: true });
      }
    });

    showStep(0);
  }

  /* ── 아코디언 FAQ ────────────────────────────────────────── */
  document.querySelectorAll('.faq-q').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var item = btn.closest('.faq-item');
      var open = item.classList.contains('open');
      var group = item.parentElement;
      group.querySelectorAll('.faq-item.open').forEach(function (o) {
        o.classList.remove('open');
        o.querySelector('.faq-q').setAttribute('aria-expanded', 'false');
      });
      if (!open) {
        item.classList.add('open');
        btn.setAttribute('aria-expanded', 'true');
      }
    });
  });

  /* ── 앵커 이동 시 스텝 포커스 정리 ──────────────────────── */
  if (location.hash === '#inquiry' && wizCard) {
    setTimeout(function () { wizCard.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' }); }, 60);
  }
})();
