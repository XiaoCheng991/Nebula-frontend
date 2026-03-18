"use client"

import { useState, useCallback, useRef } from "react"
import { AlertTriangle, Info } from "lucide-react"
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog"

interface ConfirmOptions {
  title: string
  description?: string
  confirmText?: string
  cancelText?: string
  variant?: "default" | "danger"
}

interface ConfirmState extends ConfirmOptions {
  open: boolean
}

export function useConfirm() {
  const [state, setState] = useState<ConfirmState>({
    open: false,
    title: "",
    description: "",
    confirmText: "确认",
    cancelText: "取消",
    variant: "default",
  })

  const resolveRef = useRef<((value: boolean) => void) | null>(null)

  const confirm = useCallback(
    (options: ConfirmOptions): Promise<boolean> => {
      return new Promise<boolean>((resolve) => {
        resolveRef.current = resolve
        setState({
          open: true,
          title: options.title,
          description: options.description,
          confirmText: options.confirmText ?? "确认",
          cancelText: options.cancelText ?? "取消",
          variant: options.variant ?? "default",
        })
      })
    },
    []
  )

  const handleClose = useCallback(() => {
    setState((prev) => ({ ...prev, open: false }))
    resolveRef.current?.(false)
    resolveRef.current = null
  }, [])

  const handleConfirm = useCallback(() => {
    setState((prev) => ({ ...prev, open: false }))
    resolveRef.current?.(true)
    resolveRef.current = null
  }, [])

  const isDanger = state.variant === "danger"

  const ConfirmDialog = useCallback(
    () => (
      <AlertDialog open={state.open} onOpenChange={(open) => { if (!open) handleClose() }}>
        <AlertDialogContent className="confirm-dialog-content">
          <AlertDialogHeader className="confirm-dialog-header">
            <div className="confirm-dialog-icon-wrapper" data-variant={state.variant}>
              {isDanger ? (
                <AlertTriangle className="h-5 w-5" />
              ) : (
                <Info className="h-5 w-5" />
              )}
            </div>
            <AlertDialogTitle className="confirm-dialog-title">
              {state.title}
            </AlertDialogTitle>
            {state.description && (
              <AlertDialogDescription className="confirm-dialog-description">
                {state.description}
              </AlertDialogDescription>
            )}
          </AlertDialogHeader>
          <AlertDialogFooter className="confirm-dialog-footer">
            <AlertDialogCancel className="confirm-dialog-btn confirm-dialog-btn-cancel" onClick={handleClose}>
              {state.cancelText}
            </AlertDialogCancel>
            <AlertDialogAction
              className={`confirm-dialog-btn ${isDanger ? "confirm-dialog-btn-danger" : "confirm-dialog-btn-confirm"}`}
              onClick={handleConfirm}
            >
              {state.confirmText}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    ),
    [state, handleClose, handleConfirm, isDanger]
  )

  return { confirm, ConfirmDialog }
}
