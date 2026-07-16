// Load CAC accent layers after the base/effects styles.
const brandAccentStyles = document.createElement('link');
brandAccentStyles.rel = 'stylesheet';
brandAccentStyles.href = 'brand-accent.css';
document.head.appendChild(brandAccentStyles);

const latestFixStyles = document.createElement('link');
latestFixStyles.rel = 'stylesheet';
latestFixStyles.href = 'latest-fixes.css';
document.head.appendChild(latestFixStyles);

const finalAdjustmentStyles = document.createElement('link');
finalAdjustmentStyles.rel = 'stylesheet';
finalAdjustmentStyles.href = 'final-adjustments.css';
document.head.appendChild(finalAdjustmentStyles);

const polishFixStyles = document.createElement('link');
polishFixStyles.rel = 'stylesheet';
polishFixStyles.href = 'site-polish-fixes.css';
document.head.appendChild(polishFixStyles);

const interactiveSectionStyles = document.createElement('link');
interactiveSectionStyles.rel = 'stylesheet';
interactiveSectionStyles.href = 'interactive-sections.css';
document.head.appendChild(interactiveSectionStyles);

const setupImageFallbacks = () => {
  const normalize = (src) => {
    if (!src) return '';
    try {
      return decodeURIComponent(src.trim());
    } catch {
      return src.trim();
    }
  };

  const getFileName = (src) => normalize(src).split('/').pop();

  const getCandidates = (image) => {
    const current = normalize(image.getAttribute('src'));
    const fallback = normalize(image.dataset.fallback);
    const fileName = getFileName(current || fallback);
    const candidates = [];

    const add = (value) => {
      const clean = normalize(value);
      if (clean && !candidates.includes(clean)) candidates.push(clean);
    };

    add(current);

    if (image.dataset.fallbacks) {
      image.dataset.fallbacks.split('|').forEach(add);
    }

    add(fallback);

    if (fileName) {
      if (current.startsWith('assets/clients/')) {
        add(fileName);
        add(`brand/${fileName}`);
      }
      if (current.startsWith('assets/story/')) {
        add(fileName);
        add(`brand/${fileName}`);
      }
      if (current.startsWith('assets/projects/')) {
        add(fileName);
      }
      if (current.startsWith('brand/')) {
        add(fileName);
        add(`assets/brand/${fileName}`);
      }
    }

    return candidates;
  };

  const markMissing = (image) => {
    image.classList.add('is-missing');
    const projectMedia = image.closest('.project-media');
    if (projectMedia) projectMedia.classList.add('is-missing');
  };

  const tryNextCandidate = (image) => {
    const candidates = getCandidates(image);
    const index = Number(image.dataset.imageAttempt || 0);
    const next = candidates[index + 1];

    if (next) {
      image.dataset.imageAttempt = String(index + 1);
      image.classList.remove('is-missing');
      const projectMedia = image.closest('.project-media');
      if (projectMedia) projectMedia.classList.remove('is-missing');
      image.removeAttribute('style');
      image.src = next;
      return;
    }

    markMissing(image);
  };

  document.querySelectorAll('img').forEach((image) => {
    image.dataset.imageAttempt = image.dataset.imageAttempt || '0';

    image.addEventListener('error', () => tryNextCandidate(image));
    image.addEventListener('load', () => {
      if (image.naturalWidth > 0) {
        image.classList.remove('is-missing');
        const projectMedia = image.closest('.project-media');
        if (projectMedia) projectMedia.classList.remove('is-missing');
      }
    });

    window.setTimeout(() => {
      if (image.complete && image.naturalWidth === 0) {
        tryNextCandidate(image);
      }
    }, 0);
  });
};

setupImageFallbacks();

// Reduce accidental mobile pinch/side-gesture drift without blocking desktop zoom controls.
const isTouchLikeDevice = window.matchMedia('(pointer: coarse)').matches || 'ontouchstart' in window;
const viewportMeta = document.querySelector('meta[name="viewport"]');
if (isTouchLikeDevice && viewportMeta) {
  viewportMeta.setAttribute('content', 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover');
}

if (isTouchLikeDevice) {
  document.addEventListener('gesturestart', (event) => event.preventDefault(), { passive: false });
  document.addEventListener('gesturechange', (event) => event.preventDefault(), { passive: false });
  document.addEventListener('gestureend', (event) => event.preventDefault(), { passive: false });
}

const highlightTitleWords = () => {
  const rules = [
    { selector: '.hero h1', words: [['Engineered', 'blue'], ['Built', 'red']] },
    { selector: '#capabilities h2', words: [['mechanical', 'blue'], ['Every', 'sage']] },
    { selector: '.delivery-section h2', words: [['design-build', 'sage'], ['plan & spec', 'red']] },
    { selector: '#services h2', words: [['Commercial', 'red'], ['mechanical', 'blue']] },
    { selector: '#markets h2', words: [['Versatile', 'sage'], ['critical', 'red']] },
    { selector: '#projects h2', words: [['Projects', 'red'], ['range', 'blue']] },
    { selector: '.client-section h2', words: [['Trusted', 'blue']] },
    { selector: '#story h2', words: [['engineering', 'blue'], ['1938', 'red']] },
    { selector: '.sure-group h2', words: [['SURE', 'teal']] },
    { selector: '.service-area h2', words: [['Regional', 'red']] },
    { selector: '#careers h2', words: [['Build', 'red'], ['critical', 'sage']] },
    { selector: '#contact h2', words: [['project', 'red']] }
  ];

  const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  rules.forEach(({ selector, words }) => {
    const heading = document.querySelector(selector);
    if (!heading || heading.dataset.titleAccented === 'true') return;

    let html = heading.textContent;
    words.forEach(([word, color]) => {
      const expression = new RegExp(`(${escapeRegExp(word)})`, 'i');
      html = html.replace(expression, `<span class="title-accent title-accent-${color}">$1</span>`);
    });

    heading.innerHTML = html;
    heading.dataset.titleAccented = 'true';
  });
};

highlightTitleWords();

const setupDeliveryAccordions = () => {
  document.querySelectorAll('.delivery-card').forEach((card, index) => {
    if (card.dataset.accordionReady === 'true') return;

    const label = card.querySelector('.delivery-label');
    const heading = card.querySelector('h3');
    const description = card.querySelector('p');
    if (!label || !heading || !description) return;

    const detailsId = `delivery-details-${index + 1}`;
    const summary = document.createElement('div');
    summary.className = 'delivery-summary';

    const toggleButton = document.createElement('button');
    toggleButton.type = 'button';
    toggleButton.className = 'delivery-toggle';
    toggleButton.setAttribute('aria-expanded', 'false');
    toggleButton.setAttribute('aria-controls', detailsId);
    toggleButton.setAttribute('aria-label', `Expand ${heading.textContent.trim()} details`);
    toggleButton.innerHTML = '<span class="delivery-toggle-icon" aria-hidden="true">+</span>';

    const details = document.createElement('div');
    details.className = 'delivery-details';
    details.id = detailsId;

    card.insertBefore(summary, label);
    summary.append(label, heading, toggleButton);
    details.append(description);
    card.append(details);
    card.classList.add('delivery-collapsible');
    card.dataset.accordionReady = 'true';

    toggleButton.addEventListener('click', () => {
      const willOpen = !card.classList.contains('is-expanded');
      card.classList.toggle('is-expanded', willOpen);
      toggleButton.setAttribute('aria-expanded', String(willOpen));
      toggleButton.setAttribute('aria-label', `${willOpen ? 'Collapse' : 'Expand'} ${heading.textContent.trim()} details`);
    });
  });
};

const setupCapabilityTabs = () => {
  const strip = document.querySelector('.capability-strip');
  if (!strip || strip.dataset.tabsReady === 'true') return;

  const descriptions = {
    Engineering: 'In-house engineering support, system analysis, value engineering, permitting coordination, and practical design decisions rooted in constructability.',
    Coordination: 'BIM coordination, trade alignment, schedule awareness, clash reduction, and organized communication from preconstruction through closeout.',
    'Field Ops': 'Installation, commissioning, troubleshooting, service, preventative maintenance, repair, replacement, and long-term system support.'
  };

  const panel = document.createElement('div');
  panel.className = 'capability-tab-panel';
  panel.id = 'capability-tab-panel';
  panel.setAttribute('role', 'region');
  panel.setAttribute('aria-live', 'polite');

  const labels = Array.from(strip.querySelectorAll('span')).map((span) => span.textContent.trim());
  strip.textContent = '';
  strip.classList.add('capability-tabs');
  strip.dataset.tabsReady = 'true';

  labels.forEach((label) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'capability-tab';
    button.textContent = label;
    button.setAttribute('aria-expanded', 'false');
    button.setAttribute('aria-controls', panel.id);

    button.addEventListener('click', () => {
      const wasActive = button.classList.contains('is-active');

      strip.querySelectorAll('.capability-tab').forEach((tab) => {
        tab.classList.remove('is-active');
        tab.setAttribute('aria-expanded', 'false');
      });

      if (wasActive) {
        panel.classList.remove('is-open');
        panel.innerHTML = '';
        return;
      }

      button.classList.add('is-active');
      button.setAttribute('aria-expanded', 'true');
      panel.innerHTML = `<strong>${label}</strong><p>${descriptions[label] || ''}</p>`;
      panel.classList.add('is-open');
    });

    strip.append(button);
  });

  strip.insertAdjacentElement('afterend', panel);
};

const setupProjectExpansion = () => {
  const grid = document.querySelector('.project-grid');
  if (!grid || grid.dataset.expansionReady === 'true') return;

  const cards = Array.from(grid.querySelectorAll('.project-card'));
  const visibleCount = 5;
  if (cards.length <= visibleCount) return;

  const hiddenCount = cards.length - visibleCount;
  cards.slice(visibleCount).forEach((card) => card.classList.add('project-extra'));
  grid.classList.add('is-collapsed');
  grid.dataset.expansionReady = 'true';

  const buttonWrap = document.createElement('div');
  buttonWrap.className = 'projects-toggle-wrap';

  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'projects-toggle';
  button.setAttribute('aria-expanded', 'false');
  button.innerHTML = `<span class="projects-toggle-label">View ${hiddenCount} More Projects</span><span class="projects-toggle-icon" aria-hidden="true">+</span>`;

  button.addEventListener('click', () => {
    const willExpand = !grid.classList.contains('is-expanded');
    grid.classList.toggle('is-expanded', willExpand);
    grid.classList.toggle('is-collapsed', !willExpand);
    button.setAttribute('aria-expanded', String(willExpand));
    button.querySelector('.projects-toggle-label').textContent = willExpand ? 'Show Fewer Projects' : `View ${hiddenCount} More Projects`;

    if (willExpand) {
      cards.slice(visibleCount).forEach((card) => card.classList.add('is-visible'));
    } else {
      document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });

  buttonWrap.append(button);
  grid.insertAdjacentElement('afterend', buttonWrap);
};

setupDeliveryAccordions();
setupCapabilityTabs();
setupProjectExpansion();

const toggle = document.querySelector('.nav-toggle');
const navLinks = document.querySelector('.nav-links');

if (toggle && navLinks) {
  toggle.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(isOpen));
    toggle.textContent = isOpen ? 'Close' : 'Menu';
  });

  navLinks.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.textContent = 'Menu';
    });
  });
}

const year = document.getElementById('year');
if (year) year.textContent = new Date().getFullYear();

const progressBar = document.createElement('div');
progressBar.className = 'scroll-progress';
progressBar.setAttribute('aria-hidden', 'true');
document.body.appendChild(progressBar);

const updateScrollProgress = () => {
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  const progress = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;
  document.documentElement.style.setProperty('--scroll-progress', `${Math.min(progress, 100)}%`);
};

updateScrollProgress();
window.addEventListener('scroll', updateScrollProgress, { passive: true });
window.addEventListener('resize', updateScrollProgress);

let cursorTicking = false;
window.addEventListener('pointermove', (event) => {
  if (cursorTicking) return;
  cursorTicking = true;
  window.requestAnimationFrame(() => {
    document.documentElement.style.setProperty('--cursor-x', `${event.clientX}px`);
    document.documentElement.style.setProperty('--cursor-y', `${event.clientY}px`);
    cursorTicking = false;
  });
}, { passive: true });

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.16 });

document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));

const tiltCards = document.querySelectorAll('.service-card, .project-card, .delivery-card, .market-grid span, .contact-tile');

tiltCards.forEach((card) => {
  card.classList.add('interactive-tilt');

  card.addEventListener('pointermove', (event) => {
    if (window.matchMedia('(max-width: 760px)').matches) return;

    const rect = card.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const xPercent = x / rect.width;
    const yPercent = y / rect.height;
    const rotateX = (0.5 - yPercent) * 7;
    const rotateY = (xPercent - 0.5) * 7;

    card.style.setProperty('--tilt-x', `${rotateY}deg`);
    card.style.setProperty('--tilt-y', `${rotateX}deg`);
    card.style.setProperty('--spot-x', `${xPercent * 100}%`);
    card.style.setProperty('--spot-y', `${yPercent * 100}%`);
    card.classList.add('is-tilting');
  });

  card.addEventListener('pointerleave', () => {
    card.classList.remove('is-tilting');
    card.style.removeProperty('--tilt-x');
    card.style.removeProperty('--tilt-y');
    card.style.removeProperty('--spot-x');
    card.style.removeProperty('--spot-y');
  });
});

const contactForm = document.getElementById('contact-form');
const formStatus = document.getElementById('form-status');

if (contactForm) {
  contactForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const submitButton = contactForm.querySelector('button[type="submit"]');
    const originalButtonText = submitButton ? submitButton.textContent : '';
    const formData = new FormData(contactForm);

    if (formStatus) {
      formStatus.textContent = '';
      formStatus.classList.remove('error');
    }

    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = 'Sending...';
    }

    try {
      const response = await fetch(contactForm.action, {
        method: 'POST',
        body: formData,
        headers: {
          Accept: 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Form submission failed');
      }

      contactForm.reset();
      if (formStatus) formStatus.textContent = 'Thanks — your message was sent. CAC will follow up soon.';
    } catch (error) {
      if (formStatus) {
        formStatus.textContent = 'Something went wrong. Please call 800-587-5067 or try again.';
        formStatus.classList.add('error');
      }
    } finally {
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = originalButtonText;
      }
    }
  });
}
