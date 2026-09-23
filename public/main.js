(function () {
  'use strict';
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia('(pointer:fine)').matches;
  var byId = function (id) { return document.getElementById(id); };
  var all = function (selector) { return Array.prototype.slice.call(document.querySelectorAll(selector)); };
  byId('year').textContent = new Date().getFullYear();

  var intro = byId('intro');
  function liftIntro() { if (intro) intro.classList.add('gone'); }
  var introSeen = false;
  try { introSeen = sessionStorage.getItem('virative-intro-seen') === '1'; } catch (error) {}
  if (reduceMotion || introSeen) liftIntro();
  else {
    window.addEventListener('load', function () { setTimeout(liftIntro, 1150); });
    setTimeout(liftIntro, 2600);
    window.addEventListener('pointerdown', liftIntro, { once: true });
    function skipIntro(event) { if (event.key === 'Escape') { liftIntro(); window.removeEventListener('keydown', skipIntro); } }
    window.addEventListener('keydown', skipIntro);
    try { sessionStorage.setItem('virative-intro-seen', '1'); } catch (error) {}
  }

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
    function startWordmark() { fitWordmark(); if (!reduceMotion) setTimeout(nextPhase, 2400); }
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
    { vimeoId: '1214488863', client: '0521', title: 'Visual Story' },
    { vimeoId: '1187414620', client: 'Cocktail', title: 'Crafted Moments' },
    { vimeoId: '1187413039', client: 'Ritz-Carlton Abu Dhabi', title: 'Luxury in Motion' },
    { vimeoId: '1187406957', client: 'ElCarmelo', title: 'Brand Film' },
    { vimeoId: '1187213379', client: 'Stairs', title: 'Architectural Motion' },
    { vimeoId: '1187211955', client: 'Loui', title: 'Social Content' },
    { vimeoId: '1157497781', client: 'ElCarmelo', title: 'Process Film' },
    { vimeoId: '1157164326', client: 'HUAWEI GT 6 Pro', title: 'Campaign Film' },
    { vimeoId: '1157161427', client: 'HUAWEI GT 6 Pro', title: 'Product Story' },
    { vimeoId: '1157160339', client: 'OneFitout', title: 'Interior in Motion' },
    { vimeoId: '1093599047', client: 'Yango', title: 'Urban Motion' },
    { vimeoId: '1157152963', client: 'OneFitout', title: 'Space & Detail' },
    { vimeoId: '1157154617', client: 'OneFitout', title: 'Behind the Scenes' },
    { vimeoId: '1157165866', client: 'HUAWEI GT 6 Pro', title: 'Campaign Story' },
    { vimeoId: '1043610808', client: 'Dubai', title: 'From Above' }
  ];
  var gallery = byId('workGallery'), viewer = byId('workViewer'), viewerFrame = byId('workViewerFrame'), viewerClose = byId('workViewerClose'), viewerBackdrop = byId('workViewerBackdrop'), viewerTitle = byId('workViewerTitle'), lastVideoTrigger = null;
  function openWorkVideo(work, trigger) {
    lastVideoTrigger = trigger;
    viewerFrame.src = 'https://player.vimeo.com/video/' + work.vimeoId + '?autoplay=1&title=0&byline=0&portrait=0';
    viewerTitle.textContent = work.client + ': ' + work.title;
    viewer.classList.add('is-open'); viewer.setAttribute('aria-hidden', 'false'); document.body.style.overflow = 'hidden'; viewerClose.focus();
  }
  function closeWorkVideo() {
    viewer.classList.remove('is-open'); viewer.setAttribute('aria-hidden', 'true'); viewerFrame.src = ''; viewerTitle.textContent = ''; document.body.style.overflow = '';
    if (lastVideoTrigger) lastVideoTrigger.focus();
  }
  if (gallery && viewer && viewerFrame && viewerClose && viewerBackdrop && viewerTitle) {
    works.forEach(function (work, index) {
      var project = document.createElement('article'), button = document.createElement('button');
      project.className = 'work-project'; button.className = 'work-project-button'; button.type = 'button';
      button.setAttribute('aria-label', 'Open ' + work.client + ': ' + work.title);
      button.innerHTML = '<span class="work-project-media"><img src="https://vumbnail.com/' + work.vimeoId + '.jpg" alt="' + work.client + ': ' + work.title + '" loading="lazy"></span><span class="work-project-meta"><span class="work-project-number">' + String(index + 1).padStart(2, '0') + '</span><span class="work-project-client">' + work.client + '</span><span class="work-project-link">View film ↗</span><span class="work-project-title">' + work.title + '</span></span>';
      button.addEventListener('click', function () { openWorkVideo(work, button); });
      project.appendChild(button); gallery.appendChild(project);
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
