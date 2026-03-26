// src/hooks/useAdminStore.ts

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
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
      // 角色获取失败
     }

     // 3. 获取当前用户的菜单列表（仅当用户有管理员权限时）
     let userMenus: AdminMenu[] = []
     if (hasAdminAccess) {
      try {
       const menusResponse = await getCurrentUserMenus()

       if (menusResponse.code === 200 && menusResponse.data) {
        userMenus = menusResponse.data.map(transformSysMenuToAdminMenu)
       } else {
        // 菜单获取失败
       }
      } catch (error) {
       // 菜单获取失败时清除持久化的菜单数据
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
    // 同时清除 sessionStorage
    if (typeof window !== 'undefined') {
     sessionStorage.removeItem('admin-storage')
    }
   },
  }),
  {
   name: 'admin-storage',
   // 改用 sessionStorage 而不是 localStorage，减少敏感数据的持久化风险
   // sessionStorage 在浏览器关闭后会自动清除，降低 XSS 攻击窃取敏感数据的风险
   storage: createJSONStorage(() => sessionStorage),
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
