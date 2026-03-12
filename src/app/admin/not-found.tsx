'use client';

import { useRouter } from 'next/navigation';
import { FileQuestion, Home, ArrowLeft, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function AdminNotFound() {
  const router = useRouter();

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-8rem)] p-4">
      <Card className="max-w-lg w-full text-center">
        <CardHeader className="space-y-4">
          <div className="mx-auto w-20 h-20 rounded-full bg-muted flex items-center justify-center">
            <FileQuestion className="h-10 w-10 text-muted-foreground" />
          </div>
          <div className="space-y-2">
            <CardTitle className="text-2xl font-bold">页面未找到</CardTitle>
            <CardDescription className="text-base">
              抱歉，您访问的页面不存在或已被移除
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              variant="default"
              onClick={() => router.push('/admin')}
              className="gap-2"
            >
              <Home className="h-4 w-4" />
              返回首页
            </Button>
            <Button
              variant="outline"
              onClick={() => router.back()}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              返回上一页
            </Button>
          </div>

          <div className="pt-4 border-t">
            <p className="text-sm text-muted-foreground mb-3">
              可能的原因：
            </p>
            <ul className="text-sm text-muted-foreground space-y-1 text-left inline-block">
              <li className="flex items-center gap-2">
                <Search className="h-3 w-3" />
                页面地址输入错误
              </li>
              <li className="flex items-center gap-2">
                <Search className="h-3 w-3" />
                页面已被删除或移动
              </li>
              <li className="flex items-center gap-2">
                <Search className="h-3 w-3" />
                您没有访问该页面的权限
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
