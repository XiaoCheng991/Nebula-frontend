import { useEffect } from 'react'
import { create } from 'zustand'

export type Theme = 'light' | 'dark' | 'system'

interface ThemeState {
  theme: Theme
  setTheme: (theme: Theme) => void
}

export const useThemeStore = create<ThemeState>((set) => ({
  theme: 'system',
  setTheme: (theme) => set({ theme }),
}))

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
