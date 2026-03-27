"use client"

import { useState, useCallback } from "react"
import { Upload, Loader2, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { UserAvatar } from "./user-avatar"
import { AvatarCropDialog } from "./avatar-crop-dialog"
import { toast } from "./use-toast"
import { supabase, uploadAvatar, deleteAvatar } from "@/lib/supabase/client"
import { getLocalUserInfo } from "@/lib/api"

interface AvatarUploadProps {
 userId: string | number | null
 currentAvatarUrl: string | null
 currentAvatarName: string | null
 nickname?: string | null
 username?: string | null
 size?: "sm" | "md" | "lg"
 onAvatarUpdate: (avatarUrl: string, avatarName: string) => void
}

export function AvatarUpload({
 userId,
 currentAvatarUrl,
 currentAvatarName,
 nickname,
 username,
 size = "md",
 onAvatarUpdate,
}: AvatarUploadProps) {
 const [uploading, setUploading] = useState(false)
 const [showCropDialog, setShowCropDialog] = useState(false)
 const [selectedImage, setSelectedImage] = useState<string | null>(null)
 const [originalFile, setOriginalFile] = useState<File | null>(null)

 const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0]
  if (!file) return

  // 验证文件类型
  if (!file.type.startsWith('image/')) {
   toast({
    title: "文件类型错误",
    description: "请上传图片文件",
    variant: "destructive",
   })
   return
  }

  // 验证文件大小（10MB）
  if (file.size > 10 * 1024 * 1024) {
   toast({
    title: "文件过大",
    description: "图片大小不能超过 10MB",
    variant: "destructive",
   })
   return
  }

  // 保存文件并显示裁剪对话框
  setOriginalFile(file)
  const imageUrl = URL.createObjectURL(file)
  setSelectedImage(imageUrl)
  setShowCropDialog(true)

  // 清空 input
  e.target.value = ''
 }

 const handleCropComplete = async (croppedImageBlob: Blob) => {
  if (!userId) {
   toast({
    title: "错误",
    description: "用户未登录",
    variant: "destructive",
   })
   setShowCropDialog(false)
   return
  }

  setUploading(true)
  setShowCropDialog(false)

  try {
   // 将 Blob 转换为 File 对象
   const file = new File([croppedImageBlob], `${originalFile?.name || 'avatar'}.jpg`, {
    type: 'image/jpeg',
   })

   // 上传到 Supabase
   const { path, url } = await uploadAvatar(file, String(userId))

   // 如果有旧头像，删除它
   if (currentAvatarName) {
    await deleteAvatar(currentAvatarName)
   }

   // 更新本地状态
   onAvatarUpdate(url, path)

   // 刷新 Supabase 会话以同步用户数据
   const { data: { user } } = await supabase.auth.getUser()
   if (user) {
    // 更新 user 的 metadata
    await supabase.auth.updateUser({
     data: { avatar_url: url }
    })
   }

   toast({
    title: "上传成功",
    description: "头像已更新",
   })
  } catch (error: any) {
   console.error('Avatar upload error:', error)
   toast({
    title: "上传失败",
    description: error.message || "无法上传头像",
    variant: "destructive",
   })
  } finally {
   setUploading(false)
   if (selectedImage) {
    URL.revokeObjectURL(selectedImage)
    setSelectedImage(null)
   }
   setOriginalFile(null)
  }
 }

 const localUser = getLocalUserInfo()
 const displayUserId = userId || localUser?.id || null

 return (
  <>
   <div className="flex items-center gap-4">
    {/* 头像显示 */}
    <div className="relative">
     <UserAvatar
      avatarUrl={currentAvatarUrl}
      nickname={nickname}
      username={username}
      size={size}
      className="shadow-lg ring-4 ring-orange-500/10"
     />
    </div>

    {/* 上传按钮 */}
    <div className="flex-1">
     <label htmlFor="avatar-upload" className="cursor-pointer">
      <div className={`inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg shadow-orange-500/25 ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
       {uploading ? (
        <>
         <Loader2 className="h-4 w-4 animate-spin" />
         <span>上传中...</span>
        </>
       ) : (
        <>
         <Upload className="h-4 w-4" />
         <span className="font-medium">上传新头像</span>
        </>
       )}
      </div>
     </label>
     <input
      id="avatar-upload"
      type="file"
      accept="image/*"
      className="hidden"
      onChange={handleAvatarUpload}
      disabled={uploading || !displayUserId}
     />
     <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
      <span className="flex items-center gap-1">
       <span className="w-2 h-2 bg-green-500 rounded-full"></span>
       支持 JPG, PNG, GIF
      </span>
      <span>最大 10MB</span>
     </div>
    </div>
   </div>

   {/* 头像裁剪对话框 */}
   {selectedImage && (
    <AvatarCropDialog
     open={showCropDialog}
     onOpenChange={setShowCropDialog}
     imageSrc={selectedImage}
     onCropComplete={handleCropComplete}
    />
   )}
  </>
 )
}
