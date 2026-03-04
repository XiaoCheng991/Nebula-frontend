// src/hooks/usePermission.ts

import { useAdminStore } from './useAdminStore'

export function usePermission() {
  const { permissions, roles, hasAdminAccess } = useAdminStore()

  // 检查是否有某个权限
  const hasPermission = (permissionCode: string): boolean => {
    if (!hasAdminAccess) return false

    // 超级管理员权限
    if (permissions.some(p => p.code === '*')) return true

    return permissions.some(p => p.code === permissionCode)
  }

  // 检查是否有任意一个权限
  const hasAnyPermission = (permissionCodes: string[]): boolean => {
    if (!hasAdminAccess) return false
    if (permissionCodes.length === 0) return true
    return permissionCodes.some(code => hasPermission(code))
  }

  // 检查是否有所有权限
  const hasAllPermissions = (permissionCodes: string[]): boolean => {
    if (!hasAdminAccess) return false
    if (permissionCodes.length === 0) return true
    return permissionCodes.every(code => hasPermission(code))
  }

  // 检查是否有某个角色
  const hasRole = (roleCode: string): boolean => {
    if (!hasAdminAccess) return false
    return roles.some(r => r.code === roleCode)
  }

  // 检查是否有任意一个角色
  const hasAnyRole = (roleCodes: string[]): boolean => {
    if (!hasAdminAccess) return false
    if (roleCodes.length === 0) return true
    return roleCodes.some(code => hasRole(code))
  }

  return {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasRole,
    hasAnyRole,
  }
}
