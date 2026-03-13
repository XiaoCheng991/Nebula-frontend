'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { AdminMenu } from '@/lib/admin/types'

interface MenuDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  menu?: AdminMenu | null
  parentMenuId?: number | null
  onSave?: (menu: Partial<AdminMenu>) => void
  menus?: AdminMenu[]
}

export function MenuDialog({ open, onOpenChange, menu, parentMenuId, onSave, menus = [] }: MenuDialogProps) {
  const [formData, setFormData] = React.useState<Partial<AdminMenu>>({
    name: '',
    path: '',
    icon: '',
    sortOrder: 0,
    type: 'menu',
    permissionCode: '',
    parentId: parentMenuId || undefined,
  })

  React.useEffect(() => {
    if (menu) {
      setFormData(menu)
    } else {
      setFormData({
        name: '',
        path: '',
        icon: '',
        sortOrder: 0,
        type: 'menu',
        permissionCode: '',
        parentId: parentMenuId || undefined,
      })
    }
  }, [menu, parentMenuId])

  const handleSave = () => {
    onSave?.(formData)
    onOpenChange(false)
  }

  const isEdit = !!menu

  // 构建可选择的父级菜单列表（扁平结构，不包含自己和子菜单）
  const getParentMenuOptions = (menus: AdminMenu[], excludeId?: number): AdminMenu[] => {
    let options: AdminMenu[] = []
    for (const m of menus) {
      if (m.id !== excludeId) {
        options.push(m)
        if (m.children) {
          options = [...options, ...getParentMenuOptions(m.children, excludeId)]
        }
      }
    }
    return options.filter(m => m.type !== 'button')
  }

  const parentMenuOptions = getParentMenuOptions(menus, menu?.id)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? '编辑菜单' : '新增菜单'}</DialogTitle>
          <DialogDescription>
            {isEdit ? '修改菜单信息' : '创建新的系统菜单'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="parentId">上级菜单</Label>
            <Select
              value={formData.parentId?.toString() || ''}
              onValueChange={(value) =>
                setFormData({ ...formData, parentId: value ? parseInt(value) : undefined })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="无（顶级菜单）" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">无（顶级菜单）</SelectItem>
                {parentMenuOptions.map(m => (
                  <SelectItem key={m.id} value={m.id.toString()}>
                    {m.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">菜单名称 *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="icon">图标</Label>
              <Input
                id="icon"
                value={formData.icon}
                onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                placeholder="LayoutDashboard"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">菜单类型</Label>
              <Select
                value={formData.type}
                onValueChange={(value: 'directory' | 'menu' | 'button') =>
                  setFormData({ ...formData, type: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="directory">目录</SelectItem>
                  <SelectItem value="menu">菜单</SelectItem>
                  <SelectItem value="button">按钮</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="sortOrder">排序</Label>
              <Input
                id="sortOrder"
                type="number"
                value={formData.sortOrder}
                onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="path">路由路径</Label>
            <Input
              id="path"
              value={formData.path}
              onChange={(e) => setFormData({ ...formData, path: e.target.value })}
              placeholder="/admin/xxx"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="permissionCode">权限编码</Label>
            <Input
              id="permissionCode"
              value={formData.permissionCode}
              onChange={(e) => setFormData({ ...formData, permissionCode: e.target.value })}
              placeholder="user:view"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button onClick={handleSave}>
            {isEdit ? '保存修改' : '创建菜单'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
