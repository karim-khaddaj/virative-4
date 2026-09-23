(function () {
  'use strict';
  var intro = document.getElementById('brandIntro');
  if (!intro) return;
  var root = document.documentElement;
  var motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  var replay = new URLSearchParams(location.search).get('intro') === 'replay';
  var seen = false;
  try { seen = sessionStorage.getItem('virative-brand-intro-v1') === '1'; } catch (_) {}
  // Direct section links land directly at their destination.
  if (location.hash && !replay) return;
  var short = motion.matches || (seen && !replay);
  var timers = [], closed = false, opening = false, ready = false, sequenceDone = false;
  var previousFocus = document.activeElement;
  var inertNodes = [];
  var skip = intro.querySelector('.bi-skip');
  function later(fn, ms) { var t = setTimeout(fn, ms); timers.push(t); return t; }
  function finish() {
    if (closed) return;
    closed = true;
    timers.forEach(clearTimeout);
    intro.hidden = true;
    intro.querySelectorAll('.bi-fragment').forEach(function (el) { el.remove(); });
    root.classList.remove('bi-running');
    inertNodes.forEach(function (el) { el.inert = false; });
    document.removeEventListener('keydown', onKey);
    motion.removeEventListener('change', onMotion);
    try { sessionStorage.setItem('virative-brand-intro-v1', '1'); } catch (_) {}
    if (document.activeElement === skip) {
      var target = document.querySelector('.nav .logo') || previousFocus;
      if (target && target.focus) target.focus({ preventScroll: true });
    }
    window.dispatchEvent(new Event('virative:intro-end'));
    if (replay && !document.getElementById('biReplay')) {
      var button = document.createElement('button');
      button.id = 'biReplay'; button.className = 'bi-replay'; button.textContent = 'Replay intro ↺';
      button.addEventListener('click', function () { location.reload(); });
      document.body.appendChild(button);
    }
  }
  function open(force) {
    if (closed || opening || (!force && (!ready || !sequenceDone))) return;
    opening = true;
    intro.classList.add('is-opening');
    if (short || force) intro.classList.add('bi-short');
    later(finish, short || force ? 200 : 650);
  }
  function onKey(e) {
    if (e.key === 'Escape') { e.preventDefault(); open(true); }
    // One focusable intro control: keep keyboard users out of the obscured page.
    if (e.key === 'Tab' && !closed) { e.preventDefault(); skip.focus(); }
  }
  function onMotion() { if (motion.matches) { short = true; intro.classList.add('bi-short'); open(true); } }
  function assemble() {
    if (closed || opening) return;
    var target = intro.querySelector('.bi-resolve svg');
    var destination = target.getBoundingClientRect();
    var fragments = [];
    [0, 1].forEach(function (part) {
      var source = intro.querySelector('[data-row="' + part + '"] b').getBoundingClientRect();
      var svg = target.cloneNode(true);
      svg.classList.add('bi-fragment');
      svg.querySelectorAll('path').forEach(function (path, index) { if ((index < 4) !== (part === 0)) path.remove(); });
      svg.style.cssText = 'left:' + destination.left + 'px;top:' + destination.top + 'px;width:' + destination.width + 'px;height:' + destination.height + 'px;transform-origin:0 0';
      intro.appendChild(svg);
      var bounds = svg.getBBox();
      var unit = destination.width / 622;
      var scale = source.width / (bounds.width * unit);
      var dx = source.left - destination.left - bounds.x * unit * scale;
      var dy = source.top - destination.top - bounds.y * unit * scale;
      var from = 'translate(' + dx + 'px,' + dy + 'px) scale(' + scale + ')';
      if (svg.animate) svg.animate([{ transform: from, opacity: 0 }, { transform: from, opacity: 1, offset: .08 }, { transform: 'none', opacity: 1 }], { duration: 620, easing: 'cubic-bezier(.22,.61,.36,1)', fill: 'forwards' });
      fragments.push(svg);
    });
    intro.classList.add('is-resolved');
    // Swap coincident vector copies only after they reach their final position.
    later(function () {
      intro.classList.add('is-landed');
      fragments.forEach(function (svg) { svg.remove(); });
    }, 640);
  }

  function step(n) {
    if (closed || opening) return;
    intro.dataset.step = String(n + 1);
    intro.querySelectorAll('.bi-row').forEach(function (row, i) {
      row.classList.toggle('is-lit', i === n);
      row.classList.toggle('is-past', i < n);
    });
  }
  function start() {
    if (closed) return;
    if (short) { intro.classList.add('bi-short'); later(function () { sequenceDone = true; open(); }, 160); return; }
    step(0);
    later(function () { step(1); }, 580);
    later(function () { step(2); }, 1160);
    later(assemble, 1740);
    later(function () { sequenceDone = true; open(); }, 2680);
  }
  intro.hidden = false;
  root.classList.add('bi-running');
  skip.addEventListener('click', function () { open(true); });
  document.addEventListener('keydown', onKey);
  motion.addEventListener('change', onMotion);
  // Independent timeout restores page access even if a dependency is slow.
  later(finish, 6000);
  var domReady = document.readyState === 'loading' ? new Promise(function (resolve) { document.addEventListener('DOMContentLoaded', resolve, { once: true }); }) : Promise.resolve();
  domReady.then(function () { if (closed) return; Array.from(document.body.children).forEach(function (el) { if (el !== intro && !['SCRIPT', 'STYLE', 'LINK'].includes(el.tagName) && !el.inert) { el.inert = true; inertNodes.push(el); } }); });
  var fontsReady = document.fonts ? Promise.all([document.fonts.load('800 80px Archivo'), document.fonts.load('400 12px "IBM Plex Mono"')]).catch(function () {}) : Promise.resolve();
  Promise.all([domReady, fontsReady]).then(function () {
    if (closed) return;
    ready = true;
    document.getElementById('biReadiness').textContent = 'Experience ready';
    open();
  });
  // Font loading cannot hold the choreography or the website hostage.
  Promise.race([fontsReady, new Promise(function (resolve) { later(resolve, 500); })]).then(start);
  window.addEventListener('pagehide', finish, { once: true });
})();
