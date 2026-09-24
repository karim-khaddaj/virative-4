(function () {
  'use strict';
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia('(pointer:fine)').matches;
  var byId = function (id) { return document.getElementById(id); };
  var all = function (selector) { return Array.prototype.slice.call(document.querySelectorAll(selector)); };
  byId('year').textContent = new Date().getFullYear();

  var brand = 'VIRATIVE';
  var phases = [
    { word: null, hold: 3000 },
    { word: 'VIRAL', hold: 2700, lit: [0, 1, 2, 3], parts: [['VIRA', 'g'], ['L', 'wht']] },
    { word: null, hold: 1600 },
    { word: 'CREATIVE', hold: 2700, lit: [3, 4, 5, 6, 7], parts: [['CRE', 'wht'], ['ATIVE', 'g']] },
    { word: null, hold: 1600 },
    { word: 'INNOVATIVE', hold: 2700, lit: [3, 4, 5, 6, 7], parts: [['INNOV', 'wht'], ['ATIVE', 'g']] }
  ];
  var wordmark = byId('wordmark'), ghost = byId('wmGhost'), label = byId('wmLabel'), measure = byId('wmMeas'), heroInner = byId('heroIn');
  var letters = [], phaseIndex = 0;
  if (wordmark && ghost && label && measure) {
    wordmark.textContent = '';
    brand.split('').forEach(function (character, index) {
      var letter = document.createElement('span');
      letter.className = 'wm-l' + (index >= 4 ? ' suf' : '');
      letter.textContent = character;
      wordmark.appendChild(letter);
      letters.push(letter);
    });
    function applyPhase(phase) {
      letters.forEach(function (letter, index) {
        letter.style.transitionDelay = (index * 45) + 'ms';
        letter.classList.remove('dim', 'lit');
        if (phase.word) letter.classList.add(phase.lit.indexOf(index) !== -1 ? 'lit' : 'dim');
      });
      label.classList.remove('on'); label.classList.add('off');
      setTimeout(function () {
        label.innerHTML = ''; label.classList.remove('off');
        if (!phase.word) return;
        var charIndex = 0;
        phase.parts.forEach(function (part) {
          part[0].split('').forEach(function (character) {
            var span = document.createElement('span');
            span.className = 'll ' + part[1]; span.textContent = character;
            span.style.transitionDelay = (charIndex++ * 35) + 'ms';
            label.appendChild(span);
          });
        });
        void label.offsetWidth; label.classList.add('on');
      }, 380);
      ghost.classList.remove('on');
      if (phase.word) { void ghost.offsetWidth; ghost.textContent = phase.word; ghost.classList.add('on'); }
    }
    function nextPhase() { phaseIndex = (phaseIndex + 1) % phases.length; applyPhase(phases[phaseIndex]); setTimeout(nextPhase, phases[phaseIndex].hold + 800); }
    function fitWordmark() {
      var available = Math.min(document.documentElement.clientWidth * 0.92, 1280);
      document.documentElement.style.setProperty('--wm-size', '100px');
      measure.textContent = brand;
      var size = (available * 0.98 / measure.getBoundingClientRect().width) * 100;
      size = Math.max(36, Math.min(size, Math.min(176, window.innerHeight * 0.27)));
      document.documentElement.style.setProperty('--wm-size', size.toFixed(1) + 'px');
    }
    function startWordmark() { fitWordmark(); if (!reduceMotion) { if (document.documentElement.classList.contains('bi-running')) window.addEventListener('virative:intro-end', function () { setTimeout(nextPhase, 2400); }, { once: true }); else setTimeout(nextPhase, 2400); } }
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(startWordmark); else window.addEventListener('load', startWordmark);
    var resizeTimer;
    window.addEventListener('resize', function () { clearTimeout(resizeTimer); resizeTimer = setTimeout(fitWordmark, 120); });
  }

  var marquees = all('.mq');
  marquees.forEach(function (marquee) {
    var row = marquee.querySelector('.mq-row');
    if (!row) return;
    row.innerHTML += row.innerHTML;
    row.style.setProperty('--dur', (parseFloat(marquee.getAttribute('data-speed')) || 24) + 's');
  });
  var nav = document.querySelector('.nav'), navToggle = byId('navToggle'), navLinks = byId('navLinks');
  if (nav && navToggle && navLinks) {
    function closeNav() { nav.classList.remove('open'); navLinks.classList.remove('open'); navToggle.setAttribute('aria-expanded', 'false'); }
    navToggle.addEventListener('click', function () {
      var open = !nav.classList.contains('open');
      nav.classList.toggle('open', open); navLinks.classList.toggle('open', open); navToggle.setAttribute('aria-expanded', String(open));
    });
    all('#navLinks a').forEach(function (link) { link.addEventListener('click', closeNav); });
  }

  var mesh = document.querySelector('.mesh'), sectionNumbers = all('.sec-num');
  if (!reduceMotion) {
    var previousY = window.scrollY, skew = 0;
    function clamp(value, min, max) { return Math.max(min, Math.min(max, value)); }
    function renderFrame() {
      var y = window.scrollY, height = window.innerHeight, docHeight = document.documentElement.scrollHeight - height;
      var progress = docHeight > 0 ? y / docHeight : 0;
      if (heroInner && y <= height) { heroInner.style.transform = 'translateY(' + (y * 0.2).toFixed(1) + 'px)'; heroInner.style.opacity = Math.max(0, 1 - (y / height) * 1.1); }
      if (mesh) { mesh.style.transform = 'translateY(' + (y * 0.06).toFixed(1) + 'px)'; mesh.style.filter = 'blur(70px) hue-rotate(' + (progress * 130).toFixed(1) + 'deg)'; }
      sectionNumbers.forEach(function (number) { var rect = number.getBoundingClientRect(); number.style.transform = 'translateY(' + (((rect.top + rect.height / 2 - height / 2) * -0.1).toFixed(1)) + 'px)'; });
      skew += (clamp(y - previousY, -50, 50) * 0.14 - skew) * 0.2; previousY = y; skew *= 0.9;
      marquees.forEach(function (marquee) { marquee.style.transform = 'skewX(' + clamp(skew, -7, 7).toFixed(2) + 'deg)'; });
      requestAnimationFrame(renderFrame);
    }
    requestAnimationFrame(renderFrame);
  }
  if (!reduceMotion && 'IntersectionObserver' in window) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) { if (entry.isIntersecting) { entry.target.classList.add('in'); observer.unobserve(entry.target); } });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    all('.reveal:not(.in), .split').forEach(function (element) { observer.observe(element); });
  } else all('.reveal, .split').forEach(function (element) { element.classList.add('in'); });

  if (!reduceMotion && finePointer) {
    var cursor = byId('cursor'), cursorDot = byId('cursorDot');
    if (cursor && cursorDot) {
      var currentX = window.innerWidth / 2, currentY = window.innerHeight / 2, renderedX = currentX, renderedY = currentY;
      window.addEventListener('mousemove', function (event) { currentX = event.clientX; currentY = event.clientY; cursorDot.style.transform = 'translate(' + currentX + 'px,' + currentY + 'px) translate(-50%,-50%)'; });
      (function renderCursor() { renderedX += (currentX - renderedX) * 0.18; renderedY += (currentY - renderedY) * 0.18; cursor.style.transform = 'translate(' + renderedX + 'px,' + renderedY + 'px) translate(-50%,-50%)'; requestAnimationFrame(renderCursor); })();
      all('a, button, .service-trigger, .work-project-button').forEach(function (element) { element.addEventListener('mouseenter', function () { cursor.classList.add('lg'); }); element.addEventListener('mouseleave', function () { cursor.classList.remove('lg'); }); });
      all('.btn').forEach(function (button) {
        button.addEventListener('mousemove', function (event) { var rect = button.getBoundingClientRect(); button.style.transform = 'translate(' + (((event.clientX - rect.left - rect.width / 2) / rect.width * 10).toFixed(1)) + 'px,' + (((event.clientY - rect.top - rect.height / 2) / rect.height * 7).toFixed(1)) + 'px)'; });
        button.addEventListener('mouseleave', function () { button.style.transform = ''; });
      });
    }
  }

  var serviceTriggers = all('.service-trigger');
  serviceTriggers.forEach(function (trigger) {
    trigger.addEventListener('click', function () {
      var isOpen = trigger.getAttribute('aria-expanded') === 'true';
      serviceTriggers.forEach(function (other) { other.setAttribute('aria-expanded', 'false'); });
      if (!isOpen) trigger.setAttribute('aria-expanded', 'true');
    });
  });

  var works = [
    { vimeoId: '1229898077', title: 'HUAWEI' },
    { vimeoId: '1229876917', title: 'JETOUR' },
    { vimeoId: '1229886775', title: 'ROX - Arman Tsarukyan' },
    { vimeoId: '1229878637', title: 'SHEIN' },
    { vimeoId: '1229898073', title: 'YANGO' },
    { vimeoId: '1229878691', title: 'COCO DUBAI' },
    { vimeoId: '1229898128', title: 'ELCARMELO' },
    { vimeoId: '1229878638', title: 'GWM' },
    { vimeoId: '1229898076', title: 'HUAWEI' },
    { vimeoId: '1229898078', title: 'HUAWEI x DUBAI FITNESS CHALLENGE' },
    { vimeoId: '1229875756', title: 'JETOUR' },
    { vimeoId: '1229878328', title: 'MG' },
    { vimeoId: '1229878329', title: 'MG' },
    { vimeoId: '1229872820', title: 'ROX' },
    { vimeoId: '1229876915', title: 'ROX' },
    { vimeoId: '1229878639', title: 'SHEIN' },
    { vimeoId: '1229878640', title: 'SHEIN' },
    { vimeoId: '1229898147', title: 'Social Content' },
    { vimeoId: '1229878689', title: 'THE CRAFT' },
    { vimeoId: '1229876916', title: 'JETOUR' }
  ];
  var gallery = byId('workGallery'), viewer = byId('workViewer'), viewerFrame = byId('workViewerFrame'), viewerClose = byId('workViewerClose'), viewerBackdrop = byId('workViewerBackdrop'), viewerTitle = byId('workViewerTitle'), lastVideoTrigger = null;
  function openWorkVideo(work, trigger) {
    lastVideoTrigger = trigger;
    viewerFrame.src = 'https://player.vimeo.com/video/' + work.vimeoId + '?autoplay=1&title=0&byline=0&portrait=0';
    viewerTitle.textContent = work.title;
    viewerFrame.title = work.title;
    viewer.classList.add('is-open'); viewer.setAttribute('aria-hidden', 'false'); document.body.style.overflow = 'hidden'; viewerClose.focus();
  }
  function closeWorkVideo() {
    viewer.classList.remove('is-open'); viewer.setAttribute('aria-hidden', 'true'); viewerFrame.removeAttribute('src'); viewerTitle.textContent = ''; document.body.style.overflow = '';
    if (lastVideoTrigger) lastVideoTrigger.focus();
  }
  if (gallery && viewer && viewerFrame && viewerClose && viewerBackdrop && viewerTitle) {
    // Keep the existing fixed viewer above section and navigation stacking contexts.
    document.body.appendChild(viewer);
    var moreGallery = byId('workMoreGallery'), morePanel = byId('workMore'), moreToggle = byId('workMoreToggle');
    var moreOpen = false, moreAnimation = null;
    works.forEach(function (work, index) {
      var project = document.createElement('article'), button = document.createElement('button');
      project.className = 'work-project'; button.className = 'work-project-button'; button.type = 'button';
      button.dataset.vimeoId = work.vimeoId;
      button.setAttribute('aria-label', 'Open ' + work.title);
      var media = document.createElement('span'), image = document.createElement('img');
      media.className = 'work-project-media'; image.alt = work.title;
      image.loading = 'lazy'; image.decoding = 'async';
      var thumbnail = '/work-thumbnails/' + work.vimeoId + '.webp';
      if (index < 5) image.src = thumbnail;
      else image.dataset.src = thumbnail;
      media.appendChild(image);
      var meta = document.createElement('span'), number = document.createElement('span'), title = document.createElement('span'), link = document.createElement('span');
      meta.className = 'work-project-meta'; number.className = 'work-project-number'; title.className = 'work-project-title'; link.className = 'work-project-link';
      number.textContent = String(index + 1).padStart(2, '0'); title.textContent = work.title; link.textContent = 'View film ↗';
      meta.appendChild(number); meta.appendChild(title); meta.appendChild(link);
      button.appendChild(media); button.appendChild(meta);
      button.addEventListener('click', function () { openWorkVideo(work, button); });
      project.appendChild(button); (index < 5 ? gallery : moreGallery).appendChild(project);
    });
    function refreshWorkLayout() {
      if (window.ScrollTrigger) window.ScrollTrigger.refresh();
      window.dispatchEvent(new Event('resize'));
    }
    moreToggle.addEventListener('click', function () {
      var startHeight = morePanel.hidden ? 0 : morePanel.getBoundingClientRect().height;
      if (moreAnimation) { moreAnimation.cancel(); moreAnimation = null; }
      moreOpen = !moreOpen;
      moreToggle.setAttribute('aria-expanded', String(moreOpen));
      moreToggle.textContent = moreOpen ? 'SHOW LESS ↑' : 'VIEW MORE WORK ↓';
      morePanel.hidden = false;
      morePanel.inert = !moreOpen;
      if (moreOpen) {
        moreGallery.querySelectorAll('img[data-src]').forEach(function (image) {
          image.src = image.dataset.src; image.removeAttribute('data-src');
        });
      }
      var endHeight = moreOpen ? morePanel.scrollHeight : 0;
      function settled() {
        morePanel.hidden = !moreOpen;
        morePanel.classList.remove('is-changing');
        moreAnimation = null;
        refreshWorkLayout();
      }
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !morePanel.animate) { settled(); return; }
      morePanel.classList.add('is-changing');
      moreAnimation = morePanel.animate([{ height: startHeight + 'px', opacity: moreOpen ? .25 : 1 }, { height: endHeight + 'px', opacity: moreOpen ? 1 : 0 }], { duration: 520, easing: 'cubic-bezier(.16,1,.3,1)' });
      moreAnimation.onfinish = settled;
    });
    viewerClose.addEventListener('click', closeWorkVideo);
    viewerBackdrop.addEventListener('click', closeWorkVideo);
    document.addEventListener('keydown', function (event) { if (event.key === 'Escape' && viewer.classList.contains('is-open')) closeWorkVideo(); });
  }

  var form = byId('contactForm'), status = byId('formStatus'), submit = byId('submitBtn');
  if (form && status && submit) {
    function clearErrors() { all('.field').forEach(function (field) { field.classList.remove('err'); }); all('.field-err').forEach(function (message) { message.textContent = ''; }); }
    function showErrors(errors) { Object.keys(errors).forEach(function (key) { var field = byId('field-' + key), message = form.querySelector('.field-err[data-for="' + key + '"]'); if (field) field.classList.add('err'); if (message) message.textContent = errors[key]; }); }
    function setStatus(text, kind) { status.textContent = text; status.className = 'form-status show ' + (kind || ''); }
    form.addEventListener('submit', function (event) {
      event.preventDefault(); clearErrors(); setStatus('', '');
      var payload = { name: form.name.value.trim(), email: form.email.value.trim(), company: form.company.value.trim(), message: form.message.value.trim(), website: form.website.value }, errors = {};
      if (payload.name.length < 2) errors.name = 'Please enter your name.';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email)) errors.email = 'Please enter a valid email.';
      if (payload.message.length < 5) errors.message = 'Please add a short message.';
      if (Object.keys(errors).length) { showErrors(errors); return; }
      submit.disabled = true; var originalLabel = submit.textContent; submit.textContent = 'Sending…';
      fetch('/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
        .then(function (response) { return response.json().then(function (data) { return { response: response, data: data }; }); })
        .then(function (result) { if (result.response.ok && result.data.ok) { form.reset(); setStatus("Thanks. Your message is in. We'll be in touch.", 'ok'); } else if (result.data && result.data.errors) { showErrors(result.data.errors); setStatus('Please check the highlighted fields.', 'bad'); } else setStatus((result.data && result.data.error) || 'Something went wrong. Please try again.', 'bad'); })
        .catch(function () { setStatus('Network error. Please try again, or email us directly.', 'bad'); })
        .finally(function () { submit.disabled = false; submit.textContent = originalLabel; });
    });
  }
})();
