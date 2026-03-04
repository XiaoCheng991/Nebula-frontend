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
import { AdminPermission } from '@/lib/admin/types'

interface PermissionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  permission?: AdminPermission | null
  onSave?: (permission: Partial<AdminPermission>) => void
}

export function PermissionDialog({ open, onOpenChange, permission, onSave }: PermissionDialogProps) {
  const [formData, setFormData] = React.useState<Partial<AdminPermission>>({
    name: '',
    code: '',
    type: 'button',
    path: '',
    description: '',
  })

  React.useEffect(() => {
    if (permission) {
      setFormData(permission)
    } else {
      setFormData({
        name: '',
        code: '',
        type: 'button',
        path: '',
        description: '',
      })
    }
  }, [permission])

  const handleSave = () => {
    onSave?.(formData)
    onOpenChange(false)
  }

  const isEdit = !!permission

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? '编辑权限' : '新增权限'}</DialogTitle>
          <DialogDescription>
            {isEdit ? '修改权限信息' : '创建新的系统权限'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">权限名称 *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="code">权限编码 *</Label>
              <Input
                id="code"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                disabled={isEdit}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">权限类型</Label>
              <Select
                value={formData.type}
                onValueChange={(value: 'page' | 'button') =>
                  setFormData({ ...formData, type: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="page">页面权限</SelectItem>
                  <SelectItem value="button">按钮权限</SelectItem>
                </SelectContent>
              </Select>
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
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">描述</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="描述这个权限的用途..."
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button onClick={handleSave}>
            {isEdit ? '保存修改' : '创建权限'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
