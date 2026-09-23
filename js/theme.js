(() => {
  const root = document.documentElement;
  const body = document.body;
  const header = document.querySelector('.site-header');
  const themeButton = document.querySelector('[data-theme-toggle]');
  const navButton = document.querySelector('[data-nav-toggle]');
  const commandButton = document.querySelector('[data-command-toggle]');
  const commandPanel = document.querySelector('[data-command-panel]');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const setTheme = (theme) => {
    root.dataset.theme = theme;
    if (themeButton) {
      const light = theme === 'light';
      themeButton.textContent = light ? '深色' : '浅色';
      themeButton.setAttribute('aria-label', light ? '切换至深色主题' : '切换至浅色主题');
    }
  };

  setTheme(window.localStorage.getItem('zcl-notes-theme') || 'dark');
  themeButton?.addEventListener('click', () => {
    const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    window.localStorage.setItem('zcl-notes-theme', next);
  });

  if (header && navButton) {
    header.dataset.enhanced = 'true';
    navButton.addEventListener('click', () => {
      const open = header.dataset.navOpen !== 'true';
      header.dataset.navOpen = String(open);
      navButton.setAttribute('aria-expanded', String(open));
    });
  }

  const setCommandOpen = (open) => {
    if (!commandPanel || !commandButton) return;
    commandPanel.hidden = !open;
    commandButton.setAttribute('aria-expanded', String(open));
    if (open) commandPanel.querySelector('a')?.focus();
  };

  commandButton?.addEventListener('click', () => setCommandOpen(commandPanel?.hidden));
  document.addEventListener('keydown', (event) => {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
      event.preventDefault();
      setCommandOpen(commandPanel?.hidden);
    }
    if (event.key === 'Escape') setCommandOpen(false);
  });

  if (!reduceMotion && window.matchMedia('(pointer: fine)').matches && document.querySelector('[data-cursor-snake]')) {
    let frame = 0;
    window.addEventListener('pointermove', ({ clientX, clientY }) => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        root.style.setProperty('--pointer-x', clientX + 'px');
        root.style.setProperty('--pointer-y', clientY + 'px');
        body.dataset.cursorSnake = 'true';
      });
    }, { passive: true });
    window.addEventListener('blur', () => { body.dataset.cursorSnake = 'false'; });
  }

  if (!reduceMotion && 'IntersectionObserver' in window) {
    root.dataset.reveal = 'true';
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-revealed');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    document.querySelectorAll('[data-reveal]').forEach((element) => observer.observe(element));
  }

  document.querySelectorAll('.article-content pre').forEach((block) => {
    const button = document.createElement('button');
    button.className = 'code-copy';
    button.type = 'button';
    button.textContent = '复制';
    button.setAttribute('aria-label', '复制代码');
    button.addEventListener('click', async () => {
      if (!navigator.clipboard) return;
      await navigator.clipboard.writeText(block.innerText);
      button.textContent = '已复制';
      window.setTimeout(() => { button.textContent = '复制'; }, 1600);
    });
    block.append(button);
  });
})();
