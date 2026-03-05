'use client'

import React, { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Edit, Trash2, UserPlus, RefreshCw } from 'lucide-react'
import { DataTable } from '@/components/admin/table/DataTable'
import { ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { UserAvatar } from '@/components/ui/user-avatar'
import { UserDialog } from '@/components/admin/users/UserDialog'
import { AdminUser, transformSysUserToAdminUser } from '@/lib/admin/types'
import { getUserList } from '@/lib/api/modules/admin'
import { toast } from '@/components/ui/use-toast'

export default function UsersPage() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null)
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(false)
  const [pagination, setPagination] = useState({ page: 1, pageSize: 10, total: 0 })
  const [searchKeyword, setSearchKeyword] = useState('')

  // 加载用户列表
  const loadUsers = async (page: number = 1, pageSize: number = 10, keyword?: string) => {
    setLoading(true)
    try {
      const response = await getUserList(page, pageSize, keyword)
      if (response.code === 200 && response.data) {
        const transformedUsers = response.data.records.map(transformSysUserToAdminUser)
        setUsers(transformedUsers)
        setPagination({
          page: response.data.current,
          pageSize: response.data.size,
          total: response.data.total,
        })
      } else {
        toast({
          title: '加载失败',
          description: response.message || '加载用户列表失败',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Failed to load users:', error)
      toast({
        title: '加载失败',
        description: '加载用户列表失败',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  // 初始加载
  useEffect(() => {
    loadUsers(1, 10)
  }, [])

  // 搜索防抖
  useEffect(() => {
    const timer = setTimeout(() => {
      loadUsers(1, pagination.pageSize, searchKeyword || undefined)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchKeyword, pagination.pageSize])

  const handleAddUser = () => {
    setEditingUser(null)
    setDialogOpen(true)
  }

  const handleEditUser = (user: AdminUser) => {
    setEditingUser(user)
    setDialogOpen(true)
  }

  const handleSaveUser = (userData: Partial<AdminUser>) => {
    // TODO: 对接保存用户 API
    if (editingUser) {
      setUsers(users.map(u => u.id === editingUser.id ? { ...u, ...userData } as AdminUser : u))
    } else {
      const newUser: AdminUser = {
        id: Math.max(...users.map(u => u.id), 0) + 1,
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

  const handleRefresh = () => {
    loadUsers(pagination.page, pagination.pageSize, searchKeyword || undefined)
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
            avatarUrl={row.original.avatarUrl}
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
      cell: ({ row }) => row.original.email || '-',
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
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={handleRefresh} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
          <Button className="gap-2" onClick={handleAddUser}>
            <UserPlus className="h-4 w-4" />
            新增用户
          </Button>
        </div>
      </div>

      {/* 搜索框 */}
      <div className="flex items-center gap-2">
        <input
          type="text"
          placeholder="搜索用户名、邮箱或昵称..."
          value={searchKeyword}
          onChange={(e) => setSearchKeyword(e.target.value)}
          className="max-w-sm px-3 py-2 border rounded-md bg-background"
        />
      </div>

      {/* 用户列表 */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>用户列表</CardTitle>
        </CardHeader>
        <CardContent>
          {loading && users.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
              <span className="ml-2 text-muted-foreground">加载中...</span>
            </div>
          ) : (
            <DataTable
              columns={columns}
              data={users}
            />
          )}
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
