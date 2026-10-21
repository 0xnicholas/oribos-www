const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), summary, [tabindex]:not([tabindex="-1"])';

const header = document.querySelector<HTMLElement>('[data-site-header]');

if (header) {
  const menus = [...header.querySelectorAll<HTMLButtonElement>('[data-menu-trigger]')].map(
    (trigger) => ({
      trigger,
      panel: document.getElementById(trigger.getAttribute('aria-controls') ?? ''),
    }),
  );
  const menuButton = header.querySelector<HTMLButtonElement>('[data-menu-button]');
  const drawer = header.querySelector<HTMLElement>('[data-mobile-drawer]');

  const closeMenus = (): void => {
    for (const { trigger, panel } of menus) {
      trigger.setAttribute('aria-expanded', 'false');
      if (panel) panel.hidden = true;
    }
  };

  for (const { trigger, panel } of menus) {
    trigger.addEventListener('click', () => {
      const isOpen = trigger.getAttribute('aria-expanded') === 'true';
      closeMenus();

      if (!isOpen && panel) {
        trigger.setAttribute('aria-expanded', 'true');
        panel.hidden = false;
      }
    });
  }

  const drawerFocusables = (): HTMLElement[] => {
    if (!drawer) return [];
    return [...drawer.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)].filter(
      (element) => element.offsetParent !== null,
    );
  };

  let previousOverflow = '';

  const openDrawer = (): void => {
    if (!drawer || !menuButton) return;

    closeMenus();
    previousOverflow = document.body.style.overflow;
    drawer.hidden = false;
    menuButton.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
    drawerFocusables()[0]?.focus();
  };

  const closeDrawer = (returnFocus = true): void => {
    if (!drawer || !menuButton) return;

    drawer.hidden = true;
    menuButton.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = previousOverflow;
    if (returnFocus) menuButton.focus();
  };

  menuButton?.addEventListener('click', () => {
    if (drawer?.hidden) openDrawer();
    else closeDrawer();
  });

  drawer?.addEventListener('keydown', (event) => {
    if (event.key !== 'Tab') return;

    const focusables = drawerFocusables();
    if (focusables.length === 0) return;

    const first = focusables[0];
    const last = focusables[focusables.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });

  document.addEventListener('pointerdown', (event) => {
    if (!(event.target instanceof Node)) return;

    if (drawer && !drawer.hidden) {
      if (!drawer.contains(event.target) && !menuButton?.contains(event.target)) closeDrawer();
      return;
    }

    for (const { trigger, panel } of menus) {
      if (trigger.getAttribute('aria-expanded') !== 'true') continue;
      if (trigger.contains(event.target) || panel?.contains(event.target)) continue;
      closeMenus();
      break;
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;

    if (drawer && !drawer.hidden) {
      event.preventDefault();
      closeDrawer();
      return;
    }

    const open = menus.find(({ trigger }) => trigger.getAttribute('aria-expanded') === 'true');
    if (open) {
      event.preventDefault();
      closeMenus();
      open.trigger.focus();
    }
  });

  const desktop = matchMedia('(min-width: 1024px)');
  desktop.addEventListener('change', (event) => {
    if (event.matches && drawer && !drawer.hidden) closeDrawer(false);
  });
}
