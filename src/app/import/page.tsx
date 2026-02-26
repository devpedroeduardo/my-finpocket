"use client";

import { useState, useEffect } from "react";
import { Sidebar } from "@/components/sidebar";
import { Topbar } from "@/components/topbar";
import { UploadCloud, FileText, CheckCircle2, ArrowRight, Loader2, Landmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { getWallets } from "@/app/actions/wallets";
import { bulkCreateTransactions } from "@/app/actions/transactions";

interface ParsedTransaction {
  id: string;
  date: Date;
  description: string;
  amount: number;
  type: "income" | "expense";
  category: string;
}

export default function ImportPage() {
  const [wallets, setWallets] = useState<{id: string, name: string}[]>([]);
  const [selectedWallet, setSelectedWallet] = useState<string>("none");
  const [transactions, setTransactions] = useState<ParsedTransaction[]>([]);
  const [isImporting, setIsImporting] = useState(false);

  useEffect(() => {
    getWallets().then(data => setWallets(data || []));
  }, []);

  // MOTOR DE LEITURA DO ARQUIVO OFX
  const parseOFX = (ofxString: string) => {
    const parsed: ParsedTransaction[] = [];
    const blocks = ofxString.split(/<STMTTRN>/i); // Quebra o arquivo a cada transação
    
    for (let i = 1; i < blocks.length; i++) {
      const block = blocks[i];
      
      // Extrai os dados usando Expressões Regulares (Regex)
      const dateMatch = block.match(/<DTPOSTED>(.*?)(?:\r|\n|<)/i);
      const amountMatch = block.match(/<TRNAMT>(.*?)(?:\r|\n|<)/i);
      const memoMatch = block.match(/<MEMO>(.*?)(?:\r|\n|<)/i);

      if (dateMatch && amountMatch && memoMatch) {
        const rawAmount = parseFloat(amountMatch[1]);
        const type = rawAmount >= 0 ? "income" : "expense";
        
        // Data OFX vem no formato YYYYMMDDHHMMSS. Extraímos só o ano, mês e dia.
        const dateStr = dateMatch[1].substring(0, 8);
        const date = new Date(`${dateStr.substring(0,4)}-${dateStr.substring(4,6)}-${dateStr.substring(6,8)}T12:00:00Z`);

        parsed.push({
          id: Math.random().toString(36).substring(7),
          date,
          description: memoMatch[1].trim(),
          amount: Math.abs(rawAmount),
          type,
          category: "Outros", // Categoria padrão (pode ser categorizado via IA no futuro)
        });
      }
    }
    setTransactions(parsed);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.ofx')) {
      toast.error("Por favor, envie um arquivo .OFX válido.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      parseOFX(text);
      toast.success("Arquivo lido com sucesso!");
    };
    reader.readAsText(file);
  };

  const handleSaveAll = async () => {
    if (selectedWallet === "none") {
      toast.error("Selecione uma conta de destino primeiro.");
      return;
    }

    setIsImporting(true);
    const result = await bulkCreateTransactions(transactions, selectedWallet);
    
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success(`${transactions.length} transações salvas com sucesso!`);
      setTransactions([]); // Limpa a tela
    }
    setIsImporting(false);
  };

  const formatCurrency = (val: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(val);

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar />
        
        <main className="p-6 md:p-8 flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto space-y-6">
            
            <div>
              <h1 className="text-3xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
                <FileText className="w-8 h-8 text-blue-600" /> Importar Extrato (OFX)
              </h1>
              <p className="text-slate-500 mt-2">
                Baixe o arquivo .OFX no app do seu banco e importe dezenas de transações em segundos.
              </p>
            </div>

            {/* PASSO 1: SELECIONAR CONTA E ARQUIVO */}
            {transactions.length === 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8 animate-in fade-in">
                
                <Card className="border-2 border-dashed border-slate-200 dark:border-slate-800 bg-transparent shadow-none hover:bg-slate-100/50 transition-colors">
                  <CardContent className="flex flex-col items-center justify-center p-12 text-center h-full relative">
                    <input 
                      type="file" 
                      accept=".ofx" 
                      onChange={handleFileUpload}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <UploadCloud className="w-12 h-12 text-slate-400 mb-4" />
                    <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200">Clique ou arraste seu arquivo .OFX</h3>
                    <p className="text-sm text-slate-500 mt-2">Formatos suportados: Nubank, Inter, Itaú, Santander, etc.</p>
                  </CardContent>
                </Card>

                <div className="space-y-6 flex flex-col justify-center">
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-xl border border-blue-100 dark:border-blue-900">
                    <h4 className="font-semibold text-blue-800 dark:text-blue-300 flex items-center gap-2 mb-2">
                      <CheckCircle2 className="w-5 h-5" /> Como conseguir o arquivo?
                    </h4>
                    <ul className="text-sm text-blue-700 dark:text-blue-400 space-y-2 list-disc pl-5">
                      <li>Acesse o app ou internet banking do seu banco.</li>
                      <li>Vá na área de `Extrato`.</li>
                      <li>Procure a opção `Exportar`ou `Baixar`.</li>
                      <li>Selecione o formato <strong>OFX</strong> e o mês desejado.</li>
                    </ul>
                  </div>
                </div>

              </div>
            )}

            {/* PASSO 2: REVISAR AS TRANSAÇÕES E SALVAR */}
            {transactions.length > 0 && (
              <div className="space-y-6 animate-in slide-in-from-bottom-4">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-6 border-b">
                      <div>
                        <h2 className="text-xl font-bold text-slate-800 dark:text-white">Revisão de Dados</h2>
                        <p className="text-slate-500 text-sm">Encontramos {transactions.length} movimentações no seu extrato.</p>
                      </div>

                      <div className="flex items-center gap-3 w-full sm:w-auto">
                        <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-md border">
                          <Landmark className="w-4 h-4 text-emerald-600" />
                          <Select value={selectedWallet} onValueChange={setSelectedWallet}>
                            <SelectTrigger className="border-0 shadow-none bg-transparent h-8 focus:ring-0">
                              <SelectValue placeholder="Destino do dinheiro" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none" disabled>Selecione a conta</SelectItem>
                              {wallets.map(w => <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </div>

                        <Button onClick={handleSaveAll} disabled={isImporting || selectedWallet === "none"} className="bg-emerald-600 hover:bg-emerald-700 text-white min-w-[140px]">
                          {isImporting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
                          Salvar Tudo
                        </Button>
                      </div>
                    </div>

                    <div className="max-h-[500px] overflow-y-auto pr-2 space-y-2">
                      {transactions.map((tx) => (
                        <div key={tx.id} className="flex justify-between items-center p-3 hover:bg-slate-50 dark:hover:bg-slate-900 rounded-lg border border-transparent hover:border-slate-100 dark:hover:border-slate-800 transition-colors">
                          <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center bg-opacity-20 ${tx.type === 'income' ? 'bg-emerald-500 text-emerald-600' : 'bg-rose-500 text-rose-600'}`}>
                              <ArrowRight className={`w-5 h-5 ${tx.type === 'expense' ? 'rotate-45' : '-rotate-45'}`} />
                            </div>
                            <div>
                              <p className="font-semibold text-slate-800 dark:text-slate-200 text-sm">{tx.description}</p>
                              <p className="text-xs text-slate-500">{tx.date.toLocaleDateString('pt-BR')} • {tx.category}</p>
                            </div>
                          </div>
                          <span className={`font-bold ${tx.type === 'income' ? 'text-emerald-600' : 'text-slate-800 dark:text-slate-200'}`}>
                            {tx.type === 'expense' ? '-' : '+'}{formatCurrency(tx.amount)}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="mt-6 flex justify-end">
                       <Button variant="ghost" onClick={() => setTransactions([])} className="text-slate-500">
                          Cancelar Importação
                       </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

          </div>
        </main>
      </div>
    </div>
  );
}