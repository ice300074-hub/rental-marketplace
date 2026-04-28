'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

const categories = [
  { value: 'house', label: '🏠 บ้าน / คอนโด / ห้อง' },
  { value: 'car', label: '🚗 รถยนต์ / มอเตอร์ไซค์' },
  { value: 'equipment', label: '🔧 อุปกรณ์ / เครื่องมือ' },
  { value: 'fashion', label: '👗 เสื้อผ้า / แฟชั่น' },
]

const inputClass = "w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-400 text-gray-800 bg-white"

export default function CreateListing() {
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: '',
    price_per_day: '',
    location: '',
  })
  const [images, setImages] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []).slice(0, 5)
    setImages(files)
    const urls = files.map(f => URL.createObjectURL(f))
    setPreviews(urls)
  }

  const handleSubmit = async () => {
    if (!form.title || !form.category || !form.price_per_day) {
      setMessage('❌ กรุณากรอกข้อมูลที่จำเป็นให้ครบ')
      return
    }
    setLoading(true)
    setMessage('')

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { window.location.href = '/auth'; return }

    const imageUrls: string[] = []

    for (const image of images) {
      const ext = image.name.split('.').pop()
      const fileName = `${user.id}/${Date.now()}.${ext}`
      const { data, error } = await supabase.storage
        .from('listing-images')
        .upload(fileName, image, { upsert: true })

      if (!error && data) {
        const { data: urlData } = supabase.storage
          .from('listing-images')
          .getPublicUrl(data.path)
        imageUrls.push(urlData.publicUrl)
      }
    }

    const { error } = await supabase.from('listings').insert([{
      title: form.title,
      description: form.description,
      category: form.category,
      price_per_day: Number(form.price_per_day),
      location: form.location,
      is_available: true,
      owner_id: user.id,
      images: imageUrls,
    }])

    if (error) setMessage('❌ ' + error.message)
    else {
      setMessage('✅ ลงประกาศสำเร็จแล้ว!')
      setTimeout(() => window.location.href = '/dashboard', 1500)
    }
    setLoading(false)
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
        <a href="/" className="text-2xl font-bold text-blue-600">RentHub</a>
        <a href="/dashboard" className="text-gray-600 hover:text-blue-600 text-sm">← Dashboard</a>
      </nav>

      <div className="max-w-2xl mx-auto px-6 py-10">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">ลงประกาศเช่า</h2>
        <p className="text-gray-400 mb-8">กรอกข้อมูลสินค้าที่ต้องการให้เช่า</p>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 space-y-6">

          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              ชื่อประกาศ <span className="text-red-400">*</span>
            </label>
            <input name="title" value={form.title} onChange={handleChange}
              placeholder="เช่น คอนโดใจกลางเมือง, Honda Civic 2022"
              className={inputClass}/>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              หมวดหมู่ <span className="text-red-400">*</span>
            </label>
            <select name="category" value={form.category} onChange={handleChange} className={inputClass}>
              <option value="">เลือกหมวดหมู่</option>
              {categories.map((cat) => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">รายละเอียด</label>
            <textarea name="description" value={form.description} onChange={handleChange}
              rows={4} placeholder="อธิบายรายละเอียดสินค้า สภาพ เงื่อนไขการเช่า..."
              className={inputClass + " resize-none"}/>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                ราคา / วัน (฿) <span className="text-red-400">*</span>
              </label>
              <input name="price_per_day" type="number" value={form.price_per_day}
                onChange={handleChange} placeholder="500" className={inputClass}/>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">สถานที่</label>
              <input name="location" value={form.location} onChange={handleChange}
                placeholder="กรุงเทพฯ, เชียงใหม่..." className={inputClass}/>
            </div>
          </div>

          {/* อัปโหลดรูปภาพจริง */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              รูปภาพ <span className="text-gray-400 font-normal">(สูงสุด 5 รูป)</span>
            </label>
            <input type="file" accept="image/*" multiple onChange={handleImageChange}
              className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-800 bg-white"/>

            {previews.length > 0 && (
              <div className="grid grid-cols-3 gap-3 mt-3">
                {previews.map((url, i) => (
                  <img key={i} src={url} alt={`preview ${i+1}`}
                    className="rounded-lg w-full h-28 object-cover border border-gray-200"/>
                ))}
              </div>
            )}

            {previews.length === 0 && (
              <div className="border-2 border-dashed border-gray-200 rounded-lg p-8 text-center mt-2">
                <p className="text-3xl mb-2">📷</p>
                <p className="text-sm text-gray-400">คลิกเพื่ออัปโหลดรูปภาพ</p>
                <p className="text-xs text-gray-300 mt-1">JPG, PNG ขนาดไม่เกิน 50MB</p>
              </div>
            )}
          </div>

          {message && (
            <p className="text-sm text-center py-3 px-4 bg-gray-50 rounded-lg text-gray-700">{message}</p>
          )}

          <button onClick={handleSubmit} disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition-all">
            {loading ? 'กำลังอัปโหลด...' : 'ลงประกาศ'}
          </button>

          <a href="/dashboard" className="block text-center text-sm text-gray-400 hover:text-blue-500">
            ← กลับ Dashboard
          </a>
        </div>
      </div>
    </main>
  )
}