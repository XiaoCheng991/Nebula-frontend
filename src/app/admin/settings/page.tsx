'use client'

import React from 'react'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Settings, Loader2 } from 'lucide-react'
import { toast } from '@/components/ui/use-toast'
import { useSystemConfig } from '@/hooks/useSystemConfig'

export default function SettingsPage() {
  const { value: blogPerm, loading: blogLoading, update: updateBlogPerm } = useSystemConfig('blog_write_permission')
  const { value: memoPerm, loading: memoLoading, update: updateMemoPerm } = useSystemConfig('memo_write_permission')

  const handleBlogToggle = async (checked: boolean) => {
    const success = await updateBlogPerm(checked ? 'all' : 'admin_only')
    toast({
      title: success ? '保存成功' : '保存失败',
      description: success ? `博客编写权限：${checked ? '所有人' : '仅管理员'}` : '更新配置失败',
      variant: success ? undefined : 'destructive',
    })
  }

  const handleMemoToggle = async (checked: boolean) => {
    const success = await updateMemoPerm(checked ? 'all' : 'admin_only')
    toast({
      title: success ? '保存成功' : '保存失败',
      description: success ? `动态编写权限：${checked ? '所有人' : '仅管理员'}` : '更新配置失败',
      variant: success ? undefined : 'destructive',
    })
  }

  if (blogLoading || memoLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-zinc-400 mr-2" />
        <span className="text-sm text-zinc-400">加载配置中...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-1">系统配置</h2>
        <p className="text-sm text-zinc-500">管理博客和动态的编写权限</p>
      </div>

      <div className="space-y-6 border border-zinc-200 dark:border-zinc-700 rounded-lg p-6">
        {/* 博客编写权限 */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label htmlFor="blog-write-perm" className="text-sm font-medium">博客编写权限</Label>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">控制谁可以发布博客文章</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-500">{blogPerm === 'all' ? '所有人' : '仅管理员'}</span>
            <Switch
              id="blog-write-perm"
              checked={blogPerm === 'all'}
              onCheckedChange={handleBlogToggle}
            />
          </div>
        </div>

        {/* 动态编写权限 */}
        <div className="flex items-center justify-between pt-4 border-t border-zinc-200 dark:border-zinc-700">
          <div className="space-y-1">
            <Label htmlFor="memo-write-perm" className="text-sm font-medium">动态编写权限</Label>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">控制谁可以发布 Memo 动态</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-500">{memoPerm === 'all' ? '所有人' : '仅管理员'}</span>
            <Switch
              id="memo-write-perm"
              checked={memoPerm === 'all'}
              onCheckedChange={handleMemoToggle}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
