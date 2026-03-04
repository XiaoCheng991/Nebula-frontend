'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Edit, Trash2, UserPlus } from 'lucide-react'
import { DataTable } from '@/components/admin/table/DataTable'
import { ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { UserAvatar } from '@/components/ui/user-avatar'
import { UserDialog } from '@/components/admin/users/UserDialog'
import { mockUsers } from '@/lib/admin/mock-data'
import { AdminUser } from '@/lib/admin/types'

export default function UsersPage() {
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [editingUser, setEditingUser] = React.useState<AdminUser | null>(null)
  const [users, setUsers] = React.useState(mockUsers)

  const handleAddUser = () => {
    setEditingUser(null)
    setDialogOpen(true)
  }

  const handleEditUser = (user: AdminUser) => {
    setEditingUser(user)
    setDialogOpen(true)
  }

  const handleSaveUser = (userData: Partial<AdminUser>) => {
    if (editingUser) {
      // 编辑用户
      setUsers(users.map(u => u.id === editingUser.id ? { ...u, ...userData } as AdminUser : u))
    } else {
      // 新增用户
      const newUser: AdminUser = {
        id: Math.max(...users.map(u => u.id)) + 1,
        username: userData.username || '',
        displayName: userData.displayName || '',
        email: userData.email || '',
        avatar: '',
        status: userData.status || 'active',
        roleIds: userData.roleIds || [],
        createdAt: new Date().toISOString(),
      }
      setUsers([...users, newUser])
    }
  }

  const columns: ColumnDef<AdminUser>[] = [
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
      accessorKey: 'username',
      header: '用户名',
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <UserAvatar
            avatarUrl={row.original.avatar}
            displayName={row.original.displayName}
            size="sm"
          />
          <span className="font-medium">{row.original.username}</span>
        </div>
      ),
    },
    {
      accessorKey: 'displayName',
      header: '显示名称',
      cell: ({ row }) => row.original.displayName,
    },
    {
      accessorKey: 'email',
      header: '邮箱',
      cell: ({ row }) => row.original.email,
    },
    {
      accessorKey: 'status',
      header: '状态',
      cell: ({ row }) => (
        <Badge variant={row.original.status === 'active' ? 'default' : 'destructive'}>
          {row.original.status === 'active' ? '正常' : '禁用'}
        </Badge>
      ),
    },
    {
      id: 'actions',
      header: '操作',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => handleEditUser(row.original)}>
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
      {/* 页面头部 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">用户管理</h1>
          <p className="text-muted-foreground mt-1">管理系统用户</p>
        </div>
        <Button className="gap-2" onClick={handleAddUser}>
          <UserPlus className="h-4 w-4" />
          新增用户
        </Button>
      </div>

      {/* 用户列表 */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>用户列表</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={users}
            searchKey="username"
            searchPlaceholder="搜索用户名..."
          />
        </CardContent>
      </Card>

      {/* 用户对话框 */}
      <UserDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        user={editingUser}
        onSave={handleSaveUser}
      />
    </div>
  )
}
