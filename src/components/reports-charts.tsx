"use client";

import { Card, Title, BarChart, AreaChart } from "@tremor/react";

const formatCurrency = (number: number) => 
  Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(number).toString();

// 1. Criamos a tipagem exata para acabar com o "any"
interface EvolutionData {
  month: string;
  Receitas: number;
  Despesas: number;
}

interface AreaChartData {
  month: string;
  "Saldo do Mês": number;
  "Patrimônio Acumulado": number;
}

interface ReportsChartsProps {
  evolutionData: EvolutionData[];
  areaChartData: AreaChartData[];
}

export function ReportsCharts({ evolutionData, areaChartData }: ReportsChartsProps) {
  return (
    <div className="grid grid-cols-1 gap-6">
      
      {/* GRÁFICO 1: RECEITAS X DESPESAS */}
      <Card className="shadow-sm border-slate-200 dark:border-slate-800 dark:bg-slate-900">
        <Title className="text-slate-800 dark:text-slate-200">Evolução: Receitas x Despesas (Últimos 6 Meses)</Title>
        <BarChart
          className="mt-6 h-80"
          data={evolutionData}
          index="month"
          categories={["Receitas", "Despesas"]}
          colors={["emerald", "rose"]}
          valueFormatter={formatCurrency}
          yAxisWidth={90}
          showAnimation={true}
        />
      </Card>

      {/* GRÁFICO 2: CRESCIMENTO DO PATRIMÔNIO */}
      <Card className="shadow-sm border-slate-200 dark:border-slate-800 dark:bg-slate-900">
        <Title className="text-slate-800 dark:text-slate-200">Evolução do Patrimônio e Saldo</Title>
        <AreaChart
          className="mt-6 h-80"
          data={areaChartData}
          index="month"
          categories={["Patrimônio Acumulado", "Saldo do Mês"]}
          colors={["blue", "slate"]}
          valueFormatter={formatCurrency}
          yAxisWidth={90}
          showAnimation={true}
        />
      </Card>

    </div>
  );
}