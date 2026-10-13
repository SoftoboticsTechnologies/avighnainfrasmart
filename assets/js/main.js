/* Avighna Infrasmart — site interactions (no dependencies) */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.documentElement.classList.add('js');

  /* ---------- Sticky header state ---------- */
  var header = document.querySelector('[data-header]');
  if (header) {
    var onScroll = function () { header.classList.toggle('is-scrolled', window.scrollY > 8); };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ---------- Mobile menu ---------- */
  var toggle = document.querySelector('[data-nav-toggle]');
  var menu = document.querySelector('[data-mobile-menu]');
  if (toggle && menu) {
    var setOpen = function (open) {
      toggle.setAttribute('aria-expanded', String(open));
      menu.hidden = !open;
      if (open) {
        var first = menu.querySelector('a');
        if (first) first.focus();
      }
    };
    toggle.addEventListener('click', function () {
      setOpen(toggle.getAttribute('aria-expanded') !== 'true');
    });
    menu.addEventListener('click', function (e) {
      if (e.target.closest('a')) setOpen(false);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
        setOpen(false);
        toggle.focus();
      }
    });
    window.matchMedia('(min-width: 1024px)').addEventListener('change', function (mq) {
      if (mq.matches) setOpen(false);
    });
  }

  /* ---------- Hero slider ----------
     Mirrors the original Smart Slider settings: autoplay every 8s, loops,
     and stops when a visitor interacts with it. Adds a pause/play control,
     keyboard arrows, swipe, and honours reduced-motion. */
  document.querySelectorAll('[data-slider]').forEach(function (slider) {
    var slides = slider.querySelectorAll('[data-slide]');
    var thumbs = slider.querySelectorAll('[data-slide-to]');
    var current = slider.querySelector('[data-slide-current]');
    var pauseBtn = slider.querySelector('[data-slider-pause]');
    var live = slider.querySelector('[data-slider-live]');
    var delay = parseInt(slider.getAttribute('data-autoplay'), 10) || 8000;
    var index = 0;
    var timer = null;
    var stopped = reduceMotion; // user-stopped or reduced motion
    var hovering = false;

    if (slides.length < 2) return;

    function go(to, announce) {
      index = (to + slides.length) % slides.length;
      slides.forEach(function (s, i) {
        var active = i === index;
        s.classList.toggle('is-active', active);
        s.setAttribute('aria-hidden', String(!active));
      });
      thumbs.forEach(function (t, i) {
        t.setAttribute('aria-current', i === index ? 'true' : 'false');
      });
      if (current) current.textContent = String(index + 1).padStart(2, '0');
      if (announce && live) live.textContent = 'Slide ' + (index + 1) + ' of ' + slides.length;
    }

    function schedule() {
      clearTimeout(timer);
      if (!stopped && !hovering && !document.hidden) {
        timer = setTimeout(function () { go(index + 1, false); schedule(); }, delay);
      }
    }

    function setStopped(value) {
      stopped = value;
      slider.classList.toggle('is-paused', stopped);
      if (pauseBtn) pauseBtn.setAttribute('aria-label', stopped ? 'Play slideshow' : 'Pause slideshow');
      schedule();
    }

    slider.querySelector('[data-slider-prev]').addEventListener('click', function () { go(index - 1, true); setStopped(true); });
    slider.querySelector('[data-slider-next]').addEventListener('click', function () { go(index + 1, true); setStopped(true); });
    thumbs.forEach(function (t) {
      t.addEventListener('click', function () { go(parseInt(t.getAttribute('data-slide-to'), 10), true); setStopped(true); });
    });
    if (pauseBtn) pauseBtn.addEventListener('click', function () { setStopped(!stopped); });

    slider.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') { go(index - 1, true); setStopped(true); }
      if (e.key === 'ArrowRight') { go(index + 1, true); setStopped(true); }
    });
    slider.addEventListener('mouseenter', function () { hovering = true; schedule(); });
    slider.addEventListener('mouseleave', function () { hovering = false; schedule(); });
    slider.addEventListener('focusin', function () { hovering = true; schedule(); });
    slider.addEventListener('focusout', function (e) {
      if (!slider.contains(e.relatedTarget)) { hovering = false; schedule(); }
    });
    document.addEventListener('visibilitychange', schedule);

    var startX = null;
    var viewport = slider.querySelector('.slider__viewport');
    viewport.addEventListener('touchstart', function (e) { startX = e.touches[0].clientX; }, { passive: true });
    viewport.addEventListener('touchend', function (e) {
      if (startX === null) return;
      var dx = e.changedTouches[0].clientX - startX;
      if (Math.abs(dx) > 40) { go(index + (dx < 0 ? 1 : -1), true); setStopped(true); }
      startX = null;
    });

    go(0, false);
    setStopped(stopped);
  });

  /* ---------- Reveal on scroll ---------- */
  var reveals = document.querySelectorAll('[data-reveal]');
  if (!reduceMotion && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('is-visible'); });
  }
})();
