'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Edit, Trash2, Key, Plus } from 'lucide-react'
import { DataTable } from '@/components/admin/table/DataTable'
import { ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { PermissionDialog } from '@/components/admin/permissions/PermissionDialog'
import { mockPermissions } from '@/lib/admin/mock-data'
import { AdminPermission } from '@/lib/admin/types'

export default function PermissionsPage() {
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [editingPermission, setEditingPermission] = React.useState<AdminPermission | null>(null)
  const [permissions, setPermissions] = React.useState(mockPermissions)

  const handleAddPermission = () => {
    setEditingPermission(null)
    setDialogOpen(true)
  }

  const handleEditPermission = (permission: AdminPermission) => {
    setEditingPermission(permission)
    setDialogOpen(true)
  }

  const handleSavePermission = (permissionData: Partial<AdminPermission>) => {
    if (editingPermission) {
      setPermissions(permissions.map(p => p.id === editingPermission.id ? { ...p, ...permissionData } as AdminPermission : p))
    } else {
      const newPermission: AdminPermission = {
        id: Math.max(...permissions.map(p => p.id)) + 1,
        name: permissionData.name || '',
        code: permissionData.code || '',
        type: permissionData.type || 'button',
        path: permissionData.path || '',
        description: permissionData.description || '',
        createdAt: new Date().toISOString(),
      }
      setPermissions([...permissions, newPermission])
    }
  }

  const columns: ColumnDef<AdminPermission>[] = [
    {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && 'indeterminate')
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="全选"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="选择"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: 'name',
      header: '权限名称',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Key className="h-4 w-4 text-purple-500" />
          <span className="font-medium">{row.original.name}</span>
        </div>
      ),
    },
    {
      accessorKey: 'code',
      header: '权限编码',
      cell: ({ row }) => (
        <Badge variant="outline">{row.original.code}</Badge>
      ),
    },
    {
      accessorKey: 'type',
      header: '类型',
      cell: ({ row }) => (
        <Badge variant={row.original.type === 'page' ? 'default' : 'secondary'}>
          {row.original.type === 'page' ? '页面' : '按钮'}
        </Badge>
      ),
    },
    {
      accessorKey: 'path',
      header: '路由路径',
      cell: ({ row }) => row.original.path || '-',
    },
    {
      accessorKey: 'description',
      header: '描述',
      cell: ({ row }) => row.original.description || '-',
    },
    {
      id: 'actions',
      header: '操作',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => handleEditPermission(row.original)}>
            <Edit className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">权限管理</h1>
          <p className="text-muted-foreground mt-1">管理系统权限配置</p>
        </div>
        <Button className="gap-2" onClick={handleAddPermission}>
          <Plus className="h-4 w-4" />
          新增权限
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>权限列表</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={permissions}
            searchKey="name"
            searchPlaceholder="搜索权限..."
          />
        </CardContent>
      </Card>

      <PermissionDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        permission={editingPermission}
        onSave={handleSavePermission}
      />
    </div>
  )
}
