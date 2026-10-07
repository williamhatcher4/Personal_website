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
      { type: 'out',    text: 'William Hatcher — London, UK' },
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
    // Skip the canvas entirely on mobile — biggest remaining frame cost.
    if (isNarrow) return;
    tsParticles.load({
      id: 'particles',
      options: {
        fpsLimit: 60,
        background: { color: { value: 'transparent' } },
        particles: {
          number: { value: 80, density: { enable: true, area: 900 } },
          color: { value: '#22D3EE' },
          opacity: {
            value: 0.55,
            animation: { enable: true, speed: 0.4, minimumValue: 0.2, sync: false },
          },
          size: { value: { min: 1, max: 2.4 } },
          links: { enable: true, distance: 150, color: '#22D3EE', opacity: 0.28, width: 1 },
          move: {
            enable: !prefersReduced,
            speed: 0.6,
            direction: 'none',
            random: true,
            straight: false,
            outModes: { default: 'out' },
          },
        },
        interactivity: {
          events: {
            onHover: { enable: !prefersReduced, mode: 'grab' },
            resize: true,
          },
          modes: { grab: { distance: 180, links: { opacity: 0.7 } } },
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

  // ===========================================================
  // Copy-email button — writes the address to clipboard and shows
  // brief inline feedback on the button itself (no toast).
  // ===========================================================
  const copyBtn = document.getElementById('copy-email');
  if (copyBtn) {
    const labelEl = copyBtn.querySelector('.copy-email__label');
    const originalLabel = labelEl ? labelEl.textContent : 'copy email';

    async function writeToClipboard(text) {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        return;
      }
      // Fallback for non-secure contexts / older browsers
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.position = 'absolute';
      ta.style.left = '-9999px';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }

    copyBtn.addEventListener('click', async () => {
      const email = copyBtn.dataset.email;
      if (!email) return;
      try {
        await writeToClipboard(email);
        copyBtn.classList.add('is-copied');
        if (labelEl) labelEl.textContent = 'copied!';
        setTimeout(() => {
          copyBtn.classList.remove('is-copied');
          if (labelEl) labelEl.textContent = originalLabel;
        }, 2000);
      } catch (err) {
        if (labelEl) labelEl.textContent = 'copy failed';
        setTimeout(() => { if (labelEl) labelEl.textContent = originalLabel; }, 2000);
      }
    });
  }

  // ===========================================================
  // Contact form - submits to Formspree with inline feedback.
  // ===========================================================
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    const statusEl = document.getElementById('contact-form-status');
    const submitBtn = contactForm.querySelector('button[type="submit"]');
    const defaultSubmitHtml = submitBtn ? submitBtn.innerHTML : '';

    function setFormStatus(message, state) {
      if (!statusEl) return;
      statusEl.textContent = message;
      if (state) statusEl.dataset.state = state;
      else delete statusEl.dataset.state;
    }

    contactForm.addEventListener('submit', async (event) => {
      if (!window.fetch || !window.FormData) return;
      event.preventDefault();

      setFormStatus('Sending...', 'pending');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin" aria-hidden="true"></i> sending';
      }

      try {
        const response = await fetch(contactForm.action, {
          method: 'POST',
          body: new FormData(contactForm),
          headers: { Accept: 'application/json' },
        });

        if (!response.ok) {
          let message = 'Message failed to send. Please try email instead.';
          try {
            const data = await response.json();
            if (Array.isArray(data.errors) && data.errors.length) {
              message = data.errors.map(error => error.message).join(' ');
            }
          } catch (jsonErr) {
            // Keep the generic message when Formspree returns non-JSON.
          }
          throw new Error(message);
        }

        contactForm.reset();
        setFormStatus('Message sent. Thanks for reaching out.', 'success');
      } catch (err) {
        setFormStatus(err.message || 'Message failed to send. Please try email instead.', 'error');
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = defaultSubmitHtml;
        }
      }
    });
  }
})();
