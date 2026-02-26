"use client";

import { useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ArrowRight, Trash2, CheckCircle2, Landmark } from "lucide-react";
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
  status?: "paid" | "pending"; // <--- Novo campo de status
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

  // --- NOVA FUNÇÃO: DAR BAIXA ---
  async function handleToggleStatus(id: string, currentStatus: string) {
    setIsToggling(id);
    
    // Se não tiver status no banco (transações antigas), assumimos que é 'paid'
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
      <div className="flex flex-col items-center justify-center p-8 text-center border border-dashed rounded-xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
        <p className="text-slate-500 dark:text-slate-400">Nenhum lançamento encontrado com estes filtros.</p>
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
              "flex items-center justify-between p-4 bg-white dark:bg-slate-900 border rounded-xl shadow-sm transition-all",
              // Se for pendente, deixa o card com um fundo amarelado bem suave
              isPending 
                ? "border-amber-200 dark:border-amber-900/50 bg-amber-50/30 dark:bg-amber-900/10" 
                : "border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700"
            )}
          >
            <div className="flex items-center gap-4">
              {/* Ícone Redondo */}
              <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center bg-opacity-20",
                isPending ? "bg-amber-500 text-amber-600 dark:text-amber-500" : (isExpense ? "bg-rose-500 text-rose-600 dark:text-rose-500" : "bg-emerald-500 text-emerald-600 dark:text-emerald-500")
              )}>
                <ArrowRight className={cn("w-5 h-5", isExpense ? "rotate-45" : "-rotate-45")} />
              </div>
              
              <div>
                <h4 className={cn(
                  "font-semibold text-sm sm:text-base flex items-center gap-2",
                  isPending ? "text-slate-500 dark:text-slate-400" : "text-slate-800 dark:text-slate-200"
                )}>
                  {transaction.description}
                  
                  {/* Etiqueta de Transferência */}
                  {transaction.category === "Transferência" && (
                    <span className="text-[10px] bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 px-2 py-0.5 rounded-full uppercase font-bold tracking-wider">
                      Transf
                    </span>
                  )}
                  
                  {/* Etiqueta de Pendente */}
                  {isPending && (
                    <span className="text-[10px] bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300 px-2 py-0.5 rounded-full uppercase font-bold tracking-wider">
                      Pendente
                    </span>
                  )}
                </h4>
                
                <div className="flex items-center gap-2 mt-1 text-xs text-slate-500 dark:text-slate-400">
                  <span>{format(new Date(transaction.created_at), "dd 'de' MMM", { locale: ptBR })}</span>
                  <span>•</span>
                  <span>{transaction.category}</span>
                  {transaction.wallets && (
                    <>
                      <span>•</span>
                      <span className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-[10px] font-medium">
                        <Landmark className="w-3 h-3" />
                        {transaction.wallets.name}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 sm:gap-6">
              {/* Valor da Transação */}
              <span className={cn(
                "font-bold text-sm sm:text-base whitespace-nowrap",
                isPending ? "text-slate-400 dark:text-slate-500" : (isExpense ? "text-rose-600 dark:text-rose-500" : "text-emerald-600 dark:text-emerald-500")
              )}>
                {isExpense ? "-" : "+"}{formatCurrency(transaction.amount)}
              </span>

              <div className="flex items-center gap-1">
                {/* BOTÃO DE CHECK / DAR BAIXA */}
                <Button 
                  variant="ghost" 
                  size="icon"
                  disabled={isToggling === transaction.id}
                  onClick={() => handleToggleStatus(transaction.id, transaction.status || 'paid')}
                  className={cn(
                    "transition-colors",
                    isPending 
                      ? "text-amber-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/30" 
                      : "text-emerald-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/30"
                  )}
                  title={isPending ? "Marcar como Pago" : "Desmarcar Pagamento"}
                >
                  <CheckCircle2 className={cn("w-5 h-5", isToggling === transaction.id && "animate-pulse")} />
                </Button>

                {/* BOTÃO DE EXCLUIR */}
                <Button 
                  variant="ghost" 
                  size="icon" 
                  disabled={isDeleting === transaction.id}
                  onClick={() => handleDelete(transaction.id)} 
                  className="text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
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