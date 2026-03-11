import React, { Suspense } from "react";
import { getDashboardStats, getRecentTransactions, getExpensesByCategory } from "@/services/dashboard";
import { Card, Metric, Text } from "@tremor/react";
import { Wallet, TrendingUp, TrendingDown, PiggyBank } from "lucide-react"; 
import { NewTransactionDialog } from "@/components/new-transaction-dialog";
import { TransactionList, Transaction } from "@/components/transaction-list";
import { ExpensesChart } from "@/components/expenses-chart";
import { MonthSelector } from "@/components/month-selector";
import { SearchInput } from "@/components/search-input";
import { TransactionFilters } from "@/components/transaction-filters";
import { ExportButton } from "@/components/export-button";
import { BottomNav } from "@/components/bottom-nav";
import { PixBatchDialog } from "@/components/pix-batch-dialog";
import { DailyBalanceChart } from "@/components/daily-balance-chart";

import { Sidebar } from "@/components/sidebar";
import { Topbar } from "@/components/topbar";
import { AIAdvisor } from "@/components/ai-advisor";
import { CashFlowChart } from "@/components/cash-flow-chart";
import { Footer } from "@/components/footer";

export const dynamic = "force-dynamic";

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
};

interface PageProps {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}

export default async function DashboardPage({ searchParams }: PageProps) {
  const params = await searchParams;
  
  const currentMonth = params?.month;
  const currentSearch = params?.search;
  const currentType = params?.type;
  const currentCategory = params?.category;

  const [stats, transactions, categoryData] = await Promise.all([
    getDashboardStats(currentMonth, currentSearch),
    getRecentTransactions(currentMonth, currentSearch, currentType, currentCategory),
    getExpensesByCategory(currentMonth, currentSearch),
  ]);

  const chartColors = ["#10b981", "#3b82f6", "#f43f5e", "#f59e0b", "#8b5cf6", "#06b6d4", "#ec4899"];
  const formattedCategoryData = categoryData.map((item, index) => ({
    category: item.name,
    amount: item.value,
    fill: chartColors[index % chartColors.length]
  }));

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 overflow-x-hidden">
      
      <Sidebar />

      {/* Adicionado o 'relative' na div principal para ancorar bem o menu */}
      <div className="flex-1 flex flex-col min-w-0 w-full overflow-hidden relative">
        <Topbar />

        {/* Adicionado pb-20 (padding-bottom) para o conteúdo não ficar atrás do menu inferior */}
        <main className="p-4 md:p-6 lg:p-8 pb-20 flex-1 overflow-y-auto space-y-6 w-full max-w-full">
          
          {/* TÍTULO E BOTÃO */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 w-full">
            <h1 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-white">
              Visão Geral
            </h1>
            <div className="flex w-full sm:w-auto gap-3">
              <PixBatchDialog transactions={transactions as Transaction[]} />
              <NewTransactionDialog />
            </div>
          </div>

          <AIAdvisor />
          
          {/* CARDS RESPONSIVOS: 1 coluna no celular, 2 no tablet, 4 no PC */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
            <Card className="decoration-top decoration-blue-500 border-l-4 border-l-blue-500 shadow-sm">
              <div className="flex items-center justify-between">
                <Text>Saldo {currentSearch || currentType || currentCategory ? '(Filtro)' : ''}</Text>
                <Wallet className="w-5 h-5 text-blue-600 shrink-0" />
              </div>
              <Metric className="mt-2 truncate whitespace-nowrap tabular-nums tracking-tight">
                {formatCurrency(stats.balance)}
              </Metric>
            </Card>

            <Card className="decoration-top decoration-emerald-500 border-l-4 border-l-emerald-500 shadow-sm">
              <div className="flex items-center justify-between">
                <Text>Receitas</Text>
                <TrendingUp className="w-5 h-5 text-emerald-600 shrink-0" />
              </div>
              <Metric className="mt-2 text-emerald-600 truncate whitespace-nowrap tabular-nums tracking-tight">
                {formatCurrency(stats.income)}
              </Metric>
            </Card>

            <Card className="decoration-top decoration-rose-500 border-l-4 border-l-rose-500 shadow-sm">
              <div className="flex items-center justify-between">
                <Text>Despesas</Text>
                <TrendingDown className="w-5 h-5 text-rose-600 shrink-0" />
              </div>
              <Metric className="mt-2 text-rose-600 truncate whitespace-nowrap tabular-nums tracking-tight">
                {formatCurrency(stats.expense)}
              </Metric>
            </Card>

            <Card className="decoration-top decoration-indigo-500 border-l-4 border-l-indigo-500 shadow-sm">
              <div className="flex items-center justify-between">
                <Text>Nos Cofres</Text>
                <PiggyBank className="w-5 h-5 text-indigo-600 shrink-0" />
              </div>
              <Metric className="mt-2 text-indigo-600 truncate whitespace-nowrap tabular-nums tracking-tight">
                {formatCurrency(stats.saved || 0)}
              </Metric>
            </Card>
          </div>

          {/* NOVO GRÁFICO GIGANTE ADICIONADO AQUI 👇 */}
          <div className="w-full">
            <DailyBalanceChart transactions={transactions as Transaction[]} />
          </div>

          {/* ÁREA DE GRÁFICOS E TABELAS */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 w-full">
            
            {/* LADO ESQUERDO: TABELA */}
            <div className="xl:col-span-2 space-y-4 w-full">
              <div className="bg-white dark:bg-slate-900 p-4 md:p-5 rounded-xl border shadow-sm space-y-4 w-full">
                
                {/* Cabeçalho da Tabela */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-100 dark:border-slate-800 pb-4 gap-3 w-full">
                  <h2 className="text-lg font-bold text-slate-800 dark:text-white">Últimas Movimentações</h2>
                  <Suspense fallback={<div className="w-full sm:w-[150px] h-10 bg-slate-100 animate-pulse rounded-md" />}>
                    <MonthSelector /> 
                  </Suspense>
                </div>

                {/* Filtros da Tabela (Responsividade Extrema) */}
                <div className="flex flex-col xl:flex-row gap-4 justify-between w-full">
                  
                  {/* Barra de Pesquisa */}
                  <div className="w-full xl:max-w-md flex-1">
                    <Suspense fallback={<div className="w-full h-10 bg-slate-100 animate-pulse rounded-md" />}>
                      <SearchInput />
                    </Suspense>
                  </div>
                  
                  {/* Selects e Botão de Exportar */}
                  <div className="flex flex-col md:flex-row flex-wrap gap-3 w-full xl:w-auto">
                    <Suspense fallback={<div className="w-full md:w-[320px] h-10 bg-slate-100 animate-pulse rounded-md" />}>
                      <TransactionFilters />
                    </Suspense>
                    <div className="w-full md:w-auto">
                      <ExportButton data={transactions as Transaction[]} />
                    </div>
                  </div>

                </div>
              </div>

              {/* Tabela de Transações (Com scroll horizontal se necessário) */}
              <div className="w-full overflow-x-auto pb-2">
                <TransactionList data={transactions as Transaction[]} />
              </div>
            </div>
            
            {/* LADO DIREITO: GRÁFICOS */}
            <div className="xl:col-span-1 space-y-6 w-full">
              <div className="w-full overflow-hidden">
                <ExpensesChart data={formattedCategoryData} />
              </div>
              <div className="w-full overflow-hidden">
                <CashFlowChart income={stats.income} expense={stats.expense} />
              </div>
            </div>
          </div>
        {/* ADICIONE O FOOTER AQUI 👇 */}
          <div className="pt-8">
            <Footer />
          </div>

        </main>

        {/* COMPONENTE ADICIONADO AQUI: Fica fixo no rodapé apenas no celular */}
        <BottomNav />

      </div>
    </div>
  );
}