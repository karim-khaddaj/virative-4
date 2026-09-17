(function () {
  'use strict';
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia('(pointer:fine)').matches;

  document.getElementById('year').textContent = new Date().getFullYear();

  /* ---------- INTRO WIPE ---------- */
  var intro = document.getElementById('intro');
  function lift() { if (intro) intro.classList.add('gone'); }
  if (reduceMotion) { lift(); }
  else { window.addEventListener('load', function () { setTimeout(lift, 1150); }); setTimeout(lift, 2600); }

  /* ============================================================
     WORDMARK — LETTER RESONANCE
  ============================================================ */
  var BRAND = 'VIRATIVE';
  var PHASES = [
    { word: null, hold: 3000 },
    { word: 'VIRAL', hold: 2700, lit: [0, 1, 2, 3], parts: [['VIRA', 'g'], ['L', 'wht']] },
    { word: null, hold: 1600 },
    { word: 'CREATIVE', hold: 2700, lit: [3, 4, 5, 6, 7], parts: [['CRE', 'wht'], ['ATIVE', 'g']] },
    { word: null, hold: 1600 },
    { word: 'INNOVATIVE', hold: 2700, lit: [3, 4, 5, 6, 7], parts: [['INNOV', 'wht'], ['ATIVE', 'g']] }
  ];
  var SWAP = 800, STAG = 45;
  var wmEl = document.getElementById('wordmark');
  var ghost = document.getElementById('wmGhost');
  var label = document.getElementById('wmLabel');
  var meas = document.getElementById('wmMeas');
  var heroIn = document.getElementById('heroIn');
  var letters = [];
  var phase = 0;

  BRAND.split('').forEach(function (ch, i) {
    var s = document.createElement('span');
    s.className = 'wm-l' + (i >= 4 ? ' suf' : '');
    s.textContent = ch;
    wmEl.appendChild(s);
    letters.push(s);
  });

  function setLabel(p) {
    label.classList.remove('on'); label.classList.add('off');
    setTimeout(function () {
      label.innerHTML = ''; label.classList.remove('off');
      if (!p.word) return;
      var idx = 0;
      p.parts.forEach(function (part) {
        part[0].split('').forEach(function (ch) {
          var s = document.createElement('span');
          s.className = 'll ' + part[1]; s.textContent = ch;
          s.style.transitionDelay = (idx * 35) + 'ms';
          label.appendChild(s); idx++;
        });
      });
      void label.offsetWidth; label.classList.add('on');
    }, 380);
  }
  function setGhost(p) {
    ghost.classList.remove('on');
    if (!p.word) return;
    void ghost.offsetWidth; ghost.textContent = p.word; ghost.classList.add('on');
  }
  function setLetters(p) {
    letters.forEach(function (el, j) {
      el.style.transitionDelay = (j * STAG) + 'ms';
      el.classList.remove('dim', 'lit');
      if (p.word) el.classList.add(p.lit.indexOf(j) !== -1 ? 'lit' : 'dim');
    });
  }
  function applyPhase(p) { setLetters(p); setLabel(p); setGhost(p); }
  function next() { phase = (phase + 1) % PHASES.length; var p = PHASES[phase]; applyPhase(p); setTimeout(next, p.hold + SWAP); }
  function fit() {
    var avail = Math.min(document.documentElement.clientWidth * 0.92, 1280);
    document.documentElement.style.setProperty('--wm-size', '100px');
    meas.textContent = BRAND;
    var w100 = meas.getBoundingClientRect().width;
    var size = (avail * 0.98 / w100) * 100;
    var cap = Math.min(176, window.innerHeight * 0.27);
    size = Math.max(36, Math.min(size, cap));
    document.documentElement.style.setProperty('--wm-size', size.toFixed(1) + 'px');
  }
  function startWordmark() { fit(); if (!reduceMotion) setTimeout(next, 2400); }
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(startWordmark);
  else window.addEventListener('load', startWordmark);
  var rT;
  window.addEventListener('resize', function () { clearTimeout(rT); rT = setTimeout(fit, 120); });

  /* ============================================================
     MARQUEES — duplicate content & set speed/direction
  ============================================================ */
  document.querySelectorAll('.mq').forEach(function (mq) {
    var row = mq.querySelector('.mq-row');
    if (!row) return;
    row.innerHTML += row.innerHTML; // seamless 50% loop
    var speed = parseFloat(mq.getAttribute('data-speed')) || 24;
    row.style.setProperty('--dur', speed + 's');
  });

  /* ============================================================
     SCROLL ENGINE — progress, hero parallax, hue-shifting
     background, depth parallax, velocity-reactive marquee skew
  ============================================================ */
  var progress = document.getElementById('progress');
  var mesh = document.querySelector('.mesh');
  var secNums = Array.prototype.slice.call(document.querySelectorAll('.sec-num'));
  var mqs = Array.prototype.slice.call(document.querySelectorAll('.mq'));

  if (reduceMotion) {
    // progress bar only, no motion
    window.addEventListener('scroll', function () {
      var y = window.scrollY;
      var h = document.documentElement.scrollHeight - window.innerHeight;
      if (progress) progress.style.width = (h > 0 ? (y / h) * 100 : 0) + '%';
    }, { passive: true });
  } else {
    var lastY = window.scrollY;
    var skew = 0;
    var clamp = function (v, a, b) { return Math.max(a, Math.min(b, v)); };

    function frame() {
      var y = window.scrollY;
      var vh = window.innerHeight;
      var doch = document.documentElement.scrollHeight - vh;
      var prog = doch > 0 ? y / doch : 0;

      if (progress) progress.style.width = (prog * 100) + '%';

      // hero drifts up and dissolves
      if (y <= vh) {
        heroIn.style.transform = 'translateY(' + (y * 0.2).toFixed(1) + 'px)';
        heroIn.style.opacity = Math.max(0, 1 - (y / vh) * 1.1);
      }

      // background color field: slow parallax + hue rotation per scroll depth
      if (mesh) {
        mesh.style.transform = 'translateY(' + (y * 0.06).toFixed(1) + 'px)';
        mesh.style.filter = 'blur(70px) hue-rotate(' + (prog * 130).toFixed(1) + 'deg)';
      }

      // giant section numbers drift against the scroll for depth
      for (var i = 0; i < secNums.length; i++) {
        var r = secNums[i].getBoundingClientRect();
        var off = (r.top + r.height / 2) - vh / 2;
        secNums[i].style.transform = 'translateY(' + (off * -0.1).toFixed(1) + 'px)';
      }

      // velocity → marquee skew (eases back to 0 when you stop)
      var v = y - lastY; lastY = y;
      var target = clamp(v, -50, 50) * 0.14;
      skew += (target - skew) * 0.2;
      skew *= 0.9;
      var sval = clamp(skew, -7, 7).toFixed(2);
      for (var k = 0; k < mqs.length; k++) mqs[k].style.transform = 'skewX(' + sval + 'deg)';

      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  /* ============================================================
     SCROLL REVEALS + HEADING MASK REVEALS
  ============================================================ */
  if (!reduceMotion && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    document.querySelectorAll('.reveal:not(.in), .split').forEach(function (el) { io.observe(el); });
  } else {
    document.querySelectorAll('.reveal, .split').forEach(function (el) { el.classList.add('in'); });
  }

  /* ============================================================
     CUSTOM CURSOR (desktop)
  ============================================================ */
  if (!reduceMotion && finePointer) {
    var cur = document.getElementById('cursor');
    var dot = document.getElementById('cursorDot');
    var cx = window.innerWidth / 2, cy = window.innerHeight / 2;
    var rx = cx, ry = cy;
    window.addEventListener('mousemove', function (e) {
      cx = e.clientX; cy = e.clientY;
      dot.style.transform = 'translate(' + cx + 'px,' + cy + 'px) translate(-50%,-50%)';
    });
    (function loop() {
      rx += (cx - rx) * 0.18; ry += (cy - ry) * 0.18;
      cur.style.transform = 'translate(' + rx + 'px,' + ry + 'px) translate(-50%,-50%)';
      requestAnimationFrame(loop);
    })();
    document.querySelectorAll('a, button, .scroll-stack-card').forEach(function (el) {
      el.addEventListener('mouseenter', function () { cur.classList.add('lg'); });
      el.addEventListener('mouseleave', function () { cur.classList.remove('lg'); });
    });
  }

  /* ============================================================
   MAGNETIC BUTTONS (desktop)
============================================================ */
if (!reduceMotion && finePointer) {
  document.querySelectorAll('.btn').forEach(function (b) {
    b.addEventListener('mousemove', function (e) {
      var r = b.getBoundingClientRect();

      var x = (e.clientX - r.left - r.width / 2) / r.width;
      var y = (e.clientY - r.top - r.height / 2) / r.height;

      b.style.transform =
        'translate(' +
        (x * 10).toFixed(1) +
        'px,' +
        (y * 7).toFixed(1) +
        'px)';
    });

    b.addEventListener('mouseleave', function () {
      b.style.transform = '';
    });
  });
}

  /* ============================================================
     SERVICES — SCROLL STACK
  ============================================================ */
  var stackCards = Array.prototype.slice.call(
    document.querySelectorAll('.scroll-stack-card')
  );

  if (!reduceMotion && stackCards.length) {
    function updateScrollStack() {
      var stackTop = window.innerHeight * 0.2;

      for (var i = 0; i < stackCards.length; i++) {
        var card = stackCards[i];
        var next = stackCards[i + 1];

        card.style.zIndex = String(i + 1);

        var content = card.querySelectorAll(
          '.svc-index, .svc-card-title, .svc-body'
        );

        if (!next) {
          card.style.transform = 'scale(1)';
          card.style.filter = 'blur(0px)';

          for (var c = 0; c < content.length; c++) {
            content[c].style.opacity = '1';
          }

          continue;
        }

        var nextRect = next.getBoundingClientRect();
        var cardHeight = card.getBoundingClientRect().height;

        var progress = clamp(
          (stackTop + cardHeight - nextRect.top) / cardHeight,
          0,
          1
        );

        var scale = 1 - (progress * 0.08);
        var y = progress * -10;
        var blur = progress * 0.8;
        var contentOpacity = 1 - progress;

        card.style.transform =
          'translateY(' + y.toFixed(2) + 'px) scale(' + scale.toFixed(4) + ')';

        card.style.filter = 'blur(' + blur.toFixed(2) + 'px)';

        for (var j = 0; j < content.length; j++) {
          content[j].style.opacity = contentOpacity.toFixed(3);
        }
      }

      requestAnimationFrame(updateScrollStack);
    }

    requestAnimationFrame(updateScrollStack);
  }
  
  /* ============================================================
     CONTACT FORM → POST /api/contact
  ============================================================ */
  var form = document.getElementById('contactForm');
  var statusEl = document.getElementById('formStatus');
  var submitBtn = document.getElementById('submitBtn');
  function clearErrors() {
    form.querySelectorAll('.field').forEach(function (f) { f.classList.remove('err'); });
    form.querySelectorAll('.field-err').forEach(function (e) { e.textContent = ''; });
  }
  function showErrors(errors) {
    Object.keys(errors).forEach(function (key) {
      var field = document.getElementById('field-' + key);
      var msg = form.querySelector('.field-err[data-for="' + key + '"]');
      if (field) field.classList.add('err');
      if (msg) msg.textContent = errors[key];
    });
  }
  function setStatus(text, kind) { statusEl.textContent = text; statusEl.className = 'form-status show ' + (kind || ''); }

  form.addEventListener('submit', function (ev) {
    ev.preventDefault();
    clearErrors(); setStatus('', '');
    var payload = {
      name: form.name.value.trim(), email: form.email.value.trim(),
      company: form.company.value.trim(), message: form.message.value.trim(),
      website: form.website.value
    };
    var le = {};
    if (payload.name.length < 2) le.name = 'Please enter your name.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email)) le.email = 'Please enter a valid email.';
    if (payload.message.length < 5) le.message = 'Please add a short message.';
    if (Object.keys(le).length) { showErrors(le); return; }

    submitBtn.disabled = true; var original = submitBtn.textContent; submitBtn.textContent = 'Sending…';
    fetch('/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      .then(function (res) { return res.json().then(function (data) { return { res: res, data: data }; }); })
      .then(function (out) {
        if (out.res.ok && out.data.ok) { form.reset(); setStatus('Thanks — your message is in. We\'ll be in touch.', 'ok'); }
        else if (out.data && out.data.errors) { showErrors(out.data.errors); setStatus('Please check the highlighted fields.', 'bad'); }
        else { setStatus((out.data && out.data.error) || 'Something went wrong. Please try again.', 'bad'); }
      })
      .catch(function () { setStatus('Network error — please try again, or email us directly.', 'bad'); })
      .finally(function () { submitBtn.disabled = false; submitBtn.textContent = original; });
  });
})();
