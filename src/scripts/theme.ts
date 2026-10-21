const STORAGE_KEY = 'oribos-theme';

type Theme = 'light' | 'dark';

function currentTheme(): Theme {
  return document.documentElement.dataset.theme === 'light' ? 'light' : 'dark';
}

function syncToggles(theme: Theme): void {
  const isDark = theme === 'dark';

  for (const toggle of document.querySelectorAll<HTMLButtonElement>('[data-theme-toggle]')) {
    toggle.setAttribute('aria-checked', String(isDark));
  }
}

function syncThemeColor(): void {
  const meta = document.querySelector<HTMLMetaElement>('meta[data-theme-color]');
  if (!meta) return;

  const surface = getComputedStyle(document.documentElement).getPropertyValue('--surface-0');
  if (surface) meta.content = surface.trim();
}

function applyTheme(theme: Theme, persist: boolean): void {
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;

  if (persist) {
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      // Storage can be unavailable; the document theme still changes for this page.
    }
  }

  syncToggles(theme);
  syncThemeColor();
}

for (const toggle of document.querySelectorAll<HTMLButtonElement>('[data-theme-toggle]')) {
  toggle.addEventListener('click', () => {
    applyTheme(currentTheme() === 'dark' ? 'light' : 'dark', true);
  });
}

window.addEventListener('storage', (event) => {
  if (event.key === STORAGE_KEY && (event.newValue === 'light' || event.newValue === 'dark')) {
    applyTheme(event.newValue, false);
  }
});

syncToggles(currentTheme());
syncThemeColor();
