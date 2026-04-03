"use client"

import { useState, useEffect, useCallback } from "react"
import { Camera, Loader2, Settings, User } from "lucide-react"
import { useRouter } from "next/navigation"
import { UserAvatar } from "@/components/ui/user-avatar"
import { AvatarCropDialog } from "@/components/ui/avatar-crop-dialog"
import LayoutWithFullWidth from "@/components/LayoutWithFullWidth"
import { useUser } from "@/lib/user-context"
import { ProtectedRoute } from "@/components/auth/AuthGuard"
import { supabase } from "@/lib/supabase/client"
import { uploadAvatar } from "@/lib/api/modules/file"
import { getLocalUserInfo } from "@/lib/api"
import { toast } from "@/components/ui/use-toast"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

export default function SettingsPage() {
  const router = useRouter()
  const { user, loading, refreshUser, updateUser } = useUser()
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)

  // 裁剪相关状态
  const [showCropDialog, setShowCropDialog] = useState(false)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [originalFile, setOriginalFile] = useState<File | null>(null)

  const [isMounted, setIsMounted] = useState(false)

  const [profile, setProfile] = useState({
    username: "",
    nickname: "",
    avatarUrl: null as string | null,
    avatarName: null as string | null,
    bio: "",
  })

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    if (user) {
      const localUser = getLocalUserInfo()
      setProfile({
        username: user.username,
        nickname: user.nickname,
        avatarUrl: user.avatarUrl,
        avatarName: localUser?.avatarName || null,
        bio: user.bio,
      })
    }
  }, [user])

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast({ title: "文件类型错误", description: "请上传图片文件", variant: "destructive" })
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      toast({ title: "文件过大", description: "图片大小不能超过 10MB", variant: "destructive" })
      return
    }

    setOriginalFile(file)
    const imageUrl = URL.createObjectURL(file)
    setSelectedImage(imageUrl)
    setShowCropDialog(true)

    e.target.value = ''
  }

  const handleCropComplete = async (croppedImageBlob: Blob) => {
    const localUser = getLocalUserInfo()
    const userId = user?.username || localUser?.id?.toString() || null

    if (!userId) {
      toast({ title: "错误", description: "请先登录", variant: "destructive" })
      setShowCropDialog(false)
      return
    }

    setUploading(true)
    setShowCropDialog(false)

    try {
      const file = new File([croppedImageBlob], `avatar_${Date.now()}.jpg`, {
        type: 'image/jpeg',
      })
      const publicUrl = await uploadAvatar(file)

      const { data: { user: supabaseUser } } = await supabase.auth.getUser()
      if (supabaseUser) {
        await supabase.auth.updateUser({
          data: { avatar_url: publicUrl }
        })
      }

      setProfile(prev => ({ ...prev, avatarUrl: publicUrl, avatarName: publicUrl }))

      if (localUser) {
        localStorage.setItem('userInfo', JSON.stringify({
          ...localUser,
          avatar: publicUrl,
          avatar_name: publicUrl,
        }))
      }

      updateUser({ avatarUrl: publicUrl })

      toast({ title: "上传成功", description: "头像已更新" })
    } catch (error: any) {
      console.error('Avatar upload error:', error)
      toast({ title: "上传失败", description: error.message || "无法上传头像", variant: "destructive" })
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
      const { data: { user: supabaseUser } } = await supabase.auth.getUser()

      if (supabaseUser) {
        await supabase.auth.updateUser({
          data: {
            nickname: profile.nickname,
            bio: profile.bio,
            avatar_url: profile.avatarUrl,
          }
        })
      }

      updateUser({
        nickname: profile.nickname,
        avatarUrl: profile.avatarUrl,
      })

      toast({ title: "保存成功", description: "个人信息已更新" })
    } catch (error: any) {
      console.error('Error saving:', error)
      toast({ title: "保存失败", description: error.message || "无法保存信息", variant: "destructive" })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <LayoutWithFullWidth>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-5 w-5 animate-spin text-orange-500" />
        </div>
      </LayoutWithFullWidth>
    )
  }

  return (
    <ProtectedRoute>
      <LayoutWithFullWidth>
        <div className="bg-gradient-to-br from-zinc-50 via-transparent to-zinc-100 dark:from-zinc-950 dark:to-zinc-900 min-h-screen">
          <div className="max-w-2xl mx-auto px-4 pt-24 pb-12">
            {/* Page Header */}
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-2">
                <Settings className="h-4 w-4 text-zinc-400" />
                <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                  <span className="tracking-widest text-xs">SETTINGS</span>
                </span>
              </div>
              <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">账号设置</h1>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">管理你的个人信息</p>
            </div>

            {/* Avatar + Profile combined card */}
            <Card className="border-0 bg-white/90 dark:bg-zinc-900/60 backdrop-blur-xl shadow-lg mb-4">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-6 pb-4 border-b border-zinc-200 dark:border-zinc-700">
                  <User className="h-4 w-4 text-zinc-400" />
                  <span className="text-xs tracking-widest font-medium text-zinc-500 dark:text-zinc-400">PROFILE</span>
                </div>

                {/* Avatar */}
                <div className="flex items-center gap-5 mb-6">
                  <div className="relative">
                    <UserAvatar
                      avatarUrl={profile.avatarUrl}
                      nickname={profile.nickname}
                      username={profile.username}
                      size="lg"
                      className="w-20 h-20 shadow-md ring-2 ring-orange-500/10"
                    />
                    <label htmlFor="settings-avatar-upload" className="absolute bottom-0 right-0 bg-gradient-to-br from-orange-500 to-amber-500 rounded-full p-1.5 cursor-pointer hover:from-orange-600 hover:to-amber-600 transition-all shadow-md">
                      <Camera className="h-4 w-4 text-white" />
                      <input
                        id="settings-avatar-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleAvatarUpload}
                        disabled={uploading}
                      />
                    </label>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                      {profile.nickname || profile.username}
                    </p>
                    <p className="text-xs text-zinc-400 mt-0.5">支持 JPG, PNG, GIF · 最大 10MB</p>
                  </div>
                </div>

                {/* Form fields */}
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <Label className="text-sm font-medium text-zinc-600 dark:text-zinc-400">用户名</Label>
                    <Input
                      id="username"
                      value={profile.username}
                      disabled
                      className="h-10 text-sm bg-zinc-50 dark:bg-zinc-800/60"
                    />
                    <p className="text-[11px] text-zinc-400">用户名唯一且不可修改</p>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-sm font-medium text-zinc-600 dark:text-zinc-400">昵称</Label>
                    <Input
                      id="nickname"
                      value={profile.nickname}
                      onChange={(e) => setProfile(prev => ({ ...prev, nickname: e.target.value }))}
                      placeholder="输入昵称"
                      maxLength={100}
                      className="h-10 text-sm"
                    />
                    <div className="text-right text-[11px] text-zinc-400">
                      {profile.nickname?.length || 0}/100
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-sm font-medium text-zinc-600 dark:text-zinc-400">个人简介</Label>
                    <Textarea
                      id="bio"
                      value={profile.bio}
                      onChange={(e) => setProfile(prev => ({ ...prev, bio: e.target.value }))}
                      placeholder="写点什么介绍自己..."
                      rows={3}
                      maxLength={500}
                      className="text-sm resize-none"
                    />
                    <div className="text-right text-[11px] text-zinc-400">
                      {profile.bio?.length || 0} / 500
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <Button
                      onClick={handleSave}
                      disabled={saving}
                      size="sm"
                      className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 shadow-lg shadow-orange-500/20"
                    >
                      {saving ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />
                          保存中
                        </>
                      ) : (
                        "保存更改"
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </LayoutWithFullWidth>

      {/* 头像裁剪对话框 */}
      {selectedImage && (
        <AvatarCropDialog
          open={showCropDialog}
          onOpenChange={setShowCropDialog}
          imageSrc={selectedImage}
          onCropComplete={handleCropComplete}
        />
      )}
    </ProtectedRoute>
  )
}
