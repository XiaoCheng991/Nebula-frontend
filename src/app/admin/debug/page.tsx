'use client';

import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react';

const Card = dynamic(() => import('@/components/ui/card').then(mod => mod.Card), { ssr: false });
const CardContent = dynamic(() => import('@/components/ui/card').then(mod => mod.CardContent), { ssr: false });
const CardHeader = dynamic(() => import('@/components/ui/card').then(mod => mod.CardHeader), { ssr: false });
const CardTitle = dynamic(() => import('@/components/ui/card').then(mod => mod.CardTitle), { ssr: false });
const Button = dynamic(() => import('@/components/ui/button').then(mod => mod.Button), { ssr: false });

import { getCurrentUserMenus, getCurrentAdminUser } from '@/lib/api/modules/admin';
import { useAdminStore } from '@/hooks/useAdminStore';

export default function DebugPage() {
  const router = useRouter();
  const [apiResult, setApiResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { menus, loadAdminData } = useAdminStore();

  // 添加认证检查
  useEffect(() => {
    const token = document.cookie.split(', ').find(row => row.startsWith('satoken='));
    if (!token) {
      router.push('/login');
    }
  }, [router])

  const testMenuApi = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('[Debug] 测试菜单API...');
      const result = await getCurrentUserMenus();
      console.log('[Debug] 菜单API结果:', result);
      setApiResult(result);
    } catch (err) {
      console.error('[Debug] API调用失败:', err);
      setError(err instanceof Error ? err.message : '未知错误');
    } finally {
      setLoading(false);
    }
  };

  const testUserApi = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getCurrentAdminUser();
      setApiResult(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : '未知错误');
    } finally {
      setLoading(false);
    }
  };

  const reloadAdminData = async () => {
    setLoading(true);
    setError(null);
    try {
      await loadAdminData();
      setApiResult(useAdminStore.getState().menus);
    } catch (err) {
      console.error('[Debug] 加载失败:', err);
      setError(err instanceof Error ? err.message : '未知错误');
    } finally {
      setLoading(false);
    }
  };

  const clearStorage = () => {
    localStorage.removeItem('admin-storage');
    window.location.reload();
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">调试页面</h1>

      <div className="flex gap-2">
        <Button onClick={testMenuApi} disabled={loading}>
          测试菜单API
        </Button>
        <Button onClick={testUserApi} disabled={loading}>
          测试用户API
        </Button>
        <Button onClick={reloadAdminData} disabled={loading}>
          重新加载管理员数据
        </Button>
        <Button variant="destructive" onClick={clearStorage}>
          清除缓存并刷新
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>当前菜单数据 (Store)</CardTitle>
          </CardHeader>
          <CardContent>
            {menus.length === 0 ? (
              <p className="text-muted-foreground">暂无菜单数据</p>
            ) : (
              <pre className="text-xs overflow-auto max-h-96 p-4 bg-muted rounded">
                {JSON.stringify(menus, null, 2)}
              </pre>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>API测试结果</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p>加载中...</p>
            ) : error ? (
              <div className="p-4 bg-red-50 text-red-600 rounded">
                <p>错误: {error}</p>
              </div>
            ) : apiResult ? (
              <pre className="text-xs overflow-auto max-h-96 p-4 bg-muted rounded">
                {JSON.stringify(apiResult, null, 2)}
              </pre>
            ) : (
              <p className="text-muted-foreground">点击上方按钮进行测试</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}