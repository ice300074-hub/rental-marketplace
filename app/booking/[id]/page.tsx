'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function BookingPage({ params }: { params: { id: string } }) {
  const [listing, setListing] = useState<any>(null)
  const [user, setUser] = useState<any>(null)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [totalDays, setTotalDays] = useState(0)
  const [totalPrice, setTotalPrice] = useState(0)

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      if (!user) window.location.href = '/auth'
      const { data } = await supabase
        .from('listings')
        .select('*')
        .eq('id', params.id)
        .single()
      setListing(data)
    }
    fetchData()
  }, [params.id])

  useEffect(() => {
    if (startDate && endDate && listing) {
      const start = new Date(startDate)
      const end = new Date(endDate)
      const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
      if (days > 0) {
        setTotalDays(days)
        setTotalPrice(days * listing.price_per_day)
      } else {
        setTotalDays(0)
        setTotalPrice(0)
      }
    }
  }, [startDate, endDate, listing])

  const handleBooking = async () => {
    if (!startDate || !endDate) {
      setMessage('❌ กรุณาเลือกวันที่เช่าและวันที่คืน')
      return
    }
    if (totalDays <= 0) {
      setMessage('❌ วันที่คืนต้องมากกว่าวันที่เช่า')
      return
    }
    setLoading(true)
    setMessage('')

    const { data: bookingData, error } = await supabase.from('bookings').insert([{
      listing_id: params.id,
      renter_id: user.id,
      start_date: startDate,
      end_date: endDate,
      total_price: totalPrice,
      status: 'pending',
    }]).select()

    if (error) {
      setMessage('❌ ' + error.message)
    } else {
      setMessage('✅ จองสำเร็จ! กำลังไปหน้าชำระเงิน...')
      setTimeout(() => window.location.href = `/payment/${bookingData[0].id}`, 1500)
    }
    setLoading(false)
  }

  const inputClass = "w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-400 text-gray-800 bg-white"

  if (!listing) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <p className="text-gray-400">กำลังโหลด...</p>
    </div>
  )

  return (
    <main className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
        <a href="/" className="text-2xl font-bold text-blue-600">RentHub</a>
        <a href={`/listings/${params.id}`} className="text-gray-600 hover:text-blue-600 text-sm">← กลับหน้าประกาศ</a>
      </nav>

      <div className="max-w-2xl mx-auto px-6 py-10">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">จองสินค้า</h2>
        <p className="text-gray-400 mb-8">เลือกวันที่ต้องการเช่า</p>

        <div className="bg-white rounded-xl border border-gray-100 p-5 mb-6 flex gap-4">
          <div className="bg-gray-200 rounded-lg w-20 h-20 flex items-center justify-center text-gray-400 flex-shrink-0">
            📷
          </div>
          <div>
            <h3 className="font-semibold text-gray-800">{listing.title}</h3>
            {listing.location && <p className="text-sm text-gray-400 mt-1">📍 {listing.location}</p>}
            <p className="text-blue-600 font-bold mt-1">฿{listing.price_per_day?.toLocaleString()} / วัน</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 space-y-6">

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">วันที่เริ่มเช่า</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className={inputClass}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">วันที่คืน</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                min={startDate || new Date().toISOString().split('T')[0]}
                className={inputClass}
              />
            </div>
          </div>

          {totalDays > 0 && (
            <div className="bg-blue-50 rounded-xl p-5 space-y-3">
              <h3 className="font-semibold text-gray-800">สรุปการจอง</h3>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">ราคาต่อวัน</span>
                <span className="text-gray-800">฿{listing.price_per_day?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">จำนวนวัน</span>
                <span className="text-gray-800">{totalDays} วัน</span>
              </div>
              <div className="border-t border-blue-100 pt-3 flex justify-between">
                <span className="font-semibold text-gray-800">ราคารวม</span>
                <span className="font-bold text-blue-600 text-lg">฿{totalPrice.toLocaleString()}</span>
              </div>
            </div>
          )}

          {message && (
            <p className="text-sm text-center py-3 px-4 bg-gray-50 rounded-lg text-gray-700">{message}</p>
          )}

          <button
            onClick={handleBooking}
            disabled={loading || totalDays <= 0}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition-all">
            {loading ? 'กำลังจอง...' : `ยืนยันการจอง${totalDays > 0 ? ` ฿${totalPrice.toLocaleString()}` : ''}`}
          </button>

          <a href={`/listings/${params.id}`} className="block text-center text-sm text-gray-400 hover:text-blue-500">
            ← ยกเลิก
          </a>
        </div>
      </div>
    </main>
  )
}