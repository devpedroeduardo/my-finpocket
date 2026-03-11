'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useCallback } from 'react'

export function TransactionFilters() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // Lê o que está atualmente na URL
  const currentType = searchParams.get('type') || ''
  const currentStatus = searchParams.get('status') || ''

  // Função mágica do Next.js para juntar vários filtros na URL sem apagar os anteriores
  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value) {
        params.set(name, value)
      } else {
        params.delete(name) // Se o usuário escolher "Todos", a gente limpa a URL
      }
      return params.toString()
    },
    [searchParams]
  )

  return (
    <div className="flex flex-col sm:flex-row gap-3 w-full">
      {/* 1. Filtro de Tipo (Receita vs Despesa) */}
      <select
        value={currentType}
        onChange={(e) => router.push(pathname + '?' + createQueryString('type', e.target.value))}
        className="h-10 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm font-medium text-slate-700 dark:text-slate-300 outline-none focus:ring-2 focus:ring-emerald-500 transition-all cursor-pointer"
      >
        <option value="">Todas as Movimentações</option>
        <option value="income">Entradas (Receitas)</option>
        <option value="expense">Saídas (Despesas)</option>
      </select>

      {/* 2. NOVO: Filtro de Status conectado com a nossa API do PIX! */}
      <select
        value={currentStatus}
        onChange={(e) => router.push(pathname + '?' + createQueryString('status', e.target.value))}
        className="h-10 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm font-medium text-slate-700 dark:text-slate-300 outline-none focus:ring-2 focus:ring-emerald-500 transition-all cursor-pointer"
      >
        <option value="">Qualquer Status</option>
        <option value="PAID">✅ Pagos / Recebidos</option>
        <option value="PENDING">⏳ Pendentes</option>
      </select>
    </div>
  )
}