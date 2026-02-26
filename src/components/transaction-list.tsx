import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ArrowDownCircle, ArrowUpCircle, Landmark, Paperclip } from "lucide-react";
import { Badge } from "@/components/ui/badge";

// Corrigida a tipagem de 'receipt_url' e adicionada a carteira
export interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: "income" | "expense";
  category: string;
  created_at: string;
  wallets?: { name: string }; 
  receipt_url?: string; 
}

export function TransactionList({ data }: { data: Transaction[] }) {
  if (!data || data.length === 0) {
    return (
      <div className="p-8 text-center border border-dashed rounded-xl text-slate-500 bg-white dark:bg-slate-900">
        Nenhuma transação encontrada neste período.
      </div>
    );
  }

  const formatCurrency = (value: number) => 
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

  return (
    <div className="space-y-3">
      {data.map((transaction) => (
        <div key={transaction.id} className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 rounded-xl border shadow-sm">
          <div className="flex items-center gap-4">
            
            <div className={`p-2 rounded-full ${transaction.type === 'income' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30' : 'bg-rose-100 text-rose-600 dark:bg-rose-900/30'}`}>
              {transaction.type === 'income' ? <ArrowUpCircle className="w-5 h-5" /> : <ArrowDownCircle className="w-5 h-5" />}
            </div>
            
            <div>
              {/* Contêiner flexível para alinhar Nome, Tag do Banco e Botão de Anexo */}
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-semibold text-slate-800 dark:text-slate-200">{transaction.description}</p>
                
                {/* Tag do Banco */}
                {transaction.wallets?.name && (
                  <Badge variant="secondary" className="text-[10px] h-5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 gap-1 px-1.5 border border-slate-200 dark:border-slate-700">
                    <Landmark className="w-3 h-3" />
                    {transaction.wallets.name}
                  </Badge>
                )}

                {/* Botão de Ver Comprovante */}
                {transaction.receipt_url && (
                  <a 
                    href={transaction.receipt_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-[10px] font-medium text-blue-500 hover:text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-2 py-0.5 rounded-md transition-colors border border-blue-100 dark:border-blue-900/50"
                    title="Ver Comprovante Anexado"
                  >
                    <Paperclip className="w-3 h-3" /> Anexo
                  </a>
                )}
              </div>
              
              <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                <span>{format(new Date(transaction.created_at), "dd 'de' MMM", { locale: ptBR })}</span>
                <span>•</span>
                <span>{transaction.category}</span>
              </div>
            </div>

          </div>
          <div className={`font-bold whitespace-nowrap ${transaction.type === 'income' ? 'text-emerald-600' : 'text-rose-600'}`}>
            {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
          </div>
        </div>
      ))}
    </div>
  );
}