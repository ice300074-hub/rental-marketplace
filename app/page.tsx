'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function Home() {
  const [listings, setListings] = useState<any[]>([])

  useEffect(() => {
    const fetchListings = async () => {
      const { data } = await supabase
        .from('listings')
        .select('*')
        .eq('is_available', true)
        .order('created_at', { ascending: false })
        .limit(6)
      setListings(data || [])
    }
    fetchListings()
  }, [])

  const categoryLabel: Record<string, string> = {
    house: '🏠 บ้าน/คอนโด',
    car: '🚗 รถยนต์',
    equipment: '🔧 อุปกรณ์',
    fashion: '👗 เสื้อผ้า',
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-blue-600">RentHub</h1>
        <div className="flex gap-4">
          <a href="/auth" className="text-gray-600 hover:text-blue-600">เข้าสู่ระบบ</a>
          <a href="/create" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">ลงประกาศ</a>
        </div>
      </nav>

      <section className="bg-blue-600 text-white py-20 px-6 text-center">
        <h2 className="text-4xl font-bold mb-4">เช่าทุกอย่าง ในที่เดียว</h2>
        <p className="text-xl mb-8 text-blue-100">บ้าน • รถ • อุปกรณ์ • เสื้อผ้า</p>
        <div className="max-w-2xl mx-auto flex gap-2">
          <input type="text" placeholder="ค้นหาสิ่งที่อยากเช่า..." className="flex-1 px-4 py-3 rounded-lg text-gray-800 text-lg"/>
          <button className="bg-white text-blue-600 px-6 py-3 rounded-lg font-bold hover:bg-blue-50">ค้นหา</button>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-6 py-12">
        <h3 className="text-2xl font-bold text-gray-800 mb-6">หมวดหมู่ยอดนิยม</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: '🏠', label: 'บ้าน / คอนโด', count: '1,200+' },
            { icon: '🚗', label: 'รถยนต์ / มอไซค์', count: '800+' },
            { icon: '🔧', label: 'อุปกรณ์ / เครื่องมือ', count: '500+' },
            { icon: '👗', label: 'เสื้อผ้า / แฟชั่น', count: '300+' },
          ].map((cat) => (
            <div key={cat.label} className="bg-white rounded-xl p-6 text-center shadow-sm hover:shadow-md cursor-pointer border border-gray-100 hover:border-blue-200 transition-all">
              <div className="text-4xl mb-3">{cat.icon}</div>
              <p className="font-semibold text-gray-800">{cat.label}</p>
              <p className="text-sm text-gray-400 mt-1">{cat.count} รายการ</p>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-6 pb-16">
        <h3 className="text-2xl font-bold text-gray-800 mb-6">ประกาศล่าสุด</h3>
        {listings.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-5xl mb-4">📋</p>
            <p>ยังไม่มีประกาศ</p>
            <a href="/create" className="mt-4 inline-block bg-blue-600 text-white px-6 py-2 rounded-lg text-sm">ลงประกาศแรก</a>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {listings.map((item) => (
              <a key={item.id} href={`/listings/${item.id}`}
                className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all border border-gray-100 overflow-hidden cursor-pointer block">
                <div className="bg-gray-200 h-48 flex items-center justify-center text-gray-400">รูปภาพ</div>
                <div className="p-4">
                  <p className="text-xs text-blue-500 mb-1">{categoryLabel[item.category] || item.category}</p>
                  <h4 className="font-semibold text-gray-800">{item.title}</h4>
                  {item.location && <p className="text-sm text-gray-400 mt-1">📍 {item.location}</p>}
                  <p className="text-blue-600 font-bold mt-2">฿{item.price_per_day?.toLocaleString()} <span className="text-gray-400 font-normal text-sm">/ วัน</span></p>
                </div>
              </a>
            ))}
          </div>
        )}
      </section>
    </main>
  )
}