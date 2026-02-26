"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ArrowLeft, Target, Trash2, Plus, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { getCategories } from "@/app/actions/categories";

// CORREÇÃO: Usando nossa nova Action Segura (getBudgetsExpenses)
import { getBudgets, upsertBudget, deleteBudget, getBudgetsExpenses } from "@/app/actions/budgets";

interface Budget {
  id: string;
  category: string;
  amount: number;
}

interface BudgetProgress extends Budget {
  spent: number;
  percentage: number;
}

interface ExpenseItem {
  category: string;
  amount: number;
}

export default function BudgetsPage() {
  const [categories, setCategories] = useState<{id: string, name: string}[]>([]);
  const [budgets, setBudgets] = useState<BudgetProgress[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const [selectedCat, setSelectedCat] = useState("");
  const [amountStr, setAmountStr] = useState("");

  const loadData = useCallback(async () => {
    const cats = await getCategories();
    setCategories(cats || []);

    const currentMonthStr = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;
    
    // CORREÇÃO: Chamando a nova action do servidor!
    const [bgs, expenses] = await Promise.all([
      getBudgets(),
      getBudgetsExpenses(currentMonthStr)
    ]);

    const progressData: BudgetProgress[] = (bgs || []).map((b: Budget) => {
      const typedExpenses = expenses as ExpenseItem[];
      const expenseItem = typedExpenses.find(
        (e) => e.category.toLowerCase() === b.category.toLowerCase()
      );
      
      const spent = expenseItem ? expenseItem.amount : 0;
      const percentage = Math.min((spent / b.amount) * 100, 100);

      return { ...b, spent, percentage };
    });

    setBudgets(progressData);
  }, []);

  useEffect(() => {
    const fetchInit = async () => {
      await loadData();
    };
    fetchInit();
  }, [loadData]);

  async function handleAdd() {
    const val = parseFloat(amountStr);
    if (!selectedCat || isNaN(val) || val <= 0) {
      toast.error("Selecione uma categoria e insira um valor válido.");
      return;
    }

    setIsLoading(true);
    const result = await upsertBudget(selectedCat, val);
    
    if (result?.error) toast.error(result.error);
    else {
      toast.success("Meta salva com sucesso!");
      setSelectedCat("");
      setAmountStr("");
      await loadData();
    }
    setIsLoading(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("Remover esta meta?")) return;
    const result = await deleteBudget(id);
    if (result?.error) toast.error(result.error);
    else {
      toast.success("Meta removida.");
      await loadData();
    }
  }

  const getProgressColor = (percent: number) => {
    if (percent >= 100) return "bg-red-500";
    if (percent >= 80) return "bg-amber-500";
    return "bg-emerald-500";
  };

  const formatBRL = (val: number) => 
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(val);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        
        <div className="flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Metas de Gastos</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Target className="w-5 h-5 text-blue-600" />
              Definir Novo Limite
            </CardTitle>
            <CardDescription>Defina quanto você quer gastar no máximo por categoria este mês.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <Select value={selectedCat} onValueChange={setSelectedCat}>
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue placeholder="Categoria" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(c => <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>

              <Input 
                type="number" 
                step="0.01" 
                placeholder="Valor Limite (R$)" 
                value={amountStr}
                onChange={(e) => setAmountStr(e.target.value)}
                className="w-full sm:w-[200px]"
              />

              <Button onClick={handleAdd} disabled={isLoading || !selectedCat || !amountStr} className="bg-blue-600 hover:bg-blue-700">
                {isLoading ? "Salvando..." : <><Plus className="w-4 h-4 mr-2"/> Salvar</>}
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold mt-8">Acompanhamento do Mês Atual</h3>
          
          {budgets.length === 0 ? (
            <div className="p-8 text-center border border-dashed rounded-xl text-slate-500">
              Nenhuma meta definida. Crie sua primeira meta acima!
            </div>
          ) : (
            budgets.map((b) => (
              <Card key={b.id} className="overflow-hidden">
                <CardContent className="p-5 flex flex-col gap-3">
                  
                  <div className="flex items-center justify-between">
                    <div className="font-semibold text-base">{b.category}</div>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(b.id)} className="h-8 w-8 text-slate-400 hover:text-red-500">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">
                      Gasto: <strong className="text-slate-800 dark:text-slate-200">{formatBRL(b.spent)}</strong>
                    </span>
                    <span className="text-slate-500">
                      Limite: <strong>{formatBRL(b.amount)}</strong>
                    </span>
                  </div>

                  <div className="relative w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-500 ${getProgressColor(b.percentage)}`}
                      style={{ width: `${b.percentage}%` }}
                    />
                  </div>
                  
                  {b.percentage >= 100 && (
                    <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                      <AlertCircle className="w-3 h-3" /> Você ultrapassou o limite desta categoria!
                    </p>
                  )}
                  {b.percentage >= 80 && b.percentage < 100 && (
                    <p className="text-xs text-amber-500 flex items-center gap-1 mt-1">
                      <AlertCircle className="w-3 h-3" /> Atenção! Você está perto de atingir o limite.
                    </p>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>

      </div>
    </div>
  );
}