'use client'
import { useState } from 'react'

export default function ImageUpload({ onUpload }) {
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState(null)

  const handleFile = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    setUploading(true)
    const formData = new FormData()
    formData.append('file', file)
    formData.append('upload_preset', 'recipe-app')

    try {
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
        { method: 'POST', body: formData }
      )
      const data = await res.json()
      setPreview(data.secure_url)
      onUpload(data.secure_url)
    } catch (err) {
      alert('画像のアップロードに失敗しました')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div>
      <input
        type="file"
        accept="image/*"
        onChange={handleFile}
        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100"
      />
      {uploading && <p className="text-sm text-gray-500 mt-2">アップロード中...</p>}
      {preview && (
        <img src={preview} alt="プレビュー" className="mt-2 rounded w-full max-h-48 object-cover" />
      )}
    </div>
  )
}
