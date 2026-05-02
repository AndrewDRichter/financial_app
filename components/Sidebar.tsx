'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'

const navItems = [
  { href: '/', label: 'Dashboard', icon: '📊' },
  { href: '/transactions', label: 'Transações', icon: '💸' },
  { href: '/categories', label: 'Categorias', icon: '🏷️' },
  { href: '/billing', label: 'Assinatura', icon: '💳' },
]

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user))
  }, [])

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <aside className="w-60 h-screen bg-gray-50 border-r border-gray-200 flex flex-col flex-shrink-0">
      <div className="p-4 border-b border-gray-200">
        <h1 className="text-gray-900 font-semibold text-lg">💰 FinanceApp</h1>
        <p className="text-gray-400 text-xs mt-0.5">Finanças pessoais</p>
      </div>

      <nav className="flex-1 p-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors mb-0.5 ${
                isActive
                  ? 'bg-gray-200 text-gray-900 font-medium'
                  : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>

      <div className="p-3 border-t border-gray-200 space-y-2">
        <Link
          href="/transactions/new"
          className="w-full flex items-center justify-center gap-2 bg-gray-900 text-white text-sm py-2 px-4 rounded-md hover:bg-gray-700 transition-colors"
        >
          <span>+</span>
          <span>Nova Transação</span>
        </Link>

        {user && (
          <div className="flex items-center justify-between px-1 pt-1">
            <div className="min-w-0">
              <p className="text-gray-900 text-xs font-medium truncate">
                {user.user_metadata?.full_name ?? user.email}
              </p>
              {user.user_metadata?.full_name && (
                <p className="text-gray-400 text-xs truncate">{user.email}</p>
              )}
            </div>
            <button
              onClick={handleLogout}
              title="Sair"
              className="ml-2 flex-shrink-0 text-gray-400 hover:text-red-500 transition-colors text-xs p-1"
            >
              ⏻
            </button>
          </div>
        )}
      </div>
    </aside>
  )
}
