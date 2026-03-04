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
import { Checkbox } from '@/components/ui/checkbox'
import { AdminRole, AdminPermission, AdminMenu } from '@/lib/admin/types'
import { mockPermissions, mockMenus } from '@/lib/admin/mock-data'

interface RoleDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  role?: AdminRole | null
  onSave?: (role: Partial<AdminRole>) => void
}

export function RoleDialog({ open, onOpenChange, role, onSave }: RoleDialogProps) {
  const [formData, setFormData] = React.useState<Partial<AdminRole>>({
    name: '',
    code: '',
    description: '',
    permissionCodes: [],
    menuIds: [],
  })

  React.useEffect(() => {
    if (role) {
      setFormData(role)
    } else {
      setFormData({
        name: '',
        code: '',
        description: '',
        permissionCodes: [],
        menuIds: [],
      })
    }
  }, [role])

  const handleSave = () => {
    onSave?.(formData)
    onOpenChange(false)
  }

  const isEdit = !!role

  const togglePermission = (code: string) => {
    const newCodes = formData.permissionCodes?.includes(code)
      ? formData.permissionCodes.filter(c => c !== code)
      : [...(formData.permissionCodes || []), code]
    setFormData({ ...formData, permissionCodes: newCodes })
  }

  const toggleMenu = (menuId: number) => {
    const newIds = formData.menuIds?.includes(menuId)
      ? formData.menuIds.filter(id => id !== menuId)
      : [...(formData.menuIds || []), menuId]
    setFormData({ ...formData, menuIds: newIds })
  }

  const renderMenuTree = (menus: AdminMenu[]) => {
    return menus.map(menu => (
      <div key={menu.id} className="mb-2">
        <div className="flex items-center gap-2">
          <Checkbox
            checked={formData.menuIds?.includes(menu.id)}
            onCheckedChange={() => toggleMenu(menu.id)}
            id={`menu-${menu.id}`}
          />
          <Label htmlFor={`menu-${menu.id}`} className="cursor-pointer">
            {menu.name}
          </Label>
        </div>
        {menu.children && (
          <div className="ml-6 mt-2">
            {renderMenuTree(menu.children)}
          </div>
        )}
      </div>
    ))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>{isEdit ? '编辑角色' : '新增角色'}</DialogTitle>
          <DialogDescription>
            {isEdit ? '修改角色信息' : '创建新的系统角色'}
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[60vh] overflow-y-auto pr-4">
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">角色名称 *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="code">角色编码 *</Label>
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  disabled={isEdit}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">描述</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="描述这个角色的用途..."
              />
            </div>

            <div className="space-y-2">
              <Label>权限配置</Label>
              <div className="border rounded-lg p-4 max-h-48 overflow-y-auto">
                <div className="grid grid-cols-2 gap-2">
                  {mockPermissions.map(perm => (
                    <div key={perm.id} className="flex items-center gap-2">
                      <Checkbox
                        checked={formData.permissionCodes?.includes(perm.code)}
                        onCheckedChange={() => togglePermission(perm.code)}
                        id={`perm-${perm.id}`}
                      />
                      <Label htmlFor={`perm-${perm.id}`} className="cursor-pointer text-sm">
                        {perm.name}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>菜单配置</Label>
              <div className="border rounded-lg p-4 max-h-48 overflow-y-auto">
                {renderMenuTree(mockMenus)}
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button onClick={handleSave}>
            {isEdit ? '保存修改' : '创建角色'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
