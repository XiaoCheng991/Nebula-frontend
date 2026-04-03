import { useState, useEffect } from 'react'
import { getSystemConfig, updateSystemConfig } from '@/lib/api/modules/admin'

export function useSystemConfig(key: string) {
  const [value, setValue] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    getSystemConfig(key).then(({ data, error }) => {
      if (!cancelled) {
        if (!error && data) {
          setValue(data.config_value)
        }
        setLoading(false)
      }
    }).catch(() => {
      if (!cancelled) setLoading(false)
    })
    return () => { cancelled = true }
  }, [key])

  const update = async (newValue: string) => {
    const { success, error } = await updateSystemConfig(key, newValue)
    if (success) {
      setValue(newValue)
    } else {
      console.error('更新配置失败:', error)
    }
    return success
  }

  return { value, loading, update }
}
