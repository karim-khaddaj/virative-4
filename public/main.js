(function () {
  'use strict';
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia('(pointer:fine)').matches;

  document.getElementById('year').textContent = new Date().getFullYear();

  /* ---------- INTRO WIPE ---------- */
  var intro = document.getElementById('intro');
  function lift() { if (intro) intro.classList.add('gone'); }
  var introSeen = false;
  try { introSeen = sessionStorage.getItem('virative-intro-seen') === '1'; } catch (e) {}
  if (reduceMotion || introSeen) { lift(); }
  else {
    window.addEventListener('load', function () { setTimeout(lift, 1150); });
    setTimeout(lift, 2600);
    window.addEventListener('pointerdown', lift, { once: true });
    window.addEventListener('keydown', function skipIntro(event) { if (event.key === 'Escape') { lift(); window.removeEventListener('keydown', skipIntro); } });
    try { sessionStorage.setItem('virative-intro-seen', '1'); } catch (e) {}
  }

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

  wmEl.textContent = '';
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

  /* ---------- MOBILE NAVIGATION ---------- */
  var nav = document.querySelector('.nav');
  var navToggle = document.getElementById('navToggle');
  var navLinks = document.getElementById('navLinks');
  if (nav && navToggle && navLinks) {
    function closeNav() { nav.classList.remove('open'); navLinks.classList.remove('open'); navToggle.setAttribute('aria-expanded', 'false'); }
    navToggle.addEventListener('click', function () { var open = !nav.classList.contains('open'); nav.classList.toggle('open', open); navLinks.classList.toggle('open', open); navToggle.setAttribute('aria-expanded', String(open)); });
    navLinks.querySelectorAll('a').forEach(function (link) { link.addEventListener('click', closeNav); });
  }

  /* ============================================================
     SCROLL ENGINE — progress, hero parallax, hue-shifting
     background, depth parallax, velocity-reactive marquee skew
  ============================================================ */
  var mesh = document.querySelector('.mesh');
  var secNums = Array.prototype.slice.call(document.querySelectorAll('.sec-num'));
  var mqs = Array.prototype.slice.call(document.querySelectorAll('.mq'));

  if (reduceMotion) {
    // progress bar only, no motion
    window.addEventListener('scroll', function () {
      var y = window.scrollY;
      var h = document.documentElement.scrollHeight - window.innerHeight;
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
  var stackScaleStep = 0.07;
  var stackBlur = 1.5;
  var stackDim = 0.16;
  var stackPeek = 18;

  function updateScrollStack() {
    var viewport = window.innerHeight;

    for (var i = 0; i < stackCards.length; i++) {
      var card = stackCards[i];
      var rect = card.getBoundingClientRect();

      card.style.zIndex = String(i + 1);

      var progress = clamp(
        (viewport * 0.12 - rect.top) / (viewport * 0.68),
        0,
        1
      );

      var scale = 1 - (progress * stackScaleStep);
      var y = progress * -stackPeek;
      var blur = progress * stackBlur;
      var opacity = 1 - (progress * stackDim);

      card.style.transform =
        'translate3d(0,' +
        y.toFixed(2) +
        'px,0) scale(' +
        scale.toFixed(4) +
        ')';

      card.style.filter =
        'blur(' + blur.toFixed(2) + 'px)';

      card.style.opacity = opacity.toFixed(3);
    }

  }

  var stackTicking = false;
  function requestStackUpdate() {
    if (stackTicking) return;
    stackTicking = true;
    requestAnimationFrame(function () {
      updateScrollStack();
      stackTicking = false;
    });
  }

  window.addEventListener('scroll', requestStackUpdate, { passive: true });
  window.addEventListener('resize', requestStackUpdate);
  requestStackUpdate();
}

/* ============================================================
   OUR WORK — DOME GALLERY
============================================================ */

var workGallery = document.getElementById('workGallery');

if (workGallery) {

  var works = [
    {
      vimeoId: '1214488863',
      client: '0521',
      title: 'Visual Story'
    },
    {
      vimeoId: '1187414620',
      client: 'Cocktail',
      title: 'Crafted Moments'
    },
    {
      vimeoId: '1187413039',
      client: 'Ritz-Carlton Abu Dhabi',
      title: 'Luxury in Motion'
    },
    {
      vimeoId: '1187406957',
      client: 'ElCarmelo',
      title: 'Brand Film'
    },
    {
      vimeoId: '1187213379',
      client: 'Stairs',
      title: 'Architectural Motion'
    },
    {
      vimeoId: '1187211955',
      client: 'Loui',
      title: 'Social Content'
    },
    {
      vimeoId: '1157497781',
      client: 'ElCarmelo',
      title: 'Process Film'
    },
    {
      vimeoId: '1157164326',
      client: 'HUAWEI GT 6 Pro',
      title: 'Campaign Film'
    },
    {
      vimeoId: '1157161427',
      client: 'HUAWEI GT 6 Pro',
      title: 'Product Story'
    },
    {
      vimeoId: '1157160339',
      client: 'OneFitout',
      title: 'Interior in Motion'
    },
    {
      vimeoId: '1093599047',
      client: 'Yango',
      title: 'Urban Motion'
    },
    {
      vimeoId: '1157152963',
      client: 'OneFitout',
      title: 'Space & Detail'
    },
    {
      vimeoId: '1157154617',
      client: 'OneFitout',
      title: 'Behind the Scenes'
    },
    {
      vimeoId: '1157165866',
      client: 'HUAWEI GT 6 Pro',
      title: 'Campaign Story'
    },
    {
      vimeoId: '1043610808',
      client: 'Dubai',
      title: 'From Above'
    }
  ];

  var sphere = document.getElementById('workSphereObject');
  var sphereMain = document.getElementById('workSphereMain');

  var workItems = [];

  /*
   * React Bits uses:
   * 35 columns × 5 rows
   *
   * We reproduce the same structure here.
   * Your 15 videos are repeated across the available tiles.
   */

  var segments = 24;

  var xColumns = [];

  for (var c = 0; c < segments; c++) {
    xColumns.push(-23 + (c * 2));
  }

  var evenRows = [-2, 0, 2];
  var oddRows = [-1, 1, 3];

  var tileIndex = 0;

  xColumns.forEach(function (x, columnIndex) {

    var rows =
      columnIndex % 2 === 0
        ? evenRows
        : oddRows;

    rows.forEach(function (y) {

      var work = works[tileIndex % works.length];

      var item = document.createElement('div');

      item.className = 'work-item';

      item.dataset.src =
        'https://vumbnail.com/' +
        work.vimeoId +
        '.jpg';

      item.dataset.offsetX = x;
      item.dataset.offsetY = y;
      item.dataset.sizeX = 2;
      item.dataset.sizeY = 2;

      var image = document.createElement('div');

      image.className = 'work-item-image';

      image.setAttribute('role', 'button');
      image.setAttribute('tabindex', tileIndex < works.length ? '0' : '-1');

      image.setAttribute(
        'aria-label',
        'Open ' + work.client + ' — ' + work.title
      );

      image.innerHTML =
        '<img src="https://vumbnail.com/' +
        work.vimeoId +
        '.jpg" alt="' +
        work.client +
        ' — ' +
        work.title +
        '" draggable="false">' +

        '<div class="work-item-label">' +

          '<span class="work-item-client">' +
            work.client +
          '</span>' +

          '<span class="work-item-title">' +
            work.title +
          '</span>' +

        '</div>';

      item.appendChild(image);

      sphere.appendChild(item);

      workItems.push({
        element: item,
        image: image,
        work: work
      });

      tileIndex++;
    });

  });


  /* ============================================================
     DOME GEOMETRY
  ============================================================ */

  var rotationX = 0;
  var rotationY = 0;

  var targetRotationX = 0;
  var targetRotationY = 0;

  var startRotationX = 0;
  var startRotationY = 0;

  var dragging = false;
  var moved = false;

  var startPointerX = 0;
  var startPointerY = 0;

  var lastPointerX = 0;
  var lastPointerY = 0;

  var velocityX = 0;
  var velocityY = 0;

  var inertiaFrame = null;

  var maxVerticalRotation = 5;
  var dragSensitivity = 20;


  function clampAngle(value, min, max) {
    return Math.min(
      Math.max(value, min),
      max
    );
  }


  function wrapAngle(value) {
    return ((value + 180) % 360 + 360) % 360 - 180;
  }


  function getRadius() {

    var rect =
      workGallery.getBoundingClientRect();

    var width = Math.max(1, rect.width);
    var height = Math.max(1, rect.height);

    var minDimension =
      Math.min(width, height);

    var radius =
      minDimension * 0.5;

    var heightGuard =
      height * 1.35;

    radius =
      Math.min(radius, heightGuard);

    radius =
      Math.max(radius, 600);

    return radius;
  }


  function updateRadius() {

    var radius = getRadius();

    sphere.style.setProperty(
      '--radius',
      Math.round(radius) + 'px'
    );

  }


  function renderDome() {

    var radius =
      parseFloat(
        getComputedStyle(
          sphere
        ).getPropertyValue('--radius')
      ) || 600;

    var circumference =
      radius * 3.14;

    var itemWidth =
      circumference / segments;

    var itemHeight =
      circumference / segments;

    sphere.style.transform =
      'translateZ(' +
      (-radius).toFixed(2) +
      'px) ' +
      'rotateX(' +
      rotationX.toFixed(3) +
      'deg) ' +
      'rotateY(' +
      rotationY.toFixed(3) +
      'deg)';


    for (
      var i = 0;
      i < workItems.length;
      i++
    ) {

      var data =
        workItems[i];

      var item =
        data.element;

      var offsetX =
        parseFloat(item.dataset.offsetX);

      var offsetY =
        parseFloat(item.dataset.offsetY);

      var sizeX = 2;
      var sizeY = 2;

      var unit =
        360 / segments / 2;

      var baseRotateY =
        unit *
        (
          offsetX +
          ((sizeX - 1) / 2)
        );

      var baseRotateX =
        unit *
        (
          offsetY -
          ((sizeY - 1) / 2)
        );

      item.style.width =
        (itemWidth * sizeX) + 'px';

      item.style.height =
        (itemHeight * sizeY) + 'px';

      item.style.transform =
        'rotateY(' +
        baseRotateY.toFixed(3) +
        'deg) ' +

        'rotateX(' +
        baseRotateX.toFixed(3) +
        'deg) ' +

        'translateZ(' +
        radius.toFixed(2) +
        'px)';

    }

  }


  /* ============================================================
     DRAGGING
  ============================================================ */

  function stopInertia() {

    if (inertiaFrame) {

      cancelAnimationFrame(
        inertiaFrame
      );

      inertiaFrame = null;

    }

  }


  function startInertia(
    velocityXStart,
    velocityYStart
  ) {

    stopInertia();

    var vx =
      clampAngle(
        velocityXStart,
        -1.4,
        1.4
      ) * 80;

    var vy =
      clampAngle(
        velocityYStart,
        -1.4,
        1.4
      ) * 80;


    function step() {

      vx *= 0.965;
      vy *= 0.965;

      if (
        Math.abs(vx) < 0.015 &&
        Math.abs(vy) < 0.015
      ) {

        inertiaFrame = null;
        return;

      }


      rotationX =
        clampAngle(
          rotationX - vy / 200,
          -maxVerticalRotation,
          maxVerticalRotation
        );

      rotationY =
        wrapAngle(
          rotationY + vx / 200
        );


      targetRotationX =
        rotationX;

      targetRotationY =
        rotationY;


      inertiaFrame =
        requestAnimationFrame(
          step
        );

    }


    inertiaFrame =
      requestAnimationFrame(
        step
      );

  }


  sphereMain.addEventListener(
    'pointerdown',
    function (event) {

      if (workViewer.classList.contains('is-open')) {
        return;
      }

      stopInertia();

      dragging = true;
      moved = false;

      startPointerX =
        event.clientX;

      startPointerY =
        event.clientY;

      lastPointerX =
        event.clientX;

      lastPointerY =
        event.clientY;

      startRotationX =
        rotationX;

      startRotationY =
        rotationY;

      velocityX = 0;
      velocityY = 0;

      sphereMain.setPointerCapture(
        event.pointerId
      );

    }
  );


  sphereMain.addEventListener(
    'pointermove',
    function (event) {

      if (!dragging) {
        return;
      }

      var dx =
        event.clientX -
        lastPointerX;

      var dy =
        event.clientY -
        lastPointerY;

      var totalX =
        event.clientX -
        startPointerX;

      var totalY =
        event.clientY -
        startPointerY;


      if (
        Math.sqrt(
          totalX * totalX +
          totalY * totalY
        ) > 10
      ) {

        moved = true;

      }


      lastPointerX =
        event.clientX;

      lastPointerY =
        event.clientY;


      targetRotationY =
        wrapAngle(
          startRotationY +
          totalX / dragSensitivity
        );

      targetRotationX =
        clampAngle(
          startRotationX -
          totalY / dragSensitivity,
          -maxVerticalRotation,
          maxVerticalRotation
        );


      rotationY =
        targetRotationY;

      rotationX =
        targetRotationX;


      velocityX =
        dx / dragSensitivity;

      velocityY =
        dy / dragSensitivity;

    }
  );


  function finishDrag() {

    if (!dragging) {
      return;
    }

    dragging = false;

    if (
      Math.abs(velocityX) > 0.005 ||
      Math.abs(velocityY) > 0.005
    ) {

      startInertia(
        velocityX,
        velocityY
      );

    }

  }


  sphereMain.addEventListener(
    'pointerup',
    finishDrag
  );

  sphereMain.addEventListener(
    'pointercancel',
    finishDrag
  );


  /* ============================================================
     SMOOTH RENDER LOOP
  ============================================================ */

  var domeVisible = true;
  function animateDome() {

    if (!dragging && !inertiaFrame) {

      rotationX +=
        (
          targetRotationX -
          rotationX
        ) * 0.08;

      rotationY +=
        (
          targetRotationY -
          rotationY
        ) * 0.08;

    }

    renderDome();

    if (domeVisible) requestAnimationFrame(animateDome);

  }


  /* ============================================================
     VIMEO VIEWER
  ============================================================ */

  var workViewer =
    document.getElementById(
      'workViewer'
    );

  var workViewerFrame =
    document.getElementById(
      'workViewerFrame'
    );

  var workViewerClose =
    document.getElementById(
      'workViewerClose'
    );

  var workViewerBackdrop =
    document.getElementById(
      'workViewerBackdrop'
    );

  var lastVideoTrigger = null;


  function openWorkVideo(work) {

    if (!workViewer) {
      return;
    }

    stopInertia();

    workViewerFrame.src =
      'https://player.vimeo.com/video/' +
      work.vimeoId +
      '?autoplay=1&title=0&byline=0&portrait=0';

    workViewer.classList.add(
      'is-open'
    );

    workViewer.setAttribute(
      'aria-hidden',
      'false'
    );

    document.body.style.overflow =
      'hidden';
    document.getElementById('workViewerTitle').textContent = work.client + ' — ' + work.title;
    workViewerClose.focus();

  }


  function closeWorkVideo() {

    workViewer.classList.remove(
      'is-open'
    );

    workViewer.setAttribute(
      'aria-hidden',
      'true'
    );

    workViewerFrame.src = '';

    document.body.style.overflow =
      '';
    document.getElementById('workViewerTitle').textContent = '';
    if (lastVideoTrigger) lastVideoTrigger.focus();

  }


  workItems.forEach(
    function (data) {

      data.image.addEventListener(
        'click',
        function (event) {

          lastVideoTrigger = data.image;
          openWorkVideo(
            data.work
          );

        }
      );


      data.image.addEventListener(
        'keydown',
        function (event) {

          if (
            event.key === 'Enter' ||
            event.key === ' '
          ) {

            event.preventDefault();

            lastVideoTrigger = data.image;
            openWorkVideo(
              data.work
            );

          }

        }
      );

    }
  );


  workViewerClose.addEventListener(
    'click',
    closeWorkVideo
  );

  workViewerBackdrop.addEventListener(
    'click',
    closeWorkVideo
  );


  document.addEventListener(
    'keydown',
    function (event) {

      if (
        event.key === 'Escape' &&
        workViewer.classList.contains(
          'is-open'
        )
      ) {

        closeWorkVideo();

      }

    }
  );


  /* ============================================================
     RESIZE
  ============================================================ */

  window.addEventListener(
    'resize',
    function () {

      updateRadius();

    }
  );


  /* ============================================================
     INITIALIZE
  ============================================================ */

  updateRadius();

  renderDome();

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      domeVisible = entries[0].isIntersecting;
      if (domeVisible) requestAnimationFrame(animateDome);
    }, { threshold: 0.05 }).observe(workGallery);
  } else { requestAnimationFrame(animateDome); }

  sphereMain.addEventListener('pointerdown', function () {
    workGallery.classList.add('is-interacted');
  }, { once: true });

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
