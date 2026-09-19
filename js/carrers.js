/* ==========================================================================
   PENTAGAN ENGINEERS & CONSTRUCTIONS — site scripts
   Hooks used here match the HTML / css/style.css:
     #navToggle, #siteNav, .has-dropdown, .stat__num[data-count],
     .faq-item / .faq-item__q, #backToTop, #year, .reveal
   Save as: js/script.js
   ========================================================================== */
(function () {
  'use strict';

  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------------------------------------------------------
     1. Mobile navigation (hamburger)
     The CSS swaps to the off-canvas nav at max-width:1300px, so the
     same breakpoint is used here to decide when nav clicks should
     close the panel.
  ---------------------------------------------------------------- */
  var navToggle = document.getElementById('navToggle');
  var siteNav = document.getElementById('siteNav');
  var mobileQuery = window.matchMedia('(max-width:1300px)');

  function closeNav() {
    if (!siteNav || !navToggle) return;
    siteNav.classList.remove('is-open');
    navToggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  function openNav() {
    if (!siteNav || !navToggle) return;
    siteNav.classList.add('is-open');
    navToggle.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }

  if (navToggle && siteNav) {
    navToggle.addEventListener('click', function () {
      if (siteNav.classList.contains('is-open')) {
        closeNav();
      } else {
        openNav();
      }
    });

    // Close when a real link is tapped inside the panel.
    siteNav.addEventListener('click', function (e) {
      var link = e.target.closest('a');
      if (!link) return;
      if (link.getAttribute('href') === '#') return; // dropdown parent, handled below
      if (mobileQuery.matches) closeNav();
    });

    // Close when tapping outside the open panel.
    document.addEventListener('click', function (e) {
      if (!siteNav.classList.contains('is-open')) return;
      if (siteNav.contains(e.target) || navToggle.contains(e.target)) return;
      closeNav();
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeNav();
    });

    // Reset state if the viewport grows back to the inline nav.
    var onBreakpointChange = function (e) {
      if (!e.matches) closeNav();
    };
    if (mobileQuery.addEventListener) {
      mobileQuery.addEventListener('change', onBreakpointChange);
    } else if (mobileQuery.addListener) {
      mobileQuery.addListener(onBreakpointChange);
    }
  }

  /* ---------------------------------------------------------------
     2. "Projects" dropdown
     Desktop: hover/focus is handled purely in CSS.
     Mobile: the parent link toggles .is-open instead of navigating.
  ---------------------------------------------------------------- */
  Array.prototype.forEach.call(document.querySelectorAll('.has-dropdown'), function (item) {
    var trigger = item.querySelector(':scope > a');
    if (!trigger) return;

    trigger.addEventListener('click', function (e) {
      if (!mobileQuery.matches) return;
      e.preventDefault();
      var isOpen = item.classList.toggle('is-open');
      trigger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });

    // Keep aria-expanded honest on desktop hover/focus.
    item.addEventListener('mouseenter', function () {
      if (!mobileQuery.matches) trigger.setAttribute('aria-expanded', 'true');
    });
    item.addEventListener('mouseleave', function () {
      if (!mobileQuery.matches) trigger.setAttribute('aria-expanded', 'false');
    });
    item.addEventListener('focusin', function () {
      if (!mobileQuery.matches) trigger.setAttribute('aria-expanded', 'true');
    });
    item.addEventListener('focusout', function (e) {
      if (!mobileQuery.matches && !item.contains(e.relatedTarget)) {
        trigger.setAttribute('aria-expanded', 'false');
      }
    });
  });

  /* ---------------------------------------------------------------
     3. Stat counters — count up once, when the strip scrolls in
  ---------------------------------------------------------------- */
  var counters = document.querySelectorAll('.stat__num[data-count]');

  function runCounter(el) {
    var target = parseInt(el.getAttribute('data-count'), 10) || 0;
    if (prefersReducedMotion) {
      el.textContent = target;
      return;
    }
    var duration = 1400;
    var start = null;

    function step(now) {
      if (start === null) start = now;
      var progress = Math.min((now - start) / duration, 1);
      // ease-out so the number settles rather than stopping dead
      var eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(target * eased);
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  if (counters.length) {
    if ('IntersectionObserver' in window) {
      var counterObserver = new IntersectionObserver(function (entries, obs) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          runCounter(entry.target);
          obs.unobserve(entry.target);
        });
      }, { threshold: 0.4 });

      Array.prototype.forEach.call(counters, function (el) {
        counterObserver.observe(el);
      });
    } else {
      Array.prototype.forEach.call(counters, runCounter);
    }
  }

  /* ---------------------------------------------------------------
     4. FAQ accordion
     One panel open at a time. max-height is set inline so long
     answers are never clipped by the 400px CSS ceiling.
  ---------------------------------------------------------------- */
  var faqItems = document.querySelectorAll('.faq-item');

  function closeFaq(item) {
    var btn = item.querySelector('.faq-item__q');
    var panel = item.querySelector('.faq-item__a');
    item.classList.remove('is-open');
    if (btn) btn.setAttribute('aria-expanded', 'false');
    if (panel) panel.style.maxHeight = null;
  }

  Array.prototype.forEach.call(faqItems, function (item) {
    var btn = item.querySelector('.faq-item__q');
    var panel = item.querySelector('.faq-item__a');
    if (!btn || !panel) return;

    btn.addEventListener('click', function () {
      var isOpen = item.classList.contains('is-open');

      Array.prototype.forEach.call(faqItems, closeFaq);

      if (!isOpen) {
        item.classList.add('is-open');
        btn.setAttribute('aria-expanded', 'true');
        panel.style.maxHeight = panel.scrollHeight + 'px';
      }
    });
  });

  // Keep an open answer correctly sized after a resize reflow.
  window.addEventListener('resize', function () {
    Array.prototype.forEach.call(document.querySelectorAll('.faq-item.is-open .faq-item__a'), function (panel) {
      panel.style.maxHeight = panel.scrollHeight + 'px';
    });
  });

  /* ---------------------------------------------------------------
     5. Back to top
  ---------------------------------------------------------------- */
  var backToTop = document.getElementById('backToTop');

  if (backToTop) {
    var toggleBackToTop = function () {
      backToTop.classList.toggle('is-visible', window.scrollY > 600);
    };
    toggleBackToTop();
    window.addEventListener('scroll', toggleBackToTop, { passive: true });

    backToTop.addEventListener('click', function () {
      window.scrollTo({
        top: 0,
        behavior: prefersReducedMotion ? 'auto' : 'smooth'
      });
    });
  }

  /* ---------------------------------------------------------------
     6. Reveal on scroll
     The .reveal class is applied here rather than in the markup, so
     nothing is hidden if JavaScript fails to load.
  ---------------------------------------------------------------- */
  var revealTargets = document.querySelectorAll(
    '.about-snap__media, .about-snap__text, .packages__media, .packages__content,' +
    '.service-card, .why__item, .testimonial-card, .project-card, .faq__layout > *,' +
    '.find-us__grid > *, .cta-banner__inner > *'
  );

  if (revealTargets.length && 'IntersectionObserver' in window && !prefersReducedMotion) {
    var revealObserver = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        obs.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    Array.prototype.forEach.call(revealTargets, function (el, i) {
      el.classList.add('reveal');
      el.style.transitionDelay = (Math.min(i % 4, 3) * 70) + 'ms';
      revealObserver.observe(el);
    });
  }

  /* ---------------------------------------------------------------
     7. Pause the client logo marquee on hover / when off-screen
  ---------------------------------------------------------------- */
  var track = document.querySelector('.clients__track');

  if (track) {
    track.addEventListener('mouseenter', function () {
      track.style.animationPlayState = 'paused';
    });
    track.addEventListener('mouseleave', function () {
      track.style.animationPlayState = 'running';
    });

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          track.style.animationPlayState = entry.isIntersecting ? 'running' : 'paused';
        });
      }, { threshold: 0 }).observe(track);
    }
  }

  /* ---------------------------------------------------------------
     8. Smooth scroll for in-page anchors, offset for the sticky header
  ---------------------------------------------------------------- */
  var header = document.getElementById('siteHeader');

  document.addEventListener('click', function (e) {
    var link = e.target.closest('a[href^="#"]');
    if (!link) return;

    var id = link.getAttribute('href');
    if (!id || id === '#') return;

    var target = document.querySelector(id);
    if (!target) return;

    e.preventDefault();
    var offset = header ? header.offsetHeight + 12 : 0;
    var top = target.getBoundingClientRect().top + window.scrollY - offset;

    window.scrollTo({ top: top, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
    if (mobileQuery.matches) closeNav();
  });

  /* ---------------------------------------------------------------
     9. Footer year
  ---------------------------------------------------------------- */
  var year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();

  /* ---------------------------------------------------------------
     10. Mark the current page in the nav
     Works on every page, so the hard-coded is-active on index.html
     is no longer needed when you copy this header elsewhere.
  ---------------------------------------------------------------- */
  var here = window.location.pathname.split('/').pop() || 'index.html';

  Array.prototype.forEach.call(document.querySelectorAll('.nav a'), function (link) {
    var href = (link.getAttribute('href') || '').split('/').pop();
    if (href && href === here) {
      link.classList.add('is-active');
      var parent = link.closest('.has-dropdown');
      if (parent) {
        var parentLink = parent.querySelector(':scope > a');
        if (parentLink) parentLink.classList.add('is-active');
      }
    } else {
      link.classList.remove('is-active');
    }
  });
})();

/* ==========================================================================
   ADD-ON: quick cost estimate + enquiry modal
   Edit the CONFIG block below with your real number and email.
   ========================================================================== */
(function () {
  'use strict';

  var CONFIG = {
    whatsapp: '918754797065',            // country code + number, digits only
    email: 'pentaganenc@gmail.com',
    autoOpenAfterSeconds: 30,            // set to 0 to disable the timed popup
    autoOpenOnExitIntent: true           // desktop only
  };

  /* ---------------------------------------------------------------
     1. Quick cost estimate strip
  ---------------------------------------------------------------- */
  var areaInput = document.getElementById('estArea');
  var tierWrap = document.getElementById('estTiers');
  var estOutput = document.getElementById('estOutput');
  var estRate = document.getElementById('estRate');

  function formatRupees(value) {
    // Indian digit grouping: 37,00,000
    return '₹' + Math.round(value).toLocaleString('en-IN');
  }

  function currentRate() {
    var active = tierWrap ? tierWrap.querySelector('.estimate__tier.is-selected') : null;
    return active ? parseInt(active.getAttribute('data-rate'), 10) : 0;
  }

  function updateEstimate() {
    if (!areaInput || !estOutput) return;
    var area = parseFloat(areaInput.value) || 0;
    var rate = currentRate();
    estOutput.textContent = formatRupees(area * rate);
    if (estRate) estRate.textContent = 'at ₹' + rate.toLocaleString('en-IN') + ' per sqft';
  }

  if (areaInput && tierWrap) {
    areaInput.addEventListener('input', updateEstimate);

    tierWrap.addEventListener('click', function (e) {
      var tier = e.target.closest('.estimate__tier');
      if (!tier) return;
      Array.prototype.forEach.call(tierWrap.querySelectorAll('.estimate__tier'), function (t) {
        t.classList.remove('is-selected');
      });
      tier.classList.add('is-selected');
      updateEstimate();
    });

    updateEstimate();
  }

  /* ---------------------------------------------------------------
     2. Enquiry modal
     Opens from anything carrying data-enquiry, from a timer, and
     from exit intent. Timer and exit intent fire once per session,
     and never on pages whose <body> has data-no-autopopup.
  ---------------------------------------------------------------- */
  var modal = document.getElementById('enquiryModal');
  if (!modal) return;

  var form = document.getElementById('enquiryForm');
  var success = document.getElementById('enquirySuccess');
  var sourceField = document.getElementById('enqSource');
  var lastFocused = null;
  var autoShown = false;

  function openModal(source) {
    lastFocused = document.activeElement;
    if (sourceField && source) sourceField.value = source;
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');

    var first = modal.querySelector('input:not([type="hidden"]):not(.field__honeypot)');
    if (first) setTimeout(function () { first.focus(); }, 80);
  }

  function closeModal() {
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
    if (lastFocused) lastFocused.focus();

    // reset back to the form for the next open
    setTimeout(function () {
      if (form && success) {
        form.hidden = false;
        success.hidden = true;
      }
    }, 250);
  }

  // Open triggers
  document.addEventListener('click', function (e) {
    var trigger = e.target.closest('[data-enquiry]');
    if (trigger) {
      e.preventDefault();
      openModal(trigger.getAttribute('data-enquiry-source') || 'Website');
      return;
    }
    if (e.target.closest('[data-enquiry-close]')) {
      e.preventDefault();
      closeModal();
    }
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && modal.classList.contains('is-open')) closeModal();
  });

  // Keep Tab inside the dialog while it is open
  modal.addEventListener('keydown', function (e) {
    if (e.key !== 'Tab' || !modal.classList.contains('is-open')) return;
    var focusables = modal.querySelectorAll(
      'a[href], button:not([disabled]), input:not([type="hidden"]), select, textarea'
    );
    if (!focusables.length) return;
    var first = focusables[0];
    var last = focusables[focusables.length - 1];

    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  });

  // Auto-open once per browser session (skipped on data-no-autopopup pages)
  function autoOpen(source) {
    if (document.body.hasAttribute('data-no-autopopup')) return;
    if (autoShown) return;
    if (modal.classList.contains('is-open')) return;
    try {
      if (sessionStorage.getItem('pentaganEnquiryShown')) return;
      sessionStorage.setItem('pentaganEnquiryShown', '1');
    } catch (err) { /* private mode — just show it once this page view */ }
    autoShown = true;
    openModal(source);
  }

  if (CONFIG.autoOpenAfterSeconds > 0) {
    setTimeout(function () { autoOpen('Timed popup'); }, CONFIG.autoOpenAfterSeconds * 1000);
  }

  if (CONFIG.autoOpenOnExitIntent && window.matchMedia('(min-width:861px)').matches) {
    document.addEventListener('mouseout', function (e) {
      if (e.clientY <= 0 && !e.relatedTarget) autoOpen('Exit intent');
    });
  }

  /* ---------------------------------------------------------------
     3. Form validation and sending
     There is no backend here, so the form hands the enquiry to
     WhatsApp or to the visitor's email client. If you later add a
     server endpoint or a service like Formspree, replace the
     WhatsApp hand-off with a fetch() to that endpoint.
  ---------------------------------------------------------------- */
  function setError(field, message) {
    var wrap = field.closest('.field');
    var slot = wrap ? wrap.querySelector('.field__error') : null;
    if (wrap) wrap.classList.toggle('has-error', Boolean(message));
    if (slot) slot.textContent = message || '';
  }

  function validate() {
    var ok = true;
    var name = document.getElementById('enqName');
    var phone = document.getElementById('enqPhone');

    if (!name.value.trim()) {
      setError(name, 'Please enter your name.');
      ok = false;
    } else {
      setError(name, '');
    }

    var digits = phone.value.replace(/\D/g, '');
    if (digits.length < 10) {
      setError(phone, 'Enter a 10-digit mobile number.');
      ok = false;
    } else {
      setError(phone, '');
    }

    if (!ok) {
      var firstBad = modal.querySelector('.field.has-error input');
      if (firstBad) firstBad.focus();
    }
    return ok;
  }

  function collect() {
    return {
      name: document.getElementById('enqName').value.trim(),
      phone: document.getElementById('enqPhone').value.trim(),
      service: document.getElementById('enqService').value,
      location: document.getElementById('enqLocation').value.trim(),
      message: document.getElementById('enqMessage').value.trim(),
      source: sourceField ? sourceField.value : 'Website'
    };
  }

  function buildText(d) {
    var lines = [
      'New enquiry from the Pentagan website',
      '',
      'Name: ' + d.name,
      'Phone: ' + d.phone,
      'Requirement: ' + d.service
    ];
    if (d.location) lines.push('Location: ' + d.location);
    if (d.message) lines.push('Details: ' + d.message);
    lines.push('Came from: ' + d.source);
    return lines.join('\n');
  }

  function showSuccess() {
    if (form && success) {
      form.hidden = true;
      success.hidden = false;
    }
  }

  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();

      // honeypot filled = bot, fail quietly
      var pot = document.getElementById('enqCompany');
      if (pot && pot.value) { showSuccess(); return; }

      if (!validate()) return;

      var data = collect();
      var url = 'https://wa.me/' + CONFIG.whatsapp + '?text=' + encodeURIComponent(buildText(data));
      window.open(url, '_blank', 'noopener');
      form.reset();
      showSuccess();
    });
  }

  var emailBtn = document.getElementById('enqEmailBtn');
  if (emailBtn) {
    emailBtn.addEventListener('click', function () {
      if (!validate()) return;
      var data = collect();
      var subject = 'Website enquiry — ' + data.service + ' — ' + data.name;
      window.location.href =
        'mailto:' + CONFIG.email +
        '?subject=' + encodeURIComponent(subject) +
        '&body=' + encodeURIComponent(buildText(data));
      showSuccess();
    });
  }

  // Clear an error as soon as the visitor starts fixing it
  Array.prototype.forEach.call(modal.querySelectorAll('.field input'), function (input) {
    input.addEventListener('input', function () {
      var wrap = input.closest('.field');
      if (wrap && wrap.classList.contains('has-error')) setError(input, '');
    });
  });
})();

/* ==========================================================================
   ADD-ON: careers page reveal-on-scroll
   Everything else on the Careers page (nav, dropdown, back-to-top, footer
   year, active-nav highlight) is handled by the blocks above.
   ========================================================================== */
(function () {
  'use strict';

  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var revealTargets = document.querySelectorAll(
    '.career-card, .career-values__list li'
  );

  if (revealTargets.length && 'IntersectionObserver' in window && !prefersReducedMotion) {
    var revealObserver = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        obs.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    Array.prototype.forEach.call(revealTargets, function (el, i) {
      el.classList.add('reveal');
      el.style.transitionDelay = (Math.min(i % 4, 3) * 70) + 'ms';
      revealObserver.observe(el);
    });
  }
})();