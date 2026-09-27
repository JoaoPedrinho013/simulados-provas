function initBackToTop() {
  const btn = document.createElement('button');
  btn.id = 'back-to-top';
  btn.className = 'back-to-top-btn';
  btn.type = 'button';
  btn.title = 'Voltar ao topo';
  btn.setAttribute('aria-label', 'Voltar ao topo');
  btn.textContent = '↑';
  document.body.appendChild(btn);

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  window.addEventListener('scroll', () => {
    if (window.scrollY > 300) {
      btn.classList.add('visible');
    } else {
      btn.classList.remove('visible');
    }
  });
}

function initThemeToggle() {
  const btn = document.getElementById('theme-toggle');
  if (!btn) return;

  function currentTheme() {
    return document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
  }

  function syncIcon() {
    btn.textContent = currentTheme() === 'dark' ? '☀️' : '🌙';
  }

  syncIcon();

  btn.addEventListener('click', () => {
    const next = currentTheme() === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    try { localStorage.setItem('theme', next); } catch (e) {}
    syncIcon();
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initBackToTop();
  initThemeToggle();
});
