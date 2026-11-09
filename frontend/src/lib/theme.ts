/**
 * Light / dark mode.
 *
 * The choice is kept in localStorage and applied by `modeInitScript` before
 * the first paint, so a returning visitor never sees light flash first.
 * Dark mode itself is pure CSS: globals.css under [data-mode='dark'].
 */

export type Mode = 'light' | 'dark';
export const MODE_STORAGE_KEY = 'pakfix-mode';
const MODE_EVENT = 'pakfix-mode-change';

function setModeAttribute(mode: Mode) {
  const root = document.documentElement;
  if (mode === 'dark') root.dataset.mode = 'dark';
  else delete root.dataset.mode;
}

export function applyMode(mode: Mode): void {
  setModeAttribute(mode);
  try {
    localStorage.setItem(MODE_STORAGE_KEY, mode);
  } catch {
    // Private mode: still applies for this visit.
  }
  window.dispatchEvent(new Event(MODE_EVENT));
}

export function subscribeMode(onChange: () => void): () => void {
  function onStorage(event: StorageEvent) {
    if (event.key !== MODE_STORAGE_KEY) return;
    setModeAttribute(event.newValue === 'dark' ? 'dark' : 'light');
    onChange();
  }
  window.addEventListener(MODE_EVENT, onChange);
  window.addEventListener('storage', onStorage);
  return () => {
    window.removeEventListener(MODE_EVENT, onChange);
    window.removeEventListener('storage', onStorage);
  };
}

export function getModeSnapshot(): Mode {
  return document.documentElement.dataset.mode === 'dark' ? 'dark' : 'light';
}

export function getServerModeSnapshot(): Mode {
  return 'light';
}

/** Inline, pre-paint: apply the saved mode. ?mode=dark previews it. */
export function modeInitScript(): string {
  return (
    '(function(){try{' +
    "var mq=/[?&]mode=(light|dark)/.exec(location.search);" +
    `var m=mq?mq[1]:localStorage.getItem('${MODE_STORAGE_KEY}');` +
    `if(mq){try{localStorage.setItem('${MODE_STORAGE_KEY}',m);}catch(_){}}` +
    "if(m==='dark'){document.documentElement.dataset.mode='dark';}" +
    // Visitors who picked Midnight or Clay before those were retired.
    "localStorage.removeItem('pakfix-theme');" +
    '}catch(_){}})();'
  );
}
