"use client";

import { Pie, PieChart, Cell, Tooltip } from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Loader2 } from "lucide-react";

// Configuração das cores e legendas
const chartConfig = {
  amount: {
    label: "Valor",
  },
  // Mapeamento genérico para categorias
  Alimentação: { label: "Alimentação", color: "hsl(var(--chart-1))" },
  Transporte: { label: "Transporte", color: "hsl(var(--chart-2))" },
  Saúde: { label: "Saúde", color: "hsl(var(--chart-3))" },
  Lazer: { label: "Lazer", color: "hsl(var(--chart-4))" },
  Casa: { label: "Casa", color: "hsl(var(--chart-5))" },
  Educação: { label: "Educação", color: "hsl(var(--chart-1))" },
  Outros: { label: "Outros", color: "hsl(var(--chart-2))" },
} satisfies ChartConfig;

interface ExpensesChartProps {
  data: {
    category: string;
    amount: number;
    fill: string;
  }[];
}

export function ExpensesChart({ data }: ExpensesChartProps) {
  // Se não tiver dados, mostra mensagem amigável
  if (!data || data.length === 0) {
    return (
      <Card className="flex flex-col">
        <CardHeader className="items-center pb-0">
          <CardTitle>Despesas por Categoria</CardTitle>
          <CardDescription>Nenhum gasto registrado</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 pb-0 min-h-[250px] flex items-center justify-center text-muted-foreground">
          Cadastre despesas para ver o gráfico.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>Despesas por Categoria</CardTitle>
        <CardDescription>Total acumulado</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[250px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={data}
              dataKey="amount"
              nameKey="category"
              innerRadius={60} // Isso faz virar uma "Rosca" (Donut)
              strokeWidth={5}
            >
               {/* Mapeia as células para garantir as cores corretas */}
               {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}