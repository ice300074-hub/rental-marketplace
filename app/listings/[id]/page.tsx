'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function ListingDetail({ params }: { params: { id: string } }) {
  const [listing, setListing] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [reviews, setReviews] = useState<any[]>([])
  const [avgRating, setAvgRating] = useState(0)

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)

      const { data } = await supabase
        .from('listings')
        .select('*')
        .eq('id', params.id)
        .single()
      setListing(data)

      const { data: reviewData } = await supabase
        .from('reviews')
        .select('*')
        .eq('listing_id', params.id)
        .order('created_at', { ascending: false })
      setReviews(reviewData || [])

      if (reviewData && reviewData.length > 0) {
        const avg = reviewData.reduce((sum: number, r: any) => sum + r.rating, 0) / reviewData.length
        setAvgRating(Math.round(avg * 10) / 10)
      }

      setLoading(false)
    }
    fetchData()
  }, [params.id])

  const categoryLabel: Record<string, string> = {
    house: '🏠 บ้าน / คอนโด / ห้อง',
    car: '🚗 รถยนต์ / มอเตอร์ไซค์',
    equipment: '🔧 อุปกรณ์ / เครื่องมือ',
    fashion: '👗 เสื้อผ้า / แฟชั่น',
  }

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <p className="text-gray-400">กำลังโหลด...</p>
    </div>
  )

  if (!listing) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <p className="text-gray-400">ไม่พบประกาศนี้</p>
    </div>
  )

  return (
    <main className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
        <a href="/" className="text-2xl font-bold text-blue-600">RentHub</a>
        <a href="/" className="text-gray-600 hover:text-blue-600 text-sm">← กลับหน้าหลัก</a>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

          <div className="bg-gray-200 rounded-2xl h-80 flex items-center justify-center text-gray-400 text-lg">
            📷 รูปภาพ
          </div>

          <div>
            <p className="text-sm text-blue-500 mb-2">{categoryLabel[listing.category] || listing.category}</p>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">{listing.title}</h1>

            {listing.location && (
              <p className="text-gray-400 text-sm mb-2">📍 {listing.location}</p>
            )}

            {reviews.length > 0 && (
              <div className="flex items-center gap-2 mb-4">
                <span className="text-yellow-400">⭐</span>
                <span className="font-semibold text-gray-800">{avgRating}</span>
                <span className="text-gray-400 text-sm">({reviews.length} รีวิว)</span>
              </div>
            )}

            <div className="bg-blue-50 rounded-xl p-4 mb-6">
              <p className="text-3xl font-bold text-blue-600">
                ฿{listing.price_per_day?.toLocaleString()}
                <span className="text-lg font-normal text-gray-400"> / วัน</span>
              </p>
            </div>

            <div className="mb-6">
              <h3 className="font-semibold text-gray-800 mb-2">รายละเอียด</h3>
              <p className="text-gray-600 leading-relaxed">
                {listing.description || 'ไม่มีรายละเอียดเพิ่มเติม'}
              </p>
            </div>

            <div className="mb-6">
              <span className={`inline-block px-3 py-1 rounded-full text-sm ${listing.is_available ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-400'}`}>
                {listing.is_available ? '✓ ว่างให้เช่า' : '✗ ไม่ว่าง'}
              </span>
            </div>

            {listing.is_available && (
              <div className="space-y-3">
                {user ? (
                  <>
                    <a href={`/booking/${listing.id}`}
                      className="block w-full bg-blue-600 text-white py-3 rounded-xl font-medium hover:bg-blue-700 transition-all text-center">
                      จองเลย
                    </a>
                    <a href={`/chat/${listing.id}`}
                      className="block w-full border border-gray-200 text-gray-600 py-3 rounded-xl hover:bg-gray-50 transition-all text-center">
                      💬 ติดต่อผู้ให้เช่า
                    </a>
                  </>
                ) : (
                  <a href="/auth"
                    className="block w-full bg-blue-600 text-white py-3 rounded-xl font-medium hover:bg-blue-700 transition-all text-center">
                    เข้าสู่ระบบเพื่อจอง
                  </a>
                )}
              </div>
            )}
          </div>
        </div>

        {/* รีวิว */}
        {reviews.length > 0 && (
          <div className="mt-12">
            <h3 className="text-xl font-bold text-gray-800 mb-6">รีวิวจากผู้เช่า ({reviews.length})</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {reviews.map((review) => (
                <div key={review.id} className="bg-white rounded-xl border border-gray-100 p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-yellow-400">{'⭐'.repeat(review.rating)}</span>
                    <span className="text-sm text-gray-400">
                      {new Date(review.created_at).toLocaleDateString('th-TH')}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm leading-relaxed">{review.comment}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  )
}