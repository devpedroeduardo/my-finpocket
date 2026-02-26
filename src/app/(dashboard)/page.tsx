import { Suspense } from "react";
import Link from "next/link";
import { getDashboardStats, getRecentTransactions, getExpensesByCategory } from "@/services/dashboard";
import { Card, Metric, Text } from "@tremor/react";
import { Wallet, TrendingUp, TrendingDown, LogOut, Tags, User } from "lucide-react"; 
import { NewTransactionDialog } from "@/components/new-transaction-dialog";
import { TransactionList, Transaction } from "@/components/transaction-list";
import { ExpensesChart } from "@/components/expenses-chart";
import { MonthSelector } from "@/components/month-selector";
import { SearchInput } from "@/components/search-input";
import { signOut } from "@/app/actions/auth";
import { ModeToggle } from "@/components/mode-toggle";
import { TransactionFilters } from "@/components/transaction-filters";
import { ExportButton } from "@/components/export-button";

export const dynamic = "force-dynamic";

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
};

interface PageProps {
  searchParams: Promise<{ month?: string; search?: string; type?: string; category?: string }>;
}

export default async function DashboardPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const currentMonth = params.month;
  const currentSearch = params.search;
  const currentType = params.type;
  const currentCategory = params.category;

  const [stats, transactions, categoryData] = await Promise.all([
    getDashboardStats(currentMonth, currentSearch),
    getRecentTransactions(currentMonth, currentSearch, currentType, currentCategory),
    getExpensesByCategory(currentMonth, currentSearch),
  ]);

  return (
    <main className="p-6 md:p-10 mx-auto max-w-7xl space-y-6">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">
          Visão Geral
        </h1>
        <div className="flex flex-wrap items-center gap-3">
          
          <Suspense fallback={<div className="w-[200px] h-10 bg-slate-100 animate-pulse rounded-md" />}>
            <MonthSelector />
          </Suspense>

          {/* BOTÃO DE PERFIL */}
          <Link href="/profile">
            <ButtonWrapper title="Meu Perfil">
              <User className="w-4 h-4" />
            </ButtonWrapper>
          </Link>
          
          {/* BOTÃO DE CATEGORIAS */}
          <Link href="/categories">
            <ButtonWrapper title="Gerenciar Categorias" className="gap-2 px-4">
              <Tags className="w-4 h-4" />
              <span className="hidden sm:inline">Categorias</span>
            </ButtonWrapper>
          </Link>

          <NewTransactionDialog />

          {/* DIVISOR VISUAL */}
          <div className="h-8 w-px bg-slate-200 dark:bg-slate-700 mx-1"></div>

          <ModeToggle />

          <form action={signOut}>
            <button 
              type="submit" 
              className="p-2 text-slate-500 hover:text-red-600 transition-colors border rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 dark:border-slate-800"
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
          
          {/* NOVA BARRA DE FERRAMENTAS: Busca, Filtros e Exportação */}
          <div className="flex flex-col md:flex-row gap-3 justify-between items-start md:items-center bg-white dark:bg-slate-900 p-4 rounded-xl border shadow-sm">
            <Suspense fallback={<div className="w-full h-10 bg-slate-100 animate-pulse rounded-md" />}>
              <SearchInput />
            </Suspense>
            
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <Suspense fallback={<div className="w-full sm:w-[300px] h-10 bg-slate-100 animate-pulse rounded-md" />}>
                <TransactionFilters />
              </Suspense>
              <ExportButton data={transactions as Transaction[]} />
            </div>
          </div>

          <TransactionList data={transactions as Transaction[]} />
        </div>
        
        <div className="md:col-span-1 mt-6 md:mt-0">
          <ExpensesChart data={categoryData} />
        </div>
      </div>
    </main>
  );
}

// Wrapper atualizado para permitir classes extras
function ButtonWrapper({ children, title, className = "" }: { children: React.ReactNode, title?: string, className?: string }) {
  return (
    <div 
      className={`inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 ${className || 'w-10'}`}
      title={title}
    >
      {children}
    </div>
  );
}