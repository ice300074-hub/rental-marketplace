'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [activeTab, setActiveTab] = useState<'info' | 'verify' | 'history'>('info')
  const [bookings, setBookings] = useState<any[]>([])

  const [form, setForm] = useState({
    full_name: '',
    phone: '',
    line_id: '',
    facebook: '',
    id_card: '',
    address: '',
  })

  const [idCardImage, setIdCardImage] = useState<string | null>(null)
  const [selfieImage, setSelfieImage] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.href = '/auth'; return }
      setUser(user)

      const { data: bookingData } = await supabase
        .from('bookings')
        .select('*, listings(*)')
        .eq('renter_id', user.id)
        .order('created_at', { ascending: false })
      setBookings(bookingData || [])

      if (user.user_metadata) {
        setForm(prev => ({ ...prev, full_name: user.user_metadata.full_name || '' }))
      }
    }
    fetchData()
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'id' | 'selfie') => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = () => {
        if (type === 'id') setIdCardImage(reader.result as string)
        else setSelfieImage(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSaveInfo = async () => {
    setLoading(true)
    await supabase.auth.updateUser({ data: { full_name: form.full_name } })
    setMessage('✅ บันทึกข้อมูลสำเร็จ!')
    setLoading(false)
    setTimeout(() => setMessage(''), 3000)
  }

  const handleVerify = async () => {
    if (!idCardImage || !selfieImage) {
      setMessage('❌ กรุณาอัปโหลดรูปบัตรประชาชนและ Selfie')
      return
    }
    setLoading(true)
    setMessage('✅ ส่งข้อมูลยืนยันตัวตนเรียบร้อย! รอการตรวจสอบ 1-2 วันทำการ')
    setLoading(false)
  }

  const inputClass = "w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-400 text-gray-800 bg-white"

  const statusColor: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-600',
    paid: 'bg-blue-100 text-blue-600',
    confirmed: 'bg-green-100 text-green-600',
    cancelled: 'bg-red-100 text-red-400',
  }

  const statusLabel: Record<string, string> = {
    pending: 'รอยืนยัน',
    paid: 'ชำระแล้ว',
    confirmed: 'ยืนยันแล้ว',
    cancelled: 'ยกเลิก',
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
        <a href="/" className="text-2xl font-bold text-blue-600">RentHub</a>
        <a href="/dashboard" className="text-gray-600 hover:text-blue-600 text-sm">← Dashboard</a>
      </nav>

      <div className="max-w-2xl mx-auto px-6 py-10">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-2xl font-bold text-blue-600">
            {form.full_name?.[0] || user?.email?.[0]?.toUpperCase() || '?'}
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">{form.full_name || 'ผู้ใช้งาน'}</h2>
            <p className="text-gray-400 text-sm">{user?.email}</p>
          </div>
        </div>

        <div className="flex bg-gray-100 rounded-lg p-1 mb-6">
          {[
            { key: 'info', label: 'ข้อมูลส่วนตัว' },
            { key: 'verify', label: 'ยืนยันตัวตน' },
            { key: 'history', label: 'ประวัติการเช่า' },
          ].map((tab) => (
            <button key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${activeTab === tab.key ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500'}`}>
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'info' && (
          <div className="bg-white rounded-2xl border border-gray-100 p-8 space-y-5">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">ชื่อ-นามสกุล</label>
              <input name="full_name" value={form.full_name} onChange={handleChange} placeholder="กรอกชื่อ-นามสกุล" className={inputClass}/>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">เบอร์โทรศัพท์</label>
              <input name="phone" value={form.phone} onChange={handleChange} placeholder="08X-XXX-XXXX" className={inputClass}/>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">LINE ID</label>
              <input name="line_id" value={form.line_id} onChange={handleChange} placeholder="@line_id" className={inputClass}/>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Facebook</label>
              <input name="facebook" value={form.facebook} onChange={handleChange} placeholder="facebook.com/username" className={inputClass}/>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">ที่อยู่</label>
              <input name="address" value={form.address} onChange={handleChange} placeholder="บ้านเลขที่ ถนน ตำบล อำเภอ จังหวัด" className={inputClass}/>
            </div>
            {message && <p className="text-sm text-center py-3 bg-gray-50 rounded-lg text-gray-700">{message}</p>}
            <button onClick={handleSaveInfo} disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50">
              {loading ? 'กำลังบันทึก...' : 'บันทึกข้อมูล'}
            </button>
          </div>
        )}

        {activeTab === 'verify' && (
          <div className="bg-white rounded-2xl border border-gray-100 p-8 space-y-6">
            <div className="bg-blue-50 rounded-xl p-4 text-sm text-blue-700">
              🔒 การยืนยันตัวตนช่วยสร้างความน่าเชื่อถือและป้องกันมิจฉาชีพในระบบ
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">เลขบัตรประชาชน</label>
              <input name="id_card" value={form.id_card} onChange={handleChange}
                placeholder="X-XXXX-XXXXX-XX-X" maxLength={17} className={inputClass}/>
              <p className="text-xs text-gray-400 mt-1">ข้อมูลนี้จะถูกเก็บเป็นความลับ</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">รูปถ่ายบัตรประชาชน</label>
              <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'id')}
                className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-800 bg-white"/>
              {idCardImage && <img src={idCardImage} alt="id card" className="mt-3 rounded-lg w-full max-h-40 object-cover"/>}
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Selfie คู่บัตรประชาชน</label>
              <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'selfie')}
                className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-800 bg-white"/>
              {selfieImage && <img src={selfieImage} alt="selfie" className="mt-3 rounded-lg w-full max-h-40 object-cover"/>}
              <p className="text-xs text-gray-400 mt-1">ถ่ายรูปตัวเองพร้อมบัตรประชาชน ให้เห็นหน้าและบัตรชัดเจน</p>
            </div>
            {message && <p className="text-sm text-center py-3 bg-gray-50 rounded-lg text-gray-700">{message}</p>}
            <button onClick={handleVerify} disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50">
              {loading ? 'กำลังส่ง...' : 'ส่งข้อมูลยืนยันตัวตน'}
            </button>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="space-y-4">
            {bookings.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
                <p className="text-4xl mb-3">📋</p>
                <p className="text-gray-400">ยังไม่มีประวัติการเช่า</p>
                <a href="/" className="mt-4 inline-block bg-blue-600 text-white px-6 py-2 rounded-lg text-sm">ค้นหาสินค้าเช่า</a>
              </div>
            ) : (
              bookings.map((booking) => (
                <div key={booking.id} className="bg-white rounded-xl border border-gray-100 p-5">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-gray-800">{booking.listings?.title}</h3>
                    <span className={`text-xs px-2 py-1 rounded-full ${statusColor[booking.status] || 'bg-gray-100 text-gray-400'}`}>
                      {statusLabel[booking.status] || booking.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-400">{booking.start_date} → {booking.end_date}</p>
                  <p className="text-blue-600 font-bold mt-2">฿{booking.total_price?.toLocaleString()}</p>
                  <div className="flex gap-2 mt-3">
                    {booking.status === 'pending' && (
                      <a href={`/payment/${booking.id}`}
                        className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700">
                        ชำระเงิน
                      </a>
                    )}
                    {(booking.status === 'paid' || booking.status === 'confirmed') && (
                      <a href={`/review/${booking.id}`}
                        className="inline-block bg-yellow-400 text-white px-4 py-2 rounded-lg text-sm hover:bg-yellow-500">
                        ⭐ เขียนรีวิว
                      </a>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </main>
  )
}