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
  transformSysUserToAdminUser,
} from '@/lib/admin/types'
import {
  getCurrentAdminUser,
  getRolesByUserId,
  getAllRoles,
} from '@/lib/api/modules/admin'
import { transformSysRoleToAdminRole } from '@/lib/admin/types'

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
          // 1. 获取当前后台用户信息
          const userResponse = await getCurrentAdminUser()
          if (userResponse.code !== 200 || !userResponse.data) {
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

          const adminUser = transformSysUserToAdminUser(userResponse.data)

          // 2. 获取用户的角色列表
          let userRoles: AdminRole[] = []
          let hasAdminAccess = false
          try {
            const rolesResponse = await getRolesByUserId(adminUser.id)
            if (rolesResponse.code === 200 && rolesResponse.data) {
              userRoles = rolesResponse.data.map(transformSysRoleToAdminRole)
              // 检查是否有管理员角色（roleCode 包含 'admin' 或 'super_admin'）
              hasAdminAccess = userRoles.some(role =>
                role.code.toLowerCase().includes('admin') ||
                role.code.toLowerCase().includes('super_admin')
              )
            }
          } catch (error) {
            console.warn('Failed to load user roles:', error)
          }

          set({
            user: adminUser,
            roles: userRoles,
            hasAdminAccess,
            isLoading: false,
          })
        } catch (error) {
          console.error('Failed to load admin data:', error)
          set({
            user: null,
            roles: [],
            permissions: [],
            menus: [],
            hasAdminAccess: false,
            isLoading: false,
          })
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
      // 不持久化任何数据，每次都从后端重新加载
      partialize: () => ({}),
      // 初始化时清除旧数据
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.hasAdminAccess = false
        }
      },
    }
  )
)
