export interface ThemeColors {
  fg: string;
  bg: string;
  headerBg: string;
  footerBg: string;
  borderColor: string;
  scrollbarFg: string;
  scrollbarBg: string;
}

export interface Theme {
  name: string;
  colors: ThemeColors;
}

export class ThemeManager {
  private themes: Map<string, Theme>;
  private currentTheme: string;

  constructor() {
    this.themes = new Map();
    this.currentTheme = 'default';
    this.initializeThemes();
  }

  private initializeThemes(): void {
    this.themes.set('default', {
      name: 'default',
      colors: {
        fg: 'white',
        bg: 'black',
        headerBg: 'blue',
        footerBg: 'blue',
        borderColor: 'cyan',
        scrollbarFg: 'cyan',
        scrollbarBg: 'black',
      },
    });

    this.themes.set('dark', {
      name: 'dark',
      colors: {
        fg: 'white',
        bg: '#1a1a1a',
        headerBg: '#2d2d2d',
        footerBg: '#2d2d2d',
        borderColor: '#4a4a4a',
        scrollbarFg: '#6a6a6a',
        scrollbarBg: '#1a1a1a',
      },
    });

    this.themes.set('dracula', {
      name: 'dracula',
      colors: {
        fg: '#f8f8f2',
        bg: '#282a36',
        headerBg: '#44475a',
        footerBg: '#44475a',
        borderColor: '#bd93f9',
        scrollbarFg: '#bd93f9',
        scrollbarBg: '#282a36',
      },
    });

    this.themes.set('nord', {
      name: 'nord',
      colors: {
        fg: '#d8dee9',
        bg: '#2e3440',
        headerBg: '#3b4252',
        footerBg: '#3b4252',
        borderColor: '#88c0d0',
        scrollbarFg: '#88c0d0',
        scrollbarBg: '#2e3440',
      },
    });

    this.themes.set('tokyonight', {
      name: 'tokyonight',
      colors: {
        fg: '#c0caf0',
        bg: '#1a1b26',
        headerBg: '#24283b',
        footerBg: '#24283b',
        borderColor: '#7aa2f7',
        scrollbarFg: '#7aa2f7',
        scrollbarBg: '#1a1b26',
      },
    });
  }

  public setTheme(themeName: string): boolean {
    if (this.themes.has(themeName)) {
      this.currentTheme = themeName;
      return true;
    }
    return false;
  }

  public getCurrentTheme(): Theme {
    return this.themes.get(this.currentTheme) || this.themes.get('default')!;
  }

  public getAvailableThemes(): string[] {
    return Array.from(this.themes.keys());
  }

  public cycleTheme(): void {
    const themes = this.getAvailableThemes();
    const currentIndex = themes.indexOf(this.currentTheme);
    const nextIndex = (currentIndex + 1) % themes.length;
    this.setTheme(themes[nextIndex]);
  }
}
