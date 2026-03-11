'use client'

import { AreaChart, Card, Title, Text } from "@tremor/react"
import { Transaction } from "@/components/transaction-list"

interface DailyBalanceChartProps {
  transactions: Transaction[]
}

const valueFormatter = (number: number) => {
  return `R$ ${Intl.NumberFormat("pt-BR").format(number).toString()}`
}

export function DailyBalanceChart({ transactions }: DailyBalanceChartProps) {
  // 1. LÓGICA DE DADOS: Agrupar o fluxo de caixa por dia
  const flowByDay: Record<string, number> = {}

  transactions.forEach(t => {
    // Código limpo: pegando o created_at oficial que descobrimos antes
    const dateObj = new Date(t.created_at || new Date())
    const dayString = dateObj.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
    
    const amount = Number(t.amount || 0)
    
    // CORREÇÃO 1: TypeScript agora confia que é apenas 'expense'
    const isExpense = t.type === 'expense'
    const value = isExpense ? -amount : amount

    if (!flowByDay[dayString]) {
      flowByDay[dayString] = 0
    }
    flowByDay[dayString] += value
  })

  // 2. ORDENAÇÃO: Colocar os dias em ordem cronológica
  const sortedDays = Object.keys(flowByDay).sort((a, b) => {
    const [dayA, monthA] = a.split('/')
    const [dayB, monthB] = b.split('/')
    if (monthA !== monthB) return Number(monthA) - Number(monthB)
    return Number(dayA) - Number(dayB)
  })

  // 3. ACUMULAÇÃO CORRIGIDA (CORREÇÃO 2): 
  // Usando reduce em vez de map, mantendo a pureza da função sem efeitos colaterais.
  const chartData = sortedDays.reduce((acc, day) => {
    // Pega o saldo acumulado do dia anterior (se houver)
    const previousBalance = acc.length > 0 ? acc[acc.length - 1].Saldo : 0
    
    // Soma o saldo anterior com o fluxo do dia atual
    const newBalance = previousBalance + flowByDay[day]

    acc.push({
      data: day,
      Saldo: newBalance
    })

    return acc
  }, [] as { data: string; Saldo: number }[])

  // Fallback caso não tenha nenhuma transação no mês
  if (chartData.length === 0) {
    chartData.push({ 
      data: new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }), 
      Saldo: 0 
    })
  }

  // Verifica se o resultado final acumulado do mês está positivo
  const finalBalance = chartData[chartData.length - 1].Saldo
  const isHealthy = finalBalance >= 0

  return (
    <Card className="w-full shadow-sm rounded-xl border-slate-200 dark:border-slate-800 dark:bg-slate-900">
      <div className="md:flex md:items-center md:justify-between">
        <div>
          <Title className="text-slate-800 dark:text-slate-100 font-bold">Evolução do Saldo (Mês Atual)</Title>
          <Text className="text-slate-500">Acompanhamento do seu fluxo de caixa diário</Text>
        </div>
        {/* Badge dinâmico: Fica Verde se sobrou dinheiro, Vermelho se faltou */}
        <div className={`mt-4 md:mt-0 px-4 py-2 rounded-lg border ${
          isHealthy 
            ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 border-emerald-100 dark:border-emerald-900/50' 
            : 'bg-rose-50 dark:bg-rose-950/30 text-rose-600 border-rose-100 dark:border-rose-900/50'
        }`}>
          <p className="text-sm font-semibold">{isHealthy ? 'Mês Positivo' : 'Mês Negativo'}</p>
        </div>
      </div>
      
      <AreaChart
        className="h-72 mt-6"
        data={chartData}
        index="data"
        categories={["Saldo"]}
        colors={[isHealthy ? "emerald" : "rose"]}
        valueFormatter={valueFormatter}
        showAnimation={true}
        curveType="monotone"
      />
    </Card>
  )
}