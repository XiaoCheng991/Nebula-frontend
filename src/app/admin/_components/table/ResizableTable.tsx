'use client'

import React, { useState, useRef, useEffect, useCallback } from 'react'
import { cn } from '@/lib/utils'

interface Column {
  key: string
  header: string
  width?: number
  minWidth?: number
  maxWidth?: number
  render?: (value: any, row: any, index: number) => React.ReactNode
}

interface ResizableTableProps {
  columns: Column[]
  data: any[]
  loading?: boolean
  emptyText?: string
  pagination?: {
    current: number
    pageSize: number
    total: number
  }
  onPageChange?: (page: number) => void
}

export function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return '-'
  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return dateString

    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')

    return `${year}/${month}/${day} ${hours}:${minutes}`
  } catch {
    return dateString
  }
}

export function ResizableTable({
  columns: initialColumns,
  data,
  loading = false,
  emptyText = '暂无数据',
  pagination,
  onPageChange
}: ResizableTableProps) {
  const [columns, setColumns] = useState<Column[]>(() =>
    initialColumns.map(col => ({
      ...col,
      width: col.width || 150,
      minWidth: col.minWidth || 80,
      maxWidth: col.maxWidth || 400
    }))
  )
  const [resizing, setResizing] = useState<{ index: number; startX: number; startWidth: number } | null>(null)
  const tableRef = useRef<HTMLTableElement>(null)

  // 鼠标事件处理
  useEffect(() => {
    if (!resizing) return

    const handleMouseMoveGlobal = (e: MouseEvent) => {
      const diff = e.clientX - resizing.startX
      const newWidth = Math.min(
        Math.max(resizing.startWidth + diff, columns[resizing.index].minWidth || 80),
        columns[resizing.index].maxWidth || 400
      )

      setColumns(prev => prev.map((col, i) =>
        i === resizing.index ? { ...col, width: newWidth } : col
      ))
    }

    const handleMouseUpGlobal = () => {
      setResizing(null)
    }

    document.addEventListener('mousemove', handleMouseMoveGlobal)
    document.addEventListener('mouseup', handleMouseUpGlobal)
    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'

    return () => {
      document.removeEventListener('mousemove', handleMouseMoveGlobal)
      document.removeEventListener('mouseup', handleMouseUpGlobal)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }
  }, [resizing, columns])

  // 更新列配置当initialColumns改变时
  useEffect(() => {
    setColumns(initialColumns.map(col => ({
      ...col,
      width: col.width || 150,
      minWidth: col.minWidth || 80,
      maxWidth: col.maxWidth || 400
    })))
  }, [initialColumns])

  const renderCell = (column: Column, row: any, index: number) => {
    const value = row[column.key]
    if (column.render) {
      return column.render(value, row, index)
    }
    return value ?? '-'
  }

  return (
    <div className="w-full overflow-hidden">
      <div className="overflow-x-auto">
        <table ref={tableRef} className="w-full border-collapse" style={{ tableLayout: 'fixed' }}>
          <thead>
            <tr className="border-b border-[var(--glass-border)]">
              {columns.map((column, index) => (
                <th
                  key={column.key}
                  className="relative px-4 py-3 text-left text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider select-none"
                  style={{
                    width: column.width,
                    minWidth: column.minWidth,
                    maxWidth: column.maxWidth,
                    position: 'sticky',
                    top: 0,
                    zIndex: 10,
                    backgroundColor: 'var(--glass-bg)',
                    backdropFilter: 'var(--glass-blur)',
                    WebkitBackdropFilter: 'var(--glass-blur)',
                    borderBottom: '1px solid var(--glass-border)'
                  }}
                >
                  <div className="flex items-center justify-between">
                    <span className="truncate">{column.header}</span>
                    {/* 拖动调整手柄 */}
                    {index < columns.length - 1 && (
                      <div
                        className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-[var(--accent)] transition-colors"
                        onMouseDown={(e) => {
                          e.preventDefault()
                          setResizing({ index, startX: e.clientX, startWidth: column.width || 150 })
                        }}
                      />
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--glass-border)]">
            {loading ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-12 text-center">
                  <div className="loading-state">
                    <div className="loading-spinner" />
                    <span>加载中...</span>
                  </div>
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-12 text-center">
                  <div className="empty-state">{emptyText}</div>
                </td>
              </tr>
            ) : (
              data.map((row, rowIndex) => (
                <tr
                  key={row.id || rowIndex}
                  className="hover:bg-[var(--glass-bg)] transition-colors"
                >
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className="px-4 py-3 text-sm text-[var(--text-secondary)]"
                      style={{
                        width: column.width,
                        minWidth: column.minWidth,
                        maxWidth: column.maxWidth,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}
                      title={String(renderCell(column, row, rowIndex))}
                    >
                      {renderCell(column, row, rowIndex)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* 分页 */}
      {pagination && data.length > 0 && !loading && (
        <div className="pagination">
          <div className="pagination-info">
            第 {pagination.current} / {Math.ceil(pagination.total / pagination.pageSize)} 页，
            共 {pagination.total} 条
          </div>
          <div className="pagination-controls">
            <button
              className="pagination-btn"
              disabled={pagination.current <= 1}
              onClick={() => onPageChange?.(pagination.current - 1)}
            >
              ←
            </button>
            {Array.from(
              { length: Math.min(5, Math.ceil(pagination.total / pagination.pageSize)) },
              (_, i) => {
                const pageNum = i + 1
                return (
                  <button
                    key={pageNum}
                    className={cn(
                      'pagination-btn',
                      pagination.current === pageNum && 'active'
                    )}
                    onClick={() => onPageChange?.(pageNum)}
                  >
                    {pageNum}
                  </button>
                )
              }
            )}
            <button
              className="pagination-btn"
              disabled={pagination.current >= Math.ceil(pagination.total / pagination.pageSize)}
              onClick={() => onPageChange?.(pagination.current + 1)}
            >
              →
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
