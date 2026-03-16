'use client';

import { useState, useEffect, useCallback } from 'react';
import { Shield, Plus, Search, Edit, Trash2, Users, RefreshCw } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { getRoleList } from '@/lib/api/modules/admin';
import type { SysRole } from '@/lib/api/modules/admin';
import { ResizableTable, formatDate } from '@/app/admin/_components/table/ResizableTable';

export default function RoleManagementPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [roles, setRoles] = useState<SysRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    total: 0,
    pages: 0,
  });
  const { toast } = useToast();

  const fetchRoles = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getRoleList(pagination.page, pagination.pageSize, searchQuery);
      if (response.code === 200 && response.data) {
        setRoles(response.data.records || []);
        setPagination(prev => ({
          ...prev,
          total: response.data?.total || 0,
          pages: response.data?.pages || 0,
        }));
      } else {
        toast({
          title: '获取角色列表失败',
          description: response.message || '未知错误',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Failed to fetch roles:', error);
      toast({
        title: '获取角色列表失败',
        description: '网络错误，请稍后重试',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.pageSize, searchQuery, toast]);

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  const handleSearch = () => {
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const columns = [
    {
      key: 'index',
      header: '序号',
      width: 80,
      minWidth: 60,
      render: (_: any, __: any, index: number) => (
        <span className="text-mono">{(pagination.page - 1) * pagination.pageSize + index + 1}</span>
      )
    },
    {
      key: 'roleName',
      header: '角色名称',
      width: 150,
      minWidth: 100,
      render: (value: string) => (
        <span className="font-medium">{value}</span>
      )
    },
    {
      key: 'roleCode',
      header: '角色标识',
      width: 150,
      minWidth: 100,
      render: (value: string) => (
        <span className="text-mono">{value}</span>
      )
    },
    {
      key: 'sortOrder',
      header: '排序',
      width: 80,
      minWidth: 60,
    },
    {
      key: 'isSystem',
      header: '系统角色',
      width: 100,
      minWidth: 80,
      render: (value: boolean) => (
        value ? <span className="admin-badge info">系统</span> : <span style={{ color: 'var(--text-muted)' }}>-</span>
      )
    },
    {
      key: 'status',
      header: '状态',
      width: 100,
      minWidth: 80,
      render: (value: string) => (
        <span className={`admin-badge ${value === 'ACTIVE' ? 'success' : 'warning'}`}>
          {value === 'ACTIVE' ? '正常' : '禁用'}
        </span>
      )
    },
    {
      key: 'createTime',
      header: '创建时间',
      width: 180,
      minWidth: 150,
      render: (value: string) => formatDate(value)
    },
    {
      key: 'actions',
      header: '操作',
      width: 180,
      minWidth: 150,
      render: () => (
        <div className="action-buttons">
          <button className="action-btn" title="编辑">
            <Edit className="h-4 w-4" />
          </button>
          <button className="action-btn" title="分配权限">
            <Shield className="h-4 w-4" />
          </button>
          <button className="action-btn" title="分配用户">
            <Users className="h-4 w-4" />
          </button>
          <button className="action-btn danger" title="删除">
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="page-header">
        <div className="page-header-icon">
          <Shield />
        </div>
        <div>
          <h1 className="page-header-title">角色管理</h1>
          <p className="page-header-subtitle">
            管理系统角色，配置角色权限，分配角色给用户
          </p>
        </div>
        <button className="btn-secondary gap-2 ml-auto" onClick={fetchRoles}>
          <RefreshCw className="h-4 w-4" />
          刷新
        </button>
      </div>

      {/* 角色列表 */}
      <div className="data-table-container">
        <div className="data-table-header">
          <div>
            <h2 className="data-table-title">角色列表</h2>
            <p className="data-table-description">共 {pagination.total} 条记录</p>
          </div>
          <div className="search-container">
            <div className="search-input-wrapper">
              <Search className="search-icon" />
              <input
                type="text"
                placeholder="搜索角色名称、标识..."
                className="search-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <button className="btn-search" onClick={handleSearch}>
              搜索
            </button>
          </div>
        </div>

        <div className="p-4">
          <ResizableTable
            columns={columns}
            data={roles}
            loading={loading}
            emptyText="暂无角色数据"
            pagination={{
              current: pagination.page,
              pageSize: pagination.pageSize,
              total: pagination.total
            }}
            onPageChange={handlePageChange}
          />
        </div>
      </div>
    </div>
  );
}
