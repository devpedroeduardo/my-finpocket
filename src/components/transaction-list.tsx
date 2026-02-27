"use client";

import { useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Trash2, CheckCircle2, Landmark, TrendingDown, TrendingUp, Clock } from "lucide-react";
import { deleteTransaction, toggleTransactionStatus } from "@/app/actions/transactions";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: "income" | "expense";
  category: string;
  created_at: string;
  wallets?: { name: string } | null;
  status?: "paid" | "pending";
}

interface TransactionListProps {
  data: Transaction[];
}

export function TransactionList({ data }: TransactionListProps) {
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isToggling, setIsToggling] = useState<string | null>(null);

  async function handleDelete(id: string) {
    if (!confirm("Tem certeza que deseja excluir este lançamento?")) return;
    
    setIsDeleting(id);
    const result = await deleteTransaction(id);
    
    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success("Excluído com sucesso.");
    }
    setIsDeleting(null);
  }

  async function handleToggleStatus(id: string, currentStatus: string) {
    setIsToggling(id);
    
    const statusToSend = currentStatus || 'paid';
    const result = await toggleTransactionStatus(id, statusToSend);
    
    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success(statusToSend === 'pending' ? "Marcado como pago! ✅" : "Marcado como pendente. ⏳");
    }
    setIsToggling(null);
  }

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center border border-dashed rounded-2xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
        <div className="w-12 h-12 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center mb-3">
          <Clock className="w-6 h-6 text-slate-400" />
        </div>
        <p className="text-slate-500 dark:text-slate-400 font-medium">Nenhum lançamento encontrado.</p>
        <p className="text-sm text-slate-400 mt-1">Suas movimentações aparecerão aqui.</p>
      </div>
    );
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
  };

  return (
    <div className="space-y-3">
      {data.map((transaction) => {
        const isExpense = transaction.type === "expense";
        const isPending = transaction.status === "pending";

        return (
          <div 
            key={transaction.id} 
            className={cn(
              "group flex items-center justify-between p-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl hover:shadow-md transition-all duration-300",
              isPending && "opacity-85 hover:opacity-100" // Mantém o card levemente opaco se estiver pendente
            )}
          >
            <div className="flex items-center gap-4">
              {/* ÍCONE PREMIUM COM CORES SUAVES E SEM SEREM GRITANTES 👇 */}
              <div className={cn(
                "w-12 h-12 rounded-2xl flex items-center justify-center transition-colors",
                isPending 
                  ? "bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-500" 
                  : isExpense 
                    ? "bg-rose-100 dark:bg-rose-500/20 text-rose-600 dark:text-rose-500" // Despesa Paga = Vermelho Suave
                    : "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-500" // Receita Paga = Verde Suave
              )}>
                {isPending ? (
                  <Clock className="w-5 h-5" />
                ) : isExpense ? (
                  <TrendingDown className="w-5 h-5" />
                ) : (
                  <TrendingUp className="w-5 h-5" />
                )}
              </div>
              
              <div>
                <h4 className={cn(
                  "font-semibold text-sm sm:text-base flex items-center gap-2 transition-colors",
                  isPending ? "text-slate-500 dark:text-slate-400" : "text-slate-800 dark:text-slate-100"
                )}>
                  {transaction.description}
                  
                  {/* Etiqueta de Transferência super sutil */}
                  {transaction.category === "Transferência" && (
                    <span className="text-[10px] bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 px-2 py-0.5 rounded-md font-medium">
                      Transf
                    </span>
                  )}
                  
                  {/* Etiqueta de Pendente modernizada com pontinho pulsante (mantida) 👇 */}
                  {isPending && (
                    <span className="text-[10px] border border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/50 dark:bg-amber-900/20 dark:text-amber-400 px-2 py-0.5 rounded-md font-medium flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                      Pendente
                    </span>
                  )}
                </h4>
                
                <div className="flex items-center gap-2 mt-1.5 text-xs text-slate-500 dark:text-slate-400 font-medium">
                  <span>{format(new Date(transaction.created_at), "dd 'de' MMM", { locale: ptBR })}</span>
                  <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700" />
                  <span>{transaction.category}</span>
                  {transaction.wallets && (
                    <>
                      <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700" />
                      <span className="flex items-center gap-1 text-slate-600 dark:text-slate-300">
                        <Landmark className="w-3.5 h-3.5" />
                        {transaction.wallets.name}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 sm:gap-6">
              {/* VALOR DA TRANSAÇÃO COM CORES INFORMATIVAS 👇 */}
              <span className={cn(
                "font-bold text-sm sm:text-base whitespace-nowrap tracking-tight prefix-standard", // Use standard text for the prefix block
                isPending
                  ? "text-amber-600 dark:text-amber-500" // Pendente = Amarelo/Ouro
                  : isExpense
                    ? "text-rose-600 dark:text-rose-500" // Despesa Paga = Vermelho
                    : "text-emerald-600 dark:text-emerald-500" // Receita Paga = Verde
              )}>
                {isExpense ? "- " : "+ "}{formatCurrency(transaction.amount)}
              </span>

              {/* BOTÕES DE AÇÃO SEMPRE VISÍVEIS 👇 */}
              <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity duration-200">
                {/* BOTÃO DE DAR BAIXA / ESTORNAR 👇 */}
                <Button 
                  variant="ghost" 
                  size="icon"
                  disabled={isToggling === transaction.id}
                  onClick={() => handleToggleStatus(transaction.id, transaction.status || 'paid')}
                  className={cn(
                    "w-8 h-8 rounded-full transition-all",
                    isPending 
                      ? "bg-emerald-50 hover:bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:hover:bg-emerald-500/20 dark:text-emerald-400" 
                      : "bg-slate-50 hover:bg-slate-100 text-slate-400 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-500"
                  )}
                  title={isPending ? "Confirmar Pagamento" : "Desmarcar Pagamento"}
                >
                  {isPending ? (
                    <Clock className={cn("w-4 h-4", isToggling === transaction.id && "animate-spin")} />
                  ) : (
                    <CheckCircle2 className={cn("w-4 h-4 text-emerald-500 dark:text-emerald-400", isToggling === transaction.id && "animate-pulse")} />
                  )}
                </Button>

                {/* BOTÃO DE EXCLUIR 👇 */}
                <Button 
                  variant="ghost" 
                  size="icon" 
                  disabled={isDeleting === transaction.id}
                  onClick={() => handleDelete(transaction.id)} 
                  className="w-8 h-8 rounded-full transition-all bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-rose-600 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-500 dark:hover:text-rose-500"
                  title="Excluir"
                >
                  <Trash2 className={cn("w-4 h-4", isDeleting === transaction.id && "animate-pulse")} />
                </Button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}