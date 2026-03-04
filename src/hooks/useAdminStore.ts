// src/hooks/useAdminStore.ts

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import {
  AdminState,
  AdminUser,
  AdminRole,
  AdminPermission,
  AdminMenu,
  Dictionary,
} from '@/lib/admin/types'
import {
  getCurrentUser,
  getUserRoles,
  getUserPermissions,
  getUserMenus,
  mockDictionaries,
} from '@/lib/admin/mock-data'

export const useAdminStore = create<AdminState>()(
  persist(
    (set, get) => ({
      // 初始状态
      user: null,
      roles: [],
      permissions: [],
      menus: [],
      dictionaries: [],
      isLoading: false,
      hasAdminAccess: false,

      // Actions
      setUser: (user: AdminUser | null) => set({ user }),
      setRoles: (roles: AdminRole[]) => set({ roles }),
      setPermissions: (permissions: AdminPermission[]) => set({ permissions }),
      setMenus: (menus: AdminMenu[]) => set({ menus }),
      setDictionaries: (dictionaries: Dictionary[]) => set({ dictionaries }),
      setLoading: (isLoading: boolean) => set({ isLoading }),
      setHasAdminAccess: (hasAdminAccess: boolean) => set({ hasAdminAccess }),

      loadAdminData: async () => {
        set({ isLoading: true })
        try {
          // 使用 mock 数据
          const user = getCurrentUser()
          if (!user) {
            set({
              user: null,
              roles: [],
              permissions: [],
              menus: [],
              hasAdminAccess: false,
              isLoading: false,
            })
            return
          }

          // 检查用户是否有 admin 角色
          const roles = getUserRoles(user.id)
          const hasAdminAccess = roles.length > 0

          set({
            user,
            roles,
            permissions: getUserPermissions(user.id),
            menus: getUserMenus(user.id),
            dictionaries: mockDictionaries,
            hasAdminAccess,
            isLoading: false,
          })
        } catch (error) {
          console.error('Failed to load admin data:', error)
          set({ isLoading: false, hasAdminAccess: false })
        }
      },

      clearAdminData: () => {
        set({
          user: null,
          roles: [],
          permissions: [],
          menus: [],
          dictionaries: [],
          hasAdminAccess: false,
        })
      },
    }),
    {
      name: 'admin-storage',
      partialize: (state) => ({
        user: state.user,
        roles: state.roles,
        permissions: state.permissions,
        menus: state.menus,
        dictionaries: state.dictionaries,
        hasAdminAccess: state.hasAdminAccess,
      }),
    }
  )
)
