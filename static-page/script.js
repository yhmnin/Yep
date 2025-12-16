(() => {
  const root = document.documentElement;
  const toggle = document.getElementById('themeToggle');
  const themeLabel = document.getElementById('themeLabel');
  const year = document.getElementById('year');
  const toast = document.getElementById('toast');
  const toastBtn = document.getElementById('toastBtn');
  const timeBadge = document.getElementById('timeBadge');
  const form = document.getElementById('contactForm');

  const STORAGE_KEY = 'static-page-theme'; // 'light' | 'dark' | ''

  function getSystemTheme() {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  }

  function getSavedTheme() {
    try {
      return localStorage.getItem(STORAGE_KEY) || '';
    } catch {
      return '';
    }
  }

  function setSavedTheme(value) {
    try {
      if (!value) localStorage.removeItem(STORAGE_KEY);
      else localStorage.setItem(STORAGE_KEY, value);
    } catch {
      // ignore
    }
  }

  function applyTheme(theme) {
    if (theme === 'light') {
      root.dataset.theme = 'light';
      toggle?.setAttribute('aria-pressed', 'true');
      if (themeLabel) themeLabel.textContent = '浅色';
      return;
    }

    if (theme === 'dark') {
      delete root.dataset.theme;
      toggle?.setAttribute('aria-pressed', 'false');
      if (themeLabel) themeLabel.textContent = '深色';
      return;
    }

    // follow system
    const sys = getSystemTheme();
    if (sys === 'light') root.dataset.theme = 'light';
    else delete root.dataset.theme;
    toggle?.setAttribute('aria-pressed', String(sys === 'light'));
    if (themeLabel) themeLabel.textContent = '跟随系统';
  }

  function showToast(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.hidden = false;
    window.clearTimeout(showToast._t);
    showToast._t = window.setTimeout(() => {
      toast.hidden = true;
    }, 1600);
  }

  function pad2(n) {
    return String(n).padStart(2, '0');
  }

  function updateTimeBadge() {
    if (!timeBadge) return;
    const d = new Date();
    timeBadge.textContent = `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
  }

  // init year
  if (year) year.textContent = String(new Date().getFullYear());

  // init theme
  const saved = getSavedTheme();
  applyTheme(saved);

  toggle?.addEventListener('click', () => {
    const current = getSavedTheme() || 'system';
    // cycle: system -> light -> dark -> system
    const next = current === 'system' ? 'light' : current === 'light' ? 'dark' : 'system';
    if (next === 'system') setSavedTheme('');
    else setSavedTheme(next);

    applyTheme(getSavedTheme());
    showToast(next === 'system' ? '已切换：跟随系统' : `已切换：${next === 'light' ? '浅色' : '深色'}`);
  });

  // smooth scroll improvement for older browsers
  document.addEventListener('click', (e) => {
    const a = e.target && e.target.closest ? e.target.closest('a[href^="#"]') : null;
    if (!a) return;
    const id = a.getAttribute('href');
    if (!id || id === '#') return;
    const el = document.querySelector(id);
    if (!el) return;
    e.preventDefault();
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    history.pushState(null, '', id);
  });

  // demo toast
  toastBtn?.addEventListener('click', () => showToast('你好！这是一个示例提示。'));

  // time badge
  updateTimeBadge();
  window.setInterval(updateTimeBadge, 30_000);

  // form validation
  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    const fd = new FormData(form);

    const name = String(fd.get('name') || '').trim();
    const email = String(fd.get('email') || '').trim();
    const message = String(fd.get('message') || '').trim();

    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    if (name.length < 2) return showToast('请填写至少 2 个字符的称呼。');
    if (!emailOk) return showToast('请填写正确的邮箱地址。');
    if (message.length < 5) return showToast('留言至少 5 个字符。');

    showToast('已通过校验（示例：未实际提交）。');
    form.reset();
  });
})();
