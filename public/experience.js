/* Virative — immersive enhancement layer.
   Progressive enhancement only: if the libraries are unavailable, or
   the user prefers reduced motion, this file does nothing and the base
   site (CSS + main.js) carries the experience. */
(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) return;

  var hasGSAP = !!(window.gsap && window.ScrollTrigger);
  var isMobile = window.matchMedia('(max-width:760px)').matches || ('ontouchstart' in window);

  /* ============================================================
     SMOOTH SCROLL (Lenis) — synced with GSAP ticker if present
  ============================================================ */
  var lenis = null;
  if (window.Lenis && !isMobile) {
    try {
      lenis = new Lenis({ lerp: 0.1, wheelMultiplier: 1, smoothWheel: true });
      if (hasGSAP) {
        lenis.on('scroll', function () { ScrollTrigger.update(); });
        gsap.ticker.add(function (time) { lenis.raf(time * 1000); });
        gsap.ticker.lagSmoothing(0);
      } else {
        var rafL = function (t) { lenis.raf(t); requestAnimationFrame(rafL); };
        requestAnimationFrame(rafL);
      }
      document.querySelectorAll('a[href^="#"]').forEach(function (a) {
        a.addEventListener('click', function (e) {
          var id = a.getAttribute('href');
          if (id && id.length > 1) {
            var el = document.querySelector(id);
            if (el) { e.preventDefault(); lenis.scrollTo(el, { offset: -20 }); }
          }
        });
      });
    } catch (e) { lenis = null; }
  }

  /* ============================================================
     GSAP SCROLL CHOREOGRAPHY
  ============================================================ */
  if (hasGSAP) {
    gsap.registerPlugin(ScrollTrigger);
    try { initMotion(); } catch (e) { /* base reveals remain */ }
  }

  function initMotion() {
    var desktop = window.innerWidth > 760;

    // MANIFESTO — pinned exploding typography (desktop only)
    var mwords = gsap.utils.toArray('.manifesto-big .wi');
    if (mwords.length) {
      mwords.forEach(function (w) { w.style.transition = 'none'; w.style.transform = 'none'; });
      if (desktop) {
        gsap.timeline({
          scrollTrigger: { trigger: '.manifesto', start: 'top top', end: '+=90%', pin: true, scrub: 1, anticipatePin: 1 }
        })
          .from(mwords, { opacity: 0, scale: 0.25, yPercent: 60, filter: 'blur(14px)', stagger: 0.14, ease: 'power2.out' })
          .to(mwords, { letterSpacing: '0.03em', duration: 0.4 }, '>-0.15');
      } else {
        gsap.from(mwords, { scrollTrigger: { trigger: '.manifesto', start: 'top 80%' }, opacity: 0, scale: 0.6, y: 40, stagger: 0.1, duration: 0.7, ease: 'power3.out' });
      }
    }

    // ABOUT EQUATION — assembles line by line
    var eq = gsap.utils.toArray('.equation > span');
    if (eq.length) {
      eq.forEach(function (s) { s.classList.remove('reveal', 'd1', 'd2', 'in'); });
      gsap.from(eq, {
        scrollTrigger: { trigger: '.about', start: 'top 72%' },
        opacity: 0, x: -50, filter: 'blur(8px)', stagger: 0.09, duration: 0.85, ease: 'power3.out', clearProps: 'all'
      });
    }

    // SECTION TITLES — subtle scrubbed lift into place
    gsap.utils.toArray('.sec-title, .contact-title').forEach(function (tt) {
      gsap.from(tt, {
        scrollTrigger: { trigger: tt, start: 'top 92%', end: 'top 52%', scrub: true },
        yPercent: 16, opacity: 0.35, ease: 'none'
      });
    });

    ScrollTrigger.refresh();
  }

  /* ============================================================
     SERVICES CURSOR SPOTLIGHT
  ============================================================ */
  var services = document.querySelector('.services');
  var spot = document.getElementById('svcSpot');
  if (services && spot && window.matchMedia('(pointer:fine)').matches) {
    services.addEventListener('mousemove', function (e) {
      var r = services.getBoundingClientRect();
      spot.style.transform = 'translate(' + (e.clientX - r.left) + 'px,' + (e.clientY - r.top) + 'px) translate(-50%,-50%)';
    });
    services.addEventListener('mouseenter', function () { services.classList.add('spot'); });
    services.addEventListener('mouseleave', function () { services.classList.remove('spot'); });
  }
})();
