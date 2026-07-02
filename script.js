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

const setupImageFallbacks = () => {
  document.querySelectorAll('img[data-fallback]').forEach((image) => {
    image.addEventListener('error', () => {
      const fallback = image.dataset.fallback;
      const alreadyTriedFallback = image.dataset.triedFallback === 'true';

      if (fallback && !alreadyTriedFallback) {
        image.dataset.triedFallback = 'true';
        image.src = fallback;
        return;
      }

      const projectMedia = image.closest('.project-media');
      if (projectMedia) projectMedia.classList.add('is-missing');
      image.style.display = 'none';
    });
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
    { selector: '.client-section h2', words: [['Trusted', 'blue'], ['commercial', 'sage'], ['industrial', 'red']] },
    { selector: '#story h2', words: [['engineering', 'blue'], ['1938', 'red']] },
    { selector: '.sure-group h2', words: [['strength', 'red'], ['SURE Group', 'blue']] },
    { selector: '.service-area h2', words: [['Regional', 'sage'], ['reach', 'red']] },
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
