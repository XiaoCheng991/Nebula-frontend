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
  transformSysRoleToAdminRole,
  transformSysMenuToAdminMenu,
} from '@/lib/admin/types'
import {
  getCurrentAdminUser,
  getRolesByUserId,
  getAllRoles,
  getCurrentUserMenus,
} from '@/lib/api/modules/admin'

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

          // 3. 获取当前用户的菜单列表（仅当用户有管理员权限时）
          let userMenus: AdminMenu[] = []
          if (hasAdminAccess) {
            try {
              console.log('[AdminStore] 开始获取用户菜单...')
              const menusResponse = await getCurrentUserMenus()
              console.log('[AdminStore] 菜单API响应:', menusResponse)

              if (menusResponse.code === 200 && menusResponse.data) {
                userMenus = menusResponse.data.map(transformSysMenuToAdminMenu)
                console.log('[AdminStore] 转换后的菜单数据:', userMenus)
              } else {
                console.error('[AdminStore] 获取菜单失败:', menusResponse.message)
              }
            } catch (error) {
              console.error('[AdminStore] 获取菜单异常:', error)
              // 获取失败时清除持久化的菜单数据
              set({ menus: [] })
            }
          }

          set({
            user: adminUser,
            roles: userRoles,
            menus: userMenus,
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
      // 持久化用户、权限状态、菜单和管理员权限标志
      partialize: (state) => ({
        user: state.user,
        roles: state.roles,
        menus: state.menus,
        hasAdminAccess: state.hasAdminAccess,
      }),
      // 初始化时清除加载状态
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.isLoading = false
        }
      },
    }
  )
)
