'use client'

import React, { useState } from 'react'
import { Edit, Trash2, Key, Plus, Search } from 'lucide-react'
import { AdminPermission } from '@/lib/admin/types'
import { ResizableTable } from '@/app/admin/_components/table/ResizableTable'

export default function PermissionsPage() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingPermission, setEditingPermission] = useState<AdminPermission | null>(null)
  const [permissions, setPermissions] = useState<AdminPermission[]>([])
  const [searchQuery, setSearchQuery] = useState('')

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
        id: permissions.length > 0 ? Math.max(...permissions.map(p => p.id)) + 1 : 1,
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

  const filteredPermissions = permissions.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.code.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const columns = [
    {
      key: 'index',
      header: '序号',
      width: 80,
      minWidth: 60,
      render: (_: any, __: any, index: number) => (
        <span className="text-mono">{index + 1}</span>
      )
    },
    {
      key: 'name',
      header: '权限名称',
      width: 200,
      minWidth: 150,
      render: (value: string) => (
        <div className="flex items-center gap-2">
          <Key className="h-4 w-4 text-purple-500" />
          <span className="font-medium">{value}</span>
        </div>
      )
    },
    {
      key: 'code',
      header: '权限编码',
      width: 200,
      minWidth: 150,
      render: (value: string) => (
        <span className="text-mono">{value}</span>
      )
    },
    {
      key: 'type',
      header: '类型',
      width: 100,
      minWidth: 80,
      render: (value: string) => (
        <span className={`admin-badge ${value === 'page' ? 'info' : ''}`}>
          {value === 'page' ? '页面' : '按钮'}
        </span>
      )
    },
    {
      key: 'path',
      header: '路由路径',
      width: 200,
      minWidth: 150,
    },
    {
      key: 'description',
      header: '描述',
      width: 250,
      minWidth: 200,
    },
    {
      key: 'actions',
      header: '操作',
      width: 150,
      minWidth: 120,
      render: (_: any, permission: AdminPermission) => (
        <div className="action-buttons">
          <button
            className="action-btn"
            title="编辑"
            onClick={() => handleEditPermission(permission)}
          >
            <Edit className="h-4 w-4" />
          </button>
          <button className="action-btn danger" title="删除">
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      )
    }
  ]

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="page-header">
        <div className="page-header-icon">
          <Key />
        </div>
        <div>
          <h1 className="page-header-title">权限管理</h1>
          <p className="page-header-subtitle">管理系统权限配置</p>
        </div>
        <button className="btn-primary gap-2 ml-auto" onClick={handleAddPermission}>
          <Plus className="h-4 w-4" />
          新增权限
        </button>
      </div>

      {/* 权限列表 */}
      <div className="data-table-container">
        <div className="data-table-header">
          <div className="data-table-header-left">
            <h2 className="data-table-title">权限列表</h2>
            <span className="data-table-description">共 {filteredPermissions.length} 条记录</span>
          </div>
          <div className="data-table-header-right">
            <div className="search-container">
              <div className="search-input-wrapper">
                <Search className="search-icon" />
                <input
                  type="text"
                  placeholder="搜索权限..."
                  className="search-input"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="p-4">
          <ResizableTable
            columns={columns}
            data={filteredPermissions}
            emptyText="暂无权限数据"
          />
        </div>
      </div>
    </div>
  )
}
