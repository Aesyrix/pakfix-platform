/**
 * Colour themes.
 *
 * A theme is a set of token values in globals.css under
 * `[data-theme='<id>']`; the default has no attribute at all. The choice is
 * kept in localStorage and applied by `themeInitScript` before the first
 * paint, so a returning visitor never sees the default flash first.
 */

export const THEMES = [
  {
    id: 'emerald',
    name: 'Emerald',
    nameUr: 'زمرد',
    description: 'Fresh green, the PakFix default',
    descriptionUr: 'تازہ سبز، پاک فکس کا بنیادی انداز',
    swatch: ['#0A7A48', '#4ADE80', '#2F5BEA'],
  },
  {
    id: 'midnight',
    name: 'Midnight',
    nameUr: 'آدھی رات',
    description: 'Deep navy with gold',
    descriptionUr: 'گہرا نیلا اور سنہری',
    swatch: ['#213F8F', '#F2C14E', '#131826'],
  },
  {
    id: 'clay',
    name: 'Clay',
    nameUr: 'مٹی',
    description: 'Warm terracotta with teal',
    descriptionUr: 'گرم ٹیراکوٹا اور فیروزی',
    swatch: ['#B0432A', '#F4A582', '#187A75'],
  },
] as const;

export type ThemeId = (typeof THEMES)[number]['id'];

export const DEFAULT_THEME: ThemeId = 'emerald';
export const THEME_STORAGE_KEY = 'pakfix-theme';

export function isThemeId(value: unknown): value is ThemeId {
  return THEMES.some((theme) => theme.id === value);
}

const THEME_EVENT = 'pakfix-theme-change';

/** Applies and remembers a theme. The default is the absence of the attribute. */
export function applyTheme(id: ThemeId): void {
  const root = document.documentElement;
  if (id === DEFAULT_THEME) {
    delete root.dataset.theme;
  } else {
    root.dataset.theme = id;
  }
  try {
    localStorage.setItem(THEME_STORAGE_KEY, id);
  } catch {
    // Private mode: the theme still applies for this visit.
  }
  window.dispatchEvent(new Event(THEME_EVENT));
}

/** useSyncExternalStore wiring, so every switcher on the page agrees. */
export function subscribeTheme(onChange: () => void): () => void {
  function onStorage(event: StorageEvent) {
    if (event.key !== THEME_STORAGE_KEY) return;
    // Another tab changed it: follow along.
    const next = isThemeId(event.newValue) ? event.newValue : DEFAULT_THEME;
    const root = document.documentElement;
    if (next === DEFAULT_THEME) delete root.dataset.theme;
    else root.dataset.theme = next;
    onChange();
  }
  window.addEventListener(THEME_EVENT, onChange);
  window.addEventListener('storage', onStorage);
  return () => {
    window.removeEventListener(THEME_EVENT, onChange);
    window.removeEventListener('storage', onStorage);
  };
}

export function getThemeSnapshot(): ThemeId {
  const value = document.documentElement.dataset.theme;
  return isThemeId(value) ? value : DEFAULT_THEME;
}

export function getServerThemeSnapshot(): ThemeId {
  return DEFAULT_THEME;
}

// ---- Light / dark mode -------------------------------------------------

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

/** Inline, pre-paint: read the saved theme and mode and set them on <html>. */
export function themeInitScript(): string {
  const ids = JSON.stringify(THEMES.map((theme) => theme.id).filter((id) => id !== DEFAULT_THEME));
  return (
    '(function(){try{' +
    // ?theme=<id> previews (and remembers) a theme, handy for sharing a look.
    "var q=/[?&]theme=([a-z]+)/.exec(location.search);" +
    `var t=q?q[1]:localStorage.getItem('${THEME_STORAGE_KEY}');` +
    `if(q){try{localStorage.setItem('${THEME_STORAGE_KEY}',t);}catch(_){}}` +
    `if(${ids}.indexOf(t)>-1){document.documentElement.dataset.theme=t;}` +
    // Mode: ?mode=dark previews; otherwise the saved choice. Light by default.
    "var mq=/[?&]mode=(light|dark)/.exec(location.search);" +
    `var m=mq?mq[1]:localStorage.getItem('${MODE_STORAGE_KEY}');` +
    `if(mq){try{localStorage.setItem('${MODE_STORAGE_KEY}',m);}catch(_){}}` +
    "if(m==='dark'){document.documentElement.dataset.mode='dark';}" +
    '}catch(_){}})();'
  );
}
