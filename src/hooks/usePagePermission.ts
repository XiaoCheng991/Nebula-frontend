import { useAppStore } from './useAppStore'

export function usePagePermission() {
  return useAppStore((state) => ({
    hasAdminAccess: state.hasAdminAccess,
    blogWritePerm: state.blogWritePerm,
    memoWritePerm: state.memoWritePerm,
    loading: !state.permissionsLoaded,
  }))
}
