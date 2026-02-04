import { Suspense } from "react";
import { getDashboardStats, getRecentTransactions, getExpensesByCategory } from "@/services/dashboard";
import { Card, Metric, Text } from "@tremor/react";
import { Wallet, TrendingUp, TrendingDown, LogOut } from "lucide-react";
import { NewTransactionDialog } from "@/components/new-transaction-dialog";
import { TransactionList, Transaction } from "@/components/transaction-list";
import { ExpensesChart } from "@/components/expenses-chart";
import { MonthSelector } from "@/components/month-selector";
import { SearchInput } from "@/components/search-input";
import { signOut } from "@/app/actions/auth";

// 1. FORÇA A PÁGINA A SER DINÂMICA (Garante que o saldo zere ao trocar de conta)
export const dynamic = "force-dynamic";

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
};

interface PageProps {
  searchParams: Promise<{ month?: string; search?: string }>;
}

export default async function DashboardPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const currentMonth = params.month;
  const currentSearch = params.search;

  const [stats, transactions, categoryData] = await Promise.all([
    getDashboardStats(currentMonth, currentSearch),
    getRecentTransactions(currentMonth, currentSearch),
    getExpensesByCategory(currentMonth, currentSearch),
  ]);

  return (
    <main className="p-6 md:p-10 mx-auto max-w-7xl space-y-6">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">
          Visão Geral
        </h1>
        <div className="flex items-center gap-3">
          {/* Suspense resolve o erro de Hydration do seletor */}
          <Suspense fallback={<div className="w-[200px] h-10 bg-slate-100 animate-pulse rounded-md" />}>
            <MonthSelector />
          </Suspense>
          
          <NewTransactionDialog />

          {/* BOTÃO DE SAIR (Logout) */}
          <form action={signOut}>
            <button 
              type="submit" 
              className="p-2 text-slate-500 hover:text-red-600 transition-colors border rounded-md hover:bg-slate-100"
              title="Sair da conta"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </form>

        </div>
      </div>
      
      {/* Cards de Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="decoration-top decoration-blue-500 border-l-4 border-l-blue-500">
          <div className="flex items-center justify-between">
            <Text>Saldo {currentSearch ? '(Filtrado)' : ''}</Text>
            <Wallet className="w-5 h-5 text-blue-600" />
          </div>
          <Metric className="mt-2">{formatCurrency(stats.balance)}</Metric>
        </Card>

        <Card className="decoration-top decoration-emerald-500 border-l-4 border-l-emerald-500">
          <div className="flex items-center justify-between">
            <Text>Receitas</Text>
            <TrendingUp className="w-5 h-5 text-emerald-600" />
          </div>
          <Metric className="mt-2 text-emerald-600">{formatCurrency(stats.income)}</Metric>
        </Card>

        <Card className="decoration-top decoration-rose-500 border-l-4 border-l-rose-500">
          <div className="flex items-center justify-between">
            <Text>Despesas</Text>
            <TrendingDown className="w-5 h-5 text-rose-600" />
          </div>
          <Metric className="mt-2 text-rose-600">{formatCurrency(stats.expense)}</Metric>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-4">
          
          {/* Suspense resolve o erro de Hydration da busca */}
          <Suspense fallback={<div className="w-full h-10 bg-slate-100 animate-pulse rounded-md" />}>
            <SearchInput />
          </Suspense>
          
          <TransactionList data={transactions as Transaction[]} />
        </div>
        
        <div className="md:col-span-1 mt-6 md:mt-0">
          <ExpensesChart data={categoryData} />
        </div>
      </div>
    </main>
  );
}