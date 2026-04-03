import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { supabase, isSupabaseAvailable } from '@/lib/supabase/client'
import { checkHasAdminAccess, useAdminStore } from '@/hooks/useAdminStore'
import { getSystemConfig } from '@/lib/api/modules/admin'

interface AppPermissionState {
  hasAdminAccess: boolean
  blogWritePerm: string | null
  memoWritePerm: string | null
  permissionsLoaded: boolean
  refreshPermissions: () => Promise<void>
}

export const useAppStore = create<AppPermissionState>()(
  persist(
    (set, get) => ({
      hasAdminAccess: false,
      blogWritePerm: null,
      memoWritePerm: null,
      permissionsLoaded: false,

      refreshPermissions: async () => {
        if (!isSupabaseAvailable()) {
          set({ permissionsLoaded: true })
          return
        }

        const [adminResult, blogResult, memoResult] = await Promise.allSettled([
          checkHasAdminAccess(),
          getSystemConfig('blog_write_permission'),
          getSystemConfig('memo_write_permission'),
        ])

        if (adminResult.status === 'fulfilled') {
          set({ hasAdminAccess: adminResult.value })
          useAdminStore.getState().setHasAdminAccess(adminResult.value)
        }

        if (blogResult.status === 'fulfilled' && blogResult.value.data) {
          set({ blogWritePerm: blogResult.value.data.config_value })
        }

        if (memoResult.status === 'fulfilled' && memoResult.value.data) {
          set({ memoWritePerm: memoResult.value.data.config_value })
        }

        set({ permissionsLoaded: true })
      },
    }),
    {
      name: 'app-permissions',
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        hasAdminAccess: state.hasAdminAccess,
        blogWritePerm: state.blogWritePerm,
        memoWritePerm: state.memoWritePerm,
        permissionsLoaded: state.permissionsLoaded,
      }) as {
        hasAdminAccess: boolean
        blogWritePerm: string | null
        memoWritePerm: string | null
        permissionsLoaded: boolean
      },
    }
  )
)

/**
 * 统一的权限 Hook
 * 返回当前权限状态和是否需要等待
 */
export function usePagePermission() {
  const hasAdminAccess = useAppStore((state) => state.hasAdminAccess)
  const blogWritePerm = useAppStore((state) => state.blogWritePerm)
  const memoWritePerm = useAppStore((state) => state.memoWritePerm)
  const permissionsLoaded = useAppStore((state) => state.permissionsLoaded)

  return {
    hasAdminAccess,
    blogWritePerm,
    memoWritePerm,
    loading: !permissionsLoaded,
  }
}
