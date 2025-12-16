(() => {
  const prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const toastEl = document.querySelector('.toast');
  const dockBtns = Array.from(document.querySelectorAll('.dockBtn[data-target]'));
  const sections = Array.from(document.querySelectorAll('[data-section]'));

  function showToast(text) {
    if (!toastEl) return;
    toastEl.textContent = text;
    toastEl.hidden = false;
    window.clearTimeout(showToast._t);
    showToast._t = window.setTimeout(() => {
      toastEl.hidden = true;
    }, 1200);
  }

  function setActive(target) {
    dockBtns.forEach((btn) => {
      const isActive = btn.dataset.target === target;
      btn.setAttribute('aria-current', isActive ? 'true' : 'false');
    });
  }

  function scrollToTarget(target) {
    const el = document.getElementById(target);
    if (!el) {
      // special: home is the main element
      if (target === 'home') {
        window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
        return;
      }
      return;
    }

    el.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'start' });
  }

  dockBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.target;
      setActive(target);
      scrollToTarget(target);
      showToast(btn.getAttribute('aria-label') || '已跳转');
    });
  });

  // Also handle in-page links with data-nav
  document.addEventListener('click', (e) => {
    const a = e.target && e.target.closest ? e.target.closest('a[data-nav]') : null;
    if (!a) return;
    const target = a.getAttribute('data-nav');
    if (!target) return;
    const sectionId = target === 'home' ? 'home' : target;
    setActive(sectionId);
  });

  // Active section tracking
  const sectionById = new Map(sections.map((s) => [s.getAttribute('data-section'), s]));

  const observer = new IntersectionObserver(
    (entries) => {
      // Pick most visible section
      const visible = entries
        .filter((x) => x.isIntersecting)
        .sort((a, b) => (b.intersectionRatio || 0) - (a.intersectionRatio || 0));

      if (visible.length === 0) return;
      const top = visible[0].target;
      const id = top.getAttribute('data-section');
      if (!id) return;
      setActive(id);
    },
    {
      root: null,
      threshold: [0.18, 0.28, 0.38, 0.5, 0.62],
      rootMargin: '-20% 0px -55% 0px',
    }
  );

  sections.forEach((s) => observer.observe(s));

  // Reveal-on-scroll
  const revealEls = Array.from(document.querySelectorAll('.card, .sectionHead, .tItem, .poster, .heroCopy'));
  revealEls.forEach((el) => el.classList.add('reveal'));

  const revealObs = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-in');
        revealObs.unobserve(entry.target);
      });
    },
    { threshold: 0.12 }
  );

  if (!prefersReducedMotion) {
    revealEls.forEach((el) => revealObs.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add('is-in'));
  }

  // Initial active state
  setActive('home');

  // Keyboard: quick jump with 1-5
  document.addEventListener('keydown', (e) => {
    if (e.altKey || e.ctrlKey || e.metaKey) return;
    const map = {
      '1': 'home',
      '2': 'masters',
      '3': 'works',
      '4': 'timeline',
      '5': 'contact',
    };
    const target = map[e.key];
    if (!target) return;
    e.preventDefault();
    setActive(target);
    scrollToTarget(target);
    showToast(`跳转：${target}`);
  });

  // Improve focus outlines for keyboard users
  function handleFirstTab(e) {
    if (e.key !== 'Tab') return;
    document.body.classList.add('user-is-tabbing');
    window.removeEventListener('keydown', handleFirstTab);
  }
  window.addEventListener('keydown', handleFirstTab);
})();
