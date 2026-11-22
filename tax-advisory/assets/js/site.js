/* =========================================================
   도원 세무·경영 파트너스 — site.js
   motion · navigation · filters · modals · calculator · forms
   ========================================================= */
(function () {
  'use strict';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------- header + progress ---------------- */
  var header = $('.header');
  var progress = $('.progress');
  function onScroll() {
    var y = window.scrollY || window.pageYOffset;
    if (header) header.classList.toggle('scrolled', y > 12);
    if (progress) {
      var h = document.documentElement.scrollHeight - window.innerHeight;
      progress.style.width = (h > 0 ? Math.min(100, (y / h) * 100) : 0) + '%';
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------------- mobile top nav strip (10 pages visible) ---------------- */
  if (header && !$('.mobile-nav-strip')) {
    var pages = [
      { href: 'index.html', label: '홈' },
      { href: 'about.html', label: '법인소개' },
      { href: 'team.html', label: '파트너' },
      { href: 'tax.html', label: '기장신고' },
      { href: 'consulting.html', label: '컨설팅' },
      { href: 'cases.html', label: '성공사례' },
      { href: 'calculator.html', label: '계산기' },
      { href: 'insights.html', label: '자료실' },
      { href: 'faq.html', label: 'FAQ' },
      { href: 'contact.html', label: '무료상담' }
    ];
    var cur = (location.pathname.split('/').pop() || 'index.html');
    var strip = document.createElement('nav');
    strip.className = 'mobile-nav-strip';
    strip.setAttribute('aria-label', '페이지 바로가기');
    strip.innerHTML = pages.map(function (p) {
      var isAct = (cur === p.href) || (cur === '' && p.href === 'index.html');
      return '<a href="' + p.href + '"' + (isAct ? ' class="active"' : '') + '>' + p.label + '</a>';
    }).join('');
    header.insertAdjacentElement('afterend', strip);
  }

  /* ---------------- mobile drawer ---------------- */
  var menuBtn = $('#menu-toggle');
  var drawer = $('#drawer');
  if (drawer && drawer.parentElement !== document.body) { document.body.appendChild(drawer); }
  function closeDrawer() {
    if (!drawer) return;
    drawer.classList.remove('open');
    if (menuBtn) menuBtn.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }
  if (menuBtn && drawer) {
    menuBtn.addEventListener('click', function () {
      var open = drawer.classList.toggle('open');
      menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
      document.body.style.overflow = open ? 'hidden' : '';
    });
    $$('.drawer-btn', drawer).forEach(function (btn) {
      btn.addEventListener('click', function () {
        var panel = btn.nextElementSibling;
        var open = btn.getAttribute('aria-expanded') === 'true';
        btn.setAttribute('aria-expanded', open ? 'false' : 'true');
        if (panel) panel.classList.toggle('open', !open);
      });
    });
    $$('a', drawer).forEach(function (a) { a.addEventListener('click', closeDrawer); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeDrawer(); });
  }
  window.addEventListener('resize', function () { if (window.innerWidth > 960) closeDrawer(); });

  /* ---------------- reveal + stagger ---------------- */
  $$('[data-stagger]').forEach(function (box) {
    $$(':scope > *', box).forEach(function (el, i) {
      el.classList.add('stagger-child');
      el.style.setProperty('--d', Math.min(i * 0.07, 0.63) + 's');
    });
  });
  var revealEls = $$('.reveal, [data-stagger]');
  if ('IntersectionObserver' in window && !reduced) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add('in');
          io.unobserve(en.target);
          if (en.target.hasAttribute('data-count-group')) startCounts(en.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('in'); });
  }

  /* ---------------- count up ---------------- */
  function fmt(n, dec) {
    return n.toLocaleString('ko-KR', { minimumFractionDigits: dec, maximumFractionDigits: dec });
  }
  function animateCount(el) {
    if (el.dataset.done === '1') return;
    el.dataset.done = '1';
    var target = parseFloat(el.dataset.count || '0');
    var dec = parseInt(el.dataset.decimals || '0', 10);
    var prefix = el.dataset.prefix || '';
    var suffix = el.dataset.suffix || '';
    if (reduced) { el.textContent = prefix + fmt(target, dec) + suffix; return; }
    var dur = 1500, t0 = null;
    function frame(t) {
      if (!t0) t0 = t;
      var p = Math.min(1, (t - t0) / dur);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = prefix + fmt(target * eased, dec) + suffix;
      if (p < 1) requestAnimationFrame(frame);
      else el.textContent = prefix + fmt(target, dec) + suffix;
    }
    requestAnimationFrame(frame);
  }
  function startCounts(scope) {
    $$('[data-count]', scope).forEach(function (el) { animateCount(el); });
  }
  if ('IntersectionObserver' in window) {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { animateCount(en.target); cio.unobserve(en.target); }
      });
    }, { threshold: 0.4 });
    $$('[data-count]').forEach(function (el) { cio.observe(el); });
  } else {
    $$('[data-count]').forEach(function (el) { animateCount(el); });
  }

  /* ---------------- generic accordion ---------------- */
  $$('[data-acc]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var item = btn.closest('.faq-item') || btn.parentElement;
      var panel = item.querySelector('.faq-a');
      var open = item.classList.toggle('open');
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      if (panel) panel.style.maxHeight = open ? panel.scrollHeight + 'px' : '0px';
    });
  });

  /* ---------------- filters / tabs ---------------- */
  $$('[data-filter-group]').forEach(function (row) {
    var targetSel = row.dataset.filterGroup;
    var btns = $$('[data-filter]', row);
    var items = $$(targetSel);
    var countBadge = row.dataset.countTarget ? $(row.dataset.countTarget) : null;
    btns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        btns.forEach(function (b) { b.classList.remove('active'); b.setAttribute('aria-selected', 'false'); });
        btn.classList.add('active');
        btn.setAttribute('aria-selected', 'true');
        var f = btn.dataset.filter;
        var shown = 0;
        items.forEach(function (it) {
          var show = f === 'all' || (it.dataset.tags || '').split(' ').indexOf(f) > -1;
          it.classList.toggle('hidden', !show);
          if (show) {
            shown++;
            it.style.animation = 'none';
            void it.offsetWidth;
            it.style.animation = 'fadeInUp .5s cubic-bezier(.22,1,.36,1) both';
            it.style.animationDelay = Math.min(shown * 0.04, 0.3) + 's';
          }
        });
        if (countBadge) countBadge.textContent = shown;
      });
    });
  });

  /* ---------------- modal ---------------- */
  var lastFocus = null;
  function openModal(id, html) {
    var m = $(id);
    if (!m) return;
    if (html) { var body = $('.modal-content', m); if (body) body.innerHTML = html; }
    lastFocus = document.activeElement;
    m.classList.add('open');
    m.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    var close = $('.modal-close', m);
    if (close) setTimeout(function () { close.focus(); }, 60);
  }
  function closeModal(m) {
    m.classList.remove('open');
    m.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (lastFocus) { try { lastFocus.focus(); } catch (e) {} }
  }
  $$('.modal').forEach(function (m) {
    $$('[data-close]', m).forEach(function (b) { b.addEventListener('click', function () { closeModal(m); }); });
    m.addEventListener('click', function (e) { if (e.target === m || e.target.classList.contains('modal-backdrop')) closeModal(m); });
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') $$('.modal.open').forEach(closeModal);
  });

  /* ---------------- toast ---------------- */
  var toastEl = $('#toast');
  var toastTimer = null;
  window.showToast = function (html, ms) {
    if (!toastEl) return;
    toastEl.innerHTML = '<span class="t-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg></span><span>' + html + '</span>';
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove('show'); }, ms || 4200);
  };

  /* ---------------- data: team ---------------- */
  var TEAM = {
    kim: {
      role: '대표 세무사 · 창업 파트너', name: '김도원', en: 'DOWON KIM, CPA / Tax Attorney',
      photo: 'assets/img/team-kim.jpg',
      body: '<p>기업 회계와 세무 실무를 24년간 한 우물만 파왔습니다. 대기업 세무조정에서 출발해, 지금은 창업부터 승계까지 기업의 전 생애주기를 함께 설계합니다.</p><h4>주요 경력</h4><ul><li>前 삼일회계법인 세무부문 시니어 매니저</li><li>前 중견 제조기업 그룹 세무총괄</li><li>도원 세무·경영 파트너스 설립 (2011)</li><li>한국세무사회 법인세분과 위원</li></ul><h4>전문 분야</h4><p>법인 전환·지주회사 구조, 가업승계, 세무조정, 투자·정책자금 자문. 누적 자문 법인 1,240곳.</p><h4>자격</h4><ul><li>공인회계사 (KICPA)</li><li>세무사</li></ul>'
    },
    seo: {
      role: '파트너 세무사 · 절세 전략', name: '서지연', en: 'JIYEON SEO, Tax Attorney',
      photo: 'assets/img/team-seo.jpg',
      body: '<p>개인사업자와 병의원·전문직 사업장의 기장과 절세 설계를 담당합니다. 신고 직전에 맞추는 세금이 아니라, 1년의 사업 흐름을 미리 설계하는 세무를 지향합니다.</p><h4>주요 경력</h4><ul><li>前 대형 세무법인 개인사업자 본부장</li><li>병·의원 전문 세무 자문 12년</li><li>도원 세무·경영 파트너스 파트너 (2015)</li></ul><h4>전문 분야</h4><p>개인사업자 기장, 종합소득세·부가가치세 신고, 경정청구, 병의원·전문직 세무.</p><h4>자격</h4><ul><li>세무사</li><li>공인중개사</li></ul>'
    },
    park: {
      role: '경영컨설팅 파트너', name: '박준호', en: 'JUNHO PARK, Management Consultant',
      photo: 'assets/img/team-park.jpg',
      body: '<p>세무와 별개로 보이는 경영 문제를 숫자로 풀어냅니다. 자금 조달, 원가 구조, 사업계획서와 투자 유치까지 세무 전략과 함께 설계합니다.</p><h4>주요 경력</h4><ul><li>前 컨설팅펌 중소기업 성장지원팀</li><li>정책자금·투자유치 자문 180건</li><li>도원 세무·경영 파트너스 합류 (2018)</li></ul><h4>전문 분야</h4><p>사업계획서·재무모델, 정책자금, 투자 유치, 원가·수익성 개선.</p><h4>자격</h4><ul><li>경영학 석사 (재무전공)</li><li>투자자산운용사</li></ul>'
    },
    lee: {
      role: '노무·인사 파트너', name: '이하늘', en: 'HANEUL LEE, Labor Consultant',
      photo: 'assets/img/team-lee.jpg',
      body: '<p>직원을 채용하는 순간부터 퇴사까지, 세무와 노무는 떼어낼 수 없습니다. 4대보험·급여·근로계약을 세무 신고와 한 흐름으로 관리합니다.</p><h4>주요 경력</h4><ul><li>前 공인노무사 사무소 근로감독 대응팀</li><li>스타트업 인사제도 구축 90곳</li><li>도원 세무·경영 파트너스 합류 (2020)</li></ul><h4>전문 분야</h4><p>4대보험 취득·상실, 급여대행, 근로계약·취업규칙, 인사제도.</p><h4>자격</h4><ul><li>공인노무사</li></ul>'
    }
  };
  $$('[data-member]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var d = TEAM[btn.dataset.member];
      if (!d) return;
      var html = '<div class="modal-hero"><button class="modal-close" type="button" data-close aria-label="닫기"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg></button><span class="role">' + d.role + '</span><h3>' + d.name + '</h3><span class="en">' + d.en + '</span><img class="modal-photo" src="' + d.photo + '" alt="' + d.name + ' 프로필 사진" loading="lazy"></div><div class="modal-content">' + d.body + '<a class="btn btn-navy" href="contact.html?type=meeting">' + d.name + ' 세무사 상담 예약 <span class="arr">→</span></a></div>';
      openModal('#team-modal', html);
      $$('[data-close]', $('#team-modal')).forEach(function (b) {
        b.onclick = function () { closeModal($('#team-modal')); };
      });
    });
  });

  /* ---------------- data: cases ---------------- */
  var CASES = {
    c1: {
      cat: '법인전환', year: '2026', title: '개인사업자에서 법인으로, 세부담 31% 절감', client: '서울 서초 · 건축설계 사무소 · 연 매출 28억',
      body: '<p>대표 1인 체제로 12년간 개인사업자로 운영하던 설계 사무소입니다. 소득이 누진세율 구간에 진입하면서 실효 세율이 35%를 넘어섰고, 대표 급여와 법인 유보이익의 배분이 최적화되지 않은 상태였습니다.</p><h4>진행 내용</h4><ul><li>3개년 손익·현금흐름 분석 후 법인 전환 시점과 방법(현물출자) 설계</li><li>대표 급여·상여·배당 조합 시뮬레이션 36개 안 비교</li><li>법인 설립·사업자등록·4대보험·기장 이관을 한 번에 처리</li><li>전환 첫해 세무조정과 성실신고 대비</li></ul><h4>결과</h4><p>전환 후 1년 차 실효 세부담이 35.4%에서 24.3%로 낮아졌고, 절감된 재원을 인력 2명 채용과 장비 투자에 재투자했습니다.</p><table class="modal-table"><thead><tr><th>항목</th><th>전환 전</th><th>전환 후</th></tr></thead><tbody><tr><td>연 소득세·법인세</td><td>약 4억 1,200만 원</td><td>약 2억 8,400만 원</td></tr><tr><td>실효 세율</td><td>35.4%</td><td>24.3%</td></tr><tr><td>연 절감액</td><td colspan="2"><strong>약 1억 2,800만 원</strong></td></tr></tbody></table><p style="font-size:12px;color:#717c8e;margin-top:12px">* 실제 결과는 업종·비용 구조·대표 보수 설계에 따라 달라집니다. 예시 수치입니다.</p>'
    },
    c2: {
      cat: '경정청구', year: '2025', title: '놓쳤던 연구·인력개발비 세액공제 3년치 환급', client: '경기 성남 · 소프트웨어 개발 · 연 매출 42억',
      body: '<p>개발 인력이 30명인 소프트웨어 기업으로, 매년 연구·인력개발비 세액공제를 일부만 반영하고 있었습니다. 외부 기장 대행사가 공제 항목을 충분히 검토하지 않은 상태였습니다.</p><h4>진행 내용</h4><ul><li>3개년 연구개발비 적격성 검토와 증빙 재정리</li><li>연구전담요원 지정·연구노트 보완</li><li>경정청구서 작성 및 관할 세무서 제출, 심사 대응</li></ul><h4>결과</h4><p>3개년 합계 2억 3,600만 원을 환급받았습니다. 이후 매년 공제 누락이 없도록 결산 프로세스를 정착시켰습니다.</p><table class="modal-table"><thead><tr><th>연도</th><th>환급액</th></tr></thead><tbody><tr><td>2022년</td><td>6,900만 원</td></tr><tr><td>2023년</td><td>8,100만 원</td></tr><tr><td>2024년</td><td>8,600만 원</td></tr><tr><td><strong>합계</strong></td><td><strong>2억 3,600만 원</strong></td></tr></tbody></table><p style="font-size:12px;color:#717c8e;margin-top:12px">* 경정청구는 법정 신고기한 후 5년 이내 가능하며, 적격성 판단에 따라 결과가 달라집니다.</p>'
    },
    c3: {
      cat: '스타트업', year: '2026', title: '창업 첫해, 투자 유치를 위한 재무구조 정비', client: '서울 마포 · B2B SaaS · 시드 투자 유치',
      body: '<p>창업 8개월 차 스타트업으로, 시드 투자 실사를 앞두고 재무·세무 정리가 되어 있지 않았습니다. 지분 구조와 주식발행초과금, 스톡옵션 회계 처리까지 점검이 필요했습니다.</p><h4>진행 내용</h4><ul><li>창업 초기 비용·자산 분류 정리와 월 결산 체계 구축</li><li>투자 계약 전 자본금·주식발행초과금 회계 처리 검토</li><li>스톡옵션 부여·행사 관련 세무 리스크 점검</li><li>VC 실사 대응용 재무자료 패키지 준비</li></ul><h4>결과</h4><p>실사 지적사항 없이 시드 12억 원 투자를 마무리했고, 이후 월 단위 경영 리포트를 함께 운영하고 있습니다.</p>'
    },
    c4: {
      cat: '병의원·전문직', year: '2025', title: '치과의원 3개 지점, 인건비·임대료 구조 재설계', client: '인천 송도 · 치과의원 3개 지점 · 연 매출 36억',
      body: '<p>지점이 늘면서 의사·스태프 인건비와 임대료가 매출 증가 속도를 앞질렀습니다. 지점별 손익이 분리되지 않아 어느 지점이 수익성을 떨어뜨리는지 보이지 않는 상태였습니다.</p><h4>진행 내용</h4><ul><li>지점별 손익계산서와 원가 배분 기준 수립</li><li>인건비·재료비·임대료 구조 진단</li><li>세무조정과 함께 비용 인정 범위 재검토</li><li>지점별 월간 경영 리포트 정착</li></ul><h4>결과</h4><p>1년 만에 영업이익률이 9.8%에서 14.6%로 개선됐고, 세무조정 조정사항은 62% 줄었습니다.</p>'
    },
    c5: {
      cat: '법인전환', year: '2025', title: '음식점 4개 브랜드, 법인 2개로 재편', client: '서울 강남 · 외식 프랜차이즈 · 연 매출 58억',
      body: '<p>개인사업자 4개로 운영되던 외식 브랜드를 법인 2개 체제로 재편했습니다. 브랜드별 수익성과 리스크를 분리하고, 가맹사업 확장을 위한 구조를 만들었습니다.</p><h4>진행 내용</h4><ul><li>브랜드별 손익 분석과 법인 분할 기준 설계</li><li>사업 양수도에 따른 부가가치세·양도소득세 검토</li><li>가맹본부와 운영법인 간 용역·라이선스 계약 정비</li><li>이전가격 이슈 점검</li></ul><h4>결과</h4><p>법인 재편 후 그룹 전체 세부담이 18% 감소했고, 2026년 가맹사업 정보공개서 등록을 완료했습니다.</p>'
    },
    c6: {
      cat: '경정청구', year: '2024', title: '부가세 신고 누락 매입세액 1억 4천만 원 환급', client: '경기 안산 · 정밀부품 제조 · 연 매출 65억',
      body: '<p>원재료 매입과 설비 수리 관련 매입세액 일부가 신고에서 누락되어 있었습니다. 세금계산서 발급 시기와 실물 거래 시점이 어긋난 건도 포함되어 있었습니다.</p><h4>진행 내용</h4><ul><li>4개 과세기간 매입세액 전수 대사</li><li>세금계산서·거래명세서·입금 내역 3중 대조</li><li>수정신고 및 경정청구 진행</li></ul><h4>결과</h4><p>누락 매입세액 1억 4,200만 원을 환급받았고, 매입세액 대사 프로세스를 월 단위로 정착시켰습니다.</p>'
    }
  };
  $$('[data-case]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var d = CASES[btn.dataset.case];
      if (!d) return;
      var html = '<div class="modal-hero"><button class="modal-close" type="button" data-close aria-label="닫기"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg></button><span class="role">' + d.cat + ' · ' + d.year + '</span><h3>' + d.title + '</h3><span class="en">' + d.client + '</span></div><div class="modal-content">' + d.body + '<a class="btn btn-navy" href="contact.html?type=' + (d.cat === '경정청구' ? 'refund' : d.cat === '법인전환' ? 'corporate' : 'tax') + '">비슷한 사례로 상담받기 <span class="arr">→</span></a></div>';
      openModal('#case-modal', html);
      $$('[data-close]', $('#case-modal')).forEach(function (b) {
        b.onclick = function () { closeModal($('#case-modal')); };
      });
    });
  });

  /* ---------------- data: articles ---------------- */
  var ARTICLES = {
    a1: {
      tag: '법인전환', date: '2026.11.14', read: '6분', title: '법인 전환, 언제 하는 것이 가장 유리한가',
      body: '<p>법인 전환은 세율만 보고 결정할 문제가 아닙니다. 대표의 소득 수준, 유보이익을 얼마나 쌓을지, 직원 채용과 투자 계획, 4대보험과 퇴직금 부담까지 함께 계산해야 합니다.</p><h4>1. 소득세 누진 구간에 진입했는가</h4><p>개인사업자의 종합소득세는 과세표준 8,800만 원을 넘으면 35% 구간에 들어갑니다. 여기에 지방소득세를 더하면 실효 세율은 더 높아집니다. 반면 법인세는 과세표준 2억 원까지 9%, 2억~200억 원 구간이 19%입니다.</p><h4>2. 이익을 회사에 남길 것인가</h4><p>법인의 가장 큰 장점은 유보이익에 대한 과세가 낮다는 점입니다. 당장 개인 소비로 인출하지 않고 사업 재투자에 쓸 계획이라면 법인 구조가 유리합니다. 반대로 매년 이익 전액을 인출해야 한다면 배당소득세까지 고려해야 합니다.</p><h4>3. 전환 비용과 리스크</h4><p>현물출자 방식은 양도소득세 과세이연 요건을 충족해야 하고, 사업용 자산·부채·계약의 이전도 필요합니다. 4대보험과 퇴직금, 법인 설립 비용까지 포함한 3개년 시뮬레이션이 선행되어야 합니다.</p>'
    },
    a2: {
      tag: '절세', date: '2026.11.07', read: '5분', title: '개인사업자가 놓치기 쉬운 비용 인정 항목 7가지',
      body: '<p>세금을 줄이는 가장 안전한 방법은 실제로 쓴 사업 비용을 빠짐없이 인정받는 것입니다. 신고 직전에 영수증을 모으는 방식으로는 한계가 있습니다.</p><h4>자주 놓치는 항목</h4><ul><li>사업용 차량의 보험료·유류비·수리비 (업무 사용 비율만큼)</li><li>사무실 임차보증금 대출이자</li><li>직원 식대와 복리후생비</li><li>업무용 휴대폰·인터넷·소프트웨어 구독료</li><li>거래처 접대를 위한 소액 선물 (한도 내)</li><li>사업 관련 교육·세미나 참가비</li><li>노무사·변호사·세무사 자문료</li></ul><h4>증빙이 핵심입니다</h4><p>비용 인정의 기준은 지출 사실과 사업 관련성입니다. 카드 매출전표만으로는 부족한 항목이 있으므로, 거래처·목적이 드러나는 증빙을 남겨야 합니다. 3만 원 이상 접대비는 반드시 적격증빙이 필요합니다.</p>'
    },
    a3: {
      tag: '경정청구', date: '2026.10.30', read: '4분', title: '경정청구, 5년 안에 돌려받을 수 있는 세금',
      body: '<p>경정청구는 신고한 세금이 과다하게 납부된 경우, 법정 신고기한 후 5년 이내에 세무서에 환급을 요청하는 절차입니다. 생각보다 많은 기업이 이 권리를 쓰지 않고 지나갑니다.</p><h4>대표적인 대상</h4><ul><li>연구·인력개발비 세액공제 누락</li><li>매입세액 불공제 오류</li><li>감가상각 내용연수 적용 오류</li><li>결손금 공제 누락</li><li>세율 적용 착오</li></ul><h4>진행 절차</h4><p>과거 신고서와 장부를 대사해 과다 납부 근거를 정리하고, 경정청구서와 증빙을 첨부해 제출합니다. 세무서 심사 후 환급 또는 결정통지가 이루어지며, 통상 2~4개월이 걸립니다.</p>'
    },
    a4: {
      tag: '기장', date: '2026.10.21', read: '5분', title: '기장료가 업체마다 다른 이유, 무엇을 확인해야 하나',
      body: '<p>같은 매출의 사업장이라도 기장료가 두 배 이상 차이 나는 경우가 있습니다. 가격만 비교하면 나중에 추가 비용이 붙거나, 신고 품질이 낮아질 수 있습니다.</p><h4>가격을 결정하는 요소</h4><ul><li>월 매출과 거래 건수</li><li>직원 수와 급여대행 범위</li><li>업종별 특수 계정 (재고, 원가, 의료수익 등)</li><li>세무조정·결산 포함 여부</li><li>경정청구·자문 응대 범위</li></ul><h4>계약 전 확인할 것</h4><p>월 기장료에 부가세가 포함인지, 세무조정과 결산이 별도인지, 추가 신고(양도·상속·증여) 시 수수료가 어떻게 되는지 반드시 서면으로 확인해야 합니다.</p>'
    },
    a5: {
      tag: '병의원', date: '2026.10.12', read: '6분', title: '병의원 세무, 일반 법인과 무엇이 다른가',
      body: '<p>병의원은 의료수익·비급여수익의 구분, 인건비 비중, 의료장비 감가상각, 개인사업자와 법인 간 전환 이슈까지 일반 법인과 다른 회계 구조를 가집니다.</p><h4>의료수익과 비급여</h4><p>급여와 비급여를 구분해 관리해야 하며, 비급여 항목의 부가가치세 과세 여부를 정확히 판단해야 합니다. 미용·피부과 시술은 과세 대상이 될 수 있습니다.</p><h4>인건비 구조</h4><p>의사·간호인력의 급여와 수당, 당직 수당, 성과급은 세무조정에서 자주 쟁점이 됩니다. 근로계약과 급여대장이 일치해야 합니다.</p><h4>개인에서 법인으로</h4><p>연 매출 15억 원을 넘어서면 법인 전환을 검토할 시점입니다. 의료법상 법인 설립 요건과 세무상 전환 시점을 함께 검토해야 합니다.</p>'
    },
    a6: {
      tag: '스타트업', date: '2026.10.01', read: '4분', title: '스톡옵션, 세금은 언제 얼마나 나오나',
      body: '<p>스톡옵션은 부여 시점, 행사 시점, 매도 시점에 각각 다른 세금 이슈가 생깁니다. 창업 초기라면 미리 구조를 정해두는 것이 좋습니다.</p><h4>부여·행사·매도</h4><p>일반적으로 부여 시점에는 과세가 없고, 행사 시 시가와 행사가액의 차액이 근로소득으로 과세될 수 있습니다. 벤처기업의 경우 과세특례 요건을 충족하면 과세가 이연됩니다.</p><h4>확인할 것</h4><p>벤처기업 확인서, 주식매수선택권 부여 계약, 시가 산정 근거를 갖추어야 특례 적용이 가능합니다. 투자 유치 전에 반드시 검토하시기 바랍니다.</p>'
    }
  };
  $$('[data-article]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var d = ARTICLES[btn.dataset.article];
      if (!d) return;
      var html = '<div class="modal-hero"><button class="modal-close" type="button" data-close aria-label="닫기"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg></button><span class="role">' + d.tag + ' · ' + d.read + '</span><h3>' + d.title + '</h3><span class="en">' + d.date + ' · 도원 세무·경영 파트너스</span></div><div class="modal-content">' + d.body + '<a class="btn btn-navy" href="contact.html?type=tax">이 주제로 상담 신청 <span class="arr">→</span></a></div>';
      openModal('#article-modal', html);
      $$('[data-close]', $('#article-modal')).forEach(function (b) {
        b.onclick = function () { closeModal($('#article-modal')); };
      });
    });
  });

  /* ---------------- insights search ---------------- */
  var search = $('#insight-search');
  if (search) {
    var articles = $$('.article');
    var countEl = $('#search-count');
    var emptyEl = $('#search-empty');
    var activeTag = 'all';
    function applySearch() {
      var q = search.value.trim().toLowerCase();
      var shown = 0;
      articles.forEach(function (a) {
        var hay = (a.dataset.keywords || '') + ' ' + a.textContent;
        var okQ = !q || hay.toLowerCase().indexOf(q) > -1;
        var okT = activeTag === 'all' || (a.dataset.tags || '').split(' ').indexOf(activeTag) > -1;
        var show = okQ && okT;
        a.classList.toggle('hidden', !show);
        if (show) shown++;
      });
      if (countEl) countEl.innerHTML = '검색 결과 <b>' + shown + '</b>건';
      if (emptyEl) emptyEl.style.display = shown ? 'none' : 'block';
    }
    search.addEventListener('input', applySearch);
    var tagRow = $('#insight-tags');
    if (tagRow) {
      $$('[data-filter]', tagRow).forEach(function (btn) {
        btn.addEventListener('click', function () {
          $$('[data-filter]', tagRow).forEach(function (b) { b.classList.remove('active'); });
          btn.classList.add('active');
          activeTag = btn.dataset.filter;
          applySearch();
        });
      });
    }
  }

  /* ---------------- calculator ---------------- */
  var calc = $('#calc');
  if (calc) {
    var state = { biz: 'personal', revenue: 3000, staff: '0', industry: 'general', opts: [] };
    var amountEl = $('#calc-amount');
    var amountBox = $('#calc-amount-box');
    var data = {
      biz: {
        personal: { base: 120000, label: '개인사업자', mult: 1 },
        corporate: { base: 260000, label: '법인사업자', mult: 1 },
        startup: { base: 100000, label: '신규 창업 예정', mult: 1 }
      },
      staff: { '0': [0, '없음'], '1': [50000, '1~3명'], '3': [110000, '4~10명'], '10': [240000, '11명 이상'] },
      industry: { general: [0, '일반 서비스·도소매'], food: [30000, '요식·소매'], medical: [90000, '병의원·전문직'], build: [90000, '제조·건설'], it: [40000, 'IT·스타트업'] },
      opts: { adjust: [80000, '결산 세무조정'], payroll: [40000, '급여대행'], insurance: [30000, '4대보험 신고대행'] }
    };
    function revenueFee(r) {
      if (r <= 1000) return 0;
      if (r <= 3000) return 60000;
      if (r <= 5000) return 110000;
      if (r <= 10000) return 180000;
      if (r <= 20000) return 260000;
      return 320000;
    }
    function calcFee() {
      var b = data.biz[state.biz].base;
      var r = revenueFee(state.revenue);
      var s = data.staff[state.staff][0];
      var i = data.industry[state.industry][0];
      var o = state.opts.reduce(function (sum, k) { return sum + data.opts[k][0]; }, 0);
      var total = Math.round((b + r + s + i + o) / 10000) * 10000;
      return { total: total, base: b, rev: r, staff: s, industry: i, opts: o };
    }
    function packageFor(total) {
      if (total < 260000) return { name: 'BASIC 기장 패키지', tag: '월 1회 결산 · 부가세 신고', color: '#5b8ff9' };
      if (total < 470000) return { name: 'GROWTH 기장 패키지', tag: '결산·세무조정 · 절세 리포트', color: '#c8a25a' };
      return { name: 'PREMIUM 세무 파트너', tag: '전담 세무사 · 경영 자문 포함', color: '#e8ce97' };
    }
    function won(n) { return n.toLocaleString('ko-KR'); }
    function render(pulse) {
      var f = calcFee();
      var pkg = packageFor(f.total);
      if (amountEl) amountEl.textContent = won(f.total);
      if (pulse && amountBox && !reduced) {
        amountBox.classList.remove('pulse');
        void amountBox.offsetWidth;
        amountBox.classList.add('pulse');
      }
      var pkgName = $('#calc-pkg-name'); if (pkgName) pkgName.textContent = pkg.name;
      var pkgTag = $('#calc-pkg-tag'); if (pkgTag) pkgTag.textContent = pkg.tag;
      var lines = $('#calc-lines');
      if (lines) {
        var rows = [
          ['기본 기장 (' + data.biz[state.biz].label + ')', f.base],
          ['매출 규모 반영 (' + won(state.revenue) + '만 원)', f.rev],
          ['직원 수 (' + data.staff[state.staff][1] + ')', f.staff],
          ['업종 가산 (' + data.industry[state.industry][1] + ')', f.industry]
        ];
        if (f.opts) rows.push(['추가 업무', f.opts]);
        lines.innerHTML = rows.filter(function (r) { return r[1] > 0; }).map(function (r) {
          return '<div class="calc-line"><span>' + r[0] + '</span><b>' + won(r[1]) + '원</b></div>';
        }).join('') + '<div class="calc-line total"><span>예상 월 기장료 (VAT 별도)</span><b>' + won(f.total) + '원</b></div>';
      }
      var bars = $('#calc-bars');
      if (bars) {
        var parts = [['기본 기장', f.base], ['매출 반영', f.rev], ['인력·업종', f.staff + f.industry], ['추가 업무', f.opts]];
        bars.innerHTML = parts.filter(function (x) { return x[1] > 0; }).map(function (x) {
          var pct = Math.round((x[1] / f.total) * 100);
          return '<div class="bar-line"><div class="bl-top"><span>' + x[0] + '</span><b>' + pct + '%</b></div><div class="bar-track"><div class="bar-fill" style="width:' + pct + '%"></div></div></div>';
        }).join('');
      }
      var saveRate = state.biz === 'personal' ? (state.revenue >= 5000 ? 0.032 : 0.018) : (state.biz === 'corporate' ? 0.009 : 0.012);
      var save = Math.round((state.revenue * 12 * saveRate) / 10) * 10;
      var saveEl = $('#calc-saving');
      if (saveEl) saveEl.textContent = '연 약 ' + won(save) + '만 원';
      var points = $('#calc-points');
      if (points) {
        var arr = [];
        if (state.biz === 'personal' && state.revenue >= 5000) {
          arr.push('<b>법인 전환 검토 구간입니다.</b> 연 매출 ' + (state.revenue * 12 / 10000).toFixed(1) + '억 원 규모라면 대표 급여·배당 구조에 따라 절세 여지가 커집니다.');
        } else if (state.biz === 'personal') {
          arr.push('<b>비용 인정 항목 점검이 우선입니다.</b> 차량·통신·임차료 등 실제 사업 비용이 빠짐없이 반영되는지 확인합니다.');
        } else if (state.biz === 'corporate') {
          arr.push('<b>세무조정과 유보이익 설계가 핵심입니다.</b> 대표 보수와 법인세율 구간을 함께 조정합니다.');
        } else {
          arr.push('<b>창업 초기에는 복식부기 전환이 유리합니다.</b> 초기 3년의 장부 품질이 이후 자금 조달에 영향을 줍니다.');
        }
        if (state.industry === 'medical') arr.push('<b>비급여·미용 시술의 부가세 과세 여부</b>를 항목별로 점검해야 합니다.');
        if (state.industry === 'food') arr.push('<b>카드 매출과 현금 매출의 정합성</b>이 신고 리스크의 핵심입니다.');
        if (state.industry === 'it') arr.push('<b>연구·인력개발비 세액공제</b> 적격 비용을 결산 전에 정리하시기 바랍니다.');
        if (state.staff !== '0') arr.push('<b>4대보험·급여대행을 함께 운영</b>하면 신고 누락과 가산세를 줄일 수 있습니다.');
        if (state.opts.indexOf('adjust') === -1 && state.biz === 'corporate') arr.push('<b>결산 세무조정을 추가</b>하시면 법인세 신고 리스크를 낮출 수 있습니다.');
        points.innerHTML = arr.map(function (t) { return '<li>' + t + '</li>'; }).join('');
      }
      var cta = $('#calc-cta');
      if (cta) cta.href = 'contact.html?type=' + (state.biz === 'corporate' ? 'corporate' : state.biz === 'startup' ? 'startup' : 'tax') + '&plan=' + encodeURIComponent(pkg.name) + '&fee=' + f.total + '&rev=' + state.revenue + '&staff=' + encodeURIComponent(data.staff[state.staff][1]) + '&industry=' + encodeURIComponent(data.industry[state.industry][1]);
    }
    $$('[data-biz]', calc).forEach(function (btn) {
      btn.addEventListener('click', function () {
        $$('[data-biz]', calc).forEach(function (b) { b.classList.remove('active'); b.setAttribute('aria-pressed', 'false'); });
        btn.classList.add('active'); btn.setAttribute('aria-pressed', 'true');
        state.biz = btn.dataset.biz;
        render(true);
      });
    });
    var rev = $('#rev-range');
    if (rev) {
      function paintRange() {
        var pct = ((state.revenue - 500) / (20000 - 500)) * 100;
        rev.style.setProperty('--p', pct + '%');
      }
      rev.addEventListener('input', function () {
        state.revenue = parseInt(rev.value, 10);
        var label = $('#rev-value');
        if (label) label.textContent = '월 ' + state.revenue.toLocaleString('ko-KR') + '만 원';
        paintRange();
        render(false);
      });
      state.revenue = parseInt(rev.value, 10);
      paintRange();
      var label0 = $('#rev-value');
      if (label0) label0.textContent = '월 ' + state.revenue.toLocaleString('ko-KR') + '만 원';
    }
    var staffSel = $('#staff-select');
    if (staffSel) staffSel.addEventListener('change', function () { state.staff = staffSel.value; render(true); });
    var indSel = $('#industry-select');
    if (indSel) indSel.addEventListener('change', function () { state.industry = indSel.value; render(true); });
    $$('.check-chip input', calc).forEach(function (cb) {
      cb.addEventListener('change', function () {
        state.opts = $$('.check-chip input', calc).filter(function (x) { return x.checked; }).map(function (x) { return x.value; });
        render(true);
      });
    });
    render(false);
    setTimeout(function () { render(false); }, 60);
  }

  /* ---------------- contact form ---------------- */
  var form = $('#consult-form');
  if (form) {
    var params = new URLSearchParams(window.location.search);
    var typeSel = $('#c-type');
    var plan = params.get('plan');
    var fee = params.get('fee');
    var revp = params.get('rev');
    var staffp = params.get('staff');
    var indp = params.get('industry');
    if (typeSel && params.get('type')) {
      var t = params.get('type');
      var map = { tax: 'tax', corporate: 'corporate', refund: 'refund', startup: 'startup', meeting: 'meeting' };
      if (map[t]) typeSel.value = map[t];
    }
    if (plan) {
      var summary = '계산기 결과를 바탕으로 상담을 신청합니다.\n- 추천 패키지: ' + plan + (fee ? '\n- 예상 월 기장료: ' + parseInt(fee, 10).toLocaleString('ko-KR') + '원 (VAT 별도)' : '') + (revp ? '\n- 월 매출: ' + parseInt(revp, 10).toLocaleString('ko-KR') + '만 원' : '') + (staffp ? '\n- 직원 수: ' + staffp : '') + (indp ? '\n- 업종: ' + indp : '');
      var msg = $('#c-message');
      if (msg && !msg.value) msg.value = summary;
      var badge = $('#calc-summary');
      if (badge) {
        badge.style.display = 'block';
        badge.innerHTML = '<b>계산기에서 넘어온 상담입니다.</b> ' + plan + (fee ? ' · 월 ' + parseInt(fee, 10).toLocaleString('ko-KR') + '원 예상' : '');
      }
    }
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var valid = true;
      $$('[required]', form).forEach(function (el) {
        var field = el.closest('.form-field') || el.closest('.consent') && el.closest('.form-field');
        var ok = el.type === 'checkbox' ? el.checked : el.value.trim() !== '';
        if (el.type === 'tel') ok = /^0\d{1,2}-?\d{3,4}-?\d{4}$/.test(el.value.replace(/\s/g, ''));
        if (el.type === 'email' && el.value.trim()) ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(el.value);
        if (field) field.classList.toggle('invalid', !ok);
        if (!ok && valid) { el.focus(); }
        if (!ok) valid = false;
      });
      if (!valid) { showToast('<b>입력 내용을 확인해 주세요.</b> 필수 항목이 비어 있거나 형식이 맞지 않습니다.'); return; }
      var name = ($('#c-name') || {}).value || '고객';
      showToast('<b>' + name + '님, 무료 세무 진단 신청이 접수되었습니다.</b> 영업일 기준 4시간 이내에 담당 세무사가 연락드립니다. (예시 페이지이므로 실제 발송은 되지 않습니다.)', 5600);
      form.reset();
      var dEl = $('#c-date');
      if (dEl && dEl.min) dEl.value = dEl.min;
      var badge2 = $('#calc-summary'); if (badge2) badge2.style.display = 'none';
    });
    $$('input,select,textarea', form).forEach(function (el) {
      el.addEventListener('input', function () {
        var f = el.closest('.form-field');
        if (f) f.classList.remove('invalid');
      });
    });
  }

  /* ---------------- FAQ category nav ---------------- */
  $$('[data-faq-jump]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      $$('[data-faq-jump]').forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
      var target = $(btn.dataset.faqJump);
      if (target) target.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
    });
  });

  /* ---------------- hero pointer glow ---------------- */
  var hero = $('.hero');
  if (hero && !reduced && window.matchMedia('(hover:hover)').matches) {
    hero.addEventListener('pointermove', function (e) {
      var r = hero.getBoundingClientRect();
      hero.style.setProperty('--mx', ((e.clientX - r.left) / r.width) * 100 + '%');
      hero.style.setProperty('--my', ((e.clientY - r.top) / r.height) * 100 + '%');
    });
  }
})();
