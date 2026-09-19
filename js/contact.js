/* ==========================================================================
   PENTAGAN ENGINEERS & CONSTRUCTIONS — site scripts
   Hooks used here match index.html / contact.html / css/style.css:
     #navToggle, #siteNav, .has-dropdown, .stat__num[data-count],
     .faq-item / .faq-item__q, #backToTop, #year, .reveal

   CHANGES IN THIS VERSION
     - The enquiry modal (second block, below) now drives the two-column
       "Tell us about your project" form: Your name, Phone number,
       What do you need?, Plot location, Anything we should know?
       (optional). It sends via WhatsApp ("Send on WhatsApp") or the
       visitor's mail app ("Send by email instead"), with inline validation
       and a hidden spam-trap field.
     - The timed / exit-intent popup is skipped on pages whose <body> has the
       data-no-autopopup attribute (contact.html).
     - The scroll-reveal selector list includes the contact page sections.
     Everything else is unchanged.

   Every page that uses this file needs the same modal markup
   (see enquiry-modal.html) so the field IDs match.

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
     (Used by the Home page. contact.html has no FAQ, so this block
     simply finds nothing to attach to there.)
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
     (Last line of the selector list = contact page sections.)
  ---------------------------------------------------------------- */
  var revealTargets = document.querySelectorAll(
    '.about-snap__media, .about-snap__text, .packages__media, .packages__content,' +
    '.service-card, .why__item, .testimonial-card, .project-card, .faq__layout > *,' +
    '.find-us__grid > *, .cta-banner__inner > *,' +
    '.contact-main__grid > *, .quick-enquiry__list > *'
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
   PENTAGAN — ENQUIRY MODAL / QUICK ESTIMATE
   Its own IIFE, so it can't collide with anything above.
   Edit CONFIG with the real WhatsApp number and email address.
   ========================================================================== */
(function () {
  'use strict';

  var CONFIG = {
    whatsapp: '918754797065',              // country code + number, digits only
    email: 'pentaganenc@gmail.com',        // <- check this matches the address in your top strip
    autoOpenAfterSeconds: 30,              // set to 0 to disable the timed popup
    autoOpenOnExitIntent: true             // desktop only
  };

  /* ---------------------------------------------------------------
     1. Quick cost estimate strip (Home page) — unchanged
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
     Opens from anything carrying data-enquiry (header button, page
     buttons, sticky mobile bar). Closes on X, backdrop click and
     Escape; focus goes to the first field on open and back to the
     button that opened it on close.
  ---------------------------------------------------------------- */
  var modal = document.getElementById('enquiryModal');
  if (!modal) return;

  var form = document.getElementById('enquiryForm');
  var emailBtn = document.getElementById('enqEmailBtn');
  var honeypot = document.getElementById('enqWebsite');
  var fields = {
    name: document.getElementById('enqName'),
    phone: document.getElementById('enqPhone'),
    need: document.getElementById('enqNeed'),
    location: document.getElementById('enqLocation'),
    message: document.getElementById('enqMessage')
  };
  var lastFocused = null;
  var autoShown = false;

  function openModal(trigger) {
    lastFocused = trigger || document.activeElement;
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');          // stops background scrolling
    if (fields.name) setTimeout(function () { fields.name.focus(); }, 80);
  }

  function closeModal() {
    if (!modal.classList.contains('is-open')) return;
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
    if (lastFocused && typeof lastFocused.focus === 'function') lastFocused.focus();
  }

  // One delegated listener handles every open and close control.
  document.addEventListener('click', function (e) {
    var trigger = e.target.closest('[data-enquiry]');
    if (trigger) {
      e.preventDefault();
      openModal(trigger);
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

  // Keep Tab inside the dialog while it is open (the spam-trap input is skipped)
  modal.addEventListener('keydown', function (e) {
    if (e.key !== 'Tab' || !modal.classList.contains('is-open')) return;
    var focusables = modal.querySelectorAll(
      'a[href], button:not([disabled]), input:not([type="hidden"]):not([tabindex="-1"]), select, textarea'
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

  // Auto-open once per browser session (skipped where <body data-no-autopopup>)
  function autoOpen() {
    if (autoShown) return;
    if (document.body.hasAttribute('data-no-autopopup')) return;
    if (modal.classList.contains('is-open')) return;
    try {
      if (sessionStorage.getItem('pentaganEnquiryShown')) return;
      sessionStorage.setItem('pentaganEnquiryShown', '1');
    } catch (err) { /* private mode — just show it once this page view */ }
    autoShown = true;
    openModal(null);
  }

  if (CONFIG.autoOpenAfterSeconds > 0) {
    setTimeout(autoOpen, CONFIG.autoOpenAfterSeconds * 1000);
  }

  if (CONFIG.autoOpenOnExitIntent && window.matchMedia('(min-width:861px)').matches) {
    document.addEventListener('mouseout', function (e) {
      if (e.clientY <= 0 && !e.relatedTarget) autoOpen();
    });
  }

  /* ---------------------------------------------------------------
     3. Validation
     Required: name, 10-digit Indian mobile, what they need, plot
     location. The message is optional. Errors appear under each
     field; no alert() anywhere.
     (To make Plot location optional, delete 'location' from
     requiredKeys below.)
  ---------------------------------------------------------------- */

  // Accepts 98765 43210, 098765 43210, +91 98765 43210, 91-98765-43210 ...
  function tenDigitMobile(value) {
    var digits = value.replace(/\D/g, '');
    if (digits.length === 12 && digits.indexOf('91') === 0) digits = digits.slice(2);
    else if (digits.length === 11 && digits.charAt(0) === '0') digits = digits.slice(1);
    return digits;
  }

  var validators = {
    name: function (v) {
      return v.trim() ? '' : 'Please enter your name.';
    },
    phone: function (v) {
      if (!v.trim()) return 'Please enter your phone number.';
      return /^[6-9]\d{9}$/.test(tenDigitMobile(v)) ? '' : 'Enter a valid 10-digit mobile number.';
    },
    need: function (v) {
      return v ? '' : 'Please choose what you need.';
    },
    location: function (v) {
      return v.trim() ? '' : 'Please enter the plot location.';
    }
  };
  var requiredKeys = ['name', 'phone', 'need', 'location'];

  function setError(key, message) {
    var input = fields[key];
    if (!input) return;
    var wrap = input.closest('.field');
    var slot = wrap ? wrap.querySelector('.field__error') : null;
    if (wrap) wrap.classList.toggle('has-error', Boolean(message));
    if (slot) slot.textContent = message || '';
    if (message) input.setAttribute('aria-invalid', 'true');
    else input.removeAttribute('aria-invalid');
  }

  function validateField(key) {
    var input = fields[key];
    if (!input || !validators[key]) return true;
    var message = validators[key](input.value);
    setError(key, message);
    return !message;
  }

  function validateAll() {
    var firstBad = null;
    requiredKeys.forEach(function (key) {
      if (!validateField(key) && !firstBad) firstBad = fields[key];
    });
    if (firstBad) firstBad.focus();
    return !firstBad;
  }

  function clearErrors() {
    requiredKeys.forEach(function (key) { setError(key, ''); });
  }

  requiredKeys.forEach(function (key) {
    var input = fields[key];
    if (!input) return;
    var recheck = function () {
      var wrap = input.closest('.field');
      if (wrap && wrap.classList.contains('has-error')) validateField(key);
    };
    // Fix an error as the visitor types or changes the dropdown
    input.addEventListener('input', recheck);
    input.addEventListener('change', recheck);
    // Check a filled-in field when the visitor leaves it (empty fields wait for submit)
    input.addEventListener('blur', function () {
      if (input.value.trim()) validateField(key);
    });
  });

  /* ---------------------------------------------------------------
     4. Send -> WhatsApp or email
     There is no backend, so nothing is stored. After validation the
     enquiry opens in WhatsApp (form submit / Enter key) or in the
     visitor's mail app (email button), then the form resets and the
     modal closes.
  ---------------------------------------------------------------- */
  function collect() {
    return {
      name: fields.name.value.trim(),
      phone: fields.phone.value.trim(),
      need: fields.need.value,
      location: fields.location.value.trim(),
      message: fields.message ? fields.message.value.trim() : ''
    };
  }

  function buildText(d) {
    return [
      'New Enquiry - Pentagan Engineers & Constructions',
      '',
      'Name: ' + d.name,
      'Phone: ' + d.phone,
      'Need: ' + d.need,
      'Plot location: ' + d.location,
      'Details: ' + (d.message || 'Not provided')
    ].join('\n');
  }

  function send(channel) {
    if (honeypot && honeypot.value) return;             // a bot filled the hidden field
    if (!validateAll()) return;

    var data = collect();
    var text = buildText(data);

    if (channel === 'email') {
      var subject = 'New enquiry: ' + data.need + ' - ' + data.name;
      window.location.href = 'mailto:' + CONFIG.email +
        '?subject=' + encodeURIComponent(subject) +
        '&body=' + encodeURIComponent(text);
    } else {
      window.open('https://wa.me/' + CONFIG.whatsapp + '?text=' + encodeURIComponent(text), '_blank', 'noopener');
    }

    form.reset();
    clearErrors();
    closeModal();
  }

  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      send('whatsapp');
    });
  }

  if (emailBtn) {
    emailBtn.addEventListener('click', function () {
      send('email');
    });
  }
})();