'use client';

import { AlertTriangle, Home, RefreshCw } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="zh-CN">
      <body style={{ margin: 0, padding: 0, background: '#1c1c1e', minHeight: '100vh' }}>
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1.5rem',
          background: 'linear-gradient(to bottom right, rgba(245, 166, 35, 0.05), transparent, rgba(245, 166, 35, 0.03))',
        }}>
          <div style={{
            maxWidth: '32rem',
            width: '100%',
            textAlign: 'center',
            background: 'rgba(255, 255, 255, 0.06)',
            border: '1px solid rgba(255, 255, 255, 0.10)',
            borderRadius: '1.5rem',
            padding: '3rem',
          }}>
            <div style={{
              width: '6rem',
              height: '6rem',
              margin: '0 auto 1.5rem',
              borderRadius: '50%',
              background: 'rgba(239, 68, 68, 0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <AlertTriangle style={{ width: '3rem', height: '3rem', color: '#ef4444' }} />
            </div>

            <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'rgba(255, 255, 255, 0.95)', marginBottom: '0.5rem' }}>
              出错了
            </h1>
            <p style={{ fontSize: '1rem', color: 'rgba(255, 255, 255, 0.6)', marginBottom: '2rem' }}>
              应用遇到了严重错误，请刷新页面重试
            </p>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                onClick={reset}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '1rem',
                  background: 'linear-gradient(to right, #f59e0b, #f59e0b)',
                  color: '#fff',
                  fontWeight: 600,
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                }}
              >
                <RefreshCw style={{ width: '1rem', height: '1rem' }} />
                重试
              </button>
              <a
                href="/home"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '1rem',
                  background: 'rgba(255, 255, 255, 0.06)',
                  border: '1px solid rgba(255, 255, 255, 0.10)',
                  color: 'rgba(255, 255, 255, 0.95)',
                  fontWeight: 500,
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  textDecoration: 'none',
                }}
              >
                <Home style={{ width: '1rem', height: '1rem' }} />
                返回首页
              </a>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
