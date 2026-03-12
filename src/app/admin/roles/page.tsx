'use client';

import { useState, useEffect, useCallback } from 'react';
import { Shield, Plus, Search, Edit, Trash2, MoreHorizontal, Users, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/components/ui/use-toast';
import { getRoleList } from '@/lib/api/modules/admin';
import type { SysRole } from '@/lib/api/modules/admin';

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

  const getStatusBadge = (status: string) => {
    return status === 'ACTIVE' ? (
      <Badge variant="default">正常</Badge>
    ) : (
      <Badge variant="secondary">禁用</Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">角色管理</h1>
          <p className="text-muted-foreground mt-1">
            管理系统角色，配置角色权限，分配角色给用户
          </p>
        </div>
        <Button className="gap-2" onClick={fetchRoles}>
          <RefreshCw className="h-4 w-4" />
          刷新
        </Button>
      </div>

      {/* 角色列表 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>角色列表</CardTitle>
              <CardDescription>共 {pagination.total} 条记录</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="搜索角色名称、标识..."
                  className="pl-8 w-64"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
              <Button variant="secondary" onClick={handleSearch}>搜索</Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>角色ID</TableHead>
                <TableHead>角色名称</TableHead>
                <TableHead>角色标识</TableHead>
                <TableHead>排序</TableHead>
                <TableHead>系统角色</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>创建时间</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    <div className="flex items-center justify-center">
                      <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                      <span className="ml-2">加载中...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : roles.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    暂无数据
                  </TableCell>
                </TableRow>
              ) : (
                roles.map((role) => (
                  <TableRow key={role.id}>
                    <TableCell className="font-medium">{role.id}</TableCell>
                    <TableCell>{role.roleName}</TableCell>
                    <TableCell>
                      <code className="text-xs bg-muted px-1.5 py-0.5 rounded">
                        {role.roleCode}
                      </code>
                    </TableCell>
                    <TableCell>{role.sortOrder || 0}</TableCell>
                    <TableCell>
                      {role.isSystem ? (
                        <Badge variant="outline">系统</Badge>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>{getStatusBadge(role.status)}</TableCell>
                    <TableCell>{role.createTime || '-'}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>操作</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="gap-2">
                            <Edit className="h-4 w-4" />
                            编辑
                          </DropdownMenuItem>
                          <DropdownMenuItem className="gap-2">
                            <Shield className="h-4 w-4" />
                            分配权限
                          </DropdownMenuItem>
                          <DropdownMenuItem className="gap-2">
                            <Users className="h-4 w-4" />
                            分配用户
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="gap-2 text-destructive focus:text-destructive">
                            <Trash2 className="h-4 w-4" />
                            删除
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {/* 分页 */}
          {!loading && roles.length > 0 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-muted-foreground">
                第 {pagination.page} / {pagination.pages} 页，共 {pagination.total} 条
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.page <= 1}
                  onClick={() => handlePageChange(pagination.page - 1)}
                >
                  上一页
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.page >= pagination.pages}
                  onClick={() => handlePageChange(pagination.page + 1)}
                >
                  下一页
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}