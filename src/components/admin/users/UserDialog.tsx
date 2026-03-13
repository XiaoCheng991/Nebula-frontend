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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { AdminUser, AdminRole } from '@/lib/admin/types'
import { mockRoles } from '@/lib/admin/mock-data'

interface UserDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user?: AdminUser | null
  onSave?: (user: Partial<AdminUser>) => void
}

export function UserDialog({ open, onOpenChange, user, onSave }: UserDialogProps) {
  const [formData, setFormData] = React.useState<Partial<AdminUser>>({
    username: '',
    nickname: '',
    email: '',
    status: 'active',
    roleIds: [],
  })

  React.useEffect(() => {
    if (user) {
      setFormData(user)
    } else {
      setFormData({
        username: '',
        nickname: '',
        email: '',
        status: 'active',
        roleIds: [],
      })
    }
  }, [user])

  const handleSave = () => {
    onSave?.(formData)
    onOpenChange(false)
  }

  const isEdit = !!user

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? '编辑用户' : '新增用户'}</DialogTitle>
          <DialogDescription>
            {isEdit ? '修改用户信息' : '创建新的系统用户'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="username">用户名 *</Label>
              <Input
                id="username"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                disabled={isEdit}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nickname">昵称 *</Label>
              <Input
                id="nickname"
                value={formData.nickname}
                onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">邮箱 *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          {!isEdit && (
            <div className="space-y-2">
              <Label htmlFor="password">初始密码 *</Label>
              <Input
                id="password"
                type="password"
                placeholder="设置初始密码"
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">状态</Label>
              <Select
                value={formData.status}
                onValueChange={(value: 'active' | 'disabled') =>
                  setFormData({ ...formData, status: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">正常</SelectItem>
                  <SelectItem value="disabled">禁用</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>角色</Label>
              <div className="flex flex-wrap gap-2">
                {mockRoles.map((role) => (
                  <Button
                    key={role.id}
                    variant={formData.roleIds?.includes(role.id) ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => {
                      const newRoleIds = formData.roleIds?.includes(role.id)
                        ? formData.roleIds.filter((id) => id !== role.id)
                        : [...(formData.roleIds || []), role.id]
                      setFormData({ ...formData, roleIds: newRoleIds })
                    }}
                  >
                    {role.name}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button onClick={handleSave}>
            {isEdit ? '保存修改' : '创建用户'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
