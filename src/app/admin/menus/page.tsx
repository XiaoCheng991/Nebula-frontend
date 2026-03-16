'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Edit, Trash2, Menu, Plus, ChevronRight, ChevronDown, Folder, FileText, RefreshCw } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { getMenuTree } from '@/lib/api/modules/admin';
import { AdminMenu } from '@/lib/admin/types';
import { transformSysMenuToAdminMenu } from '@/lib/admin/types';

interface MenuTreeItemProps {
  menu: AdminMenu;
  level: number;
  onEdit: (menu: AdminMenu) => void;
  onAddChild: (parentId: number) => void;
}

function MenuTreeItem({ menu, level, onEdit, onAddChild }: MenuTreeItemProps) {
  const [expanded, setExpanded] = useState(true);
  const hasChildren = menu.children && menu.children.length > 0;

  const getIcon = () => {
    if (menu.type === 'directory') return Folder;
    if (menu.type === 'menu') return FileText;
    return Menu;
  };

  const Icon = getIcon();

  return (
    <div className="select-none">
      <div
        className="tree-item"
        style={{ paddingLeft: `${level * 24 + 12}px` }}
      >
        <button
          onClick={() => setExpanded(!expanded)}
          className="tree-toggle"
          type="button"
        >
          {hasChildren ? (
            expanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )
          ) : (
            <span className="w-4" />
          )}
        </button>

        <Icon className="tree-icon" />

        <span className="tree-label">{menu.name}</span>

        <span className={`tree-badge ${menu.type === 'directory' ? 'info' : ''}`}>
          {menu.type === 'directory' ? '目录' : menu.type === 'menu' ? '菜单' : '按钮'}
        </span>

        {menu.path && (
          <span className="text-mono">{menu.path}</span>
        )}

        <div className="action-buttons opacity-0 group-hover:opacity-100 transition-opacity">
          {menu.type !== 'button' && (
            <button
              className="action-btn"
              onClick={() => onAddChild(menu.id)}
              type="button"
              title="添加子菜单"
            >
              <Plus className="h-4 w-4" />
            </button>
          )}
          <button
            className="action-btn"
            onClick={() => onEdit(menu)}
            type="button"
            title="编辑"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button className="action-btn danger" type="button" title="删除">
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {hasChildren && expanded && (
        <div>
          {menu.children!.map(child => (
            <MenuTreeItem
              key={child.id}
              menu={child}
              level={level + 1}
              onEdit={onEdit}
              onAddChild={onAddChild}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function MenusPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingMenu, setEditingMenu] = useState<AdminMenu | null>(null);
  const [parentMenuId, setParentMenuId] = useState<number | null>(null);
  const [menus, setMenus] = useState<AdminMenu[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchMenus = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getMenuTree();
      if (response.code === 200 && response.data) {
        const adminMenus = response.data.map(transformSysMenuToAdminMenu);
        setMenus(adminMenus);
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

  const handleAddMenu = () => {
    setEditingMenu(null);
    setParentMenuId(null);
    setDialogOpen(true);
  };

  const handleAddChildMenu = (parentId: number) => {
    setEditingMenu(null);
    setParentMenuId(parentId);
    setDialogOpen(true);
  };

  const handleEditMenu = (menu: AdminMenu) => {
    setEditingMenu(menu);
    setParentMenuId(null);
    setDialogOpen(true);
  };

  const handleSaveMenu = (menuData: Partial<AdminMenu>) => {
    if (editingMenu) {
      console.log('Edit menu:', editingMenu.id, menuData);
    } else {
      console.log('Add menu:', menuData);
    }
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
          <button className="btn-secondary gap-2" onClick={fetchMenus}>
            <RefreshCw className="h-4 w-4" />
            刷新
          </button>
          <button className="btn-primary gap-2" onClick={handleAddMenu}>
            <Plus className="h-4 w-4" />
            新增菜单
          </button>
        </div>
      </div>

      {/* 菜单树 */}
      <div className="data-table-container">
        <div className="data-table-header">
          <div className="flex items-center gap-2">
            <Menu className="h-5 w-5 text-[var(--accent)]" />
            <h2 className="data-table-title">菜单树</h2>
          </div>
        </div>

        <div className="p-4">
          {loading ? (
            <div className="loading-state">
              <div className="loading-spinner" />
              <span>加载中...</span>
            </div>
          ) : menus.length === 0 ? (
            <div className="empty-state">暂无菜单数据</div>
          ) : (
            <div className="space-y-1">
              {menus.map(menu => (
                <MenuTreeItem
                  key={menu.id}
                  menu={menu}
                  level={0}
                  onEdit={handleEditMenu}
                  onAddChild={handleAddChildMenu}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
