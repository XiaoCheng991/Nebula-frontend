"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import { Upload, User, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { AvatarCropDialog } from "@/components/ui/avatar-crop-dialog"
import { UserAvatar } from "@/components/ui/user-avatar"
import LayoutWithFullWidth from "@/components/LayoutWithFullWidth"
import { useUser } from "@/lib/user-context"
import { uploadFile, put } from "@/lib/api/client"
import { ProtectedRoute } from "@/components/auth/AuthGuard"

interface UserProfile {
  username: string
  nickname: string
  avatarUrl: string | null
  bio: string
}

export default function SettingsPage() {
  const router = useRouter()
  const { user, loading, refreshUser, updateUser } = useUser()
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)

  // 裁剪相关状态
  const [showCropDialog, setShowCropDialog] = useState(false)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [originalFile, setOriginalFile] = useState<File | null>(null)

  const [profile, setProfile] = useState<UserProfile>({
    username: "",
    nickname: "",
    avatarUrl: null,
    bio: "",
  })

  useEffect(() => {
    if (user) {
      setProfile({
        username: user.username,
        nickname: user.nickname,
        avatarUrl: user.avatarUrl,
        bio: user.bio,
      })
    }
  }, [user])

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
    setUploading(true)
    setShowCropDialog(false)

    try {
      // 将Blob转换为File对象
      const file = new File([croppedImageBlob], originalFile?.name || 'avatar.jpg', {
        type: 'image/jpeg',
      })

      // 调用后端上传API到MinIO
      const uploadResult = await uploadFile('/api/file/upload', file)

      // 调用API保存头像信息到数据库（使用统一的 put 方法，支持 token 刷新）
      await put('/api/user/profile/avatar', {
        avatarName: uploadResult.fileName,
        avatarUrl: uploadResult.url,
        avatarSize: file.size,
      })

      // 更新本地状态
      const newAvatarUrl = uploadResult.url
      setProfile(prev => ({ ...prev, avatarUrl: newAvatarUrl }))

      // 更新全局用户状态
      updateUser({ avatarUrl: newAvatarUrl })

      // 刷新服务器数据（同步到 localStorage）
      await refreshUser()

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

  const handleSave = async () => {
    setSaving(true)
    try {
      // 调用API保存用户档案
      await put('/api/user/profile', {
        username: profile.username,
        nickname: profile.nickname,
        bio: profile.bio,
        avatar: profile.avatarUrl,
      })

      // 更新全局用户状态
      updateUser({
        nickname: profile.nickname,
        avatarUrl: profile.avatarUrl,
      })

      // 刷新服务器数据
      await refreshUser()

      toast({
        title: "保存成功",
        description: "个人信息已更新",
      })
    } catch (error: any) {
      console.error('Error saving:', error)
      toast({
        title: "保存失败",
        description: error.message || "无法保存信息",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <LayoutWithFullWidth>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </LayoutWithFullWidth>
    )
  }

  return (
    <ProtectedRoute>
      <LayoutWithFullWidth>
        <div className="space-y-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">账号设置</h1>
          <p className="text-muted-foreground mt-1">
            管理你的个人信息和偏好设置
          </p>
        </div>

        {/* 头像设置 */}
        <Card className="admin-card">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-orange-500" />
              个人头像
            </CardTitle>
            <CardDescription>
              上传你的个人头像，让朋友更容易认出你
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-6">
              <div className="relative">
                <UserAvatar
                  avatarUrl={profile.avatarUrl}
                  nickname={profile.nickname}
                  username={profile.username}
                  size="lg"
                  className="w-24 h-24 shadow-lg ring-4 ring-orange-500/10"
                />
              </div>

              <div className="flex-1">
                <Label htmlFor="avatar-upload" className="cursor-pointer">
                  <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg shadow-orange-500/25">
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
                </Label>
                <Input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarUpload}
                  disabled={uploading}
                />
                <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    支持 JPG, PNG, GIF
                  </span>
                  <span>最大 10MB</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 基本信息 */}
        <Card className="admin-card">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-amber-500" />
              基本信息
            </CardTitle>
            <CardDescription>
              你的账号基本信息
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* 用户名 */}
              <div className="space-y-2">
                <Label htmlFor="username" className="text-foreground">用户名</Label>
                <Input
                  id="username"
                  value={profile.username}
                  disabled
                  className="bg-[var(--glass-bg)]"
                />
                <p className="text-xs text-muted-foreground">用户名唯一且不可修改</p>
              </div>

              {/* 昵称 */}
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="nickname">昵称</Label>
                <Input
                  id="nickname"
                  value={profile.nickname}
                  onChange={(e) => setProfile(prev => ({ ...prev, nickname: e.target.value }))}
                  placeholder="输入昵称"
                  maxLength={100}
                />
                <div className="flex justify-end">
                  <span className="text-xs text-muted-foreground">
                    {profile.nickname?.length || 0}/100
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 个人简介 */}
        <Card className="admin-card">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2">
              <span className="text-xl">💬</span>
              个人简介
            </CardTitle>
            <CardDescription>
              介绍一下自己，让朋友们更好地了解你
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="bio" className="text-foreground">简介内容</Label>
              <Textarea
                id="bio"
                value={profile.bio}
                onChange={(e) => setProfile(prev => ({ ...prev, bio: e.target.value }))}
                placeholder="写点什么介绍自己..."
                rows={3}
                maxLength={500}
                className="resize-none"
              />
              <div className="flex justify-end">
                <span className={`text-xs ${(profile.bio?.length || 0) >= 500 ? 'text-red-500' : 'text-muted-foreground'}`}>
                  {profile.bio?.length || 0} / 500
                </span>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button
                onClick={handleSave}
                disabled={saving}
                className="gap-2 px-6 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 shadow-lg shadow-orange-500/25"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>保存中...</span>
                  </>
                ) : (
                  <>
                    <span>💾</span>
                    <span className="font-medium">保存更改</span>
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
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
    </LayoutWithFullWidth>
    </ProtectedRoute>
  )
}
