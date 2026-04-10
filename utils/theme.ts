export type Theme = 'light' | 'dark' | 'solarized-light' | 'solarized-dark' | 'dracula' | 'nord';

export const THEMES: Theme[] = ['light', 'dark', 'solarized-light', 'solarized-dark', 'dracula', 'nord'];

export function getThemeClass(theme: Theme) {
  if (theme === 'light') return '';
  return `theme-${theme}`;
}
