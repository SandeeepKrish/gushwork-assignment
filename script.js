// main ui behavior

'use strict';

// 1. Sticky Header
// Slides in when scrolling past hero, hides on scroll up
(function initStickyHeader() {
  const stickyHeader = document.getElementById('sticky-header');
  const mainNav      = document.getElementById('main-nav');
  const heroSection  = document.getElementById('hero');

  if (!stickyHeader || !heroSection) return;

  let lastScrollY   = window.scrollY;
  let heroHeight    = heroSection.offsetHeight;
  let ticking       = false; // rAF throttle flag

  /**
   * Recalculate hero height on resize (e.g. orientation change).
   */
  const updateHeroHeight = () => {
    heroHeight = heroSection.offsetHeight;
  };

  /**
   * Core scroll handler — determines sticky visibility.
   * Shows sticky when: scrolled PAST the hero AND scrolling DOWN
   * Hides sticky when: scrolled BACK above the hero OR scrolling UP
   */
  const handleScroll = () => {
    const currentScrollY = window.scrollY;
    const scrollingDown  = currentScrollY > lastScrollY;

    if (currentScrollY > heroHeight && scrollingDown) {
      // Past hero, scrolling down → show sticky (CSS handles layout via body.sticky-active)
      document.body.classList.add('sticky-active');
      stickyHeader.classList.remove('hidden');
    } else if (!scrollingDown || currentScrollY <= heroHeight) {
      // Scrolling up OR back inside hero → hide sticky
      stickyHeader.classList.add('hidden');
      document.body.classList.remove('sticky-active');
    }

    lastScrollY = currentScrollY;
    ticking = false;
  };

  // Throttle scroll with requestAnimationFrame for performance
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(handleScroll);
      ticking = true;
    }
  }, { passive: true });

  window.addEventListener('resize', updateHeroHeight, { passive: true });
})();


// 2. Image Carousel
// Handles touch, autoplay, dots, and responsive items
(function initCarousel() {
  const carousel = document.getElementById('carousel');
  if (!carousel) return;

  const track      = document.getElementById('carousel-track');
  const items      = Array.from(track.querySelectorAll('.carousel__item'));
  const prevBtn    = document.getElementById('carousel-prev');
  const nextBtn    = document.getElementById('carousel-next');
  const dotsWrap   = document.getElementById('carousel-dots');
  const dots       = dotsWrap ? Array.from(dotsWrap.querySelectorAll('.carousel__dot')) : [];

  let currentIndex = 0;
  let visibleCount = getVisibleCount();
  let autoPlayTimer;
  let touchStartX  = 0;
  let touchEndX    = 0;

  /**
   * Determine how many slides to show based on viewport width.
   */
  function getVisibleCount() {
    if (window.innerWidth <= 767) return 1;
    if (window.innerWidth <= 1024) return 2;
    return 3;
  }

  /**
   * Maximum valid index — prevents overscrolling.
   */
  function maxIndex() {
    return Math.max(0, items.length - visibleCount);
  }

  /**
   * Move the carousel track to the given slide index.
   * @param {number} index - Target slide index
   */
  function goToSlide(index) {
    // Clamp index within bounds
    currentIndex = Math.max(0, Math.min(index, maxIndex()));

    // Calculate item width percentage (100 / visibleCount per item, accounting for padding)
    const itemWidthPct = 100 / visibleCount;
    track.style.transform = `translateX(-${currentIndex * itemWidthPct}%)`;

    // Update item flex-basis dynamically
    items.forEach(item => {
      item.style.flex = `0 0 calc(${itemWidthPct}% )`;
    });

    updateDots();
    updateAriaStates();
  }

  /**
   * Sync dot button active states.
   */
  function updateDots() {
    dots.forEach((dot, i) => {
      const isActive = i === currentIndex;
      dot.classList.toggle('active', isActive);
      dot.setAttribute('aria-selected', isActive ? 'true' : 'false');
    });
  }

  /**
   * Update ARIA states on slides and buttons.
   */
  function updateAriaStates() {
    items.forEach((item, i) => {
      const isVisible = i >= currentIndex && i < currentIndex + visibleCount;
      item.setAttribute('aria-hidden', isVisible ? 'false' : 'true');
    });

    prevBtn.setAttribute('aria-disabled', currentIndex === 0 ? 'true' : 'false');
    nextBtn.setAttribute('aria-disabled', currentIndex === maxIndex() ? 'true' : 'false');
  }

  /** Go to next slide (wraps around). */
  function next() {
    if (currentIndex >= maxIndex()) {
      goToSlide(0); // Wrap to start
    } else {
      goToSlide(currentIndex + 1);
    }
  }

  /** Go to previous slide (wraps around). */
  function prev() {
    if (currentIndex <= 0) {
      goToSlide(maxIndex()); // Wrap to end
    } else {
      goToSlide(currentIndex - 1);
    }
  }

  /** Start auto-play (slides every 4 seconds). */
  function startAutoPlay() {
    clearInterval(autoPlayTimer);
    autoPlayTimer = setInterval(next, 4000);
  }

  /** Stop auto-play. */
  function stopAutoPlay() {
    clearInterval(autoPlayTimer);
  }

  /* --- Event Listeners --- */

  // Button click handlers
  if (prevBtn) prevBtn.addEventListener('click', () => { prev(); stopAutoPlay(); startAutoPlay(); });
  if (nextBtn) nextBtn.addEventListener('click', () => { next(); stopAutoPlay(); startAutoPlay(); });

  // Dot click handlers
  dots.forEach((dot, i) => {
    dot.addEventListener('click', () => {
      goToSlide(i);
      stopAutoPlay();
      startAutoPlay();
    });
  });

  // Pause on hover / focus
  carousel.addEventListener('mouseenter', stopAutoPlay);
  carousel.addEventListener('mouseleave', startAutoPlay);
  carousel.addEventListener('focusin',    stopAutoPlay);
  carousel.addEventListener('focusout',   startAutoPlay);

  // Keyboard navigation (arrow keys when carousel is focused)
  carousel.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft')  { prev(); e.preventDefault(); }
    if (e.key === 'ArrowRight') { next(); e.preventDefault(); }
  });

  // Touch / swipe support
  track.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].clientX;
  }, { passive: true });

  track.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX - touchEndX;
    if (Math.abs(diff) > 50) { // 50px threshold
      diff > 0 ? next() : prev();
    }
  }, { passive: true });

  // Responsive — recalculate on resize
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      const newCount = getVisibleCount();
      if (newCount !== visibleCount) {
        visibleCount = newCount;
        currentIndex = Math.min(currentIndex, maxIndex());
        goToSlide(currentIndex);
      }
    }, 150);
  }, { passive: true });

  // Initial render
  goToSlide(0);
  startAutoPlay();
})();


// 3. FAQ Accordion
// Keeps only one item open at a time
(function initFAQ() {
  const faqList = document.getElementById('faq-list');
  if (!faqList) return;

  const items = Array.from(faqList.querySelectorAll('.faq-item'));

  /**
   * Close all accordion items.
   */
  function closeAll() {
    items.forEach(item => {
      item.classList.remove('open');
      const btn = item.querySelector('.faq-item__q');
      const icon = item.querySelector('.faq-item__icon');
      if (btn) btn.setAttribute('aria-expanded', 'false');
      // Reset icon to down arrow
      if (icon) icon.innerHTML = '&#8964;';
    });
  }

  /**
   * Open a specific accordion item.
   * @param {Element} item
   */
  function openItem(item) {
    item.classList.add('open');
    const btn  = item.querySelector('.faq-item__q');
    const icon = item.querySelector('.faq-item__icon');
    if (btn)  btn.setAttribute('aria-expanded', 'true');
    // Change icon to up arrow
    if (icon) icon.innerHTML = '&#8963;';
  }

  // Attach click handlers
  items.forEach(item => {
    const btn = item.querySelector('.faq-item__q');
    if (!btn) return;

    btn.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');
      closeAll();
      if (!isOpen) openItem(item);
    });
  });
})();


// 4. Mobile Menu Toggle
(function initHamburger() {
  const hamburger  = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobile-menu');
  if (!hamburger || !mobileMenu) return;

  hamburger.addEventListener('click', () => {
    const isOpen = mobileMenu.classList.toggle('is-open');
    hamburger.classList.toggle('is-open', isOpen);
    hamburger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  // Close menu when clicking a link inside it
  mobileMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      mobileMenu.classList.remove('is-open');
      hamburger.classList.remove('is-open');
      hamburger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    });
  });
})();


// 5. Desktop Dropdown Behavior
(function initDropdowns() {
  // Handle mobile dropdown toggle (tap)
  const trigger = document.getElementById('products-trigger');
  if (!trigger) return;

  const parent = trigger.closest('.nav-dropdown');
  if (!parent) return;

  trigger.addEventListener('click', (e) => {
    // On mobile, the dropdown is static so this toggles visibility
    if (window.innerWidth <= 767) {
      e.preventDefault();
      parent.classList.toggle('open');
    }
  });

  // Close dropdown when pressing Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.nav-dropdown.open').forEach(d => d.classList.remove('open'));
    }
  });
})();


// 6. Scroll Reveal Animations (IntersectionObserver)
(function initScrollReveal() {
  // Add reveal class to target elements
  const selectors = [
    '.feature-card',
    '.faq-item',
    '.specs-table-wrap',
    '.contact-form',
    '.contact-info',
    '.section-header',
    '.cta-card',
  ];

  const elements = document.querySelectorAll(selectors.join(','));

  // Add base reveal class and stagger delays for grids
  elements.forEach((el, i) => {
    el.classList.add('reveal');
    // Stagger siblings within the same parent grid
    const siblings = Array.from(el.parentElement.querySelectorAll('.feature-card, .faq-item'));
    const sibIdx = siblings.indexOf(el);
    if (sibIdx > 0) {
      el.classList.add(`reveal--delay-${Math.min(sibIdx, 3)}`);
    }
  });

  // Observer config — trigger when 15% of element is visible
  const observerConfig = {
    threshold: 0.15,
    rootMargin: '0px 0px -40px 0px',
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target); // Animate only once
      }
    });
  }, observerConfig);

  elements.forEach(el => observer.observe(el));
})();


// 7. Form validation and feedback
(function initForms() {
  /* --- Contact Form --- */
  const contactForm     = document.getElementById('contact-form');
  const contactFeedback = document.getElementById('contact-feedback');

  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name    = document.getElementById('contact-name');
      const email   = document.getElementById('contact-email');
      const message = document.getElementById('contact-message');
      let valid = true;

      // Clear previous errors
      [name, email, message].forEach(f => f.classList.remove('error'));

      if (!name.value.trim()) { name.classList.add('error'); valid = false; }
      if (!validateEmail(email.value)) { email.classList.add('error'); valid = false; }
      if (!message.value.trim()) { message.classList.add('error'); valid = false; }

      if (!valid) {
        showFeedback(contactFeedback, 'Please fill in all required fields correctly.', 'error');
        return;
      }

      // Simulate successful submission
      const submitBtn = document.getElementById('contact-submit-btn');
      submitBtn.textContent = 'Sending…';
      submitBtn.disabled = true;

      setTimeout(() => {
        showFeedback(contactFeedback, '✓ Message sent! We\'ll get back to you within 24 hours.', 'success');
        contactForm.reset();
        submitBtn.textContent = 'Send Message';
        submitBtn.disabled = false;
      }, 1500);
    });
  }

  /* --- Catalogue Form --- */
  const catalogueForm = document.getElementById('catalogue-form');
  if (catalogueForm) {
    catalogueForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const emailInput = document.getElementById('catalogue-email');
      if (!validateEmail(emailInput.value)) {
        emailInput.style.borderColor = '#ef4444';
        emailInput.focus();
        return;
      }
      emailInput.style.borderColor = '';
      const btn = document.getElementById('request-catalogue-btn');
      btn.textContent = 'Sending…';
      btn.disabled = true;
      setTimeout(() => {
        btn.textContent = '✓ Catalogue Requested!';
        catalogueForm.reset();
        setTimeout(() => {
          btn.textContent = 'Request Catalogue';
          btn.disabled = false;
        }, 3000);
      }, 1200);
    });
  }

  /**
   * Basic email format validation.
   * @param {string} email
   * @returns {boolean}
   */
  function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  }

  /**
   * Display a feedback message.
   * @param {Element} el — The feedback element
   * @param {string} message
   * @param {'success'|'error'} type
   */
  function showFeedback(el, message, type) {
    if (!el) return;
    el.textContent = message;
    el.className = `form-feedback ${type}`;
    // Clear after 5 seconds
    setTimeout(() => {
      el.textContent = '';
      el.className = 'form-feedback';
    }, 5000);
  }
})();


// 8. Smooth Scroll override
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (!target) return;
    e.preventDefault();

    // Account for the sticky nav height
    const navHeight = document.getElementById('main-nav')?.offsetHeight || 72;
    const stickyHeight = document.body.classList.contains('sticky-active')
      ? (document.getElementById('sticky-header')?.offsetHeight || 0)
      : 0;
    const offset = navHeight + stickyHeight + 16;

    window.scrollTo({
      top: target.getBoundingClientRect().top + window.scrollY - offset,
      behavior: 'smooth',
    });
  });
});


// 9. Extra scroll shadow on main nav
(function initNavShadow() {
  const nav = document.getElementById('main-nav');
  if (!nav) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 10) {
      nav.style.boxShadow = '0 4px 24px rgba(0,0,0,0.12)';
    } else {
      nav.style.boxShadow = '';
    }
  }, { passive: true });
})();
