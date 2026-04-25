'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleSubmit = async () => {
    setLoading(true)
    setMessage('')

    if (isLogin) {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setMessage('❌ ' + error.message)
      else setMessage('✅ เข้าสู่ระบบสำเร็จ!')
    } else {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName } }
      })
      if (error) setMessage('❌ ' + error.message)
      else setMessage('✅ สมัครสำเร็จ! กรุณาตรวจสอบ Email เพื่อยืนยัน')
    }
    setLoading(false)
  }

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 w-full max-w-md p-8">

        {/* Logo */}
        <h1 className="text-2xl font-bold text-blue-600 text-center mb-2">RentHub</h1>
        <p className="text-gray-400 text-center mb-8">
          {isLogin ? 'เข้าสู่ระบบเพื่อใช้งาน' : 'สมัครสมาชิกฟรี'}
        </p>

        {/* Toggle */}
        <div className="flex bg-gray-100 rounded-lg p-1 mb-6">
          <button
            onClick={() => setIsLogin(true)}
            className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${
              isLogin ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500'
            }`}>
            เข้าสู่ระบบ
          </button>
          <button
            onClick={() => setIsLogin(false)}
            className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${
              !isLogin ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500'
            }`}>
            สมัครสมาชิก
          </button>
        </div>

        {/* Form */}
        <div className="space-y-4">
          {!isLogin && (
            <div>
              <label className="text-sm text-gray-600 mb-1 block">ชื่อ-นามสกุล</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="กรอกชื่อ-นามสกุล"
                className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-400"
              />
            </div>
          )}

          <div>
            <label className="text-sm text-gray-600 mb-1 block">อีเมล</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@email.com"
              className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-400"
            />
          </div>

          <div>
            <label className="text-sm text-gray-600 mb-1 block">รหัสผ่าน</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="อย่างน้อย 6 ตัวอักษร"
              className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-400"
            />
          </div>

          {message && (
            <p className="text-sm text-center py-2 px-4 bg-gray-50 rounded-lg">{message}</p>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition-all">
            {loading ? 'กำลังดำเนินการ...' : isLogin ? 'เข้าสู่ระบบ' : 'สมัครสมาชิก'}
          </button>

          <button
            onClick={async () => {
              await supabase.auth.signInWithOAuth({ provider: 'google' })
            }}
            className="w-full border border-gray-200 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-50 transition-all flex items-center justify-center gap-2">
            <span>G</span> ดำเนินการด้วย Google
          </button>
        </div>

        <p className="text-center text-sm text-gray-400 mt-6">
          <a href="/" className="text-blue-500 hover:underline">← กลับหน้าหลัก</a>
        </p>
      </div>
    </main>
  )
}