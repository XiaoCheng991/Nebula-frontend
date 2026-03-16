'use client';

import { useState, useEffect, useCallback } from 'react';
import { Users, Plus, Search, Edit, Trash2, Shield, RefreshCw } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { getUserList, updateUserStatus, deleteUser } from '@/lib/api/modules/admin';
import type { SysUser } from '@/lib/api/modules/admin';
import { ResizableTable, formatDate } from '@/app/admin/_components/table/ResizableTable';

export default function UserManagementPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState<SysUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    total: 0,
    pages: 0,
  });
  const { toast } = useToast();

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getUserList(pagination.page, pagination.pageSize, searchQuery);
      if (response.code === 200 && response.data) {
        setUsers(response.data.records || []);
        setPagination(prev => ({
          ...prev,
          total: response.data?.total || 0,
          pages: response.data?.pages || 0,
        }));
      } else {
        toast({
          title: '获取用户列表失败',
          description: response.message || '未知错误',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
      toast({
        title: '获取用户列表失败',
        description: '网络错误，请稍后重试',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.pageSize, searchQuery, toast]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleStatusToggle = async (user: SysUser) => {
    const newStatus = user.accountStatus === 1 ? 0 : 1;
    try {
      const response = await updateUserStatus(user.id, newStatus);
      if (response.code === 200) {
        toast({
          title: '操作成功',
          description: `用户 ${user.username} 已${newStatus === 1 ? '启用' : '禁用'}`,
        });
        fetchUsers();
      } else {
        toast({
          title: '操作失败',
          description: response.message,
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: '操作失败',
        description: '网络错误',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (user: SysUser) => {
    if (!confirm(`确定要删除用户 ${user.username} 吗？此操作不可恢复。`)) {
      return;
    }
    try {
      const response = await deleteUser(user.id);
      if (response.code === 200) {
        toast({
          title: '删除成功',
          description: `用户 ${user.username} 已删除`,
        });
        fetchUsers();
      } else {
        toast({
          title: '删除失败',
          description: response.message,
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: '删除失败',
        description: '网络错误',
        variant: 'destructive',
      });
    }
  };

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
      key: 'username',
      header: '用户名',
      width: 150,
      minWidth: 100,
      render: (value: string) => (
        <span className="font-medium">{value}</span>
      )
    },
    {
      key: 'nickname',
      header: '昵称',
      width: 150,
      minWidth: 100,
    },
    {
      key: 'email',
      header: '邮箱',
      width: 200,
      minWidth: 150,
    },
    {
      key: 'phone',
      header: '手机号',
      width: 140,
      minWidth: 120,
    },
    {
      key: 'accountStatus',
      header: '状态',
      width: 100,
      minWidth: 80,
      render: (value: number) => (
        <span className={`admin-badge ${value === 1 ? 'success' : 'warning'}`}>
          {value === 1 ? '正常' : '禁用'}
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
      render: (_: any, user: SysUser) => (
        <div className="action-buttons">
          <button className="action-btn" title="编辑">
            <Edit className="h-4 w-4" />
          </button>
          <button className="action-btn" title="分配角色">
            <Shield className="h-4 w-4" />
          </button>
          <button
            className="action-btn"
            title={user.accountStatus === 1 ? '禁用' : '启用'}
            onClick={(e) => {
              e.stopPropagation();
              handleStatusToggle(user);
            }}
          >
            {user.accountStatus === 1 ? '禁用' : '启用'}
          </button>
          <button
            className="action-btn danger"
            title="删除"
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(user);
            }}
          >
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
          <Users />
        </div>
        <div>
          <h1 className="page-header-title">用户管理</h1>
          <p className="page-header-subtitle">
            管理系统用户，包括添加、编辑、删除用户等操作
          </p>
        </div>
        <button className="btn-secondary gap-2 ml-auto" onClick={fetchUsers}>
          <RefreshCw className="h-4 w-4" />
          刷新
        </button>
      </div>

      {/* 用户列表 */}
      <div className="data-table-container">
        <div className="data-table-header">
          <div>
            <h2 className="data-table-title">用户列表</h2>
            <p className="data-table-description">共 {pagination.total} 条记录</p>
          </div>
          <div className="search-container">
            <div className="search-input-wrapper">
              <Search className="search-icon" />
              <input
                type="text"
                placeholder="搜索用户名、昵称、邮箱..."
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
            data={users}
            loading={loading}
            emptyText="暂无用户数据"
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
