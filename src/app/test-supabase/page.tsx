'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase/client'

export default function TestSupabasePage() {
 const [email, setEmail] = useState('')
 const [password, setPassword] = useState('')
 const [loading, setLoading] = useState(false)
 const [message, setMessage] = useState('')

 const handleRegister = async () => {
  setLoading(true)
  setMessage('')

  const { data, error } = await supabase.auth.signUp({
   email,
   password,
  })

  if (error) {
   setMessage(`注册失败：${error.message}`)
  } else {
   setMessage(`注册成功！请检查邮箱确认（如果启用了邮箱确认）`)
   console.log('用户数据:', data)
  }
  setLoading(false)
 }

 const handleLogin = async () => {
  setLoading(true)
  setMessage('')

  const { data, error } = await supabase.auth.signInWithPassword({
   email,
   password,
  })

  if (error) {
   setMessage(`登录失败：${error.message}`)
  } else {
   setMessage(`登录成功！用户 ID: ${data.user?.id}`)
   console.log('会话数据:', data.session)
  }
  setLoading(false)
 }

 const handleLogout = async () => {
  setLoading(true)
  const { error } = await supabase.auth.signOut()
  if (error) {
   setMessage(`登出失败：${error.message}`)
  } else {
   setMessage('登出成功！')
  }
  setLoading(false)
 }

 const checkSession = async () => {
  const { data } = await supabase.auth.getSession()
  if (data.session) {
   setMessage(`已登录！用户 ID: ${data.session.user.id}`)
  } else {
   setMessage('未登录')
  }
 }

 return (
  <div className="min-h-screen flex items-center justify-center p-4">
   <div className="w-full max-w-md space-y-6">
    <h1 className="text-2xl font-bold text-center">Supabase 测试页面</h1>

    <div className="space-y-4">
     <input
      type="email"
      placeholder="邮箱"
      value={email}
      onChange={(e) => setEmail(e.target.value)}
      className="w-full px-4 py-2 border rounded"
     />
     <input
      type="password"
      placeholder="密码"
      value={password}
      onChange={(e) => setPassword(e.target.value)}
      className="w-full px-4 py-2 border rounded"
     />

     <div className="flex gap-2">
      <button
       onClick={handleRegister}
       disabled={loading}
       className="flex-1 px-4 py-2 bg-blue-500 text-white rounded disabled:bg-blue-300"
      >
       注册
      </button>
      <button
       onClick={handleLogin}
       disabled={loading}
       className="flex-1 px-4 py-2 bg-green-500 text-white rounded disabled:bg-green-300"
      >
       登录
      </button>
     </div>

     <div className="flex gap-2">
      <button
       onClick={checkSession}
       disabled={loading}
       className="flex-1 px-4 py-2 bg-gray-500 text-white rounded disabled:bg-gray-300"
      >
       检查会话
      </button>
      <button
       onClick={handleLogout}
       disabled={loading}
       className="flex-1 px-4 py-2 bg-red-500 text-white rounded disabled:bg-red-300"
      >
       登出
      </button>
     </div>

     {message && (
      <div className="p-4 bg-gray-100 rounded text-center">{message}</div>
     )}
    </div>
   </div>
  </div>
 )
}
