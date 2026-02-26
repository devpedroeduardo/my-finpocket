"use client";

import { useState, useEffect, useCallback } from "react";
import { Landmark, Trash2, Plus, CreditCard, Building2, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import { createWallet, deleteWallet, getWalletsWithBalances } from "@/app/actions/wallets";
import { Sidebar } from "@/components/sidebar";
import { Topbar } from "@/components/topbar";

interface WalletData {
  id: string;
  name: string;
  balance: number;
}

// Inteligência visual para as marcas dos bancos!
function getBankStyle(name: string) {
  const n = name.toLowerCase();
  if (n.includes('nubank')) return { bg: 'bg-purple-600', text: 'text-purple-600', light: 'bg-purple-100 dark:bg-purple-900/30', icon: CreditCard };
  if (n.includes('itaú') || n.includes('itau')) return { bg: 'bg-orange-500', text: 'text-orange-500', light: 'bg-orange-100 dark:bg-orange-900/30', icon: Building2 };
  if (n.includes('inter')) return { bg: 'bg-orange-400', text: 'text-orange-400', light: 'bg-orange-100 dark:bg-orange-900/30', icon: Building2 };
  if (n.includes('bradesco')) return { bg: 'bg-red-600', text: 'text-red-600', light: 'bg-red-100 dark:bg-red-900/30', icon: Building2 };
  if (n.includes('santander')) return { bg: 'bg-red-500', text: 'text-red-500', light: 'bg-red-100 dark:bg-red-900/30', icon: Building2 };
  if (n.includes('caixa')) return { bg: 'bg-blue-600', text: 'text-blue-600', light: 'bg-blue-100 dark:bg-blue-900/30', icon: Building2 };
  if (n.includes('brasil') || n.includes('bb')) return { bg: 'bg-yellow-500', text: 'text-yellow-600', light: 'bg-yellow-100 dark:bg-yellow-900/30', icon: Building2 };
  if (n.includes('c6')) return { bg: 'bg-slate-800', text: 'text-slate-800 dark:text-slate-200', light: 'bg-slate-200 dark:bg-slate-800', icon: CreditCard };
  if (n.includes('dinheiro') || n.includes('carteira')) return { bg: 'bg-emerald-500', text: 'text-emerald-600', light: 'bg-emerald-100 dark:bg-emerald-900/30', icon: Wallet };
  
  // Padrão genérico
  return { bg: 'bg-slate-600', text: 'text-slate-600 dark:text-slate-400', light: 'bg-slate-100 dark:bg-slate-800', icon: Landmark };
}

export default function WalletsPage() {
  const [wallets, setWallets] = useState<WalletData[]>([]);
  const [newWalletName, setNewWalletName] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const loadData = useCallback(async () => {
    // Agora buscamos a conta JÁ COM O SALDO calculado
    const data = await getWalletsWithBalances();
    setWallets(data || []);
  }, []);

  useEffect(() => {
    const fetchInit = async () => {
      await loadData();
    };
    fetchInit();
  }, [loadData]);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!newWalletName.trim()) return;

    setIsLoading(true);
    const result = await createWallet(newWalletName);
    
    if (result?.error) toast.error(result.error);
    else {
      toast.success("Conta criada com sucesso!");
      setNewWalletName("");
      await loadData();
    }
    setIsLoading(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("Tem certeza que deseja remover esta conta/carteira?")) return;
    
    const result = await deleteWallet(id);
    if (result?.error) toast.error(result.error);
    else {
      toast.success("Conta removida.");
      await loadData();
    }
  }

  const formatCurrency = (value: number) => 
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Topbar />

        <main className="p-6 md:p-8 flex-1 overflow-y-auto">
          <div className="max-w-5xl mx-auto space-y-8">
            
            <div>
              <h1 className="text-3xl font-bold text-slate-800 dark:text-white">
                Contas e Carteiras
              </h1>
              <p className="text-slate-500 mt-2">
                Gerencie os saldos individuais de suas contas bancárias e carteiras físicas.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Formulário de Criação */}
              <div className="md:col-span-1">
                <Card className="sticky top-6">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Plus className="w-5 h-5 text-emerald-600" />
                      Nova Conta
                    </CardTitle>
                    <CardDescription>Adicione uma nova origem de fundos.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleAdd} className="space-y-4">
                      <Input 
                        placeholder="Ex: Nubank, Itaú, Dinheiro..." 
                        value={newWalletName}
                        onChange={(e) => setNewWalletName(e.target.value)}
                      />
                      <Button type="submit" disabled={isLoading || !newWalletName.trim()} className="w-full bg-slate-800 hover:bg-slate-900 dark:bg-slate-200 dark:text-slate-900">
                        {isLoading ? "Salvando..." : "Adicionar Conta"}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </div>

              {/* Lista de Contas com Saldos */}
              <div className="md:col-span-2 space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Landmark className="w-5 h-5 text-slate-500" /> Seus Saldos Atuais
                </h3>

                {wallets.length === 0 ? (
                  <div className="p-8 text-center border border-dashed rounded-xl text-slate-500 bg-white dark:bg-slate-900">
                    Nenhuma conta cadastrada. Adicione a sua primeira conta ao lado!
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {wallets.map((wallet) => {
                      const style = getBankStyle(wallet.name);
                      const Icon = style.icon;
                      
                      return (
                        <Card key={wallet.id} className="overflow-hidden border-none shadow-sm relative group">
                          {/* Faixa de Cor Superior */}
                          <div className={`h-2 w-full ${style.bg}`} />
                          
                          <CardContent className="p-5">
                            <div className="flex justify-between items-start mb-4">
                              <div className={`p-3 rounded-xl ${style.light} ${style.text}`}>
                                <Icon className="w-6 h-6" />
                              </div>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => handleDelete(wallet.id)} 
                                className="text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 -mt-2 -mr-2"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                            
                            <div>
                              <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">
                                {wallet.name}
                              </h4>
                              <p className={`text-2xl font-bold ${wallet.balance >= 0 ? 'text-slate-800 dark:text-slate-100' : 'text-rose-600'}`}>
                                {formatCurrency(wallet.balance)}
                              </p>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </div>

            </div>
          </div>
        </main>
      </div>
    </div>
  );
}