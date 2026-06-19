/*
  Prathmesh Ghangare Portfolio — vanilla JS
  - Typing effect
  - IntersectionObserver animations
  - Count-up stats
  - Skills progress fill
  - Sticky navbar + active link highlighting
  - Mobile hamburger panel toggle
  - Smooth scrolling for internal anchors
  - Contact form validation + toast
  - Back-to-top visibility
  - Footer year
*/

(function () {
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  // ---------------------------
  // Footer year
  // ---------------------------
  const yearEl = $('#year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  // ---------------------------
  // Mobile menu toggle
  // ---------------------------
  const hamburger = $('#hamburger');
  const mobilePanel = $('#mobilePanel');

  function setMenu(open) {
    if (!hamburger || !mobilePanel) return;
    hamburger.setAttribute('aria-expanded', String(open));
    if (open) {
      mobilePanel.classList.add('open');
    } else {
      mobilePanel.classList.remove('open');
    }
  }

  if (hamburger && mobilePanel) {
    hamburger.addEventListener('click', () => {
      const isOpen = hamburger.getAttribute('aria-expanded') === 'true';
      setMenu(!isOpen);
    });

    // Close on outside click (panel background)
    mobilePanel.addEventListener('click', (e) => {
      if (e.target === mobilePanel) setMenu(false);
    });

    // Close on link click
    $$('.mobile-link', mobilePanel).forEach((a) => {
      a.addEventListener('click', () => setMenu(false));
    });
  }

  // ---------------------------
  // Smooth scrolling (intercept internal links)
  // ---------------------------
  document.addEventListener('click', (e) => {
    const link = e.target && e.target.closest ? e.target.closest('a[href^="#"]') : null;
    if (!link) return;

    const href = link.getAttribute('href');
    if (!href || href === '#') return;

    const id = href.slice(1);
    const target = document.getElementById(id);
    if (!target) return;

    e.preventDefault();
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  // ---------------------------
  // Sticky navbar scrolled + active link
  // ---------------------------
  const navbar = $('#navbar');
  const navLinks = $$('.nav-link');

  const sections = navLinks
    .map((a) => document.getElementById(a.dataset.section))
    .filter(Boolean);

  function setActiveSectionById(id) {
    navLinks.forEach((a) => {
      const sec = a.dataset.section;
      a.classList.toggle('active', sec === id);
    });
  }

  function onScroll() {
    if (navbar) {
      const scrolled = window.scrollY > 10;
      navbar.classList.toggle('nav-scrolled', scrolled);
    }

    // Active section: pick the last section whose top is above a threshold
    const threshold = 120;
    let current = null;
    for (const s of sections) {
      const r = s.getBoundingClientRect();
      if (r.top - threshold <= 0) current = s;
    }
    if (current) setActiveSectionById(current.id);
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // ---------------------------
  // IntersectionObserver animations
  // ---------------------------
  const animEls = $$('[data-animate]');
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          observer.unobserve(entry.target);
        }
      }
    },
    { threshold: 0.18 }
  );

  animEls.forEach((el) => observer.observe(el));

  // ---------------------------
  // Typing effect
  // ---------------------------
  const typingEl = $('.hero .typing');
  const typingRoles = ['Data Analyst', 'Machine Learning Enthusiast', 'Big Data Engineer', 'Python Developer', 'AI Enthusiast'];

  if (typingEl) {
    let roleIndex = 0;
    let charIndex = 0;
    let deleting = false;

    const baseTypeSpeed = 70;
    const baseDeleteSpeed = 35;
    const pauseAfterTyped = 900;

    function tick() {
      const role = typingRoles[roleIndex % typingRoles.length];

      if (!deleting) {
        charIndex++;
        typingEl.textContent = role.slice(0, charIndex);
        if (charIndex >= role.length) {
          deleting = true;
          setTimeout(tick, pauseAfterTyped);
          return;
        }
        setTimeout(tick, baseTypeSpeed);
      } else {
        charIndex--;
        typingEl.textContent = role.slice(0, Math.max(0, charIndex));
        if (charIndex <= 0) {
          deleting = false;
          roleIndex++;
        }
        setTimeout(tick, baseDeleteSpeed);
      }
    }

    typingEl.textContent = '';
    setTimeout(tick, 450);
  }

  // ---------------------------
  // Count-up stats
  // ---------------------------
  const countEls = $$('[data-count]');

  function animateCount(el, target, duration = 1100) {
    const start = performance.now();

    function frame(now) {
      const t = Math.min(1, (now - start) / duration);
      // easeOutCubic
      const eased = 1 - Math.pow(1 - t, 3);
      const current = Math.round(target * eased);
      el.textContent = String(current);
      if (t < 1) requestAnimationFrame(frame);
    }

    requestAnimationFrame(frame);
  }

  const countObserver = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const el = entry.target;
        const raw = el.getAttribute('data-count') || '0';
        const target = parseInt(raw.replace(/[^0-9]/g, ''), 10) || 0;
        animateCount(el, target);
        countObserver.unobserve(el);
      }
    },
    { threshold: 0.35 }
  );

  countEls.forEach((el) => countObserver.observe(el));

  // ---------------------------
  // Skill progress fill
  // ---------------------------
  const skillBars = $$('[data-pct]');
  function fillBar(el, pct) {
    el.style.width = pct + '%';
  }

  const skillObserver = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const bar = entry.target;
        const pct = parseInt(bar.getAttribute('data-pct') || '0', 10);
        fillBar(bar, pct);
        skillObserver.unobserve(bar);
      }
    },
    { threshold: 0.25 }
  );

  // Ensure bars start at 0 before view
  skillBars.forEach((bar) => {
    bar.style.width = '0%';
    skillObserver.observe(bar);
  });

  // ---------------------------
  // Contact form validation + toast simulation
  // ---------------------------
  const form = $('#contactForm');
  const toast = $('#formToast');

  function showToast() {
    if (!toast) return;
    toast.hidden = false;
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(8px)';
    toast.style.transition = 'opacity .25s ease, transform .25s ease';
    requestAnimationFrame(() => {
      toast.style.opacity = '1';
      toast.style.transform = 'translateY(0)';
    });

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(8px)';
      setTimeout(() => {
        if (toast) toast.hidden = true;
      }, 260);
    }, 3600);
  }

  function setFieldError(id, msg) {
    const err = $(`[data-error-for="${id}"]`);
    const input = document.getElementById(id);
    if (input && msg) input.style.borderColor = 'rgba(239,68,68,.55)';
    if (input && !msg) input.style.borderColor = '';
    if (err) err.textContent = msg || '';
  }

  if (form) {
    const nameInput = $('#name');
    const emailInput = $('#email');
    const messageInput = $('#message');

    // Clear toast on typing
    [nameInput, emailInput, messageInput].forEach((el) => {
      if (!el) return;
      el.addEventListener('input', () => {
        if (toast) toast.hidden = true;
      });
    });

    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const name = nameInput ? nameInput.value.trim() : '';
      const email = emailInput ? emailInput.value.trim() : '';
      const message = messageInput ? messageInput.value.trim() : '';

      let ok = true;

      if (!name || name.length < 2) {
        ok = false;
        setFieldError('name', 'Please enter your name (min 2 characters).');
      } else {
        setFieldError('name', '');
      }

      const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      if (!emailOk) {
        ok = false;
        setFieldError('email', 'Please enter a valid email address.');
      } else {
        setFieldError('email', '');
      }

      if (!message || message.length < 10) {
        ok = false;
        setFieldError('message', 'Message should be at least 10 characters.');
      } else {
        setFieldError('message', '');
      }

      if (!ok) return;

      // Simulated success
      showToast();
      form.reset();
    });
  }

  // ---------------------------
  // Back to top
  // ---------------------------
  const toTop = $('#toTop');

  function updateToTop() {
    if (!toTop) return;
    const show = window.scrollY > 600;
    toTop.classList.toggle('show', show);
  }

  window.addEventListener('scroll', updateToTop, { passive: true });
  updateToTop();

  if (toTop) {
    toTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
})();

