"use server";

import { createClient } from "@/lib/supabase/server";
import { getBudgets, getBudgetsExpenses } from "@/app/actions/budgets";
import { startOfDay, endOfDay } from "date-fns";

// 1. Definimos a interface para o Alerta
export interface Alert {
  id: string;
  type: "warning" | "danger";
  title: string;
  message: string;
}

// Interfaces auxiliares para os dados do banco
interface Budget {
  id: string;
  category: string;
  amount: number;
}

interface Expense {
  category: string;
  amount: number;
}

export async function getActiveAlerts(): Promise<Alert[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const alerts: Alert[] = [];
  const now = new Date();
  const monthStr = now.toISOString().slice(0, 7);

  // 1. Alerta de Contas a Pagar (Hoje)
  const { data: pendingToday } = await supabase
    .from("transactions")
    .select("description, amount")
    .eq("user_id", user.id)
    .eq("status", "pending")
    .gte("created_at", startOfDay(now).toISOString())
    .lte("created_at", endOfDay(now).toISOString());

  if (pendingToday && pendingToday.length > 0) {
    const total = pendingToday.reduce((acc, t) => acc + Number(t.amount), 0);
    alerts.push({
      id: "pending-today",
      type: "warning",
      title: "Contas para hoje",
      message: `Você tem ${pendingToday.length} conta(s) vencendo hoje, totalizando R$ ${total.toFixed(2)}.`,
    });
  }

  // 2. Alerta de Orçamento Estourado
  const [budgetsRaw, expensesRaw] = await Promise.all([
    getBudgets(),
    getBudgetsExpenses(monthStr)
  ]);

  // Tipagem explícita para evitar o 'any'
  const budgets = budgetsRaw as Budget[];
  const expenses = expensesRaw as Expense[];

  budgets.forEach((budget) => {
    const catName = budget.category || "Geral";
    let spent = 0;
    
    if (catName.toLowerCase() === "geral") {
      spent = expenses.reduce((acc: number, curr: Expense) => acc + Number(curr.amount), 0);
    } else {
      const found = expenses.find((e: Expense) => e.category.toLowerCase() === catName.toLowerCase());
      if (found) spent = Number(found.amount);
    }

    if (spent > budget.amount) {
      alerts.push({
        id: `budget-over-${budget.id}`,
        type: "danger",
        title: "Orçamento Estourado",
        message: `Seus gastos em "${catName}" ultrapassaram o limite de R$ ${budget.amount}.`,
      });
    }
  });

  return alerts;
}