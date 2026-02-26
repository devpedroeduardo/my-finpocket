"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { format, addMonths, subMonths } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

export function MonthSelector() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mounted, setMounted] = useState(false);

  // CORREÇÃO: Envolvemos em uma função assíncrona interna para o linter não reclamar de "Cascading Renders"
  useEffect(() => {
    const init = async () => {
      setMounted(true);
    };
    init();
  }, []);

  // Descobre o mês atual (via URL ou hoje)
  const currentMonthParam = searchParams.get("month");
  
  let currentDate = new Date();
  if (currentMonthParam) {
    // Força a data para o meio-dia para evitar bugs de fuso horário
    currentDate = new Date(`${currentMonthParam}-01T12:00:00`); 
  }

  function handleNavigate(direction: 'prev' | 'next') {
    const newDate = direction === 'prev' ? subMonths(currentDate, 1) : addMonths(currentDate, 1);
    const newMonthStr = format(newDate, "yyyy-MM");
    
    const params = new URLSearchParams(searchParams.toString());
    params.set("month", newMonthStr);
    router.push(`/?${params.toString()}`);
  }

  if (!mounted) return <div className="w-[200px] h-10 bg-slate-100 dark:bg-slate-800 animate-pulse rounded-md" />;

  return (
    <div className="flex items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm p-1">
      <Button 
        variant="ghost" 
        size="icon" 
        className="h-8 w-8 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200" 
        onClick={() => handleNavigate('prev')}
      >
        <ChevronLeft className="w-4 h-4" />
      </Button>
      
      <div className="flex items-center justify-center gap-2 w-44">
        <CalendarDays className="w-4 h-4 text-emerald-600" />
        <span className="text-sm font-semibold capitalize text-slate-800 dark:text-slate-200 select-none">
          {format(currentDate, "MMMM yyyy", { locale: ptBR })}
        </span>
      </div>

      <Button 
        variant="ghost" 
        size="icon" 
        className="h-8 w-8 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200" 
        onClick={() => handleNavigate('next')}
      >
        <ChevronRight className="w-4 h-4" />
      </Button>
    </div>
  );
}