(() => {
  'use strict';

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ===========================================================
  // FOUC guard: show body once DOM is ready
  // ===========================================================
  document.addEventListener('DOMContentLoaded', () => {
    document.body.classList.add('is-ready');
  });

  // ===========================================================
  // Mobile menu
  // ===========================================================
  const menuBtn = document.getElementById('menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');

  function closeMenu() {
    if (!mobileMenu) return;
    mobileMenu.classList.remove('is-open');
    menuBtn?.setAttribute('aria-expanded', 'false');
  }
  function toggleMenu() {
    if (!mobileMenu) return;
    const open = mobileMenu.classList.toggle('is-open');
    menuBtn?.setAttribute('aria-expanded', open ? 'true' : 'false');
  }

  menuBtn?.addEventListener('click', toggleMenu);
  mobileMenu?.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeMenu();
  });

  // ===========================================================
  // Reveal-on-scroll (IntersectionObserver)
  // ===========================================================
  const revealEls = document.querySelectorAll('[data-reveal]');
  if (prefersReduced) {
    revealEls.forEach(el => el.classList.add('is-revealed'));
  } else {
    const revealObs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-revealed');
          revealObs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.18, rootMargin: '0px 0px -10% 0px' });
    revealEls.forEach(el => revealObs.observe(el));
  }

  // ===========================================================
  // Scroll-spy: highlight active nav link
  // ===========================================================
  const sections = document.querySelectorAll('main section[id]');
  const navLinks = document.querySelectorAll('.nav__link');
  if (sections.length && navLinks.length) {
    const spy = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const id = entry.target.id;
        navLinks.forEach(link => {
          link.classList.toggle('is-active', link.getAttribute('href') === `#${id}`);
        });
      });
    }, { rootMargin: '-40% 0px -55% 0px', threshold: 0 });
    sections.forEach(s => spy.observe(s));
  }

  // ===========================================================
  // Animated counters (triggered when the stats card enters view)
  // ===========================================================
  function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }

  function animateCount(el) {
    const target = parseFloat(el.dataset.target);
    const decimals = parseInt(el.dataset.decimals || '0', 10);
    if (prefersReduced || isNaN(target)) {
      el.textContent = target.toFixed(decimals);
      return;
    }
    const duration = 1500;
    const start = performance.now();
    function tick(now) {
      const t = Math.min(1, (now - start) / duration);
      const v = easeOutCubic(t) * target;
      el.textContent = v.toFixed(decimals);
      if (t < 1) requestAnimationFrame(tick);
      else el.textContent = target.toFixed(decimals);
    }
    requestAnimationFrame(tick);
  }

  const counters = document.querySelectorAll('[data-counter]');
  if (counters.length) {
    const counterObs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCount(entry.target);
          counterObs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.6 });
    counters.forEach(c => counterObs.observe(c));
  }

  // ===========================================================
  // Hero typewriter — cycles through role descriptors
  // ===========================================================
  const twEl = document.getElementById('typewriter');
  if (twEl) {
    const phrases = [
      'Embedded & Systems Software Engineer',
      'Hardware-in-the-loop architect',
      'Imperial College London MSc-bound',
    ];
    if (prefersReduced) {
      twEl.textContent = phrases[0];
    } else {
      let i = 0, j = 0, deleting = false;
      function step() {
        const current = phrases[i];
        if (!deleting) {
          j++;
          twEl.textContent = current.slice(0, j);
          if (j === current.length) {
            deleting = true;
            return setTimeout(step, 1800);
          }
        } else {
          j--;
          twEl.textContent = current.slice(0, j);
          if (j === 0) {
            deleting = false;
            i = (i + 1) % phrases.length;
            return setTimeout(step, 250);
          }
        }
        setTimeout(step, deleting ? 30 : 55);
      }
      step();
    }
  }

  // ===========================================================
  // Contact terminal typewriter
  // ===========================================================
  const termBody = document.getElementById('terminal-body');
  if (termBody) {
    const lines = [
      { type: 'prompt', text: '$ whoami' },
      { type: 'out',    text: 'William Hatcher — Oakville, ON, Canada' },
      { type: 'prompt', text: '$ contact --email' },
      { type: 'out',    html: '<a href="mailto:williamchalmershatcher@gmail.com">williamchalmershatcher@gmail.com</a>' },
      { type: 'prompt', text: '$ contact --linkedin' },
      { type: 'out',    html: '<a href="https://www.linkedin.com/in/will-hatcher-07b234229/" target="_blank" rel="noopener">linkedin.com/in/will-hatcher-07b234229</a>' },
    ];

    function renderInstant() {
      termBody.innerHTML = '';
      lines.forEach(line => {
        const div = document.createElement('div');
        div.className = line.type === 'prompt' ? 'terminal__line' : 'terminal__out';
        if (line.html) div.innerHTML = line.html;
        else div.textContent = line.text;
        termBody.appendChild(div);
      });
    }

    if (prefersReduced) {
      renderInstant();
    } else {
      const terminal = document.getElementById('terminal');
      let started = false;
      const startObs = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && !started) {
            started = true;
            startObs.disconnect();
            typeLines();
          }
        });
      }, { threshold: 0.4 });
      if (terminal) startObs.observe(terminal); else typeLines();

      function typeLines() {
        termBody.innerHTML = '';
        let idx = 0;
        function nextLine() {
          if (idx >= lines.length) return;
          const line = lines[idx];
          const div = document.createElement('div');
          div.className = line.type === 'prompt' ? 'terminal__line' : 'terminal__out';
          termBody.appendChild(div);
          if (line.html) {
            // type the visible text but commit as HTML at the end
            const tmp = document.createElement('div');
            tmp.innerHTML = line.html;
            const visible = tmp.textContent;
            let k = 0;
            function tick() {
              k++;
              div.textContent = visible.slice(0, k);
              if (k < visible.length) setTimeout(tick, 22);
              else {
                div.innerHTML = line.html;
                idx++;
                setTimeout(nextLine, 280);
              }
            }
            tick();
          } else {
            let k = 0;
            const text = line.text;
            function tick() {
              k++;
              div.textContent = text.slice(0, k);
              if (k < text.length) setTimeout(tick, 28);
              else {
                idx++;
                setTimeout(nextLine, 220);
              }
            }
            tick();
          }
        }
        nextLine();
      }
    }
  }

  // ===========================================================
  // tsParticles hero background
  // ===========================================================
  function initParticles() {
    if (typeof tsParticles === 'undefined') return;
    const isNarrow = window.matchMedia('(max-width: 899px)').matches;
    tsParticles.load({
      id: 'particles',
      options: {
        fpsLimit: isNarrow ? 30 : 60,
        background: { color: { value: 'transparent' } },
        particles: {
          number: {
            value: isNarrow ? 20 : 80,
            density: { enable: true, area: 900 },
          },
          color: { value: '#22D3EE' },
          opacity: {
            value: 0.55,
            animation: isNarrow
              ? { enable: false }
              : { enable: true, speed: 0.4, minimumValue: 0.2, sync: false },
          },
          size: { value: { min: 1, max: 2.4 } },
          links: {
            enable: true,
            distance: isNarrow ? 110 : 150,
            color: '#22D3EE',
            opacity: 0.28,
            width: 1,
          },
          move: {
            enable: !prefersReduced,
            speed: isNarrow ? 0.35 : 0.6,
            direction: 'none',
            random: true,
            straight: false,
            outModes: { default: 'out' },
          },
        },
        interactivity: {
          events: {
            // Touch-grab on mobile causes per-finger-move recompute of every link.
            onHover: { enable: !prefersReduced && !isNarrow, mode: 'grab' },
            resize: true,
          },
          modes: {
            grab: { distance: 180, links: { opacity: 0.7 } },
          },
        },
        detectRetina: true,
        pauseOnBlur: true,
        pauseOnOutsideViewport: true,
      },
    });
  }

  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    setTimeout(initParticles, 0);
  } else {
    document.addEventListener('DOMContentLoaded', initParticles);
  }
})();
