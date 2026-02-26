"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ArrowLeft, Repeat, Trash2, Plus, Play, Pause, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { getCategories } from "@/app/actions/categories";
import { getSubscriptions, createSubscription, deleteSubscription, toggleSubscriptionStatus } from "@/app/actions/subscriptions";
import { createTransaction } from "@/app/actions/transactions";

interface Subscription {
  id: string;
  name: string;
  amount: number;
  category: string;
  billing_day: number;
  status: 'active' | 'paused';
}

export default function SubscriptionsPage() {
  const [categories, setCategories] = useState<{id: string, name: string}[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Form states
  const [name, setName] = useState("");
  const [amountStr, setAmountStr] = useState("");
  const [selectedCat, setSelectedCat] = useState("");
  const [billingDay, setBillingDay] = useState("");

  const loadData = useCallback(async () => {
    const [cats, subs] = await Promise.all([
      getCategories(),
      getSubscriptions()
    ]);
    setCategories(cats || []);
    setSubscriptions(subs as Subscription[]);
  }, []);

  useEffect(() => {
    const fetchInit = async () => {
      await loadData();
    };
    fetchInit();
  }, [loadData]);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    const val = parseFloat(amountStr);
    const day = parseInt(billingDay);

    if (!name || !selectedCat || isNaN(val) || isNaN(day) || day < 1 || day > 31) {
      toast.error("Preencha todos os campos corretamente (Dia 1 a 31).");
      return;
    }

    setIsLoading(true);
    const result = await createSubscription({ name, amount: val, category: selectedCat, billing_day: day });
    
    if (result?.error) toast.error(result.error);
    else {
      toast.success("Assinatura adicionada!");
      setName(""); setAmountStr(""); setSelectedCat(""); setBillingDay("");
      await loadData();
    }
    setIsLoading(false);
  }

  async function handleToggle(id: string, status: string) {
    await toggleSubscriptionStatus(id, status);
    toast.success(status === 'active' ? "Assinatura pausada." : "Assinatura ativada.");
    await loadData();
  }

  async function handleDelete(id: string) {
    if (!confirm("Remover esta assinatura definitivamente?")) return;
    await deleteSubscription(id);
    toast.success("Assinatura removida.");
    await loadData();
  }

  // A Mágica: Converte a assinatura em uma transação do mês atual
  async function handlePay(sub: Subscription) {
    const today = new Date();
    // Cria a data usando o dia de vencimento da assinatura no mês/ano atual
    const billingDate = new Date(today.getFullYear(), today.getMonth(), sub.billing_day);
    
    setIsLoading(true);
    const result = await createTransaction({
      description: `[Assinatura] ${sub.name}`,
      amount: sub.amount,
      category: sub.category,
      type: 'expense',
      date: billingDate,
    });

    if (result?.error) toast.error(result.error);
    else toast.success(`Despesa de ${sub.name} registrada no fluxo de caixa!`);
    setIsLoading(false);
  }

  const formatBRL = (val: number) => 
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(val);

  const totalActive = subscriptions
    .filter(s => s.status === 'active')
    .reduce<number>((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        
        <div className="flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Assinaturas e Custos Fixos</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Lado Esquerdo: Resumo e Formulário */}
          <div className="space-y-6 md:col-span-1">
            <Card className="bg-emerald-600 text-white border-none">
              <CardHeader className="pb-2">
                <CardTitle className="text-emerald-100 text-sm font-medium">Custos Fixos Ativos (Mês)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{formatBRL(totalActive)}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Nova Assinatura</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAdd} className="space-y-4">
                  <Input placeholder="Nome (ex: Netflix, Aluguel)" value={name} onChange={(e) => setName(e.target.value)} />
                  <Input type="number" step="0.01" placeholder="Valor (R$)" value={amountStr} onChange={(e) => setAmountStr(e.target.value)} />
                  
                  <Select value={selectedCat} onValueChange={setSelectedCat}>
                    <SelectTrigger><SelectValue placeholder="Categoria" /></SelectTrigger>
                    <SelectContent>
                      {categories.map(c => <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  
                  <Input type="number" min="1" max="31" placeholder="Dia do vencimento (1 a 31)" value={billingDay} onChange={(e) => setBillingDay(e.target.value)} />
                  
                  <Button type="submit" disabled={isLoading} className="w-full bg-slate-800 hover:bg-slate-900 dark:bg-slate-200 dark:text-slate-900">
                    <Plus className="w-4 h-4 mr-2" /> Adicionar
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Lado Direito: Lista de Assinaturas */}
          <div className="md:col-span-2 space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Repeat className="w-5 h-5 text-slate-500" /> Suas Assinaturas
            </h3>

            {subscriptions.length === 0 ? (
              <div className="p-8 text-center border border-dashed rounded-xl text-slate-500 bg-white dark:bg-slate-900">
                Você ainda não adicionou nenhum custo fixo.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {subscriptions.map((sub) => (
                  <Card key={sub.id} className={`overflow-hidden transition-opacity ${sub.status === 'paused' ? 'opacity-60 grayscale' : ''}`}>
                    <CardHeader className="p-4 pb-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-base">{sub.name}</CardTitle>
                          <CardDescription className="text-xs mt-1">{sub.category}</CardDescription>
                        </div>
                        <Badge variant={sub.status === 'active' ? 'default' : 'secondary'} className={sub.status === 'active' ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-100' : ''}>
                          {sub.status === 'active' ? 'Ativo' : 'Pausado'}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <div className="flex justify-between items-end mt-2">
                        <div className="text-xl font-bold">{formatBRL(sub.amount)}</div>
                        <div className="text-xs text-slate-500 font-medium bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                          Vence dia {sub.billing_day}
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="p-2 bg-slate-50 dark:bg-slate-900/50 border-t flex justify-between">
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => handleToggle(sub.id, sub.status)} className="h-8 w-8 text-slate-500">
                          {sub.status === 'active' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(sub.id)} className="h-8 w-8 text-red-400 hover:text-red-600">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      
                      {/* Botão para lançar a despesa */}
                      {sub.status === 'active' && (
                        <Button size="sm" variant="outline" onClick={() => handlePay(sub)} disabled={isLoading} className="h-8 text-xs gap-1 border-emerald-200 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-900 dark:text-emerald-400 dark:hover:bg-emerald-950/30">
                          <CheckCircle2 className="w-3 h-3" /> Lançar Pagamento
                        </Button>
                      )}
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}