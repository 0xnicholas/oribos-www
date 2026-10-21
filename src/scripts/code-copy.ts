const buttons = document.querySelectorAll<HTMLButtonElement>('[data-copy-code]');

for (const button of buttons) {
  const container = button.closest<HTMLElement>('[data-code-block]');
  const code = container?.querySelector<HTMLElement>('pre code');
  const label = button.querySelector<HTMLElement>('[data-copy-label]');
  const status = container?.querySelector<HTMLElement>('[data-copy-status]');

  if (!code) continue;

  let resetTimer: number | undefined;

  button.addEventListener('click', () => {
    const clipboard = navigator.clipboard;

    if (!clipboard) {
      if (status) status.textContent = 'Could not copy code';
      return;
    }

    void clipboard
      .writeText(code.textContent ?? '')
      .then(() => {
        if (label) label.textContent = 'Copied';
        if (status) status.textContent = 'Code copied to clipboard';
        window.clearTimeout(resetTimer);
        resetTimer = window.setTimeout(() => {
          if (label) label.textContent = 'Copy';
          if (status) status.textContent = '';
        }, 1200);
      })
      .catch(() => {
        if (status) status.textContent = 'Could not copy code';
      });
  });
}
