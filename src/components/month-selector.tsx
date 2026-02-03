"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRouter, useSearchParams } from "next/navigation";

export function MonthSelector() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Pega o mês atual da URL ou usa o mês atual do sistema
  const currentMonth = searchParams.get("month") || new Date().toISOString().slice(0, 7);

  // Função para mudar o mês na URL
  const handleMonthChange = (month: string) => {
    // Atualiza a URL sem recarregar a página inteira (navegação rápida)
    router.push(`/?month=${month}`);
  };

  // Gera os últimos 12 meses automaticamente
  const months = Array.from({ length: 12 }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    return {
      value: date.toISOString().slice(0, 7), // Formato: "2026-02"
      label: new Intl.DateTimeFormat("pt-BR", { month: "long", year: "numeric" }).format(date),
    };
  });

  return (
    <div className="w-[200px]">
      <Select value={currentMonth} onValueChange={handleMonthChange}>
        <SelectTrigger>
          <SelectValue placeholder="Selecione o mês" />
        </SelectTrigger>
        <SelectContent>
          {months.map((month) => (
            <SelectItem key={month.value} value={month.value} className="capitalize">
              {month.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}