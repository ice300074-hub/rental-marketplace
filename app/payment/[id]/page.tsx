'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function PaymentPage({ params }: { params: { id: string } }) {
  const [booking, setBooking] = useState<any>(null)
  const [listing, setListing] = useState<any>(null)
  const [method, setMethod] = useState<'promptpay' | 'card'>('promptpay')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [slip, setSlip] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      const { data: bookingData } = await supabase
        .from('bookings')
        .select('*, listings(*)')
        .eq('id', params.id)
        .single()
      if (bookingData) {
        setBooking(bookingData)
        setListing(bookingData.listings)
      }
    }
    fetchData()
  }, [params.id])

  const handleSlipUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = () => setSlip(reader.result as string)
      reader.readAsDataURL(file)
    }
  }

  const handlePayment = async () => {
    setLoading(true)
    await supabase
      .from('bookings')
      .update({ status: 'paid' })
      .eq('id', params.id)
    setMessage('✅ ชำระเงินสำเร็จ! รอการยืนยันจากเจ้าของ')
    setTimeout(() => window.location.href = '/dashboard', 2000)
    setLoading(false)
  }

  if (!booking) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <p className="text-gray-400">กำลังโหลด...</p>
    </div>
  )

  const PROMPTPAY_NUMBER = '0812345678'

  return (
    <main className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
        <a href="/" className="text-2xl font-bold text-blue-600">RentHub</a>
        <a href="/dashboard" className="text-gray-600 hover:text-blue-600 text-sm">← Dashboard</a>
      </nav>

      <div className="max-w-lg mx-auto px-6 py-10">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">ชำระเงิน</h2>
        <p className="text-gray-400 mb-8">เลือกวิธีชำระเงิน</p>

        {/* สรุปการจอง */}
        <div className="bg-white rounded-xl border border-gray-100 p-5 mb-6">
          <h3 className="font-semibold text-gray-800 mb-3">สรุปการจอง</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">สินค้า</span>
              <span className="text-gray-800">{listing?.title}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">วันที่เช่า</span>
              <span className="text-gray-800">{booking.start_date}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">วันที่คืน</span>
              <span className="text-gray-800">{booking.end_date}</span>
            </div>
            <div className="flex justify-between border-t pt-2 mt-2">
              <span className="font-semibold text-gray-800">ยอดชำระ</span>
              <span className="font-bold text-blue-600 text-lg">฿{booking.total_price?.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* เลือกวิธีชำระ */}
        <div className="flex gap-3 mb-6">
          <button
            onClick={() => setMethod('promptpay')}
            className={`flex-1 py-3 rounded-xl border-2 font-medium text-sm transition-all ${method === 'promptpay' ? 'border-blue-500 bg-blue-50 text-blue-600' : 'border-gray-200 text-gray-500'}`}>
            📱 PromptPay
          </button>
          <button
            onClick={() => setMethod('card')}
            className={`flex-1 py-3 rounded-xl border-2 font-medium text-sm transition-all ${method === 'card' ? 'border-blue-500 bg-blue-50 text-blue-600' : 'border-gray-200 text-gray-500'}`}>
            💳 บัตรเครดิต
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">

          {method === 'promptpay' && (
            <div className="space-y-5">
              <div className="text-center">
                <p className="text-sm text-gray-500 mb-3">สแกน QR หรือโอนไปที่</p>
                <div className="bg-gray-50 rounded-xl p-6 inline-block mb-3">
                  <div className="w-40 h-40 bg-gray-200 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <p className="text-xs text-gray-400 text-center">QR Code<br/>PromptPay</p>
                  </div>
                  <p className="font-bold text-gray-800 text-lg">{PROMPTPAY_NUMBER}</p>
                  <p className="text-blue-600 font-bold">฿{booking.total_price?.toLocaleString()}</p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">อัปโหลดสลิปโอนเงิน</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleSlipUpload}
                  className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-800 bg-white"
                />
                {slip && (
                  <img src={slip} alt="slip" className="mt-3 rounded-lg w-full max-h-48 object-cover"/>
                )}
              </div>

              {message && (
                <p className="text-sm text-center py-3 bg-gray-50 rounded-lg text-gray-700">{message}</p>
              )}

              <button
                onClick={handlePayment}
                disabled={loading || !slip}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50">
                {loading ? 'กำลังดำเนินการ...' : 'ยืนยันการชำระเงิน'}
              </button>
            </div>
          )}

          {method === 'card' && (
            <div className="space-y-4">
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-700">
                💳 ระบบบัตรเครดิตผ่าน Omise — กรุณาสมัครที่ omise.co และใส่ API Key ใน .env.local ก่อนใช้งาน
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">หมายเลขบัตร</label>
                <input type="text" placeholder="0000 0000 0000 0000"
                  className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-800 bg-white focus:outline-none focus:border-blue-400"/>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">วันหมดอายุ</label>
                  <input type="text" placeholder="MM/YY"
                    className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-800 bg-white focus:outline-none focus:border-blue-400"/>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">CVV</label>
                  <input type="text" placeholder="000"
                    className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-800 bg-white focus:outline-none focus:border-blue-400"/>
                </div>
              </div>

              {message && (
                <p className="text-sm text-center py-3 bg-gray-50 rounded-lg text-gray-700">{message}</p>
              )}

              <button
                onClick={handlePayment}
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50">
                {loading ? 'กำลังดำเนินการ...' : `ชำระ ฿${booking.total_price?.toLocaleString()}`}
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}