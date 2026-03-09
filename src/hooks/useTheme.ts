import { useEffect } from 'react'
import { create } from 'zustand'

export type Theme = 'light' | 'dark' | 'system'

const THEME_STORAGE_KEY = 'theme'

interface ThemeState {
  theme: Theme
  setTheme: (theme: Theme) => void
}

// 从 localStorage 读取主题
const getStoredTheme = (): Theme => {
  if (typeof window === 'undefined') return 'system'
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY)
    if (stored === 'light' || stored === 'dark' || stored === 'system') {
      return stored
    }
  } catch {
    // ignore
  }
  return 'system'
}

export const useThemeStore = create<ThemeState>((set) => {
  // 初始化时从 localStorage 读取
  const initialTheme = typeof window !== 'undefined' ? getStoredTheme() : 'system'

  return {
    theme: initialTheme,
    setTheme: (theme) => {
      set({ theme })
      try {
        localStorage.setItem(THEME_STORAGE_KEY, theme)
      } catch {
        // ignore
      }
    },
  }
})

export function useThemeEffect() {
  const { theme } = useThemeStore()

  useEffect(() => {
    const root = window.document.documentElement
    const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    let applied: Theme = theme
    if (theme === 'system') {
      applied = systemDark ? 'dark' : 'light'
    }
    if (applied === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
  }, [theme])

  useEffect(() => {
    if (theme !== 'system') return
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = () => {
      useThemeStore.setState({ theme: 'system' })
    }
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [theme])
}
