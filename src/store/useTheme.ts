import { create } from 'zustand';

type ThemeMode = 'light' | 'dark';

interface ThemeState {
  mode: ThemeMode;
  toggle: () => void;
}

const saved = localStorage.getItem('theme') as ThemeMode | null;
const initial: ThemeMode = saved === 'dark' ? 'dark' : 'light';
document.documentElement.setAttribute('data-theme', initial);

export const useTheme = create<ThemeState>((set) => ({
  mode: initial,
  toggle: () =>
    set((state) => {
      const next = state.mode === 'light' ? 'dark' : 'light';
      localStorage.setItem('theme', next);
      document.documentElement.setAttribute('data-theme', next);
      return { mode: next };
    }),
}));
