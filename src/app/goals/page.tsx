"use client";

import { useState, useEffect, useCallback } from "react";
import { Sidebar } from "@/components/sidebar";
import { Topbar } from "@/components/topbar";
import { Target, Plus, Trash2, TrendingUp, CheckCircle2, AlertCircle, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import { getGoals, createGoal, addMoneyToGoal, deleteGoal } from "@/app/actions/goals";

import { getBudgets, upsertBudget, deleteBudget, getBudgetsExpenses } from "@/app/actions/budgets";

interface Goal {
  id: string; title: string; target_amount: number; current_amount: number;
}
interface Budget {
  id: string; category: string; amount: number; spent: number;
}

// CORREÇÃO: Criamos um "molde" para avisar ao TypeScript o que vem da função getBudgetsExpenses
interface ExpenseData {
  category: string;
  amount: number;
}

export default function PlanningPage() {
  const [activeTab, setActiveTab] = useState<'objectives' | 'spending'>('objectives');
  const [isLoading, setIsLoading] = useState(false);

  // --- ESTADOS: OBJETIVOS (CAIXINHAS) ---
  const [goals, setGoals] = useState<Goal[]>([]);
  const [newTitle, setNewTitle] = useState("");
  const [newTargetStr, setNewTargetStr] = useState("");
  const [addAmounts, setAddAmounts] = useState<Record<string, string>>({});

  // --- ESTADOS: LIMITES DE GASTOS ---
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [newBudgetCatch, setNewBudgetCatch] = useState("");
  const [newBudgetAmountStr, setNewBudgetAmountStr] = useState("");

  const loadAllData = useCallback(async () => {
    const goalsData = await getGoals();
    setGoals(goalsData);

    const currentMonthStr = new Date().toISOString().slice(0, 7); 
    const [budgetsData, expensesData] = await Promise.all([
      getBudgets(),
      getBudgetsExpenses(currentMonthStr)
    ]);

    // CORREÇÃO: Removemos os 'any' e tipamos com Omit (para o budget sem o 'spent' ainda) e ExpenseData
    const mergedBudgets = (budgetsData || []).map((budget: Omit<Budget, 'spent'>) => {
      let spent = 0;
      const catName = budget.category || "Geral";

      if (catName.toLowerCase() === "geral") {
        spent = expensesData.reduce((acc: number, curr: ExpenseData) => acc + Number(curr.amount), 0);
      } else {
        const found = expensesData.find((e: ExpenseData) => e.category.toLowerCase() === catName.toLowerCase());
        if (found) spent = Number(found.amount);
      }

      return { ...budget, spent, category: catName };
    });

    setBudgets(mergedBudgets);
  }, []);

  useEffect(() => {
    const init = async () => await loadAllData();
    init();
  }, [loadAllData]);

  // =====================================
  // FUNÇÕES DE OBJETIVOS (CAIXINHAS)
  // =====================================
  async function handleCreateGoal(e: React.FormEvent) {
    e.preventDefault();
    const target = parseFloat(newTargetStr);
    if (!newTitle || isNaN(target) || target <= 0) return toast.error("Preencha dados válidos.");
    setIsLoading(true);
    const result = await createGoal(newTitle, target);
    if (result.error) toast.error(result.error);
    else { toast.success("Objetivo criado!"); setNewTitle(""); setNewTargetStr(""); await loadAllData(); }
    setIsLoading(false);
  }

  async function handleAddMoney(id: string) {
    const amount = parseFloat(addAmounts[id]);
    if (isNaN(amount) || amount <= 0) return toast.error("Valor inválido.");
    setIsLoading(true);
    const result = await addMoneyToGoal(id, amount);
    if (result.error) toast.error(result.error);
    else { toast.success("Dinheiro guardado!"); setAddAmounts(prev => ({ ...prev, [id]: "" })); await loadAllData(); }
    setIsLoading(false);
  }

  async function handleDeleteGoal(id: string) {
    if (!confirm("Excluir este objetivo?")) return;
    const result = await deleteGoal(id);
    if (!result.error) { toast.success("Removido."); await loadAllData(); }
  }

  // =====================================
  // FUNÇÕES DE LIMITES DE GASTOS
  // =====================================
  async function handleCreateBudget(e: React.FormEvent) {
    e.preventDefault();
    const amount = parseFloat(newBudgetAmountStr);
    if (isNaN(amount) || amount <= 0) return toast.error("Informe um limite válido.");
    
    setIsLoading(true);
    const cat = newBudgetCatch.trim() === "" ? "Geral" : newBudgetCatch;
    const result = await upsertBudget(cat, amount);
    
    if (result.error) toast.error(result.error);
    else { 
      toast.success("Limite salvo com sucesso!"); 
      setNewBudgetCatch(""); 
      setNewBudgetAmountStr(""); 
      await loadAllData(); 
    }
    setIsLoading(false);
  }

  async function handleDeleteBudget(id: string) {
    if (!confirm("Deseja remover este limite?")) return;
    const result = await deleteBudget(id);
    if (!result.error) { toast.success("Limite removido."); await loadAllData(); }
  }

  const formatCurrency = (value: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar />
        <main className="p-6 md:p-8 flex-1 overflow-y-auto">
          <div className="max-w-5xl mx-auto space-y-6">
            
            <div>
              <h1 className="text-3xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
                <Target className="w-8 h-8 text-blue-600" /> Metas e Planejamento
              </h1>
              <p className="text-slate-500 mt-2">Gerencie limites de gastos e objetivos futuros.</p>
            </div>

            <div className="bg-slate-200/50 dark:bg-slate-900 p-1 flex rounded-lg w-fit border border-slate-200 dark:border-slate-800">
              <button onClick={() => setActiveTab('objectives')} className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-md transition-all ${activeTab === 'objectives' ? 'bg-white dark:bg-slate-800 shadow-sm text-blue-600 dark:text-blue-400' : 'text-slate-500'}`}>
                <TrendingUp className="w-4 h-4" /> Objetivos (Caixinhas)
              </button>
              <button onClick={() => setActiveTab('spending')} className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-md transition-all ${activeTab === 'spending' ? 'bg-white dark:bg-slate-800 shadow-sm text-rose-600 dark:text-rose-400' : 'text-slate-500'}`}>
                <Wallet className="w-4 h-4" /> Limite de Gastos
              </button>
            </div>

            {/* ABA: OBJETIVOS */}
            {activeTab === 'objectives' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in">
                <div className="md:col-span-1">
                  <Card className="sticky top-6">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2"><Plus className="w-5 h-5 text-blue-600" /> Novo Objetivo</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <form onSubmit={handleCreateGoal} className="space-y-4">
                        <div><label className="text-xs font-medium text-slate-500 mb-1 block">Nome</label><Input value={newTitle} onChange={e => setNewTitle(e.target.value)} /></div>
                        <div><label className="text-xs font-medium text-slate-500 mb-1 block">Valor Alvo (R$)</label><Input type="number" step="0.01" value={newTargetStr} onChange={e => setNewTargetStr(e.target.value)} /></div>
                        <Button type="submit" disabled={isLoading} className="w-full bg-blue-600 hover:bg-blue-700 text-white">Criar Objetivo</Button>
                      </form>
                    </CardContent>
                  </Card>
                </div>
                <div className="md:col-span-2 space-y-4">
                  {goals.length === 0 ? (
                     <div className="p-8 text-center border border-dashed rounded-xl text-slate-500 bg-white dark:bg-slate-900">
                        Nenhum objetivo definido ainda. Crie ao lado!
                     </div>
                  ) : (
                    goals.map(goal => {
                      const percentage = Math.min((goal.current_amount / goal.target_amount) * 100, 100);
                      const isCompleted = percentage >= 100;
                      return (
                        <Card key={goal.id} className={isCompleted ? 'border-emerald-500' : ''}>
                          <CardContent className="p-5">
                            <div className="flex justify-between mb-4">
                              <div>
                                <h3 className="text-lg font-bold flex items-center gap-2">{goal.title}{isCompleted && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}</h3>
                                <p className="text-sm mt-1"><span className={isCompleted ? "text-emerald-600 font-bold" : "font-bold"}>{formatCurrency(goal.current_amount)}</span> de {formatCurrency(goal.target_amount)}</p>
                              </div>
                              <Button variant="ghost" size="icon" onClick={() => handleDeleteGoal(goal.id)} className="text-slate-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></Button>
                            </div>
                            <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mb-6">
                              <div className={`h-full ${isCompleted ? 'bg-emerald-500' : 'bg-blue-500'}`} style={{ width: `${percentage}%` }} />
                            </div>
                            {!isCompleted && (
                              <div className="flex items-center gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                                <TrendingUp className="w-4 h-4 text-slate-400" />
                                <Input type="number" placeholder="R$ a guardar" className="h-9 w-36" value={addAmounts[goal.id] || ""} onChange={e => setAddAmounts(prev => ({ ...prev, [goal.id]: e.target.value }))} />
                                <Button size="sm" onClick={() => handleAddMoney(goal.id)} disabled={isLoading || !addAmounts[goal.id]} className="bg-slate-800 dark:bg-slate-200 dark:text-slate-900 text-white">Guardar</Button>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      );
                    })
                  )}
                </div>
              </div>
            )}

            {/* ABA: LIMITES DE GASTOS */}
            {activeTab === 'spending' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in">
                <div className="md:col-span-1">
                  <Card className="sticky top-6">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2 text-rose-600"><AlertCircle className="w-5 h-5" /> Novo Limite</CardTitle>
                      <CardDescription>Defina um teto de gastos para o mês.</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <form onSubmit={handleCreateBudget} className="space-y-4">
                        <div><label className="text-xs font-medium text-slate-500 mb-1 block">Categoria (Vazio = Geral)</label><Input placeholder="Ex: Alimentação" value={newBudgetCatch} onChange={e => setNewBudgetCatch(e.target.value)} /></div>
                        <div><label className="text-xs font-medium text-slate-500 mb-1 block">Limite Máximo (R$)</label><Input type="number" step="0.01" value={newBudgetAmountStr} onChange={e => setNewBudgetAmountStr(e.target.value)} /></div>
                        <Button type="submit" disabled={isLoading} className="w-full bg-rose-600 hover:bg-rose-700 text-white">Salvar Limite</Button>
                      </form>
                    </CardContent>
                  </Card>
                </div>
                <div className="md:col-span-2 space-y-4">
                  {budgets.length === 0 ? (
                     <div className="p-8 text-center border border-dashed rounded-xl text-slate-500 bg-white dark:bg-slate-900">
                        Nenhum limite definido ainda. Crie ao lado!
                     </div>
                  ) : (
                    budgets.map(budget => {
                      const percentage = Math.min((budget.spent / budget.amount) * 100, 100);
                      const isOverBudget = budget.spent > budget.amount;

                      return (
                        <Card key={budget.id} className="overflow-hidden border-rose-100 dark:border-rose-900/30">
                          <CardContent className="p-5">
                            <div className="flex justify-between mb-4">
                              <div>
                                <h3 className="text-lg font-bold flex items-center gap-2">Limite: {budget.category}</h3>
                                <p className="text-sm mt-1">Você gastou <span className="text-rose-600 font-bold">{formatCurrency(budget.spent)}</span> de {formatCurrency(budget.amount)}</p>
                              </div>
                              <Button variant="ghost" size="icon" onClick={() => handleDeleteBudget(budget.id)} className="text-slate-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></Button>
                            </div>
                            <div className="mb-2 flex justify-between text-xs font-semibold text-slate-500">
                              <span>{isOverBudget ? "Orçamento Estourado!" : "Consumido"}</span>
                              <span className="text-rose-600">{percentage.toFixed(1)}%</span>
                            </div>
                            <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                              <div className={`h-full transition-all duration-1000 ${isOverBudget ? 'bg-red-600' : 'bg-rose-500'}`} style={{ width: `${percentage}%` }} />
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })
                  )}
                </div>
              </div>
            )}

          </div>
        </main>
      </div>
    </div>
  );
}