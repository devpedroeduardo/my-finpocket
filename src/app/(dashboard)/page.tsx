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

import { Sidebar } from "@/components/sidebar";
import { Topbar } from "@/components/topbar";
import { AIAdvisor } from "@/components/ai-advisor";

// IMPORTANDO O NOVO GRÁFICO 👇
import { CashFlowChart } from "@/components/cash-flow-chart";

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
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
      
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Topbar />

        <main className="p-6 md:p-8 flex-1 overflow-y-auto space-y-8">
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <h1 className="text-3xl font-bold text-slate-800 dark:text-white">
              Visão Geral
            </h1>
            <NewTransactionDialog />
          </div>

          <AIAdvisor />
          
          {/* MUDAMOS PARA 4 COLUNAS: grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 👇 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="decoration-top decoration-blue-500 border-l-4 border-l-blue-500 shadow-sm">
              <div className="flex items-center justify-between">
                <Text>Saldo {currentSearch || currentType || currentCategory ? '(Filtrado)' : ''}</Text>
                <Wallet className="w-5 h-5 text-blue-600" />
              </div>
              <Metric className="mt-2">{formatCurrency(stats.balance)}</Metric>
            </Card>

            <Card className="decoration-top decoration-emerald-500 border-l-4 border-l-emerald-500 shadow-sm">
              <div className="flex items-center justify-between">
                <Text>Receitas</Text>
                <TrendingUp className="w-5 h-5 text-emerald-600" />
              </div>
              <Metric className="mt-2 text-emerald-600">{formatCurrency(stats.income)}</Metric>
            </Card>

            <Card className="decoration-top decoration-rose-500 border-l-4 border-l-rose-500 shadow-sm">
              <div className="flex items-center justify-between">
                <Text>Despesas</Text>
                <TrendingDown className="w-5 h-5 text-rose-600" />
              </div>
              <Metric className="mt-2 text-rose-600">{formatCurrency(stats.expense)}</Metric>
            </Card>

            {/* O NOVO CARD DE DINHEIRO GUARDADO 👇 */}
            <Card className="decoration-top decoration-indigo-500 border-l-4 border-l-indigo-500 shadow-sm">
              <div className="flex items-center justify-between">
                <Text>Nos Cofres</Text>
                <PiggyBank className="w-5 h-5 text-indigo-600" />
              </div>
              <Metric className="mt-2 text-indigo-600">{formatCurrency(stats.saved || 0)}</Metric>
            </Card>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            
            {/* LADO ESQUERDO: TABELA DE MOVIMENTAÇÕES */}
            <div className="xl:col-span-2 space-y-4">
              <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border shadow-sm space-y-5">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-100 dark:border-slate-800 pb-4 gap-4">
                  <h2 className="text-lg font-bold text-slate-800 dark:text-white">Últimas Movimentações</h2>
                  <Suspense fallback={<div className="w-[150px] h-10 bg-slate-100 animate-pulse rounded-md" />}>
                    <MonthSelector /> 
                  </Suspense>
                </div>

                <div className="flex flex-col md:flex-row gap-3 justify-between items-start md:items-center">
                  <Suspense fallback={<div className="w-full md:w-64 h-10 bg-slate-100 animate-pulse rounded-md" />}>
                    <SearchInput />
                  </Suspense>
                  
                  <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                    <Suspense fallback={<div className="w-full sm:w-[300px] h-10 bg-slate-100 animate-pulse rounded-md" />}>
                      <TransactionFilters />
                    </Suspense>
                    <ExportButton data={transactions as Transaction[]} />
                  </div>
                </div>
              </div>

              <TransactionList data={transactions as Transaction[]} />
            </div>
            
            {/* LADO DIREITO: GRÁFICOS */}
            <div className="xl:col-span-1 space-y-6">
              {/* Gráfico Redondo de Despesas */}
              <ExpensesChart data={formattedCategoryData} />
              
              {/* NOVO GRÁFICO DE BARRAS DE FLUXO DE CAIXA 👇 */}
              <CashFlowChart income={stats.income} expense={stats.expense} />
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}