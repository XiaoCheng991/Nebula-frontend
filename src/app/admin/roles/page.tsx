'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Edit, Trash2, Shield, Plus } from 'lucide-react'
import { DataTable } from '@/components/admin/table/DataTable'
import { ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { RoleDialog } from '@/components/admin/roles/RoleDialog'
import { mockRoles } from '@/lib/admin/mock-data'
import { AdminRole } from '@/lib/admin/types'

export default function RolesPage() {
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [editingRole, setEditingRole] = React.useState<AdminRole | null>(null)
  const [roles, setRoles] = React.useState(mockRoles)

  const handleAddRole = () => {
    setEditingRole(null)
    setDialogOpen(true)
  }

  const handleEditRole = (role: AdminRole) => {
    setEditingRole(role)
    setDialogOpen(true)
  }

  const handleSaveRole = (roleData: Partial<AdminRole>) => {
    if (editingRole) {
      setRoles(roles.map(r => r.id === editingRole.id ? { ...r, ...roleData } as AdminRole : r))
    } else {
      const newRole: AdminRole = {
        id: Math.max(...roles.map(r => r.id)) + 1,
        name: roleData.name || '',
        code: roleData.code || '',
        description: roleData.description || '',
        permissionCodes: roleData.permissionCodes || [],
        menuIds: roleData.menuIds || [],
        createdAt: new Date().toISOString(),
      }
      setRoles([...roles, newRole])
    }
  }

  const columns: ColumnDef<AdminRole>[] = [
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
      header: '角色名称',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4 text-blue-500" />
          <span className="font-medium">{row.original.name}</span>
        </div>
      ),
    },
    {
      accessorKey: 'code',
      header: '角色编码',
      cell: ({ row }) => (
        <Badge variant="outline">{row.original.code}</Badge>
      ),
    },
    {
      accessorKey: 'description',
      header: '描述',
      cell: ({ row }) => row.original.description || '-',
    },
    {
      id: 'permissionCount',
      header: '权限数',
      cell: ({ row }) => row.original.permissionCodes.length,
    },
    {
      id: 'actions',
      header: '操作',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => handleEditRole(row.original)}>
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
          <h1 className="text-2xl font-bold text-foreground">角色管理</h1>
          <p className="text-muted-foreground mt-1">管理系统角色和权限</p>
        </div>
        <Button className="gap-2" onClick={handleAddRole}>
          <Plus className="h-4 w-4" />
          新增角色
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>角色列表</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={roles}
            searchKey="name"
            searchPlaceholder="搜索角色..."
          />
        </CardContent>
      </Card>

      <RoleDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        role={editingRole}
        onSave={handleSaveRole}
      />
    </div>
  )
}
