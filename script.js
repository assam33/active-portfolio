(function () {
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Navbar background on scroll ---------- */
  var navbar = document.getElementById('navbar');
  function toggleNavBg() {
    navbar.classList.toggle('scrolled', window.scrollY > 20);
  }
  window.addEventListener('scroll', toggleNavBg, { passive: true });
  toggleNavBg();

  /* ---------- Mobile menu ---------- */
  var navToggle = document.getElementById('nav-toggle');
  var mobileMenu = document.getElementById('mobile-menu');

  function closeMobileMenu() {
    navToggle.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
    mobileMenu.classList.remove('open');
    document.body.style.overflow = '';
  }
  function openMobileMenu() {
    navToggle.classList.add('open');
    navToggle.setAttribute('aria-expanded', 'true');
    mobileMenu.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  navToggle.addEventListener('click', function () {
    if (mobileMenu.classList.contains('open')) closeMobileMenu();
    else openMobileMenu();
  });
  mobileMenu.querySelectorAll('a').forEach(function (a) {
    a.addEventListener('click', closeMobileMenu);
  });
  window.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeMobileMenu();
  });

  /* ---------- Scroll spy + sliding underline ---------- */
  var navLinksWrap = document.querySelector('.nav-links');
  var underline = document.getElementById('nav-underline');
  var desktopLinks = document.querySelectorAll('.nav-links a');
  var mobileLinks = document.querySelectorAll('.mobile-menu a');
  var sections = document.querySelectorAll('section[id]');

  function moveUnderline(link) {
    if (!link || !navLinksWrap) return;
    var wrapRect = navLinksWrap.getBoundingClientRect();
    var linkRect = link.getBoundingClientRect();
    underline.style.opacity = '1';
    underline.style.width = linkRect.width + 'px';
    underline.style.transform = 'translateX(' + (linkRect.left - wrapRect.left) + 'px)';
  }

  function setActive(id) {
    desktopLinks.forEach(function (a) {
      var active = a.dataset.target === id;
      a.classList.toggle('active', active);
      if (active) moveUnderline(a);
    });
    mobileLinks.forEach(function (a) {
      a.classList.toggle('active', a.dataset.target === id);
    });
  }

  function onScroll() {
    var current = sections[0];
    sections.forEach(function (s) {
      if (s.getBoundingClientRect().top <= 140) current = s;
    });
    if (current) setActive(current.id);
  }

  var ticking = false;
  window.addEventListener('scroll', function () {
    if (!ticking) {
      requestAnimationFrame(function () { onScroll(); ticking = false; });
      ticking = true;
    }
  }, { passive: true });

  window.addEventListener('resize', function () {
    var activeLink = document.querySelector('.nav-links a.active');
    if (activeLink) moveUnderline(activeLink);
  });

  window.addEventListener('load', onScroll);
  onScroll();

  /* ---------- Scroll reveal ---------- */
  var reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.15 });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('in'); });
  }

  /* ---------- Skill gauges: animate fill + count up ---------- */
  var gaugeCards = document.querySelectorAll('.skill-card');
  if ('IntersectionObserver' in window) {
    var gaugeIo = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var card = entry.target;
        var fill = card.querySelector('.gauge-fill');
        var countEl = card.querySelector('.count');
        fill.classList.add('in');

        var target = parseInt(countEl.dataset.count, 10);
        if (reduceMotion) {
          countEl.textContent = target;
        } else {
          var start = 0;
          var duration = 1200;
          var startTime = null;
          function step(ts) {
            if (!startTime) startTime = ts;
            var progress = Math.min((ts - startTime) / duration, 1);
            var eased = 1 - Math.pow(1 - progress, 3);
            countEl.textContent = Math.round(start + (target - start) * eased);
            if (progress < 1) requestAnimationFrame(step);
          }
          requestAnimationFrame(step);
        }
        gaugeIo.unobserve(card);
      });
    }, { threshold: 0.4 });
    gaugeCards.forEach(function (c) { gaugeIo.observe(c); });
  }

  /* ---------- Contact form: signal bars + transmit animation ---------- */
  var form = document.getElementById('contact-form');
  var bars = document.querySelectorAll('#signal-bars i');
  var nameInput = document.getElementById('f-name');
  var emailInput = document.getElementById('f-email');
  var msgInput = document.getElementById('f-msg');
  var statusEl = document.getElementById('form-status');
  var submitBtn = form.querySelector('.btn-block');

  function updateSignal() {
    var filled = 0;
    if (nameInput.value.trim()) filled++;
    if (emailInput.value.trim()) filled++;
    if (msgInput.value.trim().length > 0) filled++;
    if (msgInput.value.trim().length > 20) filled++;
    if (msgInput.value.trim().length > 60) filled++;
    bars.forEach(function (bar, i) {
      bar.classList.toggle('active', i < filled);
    });
  }
  [nameInput, emailInput, msgInput].forEach(function (input) {
    input.addEventListener('input', updateSignal);
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var name = nameInput.value.trim() || 'friend';
    submitBtn.classList.add('sending');
    statusEl.textContent = 'Transmitting message...';
    setTimeout(function () {
      statusEl.textContent = '✓ Signal received. Thanks, ' + name + ' — I\'ll reply within 1–2 days.';
      submitBtn.classList.remove('sending');
      form.reset();
      updateSignal();
    }, 1000);
  });

})();
