"use client"

import { useMemo, useState } from "react"
import { useAvatar, getDefaultAvatarUrl } from "@/hooks/useAvatar"

interface UserAvatarProps {
  /** 用户 ID，用于查询数据库头像 */
  userId?: number
  /** 用户名，用于生成默认头像 seed */
  username?: string | null
  /** 头像 URL（直接传入） */
  avatarUrl?: string | null
  /** 昵称 */
  nickname?: string | null
  email?: string | null
  size?: "sm" | "md" | "lg"
  className?: string
}

export function UserAvatar({
  userId,
  username,
  avatarUrl: directAvatarUrl,
  nickname,
  email,
  size = "md",
  className = ""
}: UserAvatarProps) {
  const [imageError, setImageError] = useState(false)

  // 使用统一的头像获取逻辑
  const { avatarUrl, displayNickname, isDefaultAvatar } = useAvatar({
    userId,
    username: username || undefined,
    nickname: nickname || undefined,
    directAvatarUrl,
  })

  const sizeClasses = {
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-16 h-16 text-xl"
  }

  const sizeClass = sizeClasses[size]

  // 获取用于显示的文字
  const displayText = useMemo(() => {
    const text = displayNickname || username || email || ""
    if (!text) return "U"

    const chars = text.split('')
    const chineseChars = chars.filter(char => /[\u4e00-\u9fa5]/.test(char))

    if (chineseChars.length > 0) {
      return chineseChars[0]
    }
    return chars[0].toUpperCase()
  }, [displayNickname, username, email])

  // 最终使用的头像 URL
  const finalSrc = (() => {
    if (imageError || isDefaultAvatar) {
      // 使用默认像素风头像
      const seed = username || email || displayNickname || 'default'
      return getDefaultAvatarUrl(seed)
    }
    return avatarUrl
  })()

  return (
    <>
      {imageError || isDefaultAvatar ? (
        <div className={`${sizeClass} rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center shadow-lg ${className}`}>
          <span className="text-white font-bold">{displayText}</span>
        </div>
      ) : (
        <img
          src={finalSrc || undefined}
          alt={displayNickname || "Avatar"}
          className={`${sizeClass} rounded-full object-cover ${className}`}
          onError={() => setImageError(true)}
        />
      )}
    </>
  )
}