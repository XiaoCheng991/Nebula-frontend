'use client';

import { useState, useEffect, useCallback } from 'react';
import { BookOpen, Plus, Search, Edit, Trash2, MoreHorizontal, RefreshCw, Eye } from 'lucide-react';
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/components/ui/use-toast';
import {
  getDictTypeList,
  getDictDataList,
  deleteDictType,
  type SysDictType,
  type SysDictData,
} from '@/lib/api/modules/admin';

export default function DictManagementPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [dictTypes, setDictTypes] = useState<SysDictType[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    total: 0,
    pages: 0,
  });
  const [selectedDictType, setSelectedDictType] = useState<SysDictType | null>(null);
  const [dictDataList, setDictDataList] = useState<SysDictData[]>([]);
  const [dictDataLoading, setDictDataLoading] = useState(false);
  const { toast } = useToast();

  const fetchDictTypes = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getDictTypeList(pagination.page, pagination.pageSize, searchQuery);
      if (response.code === 200 && response.data) {
        setDictTypes(response.data.records || []);
        setPagination(prev => ({
          ...prev,
          total: response.data?.total || 0,
          pages: response.data?.pages || 0,
        }));
      } else {
        toast({
          title: '获取字典类型列表失败',
          description: response.message || '未知错误',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Failed to fetch dict types:', error);
      toast({
        title: '获取字典类型列表失败',
        description: '网络错误，请稍后重试',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.pageSize, searchQuery, toast]);

  useEffect(() => {
    fetchDictTypes();
  }, [fetchDictTypes]);

  const fetchDictData = useCallback(async (dictTypeId: number) => {
    setDictDataLoading(true);
    try {
      const response = await getDictDataList(dictTypeId);
      if (response.code === 200 && response.data) {
        setDictDataList(response.data || []);
      } else {
        setDictDataList([]);
      }
    } catch (error) {
      console.error('Failed to fetch dict data:', error);
      setDictDataList([]);
    } finally {
      setDictDataLoading(false);
    }
  }, []);

  const handleViewDictData = (dictType: SysDictType) => {
    setSelectedDictType(dictType);
    fetchDictData(dictType.id);
  };

  const handleDelete = async (dictType: SysDictType) => {
    if (!confirm(`确定要删除字典类型 ${dictType.dictName} 吗？`)) {
      return;
    }
    try {
      const response = await deleteDictType(dictType.id);
      if (response.code === 200) {
        toast({
          title: '删除成功',
          description: `字典类型 ${dictType.dictName} 已删除`,
        });
        fetchDictTypes();
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

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">字典管理</h1>
          <p className="text-muted-foreground mt-1">
            管理系统字典类型和字典数据，用于系统配置和选项管理
          </p>
        </div>
        <Button className="gap-2" onClick={fetchDictTypes}>
          <RefreshCw className="h-4 w-4" />
          刷新
        </Button>
      </div>

      {/* 字典类型列表 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>字典类型</CardTitle>
              <CardDescription>共 {pagination.total} 条记录</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="搜索字典名称、类型..."
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
                <TableHead>字典ID</TableHead>
                <TableHead>字典名称</TableHead>
                <TableHead>字典类型</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>系统字典</TableHead>
                <TableHead>备注</TableHead>
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
              ) : dictTypes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    暂无数据
                  </TableCell>
                </TableRow>
              ) : (
                dictTypes.map((dict) => (
                  <TableRow key={dict.id}>
                    <TableCell className="font-medium">{dict.id}</TableCell>
                    <TableCell>{dict.dictName}</TableCell>
                    <TableCell>
                      <code className="text-xs bg-muted px-1.5 py-0.5 rounded">
                        {dict.dictCode}
                      </code>
                    </TableCell>
                    <TableCell>
                      <Badge variant={dict.status === 'ACTIVE' ? 'default' : 'secondary'}>
                        {dict.status === 'ACTIVE' ? '正常' : '禁用'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {dict.isSystem ? (
                        <Badge variant="outline">系统</Badge>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="max-w-xs truncate">{dict.remark || '-'}</TableCell>
                    <TableCell>{dict.createTime || '-'}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewDictData(dict)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          查看数据
                        </Button>
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
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="gap-2 text-destructive focus:text-destructive"
                              onClick={() => handleDelete(dict)}
                            >
                              <Trash2 className="h-4 w-4" />
                              删除
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {/* 分页 */}
          {!loading && dictTypes.length > 0 && (
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

      {/* 字典数据查看对话框 */}
      <Dialog open={!!selectedDictType} onOpenChange={(open) => !open && setSelectedDictType(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              字典数据 - {selectedDictType?.dictName}
            </DialogTitle>
            <DialogDescription>
              类型: {selectedDictType?.dictCode}
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            {dictDataLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                <span className="ml-2">加载中...</span>
              </div>
            ) : dictDataList.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                暂无字典数据
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>标签</TableHead>
                    <TableHead>键值</TableHead>
                    <TableHead>排序</TableHead>
                    <TableHead>状态</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dictDataList.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.dictLabel}</TableCell>
                      <TableCell>
                        <code className="text-xs bg-muted px-1.5 py-0.5 rounded">
                          {item.dictValue}
                        </code>
                      </TableCell>
                      <TableCell>{item.sortOrder}</TableCell>
                      <TableCell>
                        <Badge variant={item.status === 'ACTIVE' ? 'default' : 'secondary'}>
                          {item.status === 'ACTIVE' ? '正常' : '禁用'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}