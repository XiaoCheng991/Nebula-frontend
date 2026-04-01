'use client'

import { useLanguage } from '@/hooks/useLanguage'
import { Globe } from 'lucide-react'

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage()

  const toggleLanguage = () => {
    setLanguage(language === 'zh' ? 'en' : 'zh')
  }

  return (
    <button
      onClick={toggleLanguage}
      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium transition-all duration-300 hover:bg-white/10 dark:hover:bg-white/5 group"
      title="Switch Language"
    >
      <Globe className="h-4 w-4 text-slate-500 dark:text-slate-400 group-hover:scale-110 transition-transform" />
      <span className="text-slate-600 dark:text-slate-300 font-medium">
        {language === 'zh' ? 'EN' : '中'}
      </span>
    </button>
  )
}
