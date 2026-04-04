"use client"

import { useMemo, useState } from "react"

interface UserAvatarProps {
  avatarUrl?: string | null
  nickname?: string | null
  email?: string | null
  username?: string | null
  size?: "sm" | "md" | "lg"
  className?: string
}

export function UserAvatar({
  avatarUrl,
  nickname,
  email,
  username,
  size = "md",
  className = ""
}: UserAvatarProps) {
  const [imageError, setImageError] = useState(false)

  const sizeClasses = {
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-16 h-16 text-xl"
  }

  const sizeClass = sizeClasses[size]

  // 获取用于显示的文字
  const displayText = useMemo(() => {
    const text = nickname || username || email || ""
    if (!text) return "U"

    const chars = text.split('')
    const chineseChars = chars.filter(char => /[\u4e00-\u9fa5]/.test(char))

    if (chineseChars.length > 0) {
      return chineseChars[0]
    }
    return chars[0].toUpperCase()
  }, [nickname, username, email])

  // 根据用户名生成确定性 DiceBear 像素风头像
  const pixelAvatarUrl = useMemo(() => {
    const seed = username || email || nickname || 'default'
    return `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(seed)}&backgroundColor=c0aede,d4e4ff,c0aede`
  }, [username, email, nickname])

  // 有真实头像 URL 就用真实的，没有就用像素风默认头像
  const hasCustomAvatar = Boolean(avatarUrl)
  const src = hasCustomAvatar ? avatarUrl : pixelAvatarUrl

  return (
    <>
      {imageError ? (
        <div className={`${sizeClass} rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center shadow-lg ${className}`}>
          <span className="text-white font-bold">{displayText}</span>
        </div>
      ) : (
        <img
          src={src}
          alt={nickname || "Avatar"}
          className={`${sizeClass} rounded-full object-cover ${className}`}
          onError={() => setImageError(true)}
        />
      )}
    </>
  )
}
