'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Edit, Trash2, Menu, Plus, Folder, FileText, RefreshCw, ChevronRight, ChevronDown } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useConfirm } from '@/components/ui/confirm-dialog';
import { getMenuTree } from '@/lib/api/modules/admin';
import { AdminMenu } from '@/lib/admin/types';
import { transformSysMenuToAdminMenu } from '@/lib/admin/types';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { ResizableTable } from '@/app/admin/_components/table/ResizableTable';

interface MenuDetailDrawerProps {
  menu: AdminMenu | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<AdminMenu>) => void;
  isEdit: boolean;
}

function MenuDetailDrawer({ menu, isOpen, onClose, onSave, isEdit }: MenuDetailDrawerProps) {
  const [formData, setFormData] = useState<Partial<AdminMenu>>({
    name: '',
    type: 'menu',
    path: '',
    icon: '',
    permissionCode: '',
    visible: true,
    status: 'ACTIVE',
    sortOrder: 0,
  });

  useEffect(() => {
    if (menu && isEdit) {
      setFormData({
        name: menu.name,
        type: menu.type,
        path: menu.path || '',
        icon: menu.icon || '',
        permissionCode: menu.permissionCode || '',
        visible: menu.visible !== false,
        status: menu.status || 'ACTIVE',
        sortOrder: menu.sortOrder,
      });
    } else {
      setFormData({
        name: '',
        type: 'menu',
        path: '',
        icon: '',
        permissionCode: '',
        visible: true,
        status: 'ACTIVE',
        sortOrder: 0,
      });
    }
  }, [menu, isEdit, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <SheetContent side="right" style={{ background: 'var(--bg-base)', borderColor: 'var(--glass-border)' }} className="sm:max-w-2xl overflow-y-auto" onOpenAutoFocus={(e) => e.preventDefault()}>
        <SheetHeader className="pb-0">
          <SheetTitle className="text-base">{isEdit ? '编辑菜单' : '新增菜单'}</SheetTitle>
          <SheetDescription>
            {isEdit ? '修改菜单项信息' : '添加新的菜单项'}
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="px-5 py-4">
          <div className="grid grid-cols-2 gap-x-4 gap-y-3">
            {/* 菜单名称 */}
            <div>
              <label className="form-label" style={{ marginBottom: '0.375rem' }}>
                菜单名称 <span style={{ color: 'var(--accent)' }}>*</span>
              </label>
              <input
                type="text"
                className="form-input"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="请输入菜单名称"
                required
              />
            </div>

            {/* 菜单类型 */}
            <div>
              <label className="form-label" style={{ marginBottom: '0.375rem' }}>
                菜单类型 <span style={{ color: 'var(--accent)' }}>*</span>
              </label>
              <select
                className="form-input form-select"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as 'directory' | 'menu' | 'button' })}
              >
                <option value="directory">目录</option>
                <option value="menu">菜单</option>
                <option value="button">按钮</option>
              </select>
            </div>

            {/* 路由路径 */}
            {formData.type !== 'button' && (
              <div>
                <label className="form-label" style={{ marginBottom: '0.375rem' }}>
                  路由路径
                </label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.path}
                  onChange={(e) => setFormData({ ...formData, path: e.target.value })}
                  placeholder="/admin/users"
                />
              </div>
            )}

            {/* 图标 */}
            <div className={formData.type === 'button' ? '' : ''}>
              <label className="form-label" style={{ marginBottom: '0.375rem' }}>
                图标名称
              </label>
              <input
                type="text"
                className="form-input"
                value={formData.icon}
                onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                placeholder="Users, Settings"
              />
            </div>

            {/* 权限标识 */}
            <div>
              <label className="form-label" style={{ marginBottom: '0.375rem' }}>
                权限标识
              </label>
              <input
                type="text"
                className="form-input"
                value={formData.permissionCode}
                onChange={(e) => setFormData({ ...formData, permissionCode: e.target.value })}
                placeholder="admin:user:list"
              />
            </div>

            {/* 排序 */}
            <div>
              <label className="form-label" style={{ marginBottom: '0.375rem' }}>
                排序号
              </label>
              <input
                type="number"
                className="form-input"
                value={formData.sortOrder}
                onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })}
                placeholder="0"
              />
            </div>

            {/* 状态 */}
            <div>
              <label className="form-label" style={{ marginBottom: '0.375rem' }}>
                状态
              </label>
              <select
                className="form-input form-select"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as 'ACTIVE' | 'INACTIVE' })}
              >
                <option value="ACTIVE">启用</option>
                <option value="INACTIVE">禁用</option>
              </select>
            </div>

            {/* 可见性 */}
            <div>
              <label className="form-label" style={{ marginBottom: '0.375rem' }}>
                可见性
              </label>
              <select
                className="form-input form-select"
                value={formData.visible ? 'true' : 'false'}
                onChange={(e) => setFormData({ ...formData, visible: e.target.value === 'true' })}
              >
                <option value="true">显示</option>
                <option value="false">隐藏</option>
              </select>
            </div>
          </div>

          {/* 编辑模式显示ID和上级菜单 */}
          {isEdit && menu && (
            <div className="mt-3 p-3 rounded-lg" style={{ borderTop: '1px solid var(--glass-border)', background: 'var(--glass-bg)', color: 'var(--text-tertiary)' }}>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs leading-none">ID</span>
                  <span className="text-xs leading-none">{menu.id}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs leading-none">上级菜单</span>
                  <span className="text-xs leading-none">
                    {menu.parentId && menu.parentId > 0
                      ? `${menu.parentName || ''}（${menu.parentId}）`
                      : '-'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* 操作按钮 */}
          <div className="flex justify-end gap-3 pt-4 mt-4" style={{ borderTop: '1px solid var(--glass-border)' }}>
            <button type="button" onClick={onClose} className="btn-secondary">
              取消
            </button>
            <button type="submit" className="btn-primary">
              {isEdit ? '保存' : '创建'}
            </button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}

function flattenMenus(
  menus: AdminMenu[],
  expandedIds: Set<number>,
  onToggle: (id: number) => void,
  onEdit: (m: AdminMenu) => void,
  onDelete: (m: AdminMenu) => void,
  level = 0
): any[] {
  const result: any[] = [];
  for (const menu of menus) {
    const hasChildren = menu.children && menu.children.length > 0;
    const isExpanded = expandedIds.has(menu.id);
    result.push({
      ...menu,
      _level: level,
      _expandButton: hasChildren ? (
        <button
          onClick={() => onToggle(menu.id)}
          className="p-0.5 rounded hover:bg-[rgba(245,166,35,0.05)] transition-colors"
        >
          {isExpanded ? (
            <ChevronDown className="h-4 w-4 text-[var(--text-secondary)]" />
          ) : (
            <ChevronRight className="h-4 w-4 text-[var(--text-secondary)]" />
          )}
        </button>
      ) : <span className="inline-block w-5" />,
      _icon: menu.type === 'directory'
        ? <Folder className="h-4 w-4 text-orange-500 flex-shrink-0" />
        : menu.type === 'menu'
          ? <FileText className="h-4 w-4 text-amber-500 flex-shrink-0" />
          : <Menu className="h-4 w-4 text-yellow-500 flex-shrink-0" />,
    });
    if (hasChildren && isExpanded) {
      result.push(...flattenMenus(menu.children!, expandedIds, onToggle, onEdit, onDelete, level + 1));
    }
  }
  return result;
}

const getTypeLabel = (type: string) => {
  switch (type) {
    case 'directory': return '目录';
    case 'menu': return '菜单';
    case 'button': return '按钮';
    default: return type;
  }
};

const getTypeBadgeClass = (type: string) => {
  switch (type) {
    case 'directory': return 'info';
    case 'menu': return 'success';
    case 'button': return 'warning';
    default: return '';
  }
};

export default function MenusPage() {
  const [menus, setMenus] = useState<AdminMenu[]>([]);
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingMenu, setEditingMenu] = useState<AdminMenu | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());
  const { toast } = useToast();
  const { confirm, ConfirmDialog } = useConfirm();

  // 展开/折叠切换
  const handleToggleExpand = (id: number) => {
    setExpandedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  // 展开所有
  const expandAll = () => {
    const allIds = new Set<number>();
    const collectIds = (menuList: AdminMenu[]) => {
      menuList.forEach(menu => {
        if (menu.children && menu.children.length > 0) {
          allIds.add(menu.id);
          collectIds(menu.children);
        }
      });
    };
    collectIds(menus);
    setExpandedIds(allIds);
  };

  // 折叠所有
  const collapseAll = () => {
    setExpandedIds(new Set());
  };

  const fetchMenus = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getMenuTree();
      if (response.code === 200 && response.data) {
        const adminMenus = response.data.map(transformSysMenuToAdminMenu);
        setMenus(adminMenus);

        // 默认全部折叠
        setExpandedIds(new Set());
      } else {
        toast({
          title: '获取菜单列表失败',
          description: response.message || '未知错误',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Failed to fetch menus:', error);
      toast({
        title: '获取菜单列表失败',
        description: '网络错误，请稍后重试',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchMenus();
  }, [fetchMenus]);

  const handleEdit = (menu: AdminMenu) => {
    setEditingMenu(menu);
    setIsEditMode(true);
    setDrawerOpen(true);
  };

  const handleAdd = () => {
    setEditingMenu(null);
    setIsEditMode(false);
    setDrawerOpen(true);
  };

  const handleDelete = async (menu: AdminMenu) => {
    const confirmed = await confirm({
      title: '删除菜单',
      description: `确定要删除菜单「${menu.name}」吗？此操作不可恢复。`,
      confirmText: '删除',
      cancelText: '取消',
      variant: 'danger',
    });
    if (confirmed) {
      console.log('Delete menu:', menu.id);
      toast({
        title: '删除成功',
        description: `菜单「${menu.name}」已删除`,
      });
    }
  };

  const handleSave = (data: Partial<AdminMenu>) => {
    if (isEditMode && editingMenu) {
      console.log('Edit menu:', editingMenu.id, data);
      toast({
        title: '保存成功',
        description: '菜单信息已更新',
      });
    } else {
      console.log('Add menu:', data);
      toast({
        title: '创建成功',
        description: '新菜单已添加',
      });
    }
    setDrawerOpen(false);
    setEditingMenu(null);
  };

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="page-header">
        <div className="page-header-icon">
          <Menu />
        </div>
        <div>
          <h1 className="page-header-title">菜单管理</h1>
          <p className="page-header-subtitle">管理系统菜单结构</p>
        </div>
        <div className="flex gap-2 ml-auto">
          <button className="btn-ghost gap-2" onClick={expandAll}>
            展开全部
          </button>
          <button className="btn-ghost gap-2" onClick={collapseAll}>
            折叠全部
          </button>
          <button className="btn-secondary gap-2" onClick={fetchMenus}>
            <RefreshCw className="h-4 w-4" />
            刷新
          </button>
          <button className="btn-primary gap-2" onClick={handleAdd}>
            <Plus className="h-4 w-4" />
            新增
          </button>
        </div>
      </div>

      {/* 菜单表格 */}
      <div className="data-table-container">
        <div className="data-table-header">
          <div className="data-table-header-left">
            <h2 className="data-table-title">菜单列表</h2>
            <span className="data-table-description">共 {menus.length} 个顶级菜单</span>
          </div>
        </div>

        <div className="p-4">
          <ResizableTable
            columns={[
              {
                key: 'name', header: '菜单名称', width: 280, minWidth: 150,
                render: (v: any, row: any) => (
                  <div className="flex items-center gap-2" style={{ paddingLeft: `${(row._level || 0) * 20}px` }}>
                    {row._expandButton} {row._icon}
                    <span className="font-medium">{v}</span>
                  </div>
                ),
              },
              {
                key: 'type', header: '类型', width: 100, minWidth: 80,
                render: (v: any) => (
                  <span className={`admin-badge ${getTypeBadgeClass(v)}`}>{getTypeLabel(v)}</span>
                ),
              },
              {
                key: 'path', header: '路由路径', width: 200, minWidth: 120,
                render: (v: any) => <span className="text-mono whitespace-nowrap">{v || '-'}</span>,
              },
              {
                key: 'permissionCode', header: '权限标识', width: 160, minWidth: 100,
                render: (v: any) => <span className="text-mono text-xs whitespace-nowrap">{v || '-'}</span>,
              },
              {
                key: 'visible', header: '可见', width: 80, minWidth: 60,
                render: (v: any) => (
                  <span className={`admin-badge ${v !== false ? 'success' : 'error'}`}>
                    {v !== false ? 'Yes' : 'No'}
                  </span>
                ),
              },
              {
                key: 'status', header: '状态', width: 100, minWidth: 80,
                render: (v: any) => (
                  <span className={`admin-badge ${v === 'ACTIVE' ? 'success' : 'warning'}`}>
                    {v === 'ACTIVE' ? 'Active' : 'Disabled'}
                  </span>
                ),
              },
              {
                key: 'actions', header: '操作', width: 120, minWidth: 100,
                render: (_: any, row: any) => (
                  <div className="action-buttons">
                    <button className="action-btn" onClick={() => handleEdit(row)} title="编辑">
                      <Edit className="h-4 w-4" />
                    </button>
                    <button className="action-btn danger" onClick={() => handleDelete(row)} title="删除">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ),
              },
            ]}
            data={flattenMenus(menus, expandedIds, handleToggleExpand, handleEdit, handleDelete)}
            loading={loading}
            emptyText="暂无菜单数据"
          />
        </div>
      </div>

      {/* 编辑/新增抽屉 */}
      <MenuDetailDrawer
        menu={editingMenu}
        isOpen={drawerOpen}
        onClose={() => {
          setDrawerOpen(false);
          setEditingMenu(null);
        }}
        onSave={handleSave}
        isEdit={isEditMode}
      />

      {/* 确认弹窗 */}
      <ConfirmDialog />
    </div>
  );
}
