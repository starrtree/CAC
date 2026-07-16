(() => {
  if (window.__cacScrollExperience) return;
  window.__cacScrollExperience = true;

  const styleLink = document.createElement('link');
  styleLink.rel = 'stylesheet';
  styleLink.href = 'scroll-experience.css';
  document.head.appendChild(styleLink);

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const root = document.documentElement;
  const nav = document.querySelector('.nav');
  const hero = document.querySelector('.hero');
  const heroCopy = document.querySelector('.hero-copy');
  const sections = Array.from(document.querySelectorAll('main > section'));

  if (nav && !nav.querySelector('.nav-motion-grid')) {
    const navGrid = document.createElement('div');
    navGrid.className = 'nav-motion-grid';
    navGrid.setAttribute('aria-hidden', 'true');
    nav.prepend(navGrid);
  }

  if (hero) {
    if (!hero.querySelector('.hero-media-layer')) {
      const mediaLayer = document.createElement('div');
      mediaLayer.className = 'hero-media-layer';
      mediaLayer.setAttribute('aria-hidden', 'true');
      hero.prepend(mediaLayer);
    }

    if (!hero.querySelector('.hero-blueprint-rings')) {
      const rings = document.createElement('div');
      rings.className = 'hero-blueprint-rings';
      rings.setAttribute('aria-hidden', 'true');
      rings.innerHTML = '<span></span><span></span><span></span>';
      hero.append(rings);
    }

    if (!hero.querySelector('.hero-scroll-cue')) {
      const cue = document.createElement('div');
      cue.className = 'hero-scroll-cue';
      cue.setAttribute('aria-hidden', 'true');
      cue.textContent = 'Scroll to explore';
      hero.append(cue);
    }
  }

  const sectionNames = new Map([
    ['capabilities', 'Capabilities'],
    ['services', 'Services'],
    ['markets', 'Markets'],
    ['projects', 'Projects'],
    ['story', 'Story'],
    ['careers', 'Careers'],
    ['contact', 'Contact']
  ]);

  let hud;
  let hudLabel;
  if (!document.querySelector('.scroll-hud')) {
    hud = document.createElement('div');
    hud.className = 'scroll-hud';
    hud.setAttribute('aria-hidden', 'true');
    hud.innerHTML = `
      <div class="scroll-hud-track">
        <span class="scroll-hud-fill"></span>
        <span class="scroll-hud-dot"></span>
      </div>
      <span class="scroll-hud-label">Overview</span>
    `;
    document.body.append(hud);
    hudLabel = hud.querySelector('.scroll-hud-label');
  } else {
    hud = document.querySelector('.scroll-hud');
    hudLabel = hud.querySelector('.scroll-hud-label');
  }

  const stageElements = sections.filter((section) => !section.classList.contains('trust-band'));
  stageElements.forEach((section, index) => {
    section.classList.add('scroll-stage');
    section.style.setProperty('--stage-index', index);
  });

  const motionSelector = [
    '.section-heading',
    '.hero-panel',
    '.service-card',
    '.delivery-card',
    '.market-grid span',
    '.project-card',
    '.story-card',
    '.sure-group > *',
    '.service-area .section-heading',
    '.career-copy',
    '.careers .button',
    '.contact-card',
    '.logo-cloud img'
  ].join(',');

  const motionItems = Array.from(document.querySelectorAll(motionSelector));
  motionItems.forEach((item, index) => {
    item.classList.add('scroll-motion-item');
    item.dataset.motionIndex = String(index);
  });

  let ticking = false;
  let previousY = window.scrollY;
  let viewportHeight = window.innerHeight;
  let documentHeight = Math.max(document.documentElement.scrollHeight - viewportHeight, 1);

  const clamp = (value, min = 0, max = 1) => Math.min(Math.max(value, min), max);

  const setMotionVariables = () => {
    ticking = false;

    if (reducedMotion.matches) {
      root.style.setProperty('--motion-scroll', '0');
      root.style.setProperty('--scroll-px', '0px');
      return;
    }

    const currentY = window.scrollY;
    const scrollProgress = clamp(currentY / documentHeight);
    const direction = currentY > previousY ? 'down' : currentY < previousY ? 'up' : root.dataset.scrollDirection || 'down';

    root.dataset.scrollDirection = direction;
    root.style.setProperty('--motion-scroll', scrollProgress.toFixed(4));
    root.style.setProperty('--scroll-px', `${currentY.toFixed(1)}px`);

    if (hero) {
      const heroRect = hero.getBoundingClientRect();
      const heroProgress = clamp((viewportHeight - heroRect.top) / (viewportHeight + heroRect.height));
      const parallaxY = (heroProgress - .5) * 82;
      const cardShift = (heroProgress - .42) * -34;
      const cardScale = 1 - Math.abs(heroProgress - .42) * .035;

      root.style.setProperty('--hero-parallax-y', `${parallaxY.toFixed(2)}px`);
      root.style.setProperty('--hero-card-y', `${cardShift.toFixed(2)}px`);
      root.style.setProperty('--hero-card-scale', clamp(cardScale, .965, 1).toFixed(4));
    }

    let activeSectionName = currentY < viewportHeight * .45 ? 'Overview' : '';
    let closestDistance = Number.POSITIVE_INFINITY;

    stageElements.forEach((section) => {
      const rect = section.getBoundingClientRect();
      const progress = clamp((viewportHeight - rect.top) / (viewportHeight + rect.height));
      const centerDistance = Math.abs((rect.top + rect.height / 2) - viewportHeight / 2);
      const presence = clamp(1 - centerDistance / Math.max(viewportHeight * .82, rect.height * .56));

      section.style.setProperty('--section-progress', progress.toFixed(4));
      section.style.setProperty('--section-presence', presence.toFixed(4));
      section.style.setProperty('--section-sweep', clamp(progress * 1.18).toFixed(4));

      if (centerDistance < closestDistance) {
        closestDistance = centerDistance;
        const sectionId = section.id;
        activeSectionName = sectionNames.get(sectionId) || section.querySelector('.eyebrow')?.textContent?.trim() || 'Overview';
      }
    });

    motionItems.forEach((item) => {
      if (item.classList.contains('project-extra') && !item.closest('.project-grid')?.classList.contains('is-expanded')) return;

      const rect = item.getBoundingClientRect();
      const itemCenter = rect.top + rect.height / 2;
      const distance = Math.abs(itemCenter - viewportHeight / 2);
      const presence = clamp(1 - distance / Math.max(viewportHeight * .78, 520));
      const entryProgress = clamp((viewportHeight - rect.top) / (viewportHeight + rect.height));
      const index = Number(item.dataset.motionIndex || 0);
      const side = index % 2 === 0 ? -1 : 1;
      const x = side * (1 - presence) * Math.min(34, viewportHeight * .035);
      const y = (1 - presence) * 58;
      const rotation = side * (1 - presence) * 1.65;
      const scale = .94 + presence * .06;

      item.style.setProperty('--motion-presence', presence.toFixed(4));
      item.style.setProperty('--motion-x', `${x.toFixed(2)}px`);
      item.style.setProperty('--motion-y', `${y.toFixed(2)}px`);
      item.style.setProperty('--motion-rotate', `${rotation.toFixed(3)}deg`);
      item.style.setProperty('--motion-scale', scale.toFixed(4));
      item.style.setProperty('--section-progress', entryProgress.toFixed(4));
      item.style.setProperty('--section-sweep', clamp(entryProgress * 1.22).toFixed(4));
    });

    if (hudLabel && activeSectionName) hudLabel.textContent = activeSectionName;

    previousY = currentY;
  };

  const requestMotionUpdate = () => {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(setMotionVariables);
  };

  const refreshMeasurements = () => {
    viewportHeight = window.innerHeight;
    documentHeight = Math.max(document.documentElement.scrollHeight - viewportHeight, 1);
    requestMotionUpdate();
  };

  window.addEventListener('scroll', requestMotionUpdate, { passive: true });
  window.addEventListener('resize', refreshMeasurements);
  window.addEventListener('load', refreshMeasurements, { once: true });
  reducedMotion.addEventListener?.('change', requestMotionUpdate);

  const resizeObserver = new ResizeObserver(refreshMeasurements);
  resizeObserver.observe(document.body);

  refreshMeasurements();
})();
