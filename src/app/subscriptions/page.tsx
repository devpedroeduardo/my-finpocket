"use client";

import { useState, useEffect, useCallback } from "react";
import { Sidebar } from "@/components/sidebar";
import { Topbar } from "@/components/topbar";
import { Repeat, Plus, Trash2, CalendarDays, Landmark, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

import { getSubscriptions, createSubscription, deleteSubscription } from "@/app/actions/subscriptions";
import { getCategories } from "@/app/actions/categories";
import { getWallets } from "@/app/actions/wallets";

interface Subscription {
  id: string;
  name: string;
  amount: number;
  category: string;
  due_day: number;
  wallets?: { name: string } | null;
}

export default function SubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [categories, setCategories] = useState<{id: string, name: string}[]>([]);
  const [wallets, setWallets] = useState<{id: string, name: string}[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Estados do formulário
  const [name, setName] = useState("");
  const [amountStr, setAmountStr] = useState("");
  const [category, setCategory] = useState("");
  const [walletId, setWalletId] = useState("none");
  const [dueDayStr, setDueDayStr] = useState("");

  const loadData = useCallback(async () => {
    const [subsData, catsData, walletsData] = await Promise.all([
      getSubscriptions(),
      getCategories(),
      getWallets()
    ]);
    setSubscriptions(subsData || []);
    setCategories(catsData || []);
    setWallets(walletsData || []);
  }, []);

  // CORREÇÃO DO ESLINT: Encapsulamos a chamada em uma função async interna
  useEffect(() => {
    const init = async () => {
      await loadData();
    };
    init();
  }, [loadData]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    const amount = parseFloat(amountStr);
    const dueDay = parseInt(dueDayStr);

    if (!name || isNaN(amount) || amount <= 0 || !category || isNaN(dueDay) || dueDay < 1 || dueDay > 31) {
      return toast.error("Preencha todos os campos corretamente. O dia deve ser entre 1 e 31.");
    }

    setIsLoading(true);
    const result = await createSubscription({
      name, amount, category, due_day: dueDay, wallet_id: walletId
    });

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Assinatura criada! Ela será cobrada automaticamente.");
      setName(""); setAmountStr(""); setCategory(""); setWalletId("none"); setDueDayStr("");
      await loadData();
    }
    setIsLoading(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("Tem certeza que deseja cancelar esta assinatura?")) return;
    const result = await deleteSubscription(id);
    if (!result.error) {
      toast.success("Assinatura removida.");
      await loadData();
    } else {
      toast.error(result.error);
    }
  }

  const formatCurrency = (val: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(val);

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar />
        <main className="p-6 md:p-8 flex-1 overflow-y-auto">
          <div className="max-w-5xl mx-auto space-y-6">
            
            <div>
              <h1 className="text-3xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
                <Repeat className="w-8 h-8 text-indigo-600" /> Assinaturas Fixas
              </h1>
              <p className="text-slate-500 mt-2">
                Cadastre seus gastos recorrentes (Netflix, Aluguel, etc). O sistema lançará a despesa automaticamente como `Pendente` no dia do vencimento.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in">
              
              {/* FORMULÁRIO */}
              <div className="md:col-span-1">
                <Card className="sticky top-6 border-indigo-100 dark:border-indigo-900/30">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2 text-indigo-700 dark:text-indigo-400">
                      <Plus className="w-5 h-5" /> Nova Assinatura
                    </CardTitle>
                    <CardDescription>Configure o pagamento automático.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleCreate} className="space-y-4">
                      <div>
                        <label className="text-xs font-medium text-slate-500 mb-1 block">Nome do Serviço</label>
                        <Input placeholder="Ex: Spotify Premium" value={name} onChange={e => setName(e.target.value)} />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs font-medium text-slate-500 mb-1 block">Valor (R$)</label>
                          <Input type="number" step="0.01" placeholder="29,90" value={amountStr} onChange={e => setAmountStr(e.target.value)} />
                        </div>
                        <div>
                          <label className="text-xs font-medium text-slate-500 mb-1 block">Dia do Venc.</label>
                          <Input type="number" min="1" max="31" placeholder="Ex: 15" value={dueDayStr} onChange={e => setDueDayStr(e.target.value)} />
                        </div>
                      </div>

                      <div>
                        <label className="text-xs font-medium text-slate-500 mb-1 block">Categoria</label>
                        <Select value={category} onValueChange={setCategory}>
                          <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                          <SelectContent>
                            {categories.map(c => <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <label className="text-xs font-medium text-slate-500 mb-1 block">Conta de Saída</label>
                        <Select value={walletId} onValueChange={setWalletId}>
                          <SelectTrigger><SelectValue placeholder="Opcional" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">Nenhuma específica</SelectItem>
                            {wallets.map(w => <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>

                      <Button type="submit" disabled={isLoading} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white mt-2">
                        {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                        Salvar Assinatura
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </div>

              {/* LISTA DE ASSINATURAS */}
              <div className="md:col-span-2 space-y-4">
                {subscriptions.length === 0 ? (
                  <div className="p-12 text-center border border-dashed rounded-xl text-slate-500 bg-white dark:bg-slate-900">
                    <Repeat className="w-12 h-12 mx-auto mb-3 opacity-20 text-indigo-500" />
                    Nenhuma assinatura cadastrada ainda.
                  </div>
                ) : (
                  subscriptions.map(sub => (
                    <Card key={sub.id} className="overflow-hidden hover:border-indigo-200 transition-colors">
                      <CardContent className="p-5 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                            <Repeat className="w-6 h-6" />
                          </div>
                          <div>
                            <h3 className="font-bold text-slate-800 dark:text-slate-200">{sub.name}</h3>
                            <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                              <span className="flex items-center gap-1"><CalendarDays className="w-3.5 h-3.5" /> Dia {sub.due_day}</span>
                              <span className="flex items-center gap-1">• {sub.category}</span>
                              {sub.wallets && <span className="flex items-center gap-1"><Landmark className="w-3.5 h-3.5" /> {sub.wallets.name}</span>}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4">
                          <span className="font-bold text-lg text-rose-600">{formatCurrency(sub.amount)}</span>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(sub.id)} className="text-slate-400 hover:text-red-500 hover:bg-red-50">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>

            </div>
          </div>
        </main>
      </div>
    </div>
  );
}