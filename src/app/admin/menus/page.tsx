'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Edit, Trash2, Menu, Plus, ChevronRight, ChevronDown, Folder, FileText, RefreshCw } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { MenuDialog } from '@/components/admin/menus/MenuDialog';
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

  const getVariant = (): "default" | "secondary" | "outline" => {
    if (menu.type === 'directory') return 'default';
    if (menu.type === 'menu') return 'secondary';
    return 'outline';
  };

  const Icon = getIcon();

  return (
    <div className="select-none">
      <div
        className="flex items-center gap-2 py-2 px-3 rounded-lg hover:bg-muted group"
        style={{ paddingLeft: `${level * 24 + 12}px` }}
      >
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-4 h-4 flex items-center justify-center"
          type="button"
        >
          {hasChildren ? (
            expanded ? (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            )
          ) : (
            <span className="w-4" />
          )}
        </button>

        <Icon className="h-4 w-4 text-muted-foreground" />

        <span className="flex-1 font-medium">{menu.name}</span>

        <Badge variant={getVariant()} className="text-xs">
          {menu.type === 'directory' ? '目录' : menu.type === 'menu' ? '菜单' : '按钮'}
        </Badge>

        {menu.path && (
          <span className="text-sm text-muted-foreground">{menu.path}</span>
        )}

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {menu.type !== 'button' && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => onAddChild(menu.id)}
              type="button"
            >
              <Plus className="h-4 w-4" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => onEdit(menu)}
            type="button"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" type="button">
            <Trash2 className="h-4 w-4" />
          </Button>
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">菜单管理</h1>
          <p className="text-muted-foreground mt-1">管理系统菜单结构</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2" onClick={fetchMenus}>
            <RefreshCw className="h-4 w-4" />
            刷新
          </Button>
          <Button className="gap-2" onClick={handleAddMenu}>
            <Plus className="h-4 w-4" />
            新增菜单
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <Menu className="h-5 w-5" />
            菜单树
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              <span className="ml-2">加载中...</span>
            </div>
          ) : menus.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              暂无菜单数据
            </div>
          ) : (
            <div className="border rounded-lg divide-y">
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
        </CardContent>
      </Card>

      <MenuDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        menu={editingMenu}
        parentMenuId={parentMenuId}
        onSave={handleSaveMenu}
      />
    </div>
  );
}