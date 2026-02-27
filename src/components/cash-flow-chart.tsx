"use client";

import { Card, Title, BarChart } from "@tremor/react";

interface CashFlowChartProps {
  income: number;
  expense: number;
}

const valueFormatter = (number: number) => 
  Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(number);

export function CashFlowChart({ income, expense }: CashFlowChartProps) {
  // Estrutura de dados que o Tremor exige para o gráfico de barras
  const chartData = [
    {
      name: "Balanço",
      "Receitas": income,
      "Despesas": expense,
    },
  ];

  return (
    <Card className="shadow-sm border-slate-100 dark:border-slate-800 dark:bg-slate-900">
      <Title className="text-slate-800 dark:text-slate-200">Fluxo de Caixa</Title>
      <p className="text-sm text-slate-500 mb-4">Entradas vs Saídas do mês</p>
      
      <BarChart
        className="mt-4 h-56"
        data={chartData}
        index="name"
        categories={["Receitas", "Despesas"]}
        colors={["emerald", "rose"]}
        valueFormatter={valueFormatter}
        yAxisWidth={80}
        showAnimation={true}
      />
    </Card>
  );
}