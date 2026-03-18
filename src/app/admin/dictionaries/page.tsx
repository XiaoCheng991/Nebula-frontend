'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { BookOpen, Plus, Edit, Trash2, RefreshCw } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { useConfirm } from '@/components/ui/confirm-dialog'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import { ResizableTable, formatDate } from '@/app/admin/_components/table/ResizableTable'
import {
  getDictTypeList,
  addDictType,
  updateDictType,
  deleteDictType,
  getDictDataList,
  addDictData,
  updateDictData,
  deleteDictData,
} from '@/lib/api/modules/admin'
import type { SysDictType, SysDictData } from '@/lib/api/modules/admin'

// ======== 字典类型编辑抽屉 ========

interface DictTypeDrawerProps {
  dictType: SysDictType | null
  isOpen: boolean
  onClose: () => void
  onSave: (data: Partial<SysDictType>) => void
  isEdit: boolean
}

function DictTypeDrawer({ dictType, isOpen, onClose, onSave, isEdit }: DictTypeDrawerProps) {
  const [formData, setFormData] = useState<Partial<SysDictType>>({
    dictName: '',
    dictCode: '',
    status: 'ACTIVE',
    remark: '',
  })

  useEffect(() => {
    if (dictType && isEdit) {
      setFormData({
        dictName: dictType.dictName,
        dictCode: dictType.dictCode,
        status: dictType.status,
        remark: dictType.remark || '',
      })
    } else {
      setFormData({
        dictName: '',
        dictCode: '',
        status: 'ACTIVE',
        remark: '',
      })
    }
  }, [dictType, isEdit, isOpen])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <Sheet open={isOpen} onOpenChange={(open) => { if (!open) onClose() }}>
      <SheetContent
        side="right"
        style={{ background: 'var(--bg-base)', borderColor: 'var(--glass-border)' }}
        className="sm:max-w-lg overflow-y-auto"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <SheetHeader className="pb-0">
          <SheetTitle className="text-base">{isEdit ? '编辑字典类型' : '新增字典类型'}</SheetTitle>
          <SheetDescription>
            {isEdit ? '修改字典类型信息' : '添加新的字典类型'}
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="px-5 py-4 space-y-4">
          {/* 字典名称 */}
          <div>
            <label className="form-label" style={{ marginBottom: '0.375rem' }}>
              字典名称 <span style={{ color: 'var(--accent)' }}>*</span>
            </label>
            <input
              type="text"
              className="form-input"
              value={formData.dictName}
              onChange={(e) => setFormData({ ...formData, dictName: e.target.value })}
              placeholder="请输入字典名称"
              required
            />
          </div>

          {/* 字典编码 */}
          <div>
            <label className="form-label" style={{ marginBottom: '0.375rem' }}>
              字典编码 <span style={{ color: 'var(--accent)' }}>*</span>
            </label>
            <input
              type="text"
              className="form-input"
              value={formData.dictCode}
              onChange={(e) => setFormData({ ...formData, dictCode: e.target.value })}
              placeholder="请输入字典编码"
              required
              disabled={isEdit}
              style={isEdit ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
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
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            >
              <option value="ACTIVE">启用</option>
              <option value="DISABLED">禁用</option>
            </select>
          </div>

          {/* 描述 */}
          <div>
            <label className="form-label" style={{ marginBottom: '0.375rem' }}>
              描述
            </label>
            <textarea
              className="form-input form-textarea"
              value={formData.remark}
              onChange={(e) => setFormData({ ...formData, remark: e.target.value })}
              placeholder="请输入描述信息"
              rows={3}
            />
          </div>

          {/* 编辑模式显示ID */}
          {isEdit && dictType && (
            <div
              className="p-3 rounded-lg"
              style={{
                borderTop: '1px solid var(--glass-border)',
                background: 'var(--glass-bg)',
                color: 'var(--text-tertiary)',
              }}
            >
              <div className="flex items-center gap-2">
                <span className="text-xs leading-none">ID</span>
                <span className="text-xs leading-none">{dictType.id}</span>
              </div>
            </div>
          )}

          {/* 操作按钮 */}
          <div
            className="flex justify-end gap-3 pt-4"
            style={{ borderTop: '1px solid var(--glass-border)' }}
          >
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
  )
}

// ======== 字典数据编辑抽屉 ========

interface DictDataDrawerProps {
  dictData: SysDictData | null
  dictTypeId: number
  isOpen: boolean
  onClose: () => void
  onSave: (data: Partial<SysDictData>) => void
  isEdit: boolean
}

function DictDataDrawer({ dictData, dictTypeId, isOpen, onClose, onSave, isEdit }: DictDataDrawerProps) {
  const [formData, setFormData] = useState<Partial<SysDictData>>({
    dictLabel: '',
    dictValue: '',
    sortOrder: 0,
    status: 'ACTIVE',
  })

  useEffect(() => {
    if (dictData && isEdit) {
      setFormData({
        dictLabel: dictData.dictLabel,
        dictValue: dictData.dictValue,
        sortOrder: dictData.sortOrder,
        status: dictData.status,
      })
    } else {
      setFormData({
        dictLabel: '',
        dictValue: '',
        sortOrder: 0,
        status: 'ACTIVE',
      })
    }
  }, [dictData, isEdit, isOpen])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({ ...formData, dictTypeId })
  }

  return (
    <Sheet open={isOpen} onOpenChange={(open) => { if (!open) onClose() }}>
      <SheetContent
        side="right"
        style={{ background: 'var(--bg-base)', borderColor: 'var(--glass-border)' }}
        className="sm:max-w-lg overflow-y-auto"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <SheetHeader className="pb-0">
          <SheetTitle className="text-base">{isEdit ? '编辑字典数据' : '新增字典数据'}</SheetTitle>
          <SheetDescription>
            {isEdit ? '修改字典数据信息' : '添加新的字典数据'}
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="px-5 py-4 space-y-4">
          {/* 数据标签 */}
          <div>
            <label className="form-label" style={{ marginBottom: '0.375rem' }}>
              数据标签 <span style={{ color: 'var(--accent)' }}>*</span>
            </label>
            <input
              type="text"
              className="form-input"
              value={formData.dictLabel}
              onChange={(e) => setFormData({ ...formData, dictLabel: e.target.value })}
              placeholder="请输入数据标签"
              required
            />
          </div>

          {/* 数据值 */}
          <div>
            <label className="form-label" style={{ marginBottom: '0.375rem' }}>
              数据值 <span style={{ color: 'var(--accent)' }}>*</span>
            </label>
            <input
              type="text"
              className="form-input"
              value={formData.dictValue}
              onChange={(e) => setFormData({ ...formData, dictValue: e.target.value })}
              placeholder="请输入数据值"
              required
            />
          </div>

          {/* 排序 */}
          <div>
            <label className="form-label" style={{ marginBottom: '0.375rem' }}>
              排序
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
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            >
              <option value="ACTIVE">启用</option>
              <option value="DISABLED">禁用</option>
            </select>
          </div>

          {/* 编辑模式显示ID */}
          {isEdit && dictData && (
            <div
              className="p-3 rounded-lg"
              style={{
                borderTop: '1px solid var(--glass-border)',
                background: 'var(--glass-bg)',
                color: 'var(--text-tertiary)',
              }}
            >
              <div className="flex items-center gap-2">
                <span className="text-xs leading-none">ID</span>
                <span className="text-xs leading-none">{dictData.id}</span>
              </div>
            </div>
          )}

          {/* 操作按钮 */}
          <div
            className="flex justify-end gap-3 pt-4"
            style={{ borderTop: '1px solid var(--glass-border)' }}
          >
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
  )
}

// ======== 主页面 ========

export default function DictionariesPage() {
  // 字典类型状态
  const [dictTypes, setDictTypes] = useState<SysDictType[]>([])
  const [dictTypeLoading, setDictTypeLoading] = useState(true)
  const [selectedType, setSelectedType] = useState<SysDictType | null>(null)
  const [dictTypePagination, setDictTypePagination] = useState({
    page: 1,
    pageSize: 10,
    total: 0,
    pages: 0,
  })

  // 字典数据状态
  const [dictDataList, setDictDataList] = useState<SysDictData[]>([])
  const [dictDataLoading, setDictDataLoading] = useState(false)
  const [dictDataPagination, setDictDataPagination] = useState({
    page: 1,
    pageSize: 10,
    total: 0,
    pages: 0,
  })

  // 字典类型抽屉状态
  const [typeDrawerOpen, setTypeDrawerOpen] = useState(false)
  const [editingType, setEditingType] = useState<SysDictType | null>(null)
  const [isTypeEditMode, setIsTypeEditMode] = useState(false)

  // 字典数据抽屉状态
  const [dataDrawerOpen, setDataDrawerOpen] = useState(false)
  const [editingData, setEditingData] = useState<SysDictData | null>(null)
  const [isDataEditMode, setIsDataEditMode] = useState(false)

  const { toast } = useToast()
  const { confirm, ConfirmDialog } = useConfirm()

  // ======== 字典类型操作 ========

  const fetchDictTypes = useCallback(async () => {
    setDictTypeLoading(true)
    try {
      const response = await getDictTypeList(dictTypePagination.page, dictTypePagination.pageSize)
      if (response.code === 200 && response.data) {
        setDictTypes(response.data.records || [])
        setDictTypePagination((prev) => ({
          ...prev,
          total: response.data?.total || 0,
          pages: response.data?.pages || 0,
        }))
      } else {
        toast({
          title: '获取字典类型列表失败',
          description: response.message || '未知错误',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Failed to fetch dict types:', error)
      toast({
        title: '获取字典类型列表失败',
        description: '网络错误，请稍后重试',
        variant: 'destructive',
      })
    } finally {
      setDictTypeLoading(false)
    }
  }, [dictTypePagination.page, dictTypePagination.pageSize, toast])

  useEffect(() => {
    fetchDictTypes()
  }, [fetchDictTypes])

  const handleDictTypePageChange = (newPage: number) => {
    setDictTypePagination((prev) => ({ ...prev, page: newPage }))
  }

  const handleAddDictType = () => {
    setEditingType(null)
    setIsTypeEditMode(false)
    setTypeDrawerOpen(true)
  }

  const handleEditDictType = (dictType: SysDictType) => {
    setEditingType(dictType)
    setIsTypeEditMode(true)
    setTypeDrawerOpen(true)
  }

  const handleSaveDictType = async (data: Partial<SysDictType>) => {
    try {
      let response
      if (isTypeEditMode && editingType) {
        response = await updateDictType({ ...data, id: editingType.id })
      } else {
        response = await addDictType(data)
      }
      if (response.code === 200) {
        toast({
          title: isTypeEditMode ? '保存成功' : '创建成功',
          description: isTypeEditMode ? '字典类型信息已更新' : '新字典类型已添加',
        })
        setTypeDrawerOpen(false)
        setEditingType(null)
        fetchDictTypes()
      } else {
        toast({
          title: isTypeEditMode ? '保存失败' : '创建失败',
          description: response.message,
          variant: 'destructive',
        })
      }
    } catch (error) {
      toast({
        title: isTypeEditMode ? '保存失败' : '创建失败',
        description: '网络错误',
        variant: 'destructive',
      })
    }
  }

  const handleDeleteDictType = async (dictType: SysDictType) => {
    const confirmed = await confirm({
      title: '删除字典类型',
      description: `确定要删除字典类型「${dictType.dictName}」吗？此操作不可恢复。`,
      confirmText: '删除',
      cancelText: '取消',
      variant: 'danger',
    })
    if (!confirmed) return
    try {
      const response = await deleteDictType(dictType.id)
      if (response.code === 200) {
        toast({
          title: '删除成功',
          description: `字典类型「${dictType.dictName}」已删除`,
        })
        // 如果删除的是当前选中的，清除选中
        if (selectedType?.id === dictType.id) {
          setSelectedType(null)
          setDictDataList([])
        }
        fetchDictTypes()
      } else {
        toast({
          title: '删除失败',
          description: response.message,
          variant: 'destructive',
        })
      }
    } catch (error) {
      toast({
        title: '删除失败',
        description: '网络错误',
        variant: 'destructive',
      })
    }
  }

  // ======== 选中字典类型，加载字典数据 ========

  const fetchDictData = useCallback(async () => {
    if (!selectedType) return
    setDictDataLoading(true)
    try {
      const response = await getDictDataList(
        selectedType.id,
        dictDataPagination.page,
        dictDataPagination.pageSize
      )
      if (response.code === 200 && response.data) {
        setDictDataList(response.data.records || [])
        setDictDataPagination((prev) => ({
          ...prev,
          total: response.data?.total || 0,
          pages: response.data?.pages || 0,
        }))
      } else {
        toast({
          title: '获取字典数据列表失败',
          description: response.message || '未知错误',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Failed to fetch dict data:', error)
      toast({
        title: '获取字典数据列表失败',
        description: '网络错误，请稍后重试',
        variant: 'destructive',
      })
    } finally {
      setDictDataLoading(false)
    }
  }, [selectedType, dictDataPagination.page, dictDataPagination.pageSize, toast])

  useEffect(() => {
    if (selectedType) {
      fetchDictData()
    }
  }, [selectedType, fetchDictData])

  const handleSelectType = (dictType: SysDictType) => {
    setSelectedType(dictType)
    setDictDataPagination({ page: 1, pageSize: 10, total: 0, pages: 0 })
  }

  const handleDictDataPageChange = (newPage: number) => {
    setDictDataPagination((prev) => ({ ...prev, page: newPage }))
  }

  const handleAddDictData = () => {
    setEditingData(null)
    setIsDataEditMode(false)
    setDataDrawerOpen(true)
  }

  const handleEditDictData = (dictData: SysDictData) => {
    setEditingData(dictData)
    setIsDataEditMode(true)
    setDataDrawerOpen(true)
  }

  const handleSaveDictData = async (data: Partial<SysDictData>) => {
    try {
      let response
      if (isDataEditMode && editingData) {
        response = await updateDictData({ ...data, id: editingData.id })
      } else {
        response = await addDictData(data)
      }
      if (response.code === 200) {
        toast({
          title: isDataEditMode ? '保存成功' : '创建成功',
          description: isDataEditMode ? '字典数据信息已更新' : '新字典数据已添加',
        })
        setDataDrawerOpen(false)
        setEditingData(null)
        fetchDictData()
      } else {
        toast({
          title: isDataEditMode ? '保存失败' : '创建失败',
          description: response.message,
          variant: 'destructive',
        })
      }
    } catch (error) {
      toast({
        title: isDataEditMode ? '保存失败' : '创建失败',
        description: '网络错误',
        variant: 'destructive',
      })
    }
  }

  const handleDeleteDictData = async (dictData: SysDictData) => {
    const confirmed = await confirm({
      title: '删除字典数据',
      description: `确定要删除字典数据「${dictData.dictLabel}」吗？此操作不可恢复。`,
      confirmText: '删除',
      cancelText: '取消',
      variant: 'danger',
    })
    if (!confirmed) return
    try {
      const response = await deleteDictData(dictData.id)
      if (response.code === 200) {
        toast({
          title: '删除成功',
          description: `字典数据「${dictData.dictLabel}」已删除`,
        })
        fetchDictData()
      } else {
        toast({
          title: '删除失败',
          description: response.message,
          variant: 'destructive',
        })
      }
    } catch (error) {
      toast({
        title: '删除失败',
        description: '网络错误',
        variant: 'destructive',
      })
    }
  }

  // ======== 字典类型表格列定义 ========

  const dictTypeColumns = [
    {
      key: 'index',
      header: '序号',
      width: 80,
      minWidth: 60,
      render: (_: any, __: any, index: number) => (
        <span className="text-mono">
          {(dictTypePagination.page - 1) * dictTypePagination.pageSize + index + 1}
        </span>
      ),
    },
    {
      key: 'dictName',
      header: '字典名称',
      width: 200,
      minWidth: 150,
      render: (value: string) => <span className="font-medium">{value}</span>,
    },
    {
      key: 'dictCode',
      header: '字典编码',
      width: 180,
      minWidth: 120,
      render: (value: string) => <span className="text-mono">{value}</span>,
    },
    {
      key: 'status',
      header: '状态',
      width: 100,
      minWidth: 80,
      render: (value: string) => (
        <span className={`admin-badge ${value === 'ACTIVE' ? 'success' : 'warning'}`}>
          {value === 'ACTIVE' ? '启用' : '禁用'}
        </span>
      ),
    },
    {
      key: 'createTime',
      header: '创建时间',
      width: 180,
      minWidth: 150,
      render: (value: string) => formatDate(value),
    },
    {
      key: 'actions',
      header: '操作',
      width: 120,
      minWidth: 100,
      render: (_: any, dictType: SysDictType) => (
        <div className="action-buttons">
          <button
            className="action-btn"
            onClick={(e) => {
              e.stopPropagation()
              handleEditDictType(dictType)
            }}
            title="编辑"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            className="action-btn danger"
            onClick={(e) => {
              e.stopPropagation()
              handleDeleteDictType(dictType)
            }}
            title="删除"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ]

  // ======== 字典数据表格列定义 ========

  const dictDataColumns = [
    {
      key: 'index',
      header: '序号',
      width: 80,
      minWidth: 60,
      render: (_: any, __: any, index: number) => (
        <span className="text-mono">
          {(dictDataPagination.page - 1) * dictDataPagination.pageSize + index + 1}
        </span>
      ),
    },
    {
      key: 'dictLabel',
      header: '数据标签',
      width: 180,
      minWidth: 120,
      render: (value: string) => <span className="font-medium">{value}</span>,
    },
    {
      key: 'dictValue',
      header: '数据值',
      width: 150,
      minWidth: 100,
      render: (value: string) => <span className="text-mono">{value}</span>,
    },
    {
      key: 'sortOrder',
      header: '排序',
      width: 80,
      minWidth: 60,
      render: (value: number) => <span>{value ?? 0}</span>,
    },
    {
      key: 'status',
      header: '状态',
      width: 100,
      minWidth: 80,
      render: (value: string) => (
        <span className={`admin-badge ${value === 'ACTIVE' ? 'success' : 'warning'}`}>
          {value === 'ACTIVE' ? '启用' : '禁用'}
        </span>
      ),
    },
    {
      key: 'createTime',
      header: '创建时间',
      width: 180,
      minWidth: 150,
      render: (value: string) => formatDate(value),
    },
    {
      key: 'actions',
      header: '操作',
      width: 120,
      minWidth: 100,
      render: (_: any, dictData: SysDictData) => (
        <div className="action-buttons">
          <button
            className="action-btn"
            onClick={(e) => {
              e.stopPropagation()
              handleEditDictData(dictData)
            }}
            title="编辑"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            className="action-btn danger"
            onClick={(e) => {
              e.stopPropagation()
              handleDeleteDictData(dictData)
            }}
            title="删除"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ]

  // ======== 渲染 ========

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="page-header">
        <div className="page-header-icon">
          <BookOpen />
        </div>
        <div>
          <h1 className="page-header-title">字典管理</h1>
          <p className="page-header-subtitle">管理系统字典类型和字典数据</p>
        </div>
        <div className="flex gap-2 ml-auto">
          <button className="btn-secondary gap-2" onClick={fetchDictTypes}>
            <RefreshCw className="h-4 w-4" />
            刷新
          </button>
          <button className="btn-primary gap-2" onClick={handleAddDictType}>
            <Plus className="h-4 w-4" />
            新增字典
          </button>
        </div>
      </div>

      {/* 字典类型表格 */}
      <div className="data-table-container">
        <div className="data-table-header">
          <div className="data-table-header-left">
            <h2 className="data-table-title">字典类型列表</h2>
            <span className="data-table-description">
              共 {dictTypePagination.total} 条记录
              {selectedType && (
                <span style={{ color: 'var(--accent)', marginLeft: '0.5rem' }}>
                  （已选中：{selectedType.dictName}）
                </span>
              )}
            </span>
          </div>
        </div>

        <div className="p-4">
          <ResizableTable
            columns={dictTypeColumns}
            data={dictTypes}
            loading={dictTypeLoading}
            emptyText="暂无字典类型数据"
            pagination={{
              current: dictTypePagination.page,
              pageSize: dictTypePagination.pageSize,
              total: dictTypePagination.total,
            }}
            onPageChange={handleDictTypePageChange}
          />
        </div>
      </div>

      {/* 字典数据面板（选中字典类型后显示） */}
      {selectedType && (
        <div className="data-table-container" style={{ borderColor: 'var(--accent-border)' }}>
          <div className="data-table-header">
            <div className="data-table-header-left">
              <h2 className="data-table-title">
                <span style={{ color: 'var(--accent)' }}>{selectedType.dictName}</span> - 字典数据
              </h2>
              <span className="data-table-description">
                共 {dictDataPagination.total} 条记录
              </span>
            </div>
            <div className="data-table-header-right">
              <button className="btn-primary gap-2" onClick={handleAddDictData}>
                <Plus className="h-4 w-4" />
                新增数据
              </button>
            </div>
          </div>

          <div className="p-4">
            <ResizableTable
              columns={dictDataColumns}
              data={dictDataList}
              loading={dictDataLoading}
              emptyText="暂无字典数据"
              pagination={{
                current: dictDataPagination.page,
                pageSize: dictDataPagination.pageSize,
                total: dictDataPagination.total,
              }}
              onPageChange={handleDictDataPageChange}
            />
          </div>
        </div>
      )}

      {/* 字典类型编辑抽屉 */}
      <DictTypeDrawer
        dictType={editingType}
        isOpen={typeDrawerOpen}
        onClose={() => {
          setTypeDrawerOpen(false)
          setEditingType(null)
        }}
        onSave={handleSaveDictType}
        isEdit={isTypeEditMode}
      />

      {/* 字典数据编辑抽屉 */}
      <DictDataDrawer
        dictData={editingData}
        dictTypeId={selectedType?.id || 0}
        isOpen={dataDrawerOpen}
        onClose={() => {
          setDataDrawerOpen(false)
          setEditingData(null)
        }}
        onSave={handleSaveDictData}
        isEdit={isDataEditMode}
      />

      {/* 确认弹窗 */}
      <ConfirmDialog />
    </div>
  )
}
