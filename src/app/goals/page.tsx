"use client";

import { useState, useEffect, useCallback } from "react";
import { Sidebar } from "@/components/sidebar";
import { Topbar } from "@/components/topbar";
import { Target, Plus, Trash2, TrendingUp, CheckCircle2, AlertCircle, Wallet, PiggyBank, ArrowDownToLine, ArrowUpFromLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// Importando as novas funções do nosso backend (Cofres)
import { getGoals, createGoal, updateGoalAmount, deleteGoal } from "@/app/actions/goals";
import { getBudgets, upsertBudget, deleteBudget, getBudgetsExpenses } from "@/app/actions/budgets";

interface Goal {
  id: string; 
  name: string; // Atualizado para corresponder ao BD
  target_amount: number; 
  current_amount: number;
}

interface Budget {
  id: string; category: string; amount: number; spent: number;
}

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
  const [amountInputs, setAmountInputs] = useState<Record<string, string>>({}); // Valor do input de cada caixinha

  // --- ESTADOS: LIMITES DE GASTOS ---
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [newBudgetCatch, setNewBudgetCatch] = useState("");
  const [newBudgetAmountStr, setNewBudgetAmountStr] = useState("");

  const loadAllData = useCallback(async () => {
    // 1. Carrega as Caixinhas
    const goalsData = await getGoals();
    setGoals(goalsData || []);

    // 2. Carrega os Limites
    const currentMonthStr = new Date().toISOString().slice(0, 7); 
    const [budgetsData, expensesData] = await Promise.all([
      getBudgets(),
      getBudgetsExpenses(currentMonthStr)
    ]);

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
    if (!newTitle || isNaN(target) || target <= 0) return toast.error("Preencha o nome e um valor alvo maior que zero.");
    
    setIsLoading(true);
    const result = await createGoal({ name: newTitle, target_amount: target });
    
    if (result.error) {
      toast.error(result.error);
    } else { 
      toast.success("Objetivo criado com sucesso!"); 
      setNewTitle(""); 
      setNewTargetStr(""); 
      await loadAllData(); 
    }
    setIsLoading(false);
  }

  // Função unificada para Guardar (deposit) ou Resgatar (withdraw)
  async function handleGoalTransaction(id: string, type: 'deposit' | 'withdraw') {
    const amountStr = amountInputs[id];
    const amount = parseFloat(amountStr);
    
    if (isNaN(amount) || amount <= 0) {
      return toast.error("Informe um valor válido para movimentar.");
    }

    // Verifica se está tentando resgatar mais do que tem
    const goal = goals.find(g => g.id === id);
    if (type === 'withdraw' && goal && amount > goal.current_amount) {
      return toast.error("Você não pode resgatar mais do que guardou nesta caixinha.");
    }

    setIsLoading(true);
    const toastId = toast.loading(type === 'deposit' ? "Guardando dinheiro..." : "Resgatando dinheiro...");
    
    const result = await updateGoalAmount(id, amount, type);
    
    if (result.error) {
      toast.error(result.error, { id: toastId });
    } else { 
      toast.success(type === 'deposit' ? "Dinheiro guardado! 🎉" : "Dinheiro resgatado com sucesso.", { id: toastId }); 
      setAmountInputs(prev => ({ ...prev, [id]: "" })); // Limpa o input
      await loadAllData(); 
    }
    setIsLoading(false);
  }

  async function handleDeleteGoal(id: string) {
    const goal = goals.find(g => g.id === id);
    if (goal && goal.current_amount > 0) {
      const confirmForce = confirm(`ATENÇÃO! Há ${formatCurrency(goal.current_amount)} guardados neste objetivo. Deletar a caixinha fará você perder esse registro. Deseja continuar?`);
      if (!confirmForce) return;
    } else {
      if (!confirm("Tem certeza que deseja excluir este objetivo?")) return;
    }

    setIsLoading(true);
    const result = await deleteGoal(id);
    if (!result.error) { 
      toast.success("Objetivo removido."); 
      await loadAllData(); 
    } else {
      toast.error(result.error);
    }
    setIsLoading(false);
  }

  // =====================================
  // FUNÇÕES DE LIMITES DE GASTOS (MANTIDAS)
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
              <p className="text-slate-500 mt-2">Gerencie limites de gastos e guarde dinheiro para seus objetivos.</p>
            </div>

            <div className="bg-slate-200/50 dark:bg-slate-900 p-1 flex rounded-lg w-fit border border-slate-200 dark:border-slate-800">
              <button onClick={() => setActiveTab('objectives')} className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-md transition-all ${activeTab === 'objectives' ? 'bg-white dark:bg-slate-800 shadow-sm text-blue-600 dark:text-blue-400' : 'text-slate-500'}`}>
                <PiggyBank className="w-4 h-4" /> Cofres (Caixinhas)
              </button>
              <button onClick={() => setActiveTab('spending')} className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-md transition-all ${activeTab === 'spending' ? 'bg-white dark:bg-slate-800 shadow-sm text-rose-600 dark:text-rose-400' : 'text-slate-500'}`}>
                <Wallet className="w-4 h-4" /> Limite de Gastos
              </button>
            </div>

            {/* ABA: OBJETIVOS (CAIXINHAS) */}
            {activeTab === 'objectives' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in">
                {/* FORMULÁRIO DE CRIAR COFRE */}
                <div className="md:col-span-1">
                  <Card className="sticky top-6 border-blue-100 dark:border-blue-900/30">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2 text-blue-700 dark:text-blue-400">
                        <Plus className="w-5 h-5" /> Novo Cofre
                      </CardTitle>
                      <CardDescription>Crie uma caixinha para uma meta específica.</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <form onSubmit={handleCreateGoal} className="space-y-4">
                        <div>
                          <label className="text-xs font-medium text-slate-500 mb-1 block">Nome do Objetivo</label>
                          <Input placeholder="Ex: Viagem para Praia" value={newTitle} onChange={e => setNewTitle(e.target.value)} />
                        </div>
                        <div>
                          <label className="text-xs font-medium text-slate-500 mb-1 block">Valor Alvo (R$)</label>
                          <Input type="number" step="0.01" placeholder="Ex: 5000" value={newTargetStr} onChange={e => setNewTargetStr(e.target.value)} />
                        </div>
                        <Button type="submit" disabled={isLoading} className="w-full bg-blue-600 hover:bg-blue-700 text-white">Criar Cofre</Button>
                      </form>
                    </CardContent>
                  </Card>
                </div>

                {/* LISTA DE COFRES */}
                <div className="md:col-span-2 space-y-4">
                  {goals.length === 0 ? (
                     <div className="p-12 text-center border border-dashed rounded-xl text-slate-500 bg-white dark:bg-slate-900">
                       <PiggyBank className="w-12 h-12 mx-auto mb-3 opacity-20 text-blue-500" />
                       <h3 className="font-semibold text-slate-700 dark:text-slate-300 mb-1">Nenhum cofre criado</h3>
                       <p className="text-sm">Comece a planejar seus sonhos criando um objetivo ao lado.</p>
                     </div>
                  ) : (
                    goals.map(goal => {
                      const percentage = Math.min((goal.current_amount / goal.target_amount) * 100, 100);
                      const isCompleted = percentage >= 100;
                      
                      return (
                        <Card key={goal.id} className={cn("overflow-hidden transition-all", isCompleted ? 'border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/10 dark:bg-emerald-900/10' : '')}>
                          <CardContent className="p-6">
                            
                            <div className="flex justify-between items-start mb-4">
                              <div className="flex gap-4">
                                <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center mt-1", isCompleted ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400" : "bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400")}>
                                  {isCompleted ? <CheckCircle2 className="w-6 h-6" /> : <PiggyBank className="w-6 h-6" />}
                                </div>
                                <div>
                                  <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">{goal.name}</h3>
                                  <div className="flex items-center gap-2 mt-1">
                                    <span className={cn("text-lg font-bold tracking-tight", isCompleted ? "text-emerald-600" : "text-blue-600 dark:text-blue-400")}>
                                      {formatCurrency(goal.current_amount)}
                                    </span>
                                    <span className="text-sm text-slate-400 font-medium pt-1">de {formatCurrency(goal.target_amount)}</span>
                                  </div>
                                </div>
                              </div>
                              <Button variant="ghost" size="icon" onClick={() => handleDeleteGoal(goal.id)} disabled={isLoading} className="text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>

                            <div className="flex justify-between text-xs font-bold text-slate-400 mb-2 mt-2 px-1">
                              <span>Progresso</span>
                              <span className={isCompleted ? "text-emerald-500" : "text-slate-600 dark:text-slate-300"}>{percentage.toFixed(1)}%</span>
                            </div>

                            <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mb-5">
                              <div 
                                className={cn("h-full transition-all duration-1000", isCompleted ? 'bg-emerald-500' : 'bg-gradient-to-r from-blue-500 to-indigo-500')} 
                                style={{ width: `${percentage}%` }} 
                              />
                            </div>
                            
                            {/* ÁREA DE INTERAÇÃO (DEPOSITAR / RESGATAR) */}
                            <div className="flex items-center gap-3 pt-5 border-t border-slate-100 dark:border-slate-800">
                              <div className="relative flex-1 max-w-[200px]">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium text-sm">R$</span>
                                <Input 
                                  type="number" 
                                  step="0.01"
                                  placeholder="0,00" 
                                  className="h-10 pl-9 font-medium" 
                                  value={amountInputs[goal.id] || ""} 
                                  onChange={e => setAmountInputs(prev => ({ ...prev, [goal.id]: e.target.value }))} 
                                />
                              </div>
                              
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button disabled={isLoading || !amountInputs[goal.id]} className={cn("h-10 gap-2 font-semibold", isCompleted ? "bg-emerald-600 hover:bg-emerald-700" : "bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-700 dark:text-white")}>
                                    Movimentar
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-48">
                                  <DropdownMenuItem onClick={() => handleGoalTransaction(goal.id, 'deposit')} className="cursor-pointer text-emerald-600 font-medium py-2">
                                    <ArrowDownToLine className="w-4 h-4 mr-2" /> Guardar (Depositar)
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleGoalTransaction(goal.id, 'withdraw')} disabled={goal.current_amount <= 0} className="cursor-pointer text-amber-600 font-medium py-2">
                                    <ArrowUpFromLine className="w-4 h-4 mr-2" /> Resgatar (Retirar)
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                            
                          </CardContent>
                        </Card>
                      );
                    })
                  )}
                </div>
              </div>
            )}

            {/* ABA: LIMITES DE GASTOS (MANTIDA IGUAL AO SEU CÓDIGO) */}
            {activeTab === 'spending' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in">
                {/* ... (Todo o seu código de Limites de Gastos continua idêntico aqui) ... */}
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