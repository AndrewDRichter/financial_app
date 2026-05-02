'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import type { Category, CategoryType } from '@/types'

const TYPE_LABEL: Record<CategoryType, string> = {
  income: 'Entrada',
  expense: 'Saída',
  both: 'Ambos',
}

const TYPE_COLOR: Record<CategoryType, string> = {
  income: 'bg-emerald-100 text-emerald-700',
  expense: 'bg-red-100 text-red-700',
  both: 'bg-blue-100 text-blue-700',
}

export default function CategoryManager() {
  const [categories, setCategories] = useState<Category[]>([])
  const [name, setName] = useState('')
  const [type, setType] = useState<CategoryType>('both')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function fetchCategories() {
    const { data, error: err } = await supabase.from('categories').select('*').order('name')
    if (err) {
      setError(`Erro ao carregar: ${err.message}`)
    } else {
      setError('')
      setCategories(data ?? [])
    }
  }

  useEffect(() => { fetchCategories() }, [])

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return

    setLoading(true)
    const { error: err } = await supabase.from('categories').insert({ name: name.trim(), type })
    setLoading(false)

    if (err) { setError(`Erro ao adicionar: ${err.message}`); return }

    setName('')
    fetchCategories()
  }

  async function handleDelete(id: string) {
    await supabase.from('categories').delete().eq('id', id)
    fetchCategories()
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleAdd} className="flex gap-3">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nome da categoria..."
          className="flex-1 px-3 py-2.5 text-sm text-gray-900 bg-white border border-gray-200 rounded-lg outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
        />
        <select
          value={type}
          onChange={(e) => setType(e.target.value as CategoryType)}
          className="px-3 py-2.5 text-sm text-gray-900 bg-white border border-gray-200 rounded-lg outline-none focus:border-gray-900 cursor-pointer"
        >
          <option value="income">Entrada</option>
          <option value="expense">Saída</option>
          <option value="both">Ambos</option>
        </select>
        <button
          type="submit"
          disabled={loading || !name.trim()}
          className="px-4 py-2.5 text-sm bg-gray-900 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50 whitespace-nowrap"
        >
          Adicionar
        </button>
      </form>

      {error && (
        <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>
      )}

      <div className="space-y-2">
        {categories.length === 0 && !error ? (
          <div className="text-center py-12 text-gray-400">
            <p className="text-3xl mb-3">🏷️</p>
            <p className="text-sm">Nenhuma categoria cadastrada.</p>
          </div>
        ) : (
          categories.map((cat) => (
            <div key={cat.id} className="flex items-center justify-between p-3.5 bg-white border border-gray-200 rounded-lg group">
              <div className="flex items-center gap-3">
                <span className="text-gray-900 text-sm font-medium">{cat.name}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${TYPE_COLOR[cat.type]}`}>
                  {TYPE_LABEL[cat.type]}
                </span>
              </div>
              <button
                onClick={() => handleDelete(cat.id)}
                className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-all text-sm"
              >
                ✕
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
