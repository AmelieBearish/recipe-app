'use client'
import { useState, useEffect } from 'react'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { db } from '../../../../lib/firebase'
import ImageUpload from '../../../../components/ImageUpload'

const CATEGORIES = ['主菜', '副菜', '汁物', '丼・麺', 'おやつ・デザート', 'その他']

export default function EditRecipe({ params }) {
  const [form, setForm] = useState(null)
  const [loading, setLoading] = useState(true)
  const [password, setPassword] = useState('')
  const [verified, setVerified] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const fetch = async () => {
      const snap = await getDoc(doc(db, 'recipes', params.id))
      if (snap.exists()) {
        const data = snap.data()
        setForm({
          title: data.title || '',
          description: data.description || '',
          category: data.category || '主菜',
          cookTime: data.cookTime || '',
          ingredients: (data.ingredients || []).join('\n'),
          steps: (data.steps || []).join('\n'),
          imageUrl: data.imageUrl || '',
          password: data.password || '',
        })
      }
      setLoading(false)
    }
    fetch()
  }, [params.id])

  const handleVerify = (e) => {
    e.preventDefault()
    if (password !== form.password) {
      alert('パスワードが違います')
      return
    }
    setVerified(true)
  }

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.title.trim()) return
    setSubmitting(true)
    try {
      await updateDoc(doc(db, 'recipes
