/**
 * Dark-mode overrides for the @theme color tokens in index.css.
 *
 * These are applied with element.style.setProperty (inline style, highest
 * possible cascade priority) instead of a plain `.dark { --color-x: ... }`
 * CSS rule. Tailwind v4's build (Lightning CSS) silently drops any
 * hand-written rule that reassigns a name already declared inside
 * `@theme` — verified by inspecting the compiled stylesheet, where such a
 * rule never made it into the final CSS. Inline styles bypass that
 * pipeline entirely and are guaranteed to win over the @theme defaults.
 */
const DARK_OVERRIDES: Record<string, string> = {
  '--color-ink-50': '#0a0e14',
  '--color-ink-100': '#12161f',
  '--color-ink-200': '#232935',
  '--color-ink-300': '#333b4a',
  '--color-ink-400': '#7c8598',
  '--color-ink-500': '#98a1b3',
  '--color-ink-600': '#b3bbc9',
  '--color-ink-700': '#cbd2dd',
  '--color-ink-800': '#e2e6ec',
  '--color-ink-900': '#f4f6f8',
  '--color-ink-950': '#ffffff',
  '--color-primary-light': 'rgb(67 97 238 / 0.16)',
  '--color-secondary-light': 'rgb(247 37 133 / 0.16)',
  '--shadow-soft': '0 1px 2px 0 rgb(0 0 0 / 0.3), 0 1px 3px 0 rgb(0 0 0 / 0.35)',
  '--shadow-card': '0 0 0 1px rgb(255 255 255 / 0.04), 0 8px 24px -8px rgb(0 0 0 / 0.5)',
  '--shadow-lift': '0 0 0 1px rgb(255 255 255 / 0.06), 0 16px 40px -12px rgb(0 0 0 / 0.6)',
};

export function applyThemeTokens(dark: boolean): void {
  const root = document.documentElement;
  for (const [prop, value] of Object.entries(DARK_OVERRIDES)) {
    if (dark) root.style.setProperty(prop, value);
    else root.style.removeProperty(prop);
  }
}
