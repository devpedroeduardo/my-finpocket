import React from "react";
import { Sidebar } from "@/components/sidebar";
import { Topbar } from "@/components/topbar";
import { getMonthlyEvolution } from "@/services/reports";
import { ReportsCharts } from "@/components/reports-charts";

export const dynamic = "force-dynamic";

export default async function ReportsPage() {
  const evolutionData = await getMonthlyEvolution();

  // CORREÇÃO: Usando reduce() para criar o array sem mutar variáveis soltas
  const areaChartData = evolutionData.reduce((acc, item) => {
    const balance = item.Receitas - item.Despesas;
    // Pega o acumulado do mês anterior (se for o primeiro mês, é 0)
    const previousAccumulated = acc.length > 0 ? acc[acc.length - 1]["Patrimônio Acumulado"] : 0;
    
    acc.push({
      month: item.month,
      "Saldo do Mês": balance,
      "Patrimônio Acumulado": previousAccumulated + balance
    });
    
    return acc;
  }, [] as Array<{ month: string, "Saldo do Mês": number, "Patrimônio Acumulado": number }>);

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Topbar />

        <main className="p-6 md:p-8 flex-1 overflow-y-auto space-y-8">
          
          <div>
            <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Relatórios e Análises</h1>
            <p className="text-slate-500 mt-2">Acompanhe a evolução histórica do seu fluxo de caixa.</p>
          </div>

          <ReportsCharts evolutionData={evolutionData} areaChartData={areaChartData} />

        </main>
      </div>
    </div>
  );
}