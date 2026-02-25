/* ============================================
   LUOVA KAMPAAMO — main.js
   ============================================ */

'use strict';

/* ---------- UTILITY ---------- */
const qs  = (sel, ctx = document) => ctx.querySelector(sel);
const qsa = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

/* ============================================
   1. NAVIGATION
   ============================================ */
(function initNav() {
  const header      = qs('.site-header');
  const hamburger   = qs('.nav__hamburger');
  const menu        = qs('#nav-menu');
  const navLinks    = qsa('.nav__link');
  const navCta      = qs('.btn--nav');

  if (!header || !hamburger || !menu) return;

  /* --- Scrolled state --- */
  const onScroll = () => {
    header.classList.toggle('scrolled', window.scrollY > 40);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* --- Hamburger toggle --- */
  const openMenu = () => {
    menu.classList.add('is-open');
    hamburger.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
    hamburger.setAttribute('aria-label', 'Sulje valikko');
  };

  const closeMenu = () => {
    menu.classList.remove('is-open');
    hamburger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
    hamburger.setAttribute('aria-label', 'Avaa valikko');
  };

  hamburger.addEventListener('click', () => {
    const isOpen = hamburger.getAttribute('aria-expanded') === 'true';
    isOpen ? closeMenu() : openMenu();
  });

  /* Close on nav link / CTA click */
  const closeOnClick = () => closeMenu();
  navLinks.forEach(link => link.addEventListener('click', closeOnClick));
  if (navCta) navCta.addEventListener('click', closeOnClick);

  /* Close on Escape */
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && menu.classList.contains('is-open')) {
      closeMenu();
      hamburger.focus();
    }
  });

  /* Close on outside click */
  document.addEventListener('click', e => {
    if (
      menu.classList.contains('is-open') &&
      !menu.contains(e.target) &&
      !hamburger.contains(e.target)
    ) {
      closeMenu();
    }
  });

  /* --- Active link highlight on scroll --- */
  const sections = qsa('main section[id]');

  const observerOptions = {
    root: null,
    rootMargin: '-30% 0px -60% 0px',
    threshold: 0,
  };

  const sectionObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const id = entry.target.getAttribute('id');
      navLinks.forEach(link => {
        const href = link.getAttribute('href');
        link.classList.toggle('nav__link--active', href === `#${id}`);
      });
    });
  }, observerOptions);

  sections.forEach(sec => sectionObserver.observe(sec));
})();

/* ============================================
   2. SCROLL REVEAL
   ============================================ */
(function initScrollReveal() {
  /* Add reveal class to target elements */
  const targets = [
    '.service-card',
    '.pricing-col',
    '.meista__text-col',
    '.meista__img-col',
    '.tuotteet__text-col',
    '.tuotteet__img-col',
    '.trust-item',
    '.contact-item',
    '.yhteystiedot__form-wrap',
    '.studio-img-wrap',
    '.cta-band__text',
  ];

  targets.forEach(sel => {
    qsa(sel).forEach((el, i) => {
      el.classList.add('reveal');
      /* Stagger siblings */
      const delay = Math.min(i * 0.1, 0.4);
      el.style.transitionDelay = `${delay}s`;
    });
  });

  /* Respect reduced motion */
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) {
    qsa('.reveal').forEach(el => el.classList.add('visible'));
    return;
  }

  const revealObserver = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -60px 0px' }
  );

  qsa('.reveal').forEach(el => revealObserver.observe(el));
})();

/* ============================================
   3. CONTACT FORM
   ============================================ */
(function initContactForm() {
  const form        = qs('#contact-form');
  const feedback    = qs('#form-feedback');
  const submitBtn   = qs('#submit-btn');

  if (!form || !feedback || !submitBtn) return;

  const btnText    = qs('.btn-text',    submitBtn);
  const btnLoading = qs('.btn-loading', submitBtn);

  /* --- Inline validation helpers --- */
  const showFieldError = (input, msg) => {
    input.setAttribute('aria-invalid', 'true');
    let errEl = qs(`#err-${input.id}`);
    if (!errEl) {
      errEl = document.createElement('span');
      errEl.id = `err-${input.id}`;
      errEl.className = 'field-error';
      errEl.setAttribute('role', 'alert');
      errEl.style.cssText =
        'display:block;font-size:0.78rem;color:#991b1b;margin-top:0.25rem;';
      input.parentNode.appendChild(errEl);
    }
    errEl.textContent = msg;
    input.style.borderColor = '#f87171';
  };

  const clearFieldError = input => {
    input.removeAttribute('aria-invalid');
    const errEl = qs(`#err-${input.id}`);
    if (errEl) errEl.textContent = '';
    input.style.borderColor = '';
  };

  const validateField = input => {
    const val = input.value.trim();

    if (input.required && !val) {
      showFieldError(input, 'Tämä kenttä on pakollinen.');
      return false;
    }

    if (input.type === 'email' && val) {
      const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRe.test(val)) {
        showFieldError(input, 'Tarkista sähköpostiosoite.');
        return false;
      }
    }

    clearFieldError(input);
    return true;
  };

  /* Live validation on blur */
  qsa('.form-input', form).forEach(input => {
    input.addEventListener('blur', () => validateField(input));
    input.addEventListener('input', () => {
      if (input.getAttribute('aria-invalid') === 'true') {
        validateField(input);
      }
    });
  });

  /* --- Show feedback message --- */
  const showFeedback = (type, msg) => {
    feedback.className = `form-feedback ${type}`;
    feedback.textContent = msg;
    feedback.style.display = 'block';
    feedback.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  };

  const hideFeedback = () => {
    feedback.className = 'form-feedback';
    feedback.style.display = 'none';
    feedback.textContent = '';
  };

  /* --- Submit --- */
  form.addEventListener('submit', async e => {
    e.preventDefault();
    hideFeedback();

    /* Validate all required fields */
    const requiredInputs = qsa('.form-input[required]', form);
    const valid = requiredInputs.map(validateField).every(Boolean);

    if (!valid) {
      showFeedback('error', 'Tarkista punaisella merkityt kentät ja yritä uudelleen.');
      const firstInvalid = qs('[aria-invalid="true"]', form);
      if (firstInvalid) firstInvalid.focus();
      return;
    }

    /* Loading state */
    submitBtn.disabled = true;
    if (btnText)    btnText.style.display    = 'none';
    if (btnLoading) btnLoading.style.display = 'inline';

    try {
      const data = new FormData(form);
      const res  = await fetch(form.action, {
        method:  'POST',
        body:    data,
        headers: { Accept: 'application/json' },
      });

      if (res.ok) {
        showFeedback(
          'success',
          'Viesti lähetetty! Palaamme sinulle mahdollisimman pian.'
        );
        form.reset();
        qsa('.form-input', form).forEach(input => {
          clearFieldError(input);
          input.style.borderColor = '';
        });
      } else {
        const body = await res.json().catch(() => ({}));
        const msg  = body?.errors?.map(err => err.message).join(', ') ||
                     'Viestin lähetys epäonnistui. Yritä uudelleen tai soita meille.';
        showFeedback('error', msg);
      }
    } catch {
      showFeedback(
        'error',
        'Verkkovirhe — tarkista yhteytesi ja yritä uudelleen, tai soita numeroon 040 0450902.'
      );
    } finally {
      submitBtn.disabled = false;
      if (btnText)    btnText.style.display    = 'inline';
      if (btnLoading) btnLoading.style.display = 'none';
    }
  });
})();

/* ============================================
   4. FOOTER YEAR
   ============================================ */
(function initYear() {
  const el = qs('#year');
  if (el) el.textContent = new Date().getFullYear();
})();

/* ============================================
   5. SMOOTH ANCHOR SCROLL (fallback)
   ============================================ */
(function initSmoothScroll() {
  /* Native scroll-behavior handles most cases.
     This fallback ensures offset for fixed header. */
  const HEADER_HEIGHT = 80;

  document.addEventListener('click', e => {
    const anchor = e.target.closest('a[href^="#"]');
    if (!anchor) return;

    const targetId = anchor.getAttribute('href').slice(1);
    if (!targetId) return;

    const target = document.getElementById(targetId);
    if (!target) return;

    e.preventDefault();

    const top =
      target.getBoundingClientRect().top +
      window.scrollY -
      HEADER_HEIGHT;

    window.scrollTo({ top, behavior: 'smooth' });
  });
})();

/* ============================================
   6. IMAGE LAZY LOAD — native + observer fallback
   ============================================ */
(function initLazyImages() {
  /* Modern browsers handle loading="lazy" natively.
     This observer provides a fallback and adds a
     fade-in effect once images are loaded. */
  const images = qsa('img[loading="lazy"]');

  const onLoad = img => {
    img.style.opacity = '0';
    img.style.transition = 'opacity 0.5s ease';
    img.addEventListener('load', () => {
      img.style.opacity = '1';
    }, { once: true });

    /* If already cached / loaded */
    if (img.complete && img.naturalWidth > 0) {
      img.style.opacity = '1';
    }
  };

  if ('IntersectionObserver' in window) {
    const imgObserver = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          const img = entry.target;
          onLoad(img);
          obs.unobserve(img);
        });
      },
      { rootMargin: '200px 0px' }
    );

    images.forEach(img => imgObserver.observe(img));
  } else {
    images.forEach(onLoad);
  }
})();

/* ============================================
   7. PRICING ROW — subtle hover highlight
   ============================================ */
(function initPricingInteraction() {
  qsa('.pricing-row').forEach(row => {
    row.addEventListener('mouseenter', () => {
      row.style.paddingLeft  = '0.75rem';
      row.style.paddingRight = '0.75rem';
    });
    row.addEventListener('mouseleave', () => {
      row.style.paddingLeft  = '0.25rem';
      row.style.paddingRight = '0.25rem';
    });
  });
})();

/* ============================================
   8. SERVICE CARD — tilt micro-interaction
   ============================================ */
(function initCardTilt() {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) return;

  /* Only on non-touch devices */
  if (window.matchMedia('(hover: none)').matches) return;

  qsa('.service-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect   = card.getBoundingClientRect();
      const cx     = rect.left + rect.width  / 2;
      const cy     = rect.top  + rect.height / 2;
      const dx     = (e.clientX - cx) / (rect.width  / 2);
      const dy     = (e.clientY - cy) / (rect.height / 2);
      const rotX   = -(dy * 3).toFixed(2);
      const rotY   =  (dx * 3).toFixed(2);

      card.style.transform =
        `translateY(-6px) rotateX(${rotX}deg) rotateY(${rotY}deg)`;
      card.style.transition = 'transform 0.1s ease';
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform  = '';
      card.style.transition = 'transform 0.4s cubic-bezier(0.4,0,0.2,1), box-shadow 0.3s ease, border-color 0.3s ease';
    });
  });
})();

/* ============================================
   9. CTA BAND — pulse attention animation
   ============================================ */
(function initCtaBandPulse() {
  const cta = qs('.cta-band .btn--champagne');
  if (!cta) return;

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) return;

  /* Pulse once when scrolled into view */
  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;

      cta.animate(
        [
          { transform: 'scale(1)',    boxShadow: '0 8px 32px rgba(184,145,42,0.18)' },
          { transform: 'scale(1.04)', boxShadow: '0 12px 40px rgba(184,145,42,0.35)' },
          { transform: 'scale(1)',    boxShadow: '0 8px 32px rgba(184,145,42,0.18)' },
        ],
        { duration: 700, easing: 'ease-in-out', delay: 400 }
      );

      obs.unobserve(entry.target);
    });
  }, { threshold: 0.8 });

  obs.observe(cta);
})();