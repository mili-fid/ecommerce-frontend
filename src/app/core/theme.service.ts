import { Injectable } from '@angular/core';

/**
 * Dark mode (spec 5.4).
 * - Tailwind: a `dark` class on <html> activates all dark: utilities
 *   (declared via @custom-variant in styles.css)
 * - Angular Material: setting color-scheme on <html> switches the whole
 *   Material theme to its dark variant (Material v19+ prebuilt themes
 *   are light-dark adaptive)
 * The preference is saved in localStorage so it survives browser restarts.
 */
@Injectable({ providedIn: 'root' })
export class ThemeService {
  isDark = false;

  init() {
    this.apply(localStorage.getItem('theme') === 'dark');
  }

  toggle() {
    this.apply(!this.isDark);
  }

  private apply(dark: boolean) {
    this.isDark = dark;
    const root = document.documentElement;
    root.classList.toggle('dark', dark);
    root.style.colorScheme = dark ? 'dark' : 'light';
    localStorage.setItem('theme', dark ? 'dark' : 'light');
  }
}
