import { getDashboardStats, getRecentTransactions, getExpensesByCategory } from "@/services/dashboard";
import { Card, Metric, Text } from "@tremor/react";
import { Wallet, TrendingUp, TrendingDown } from "lucide-react";
import { NewTransactionDialog } from "@/components/new-transaction-dialog";
import { TransactionList, Transaction } from "@/components/transaction-list";
import { ExpensesChart } from "@/components/expenses-chart";
import { MonthSelector } from "@/components/month-selector";
import { SearchInput } from "@/components/search-input"; // <--- Importe aqui

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
};

interface PageProps {
  // Agora aceitamos 'search' na URL também
  searchParams: Promise<{ month?: string; search?: string }>;
}

export default async function DashboardPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const currentMonth = params.month;
  const currentSearch = params.search; // <--- Pega o termo digitado

  // Passamos o termo de busca para todas as funções
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
          <MonthSelector />
          <NewTransactionDialog />
        </div>
      </div>
      
      {/* Cards de Métricas (Reativos à busca!) */}
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
          {/* Barra de Busca posicionada acima da tabela */}
          <SearchInput />
          
          <TransactionList data={transactions as Transaction[]} />
        </div>
        
        <div className="md:col-span-1 mt-6 md:mt-0">
          <ExpensesChart data={categoryData} />
        </div>
      </div>
    </main>
  );
}