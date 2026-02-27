"use client";

import { useState } from "react";
import { Sparkles, Loader2, Bot, X, Copy, Check, PiggyBank, TrendingDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { generateFinancialAdvice } from "@/app/actions/ai-assistant";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function AIAdvisor() {
  const [advice, setAdvice] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [activeFocus, setActiveFocus] = useState<'general' | 'savings' | 'villain'>('general');

  async function handleGenerateAdvice(focus: 'general' | 'savings' | 'villain' = 'general') {
    setIsLoading(true);
    setActiveFocus(focus);
    
    const result = await generateFinancialAdvice(undefined, focus);
    
    if (result.error) {
      toast.error(result.error);
    } else {
      setAdvice(result.text || "");
      setIsCopied(false);
    }
    setIsLoading(false);
  }

  function handleClear() {
    setAdvice("");
    setActiveFocus('general');
  }

  function handleCopy() {
    if (!advice) return;
    navigator.clipboard.writeText(advice);
    setIsCopied(true);
    toast.success("Análise copiada para a área de transferência!");
    setTimeout(() => setIsCopied(false), 2000);
  }

  return (
    <Card className={cn(
      "overflow-hidden border transition-all duration-500",
      advice 
        ? "border-indigo-200 dark:border-indigo-800 shadow-md bg-white dark:bg-slate-900" 
        : "border-indigo-100 dark:border-indigo-900/50 bg-gradient-to-br from-indigo-50/50 to-purple-50/50 dark:from-indigo-950/20 dark:to-purple-950/20 shadow-sm"
    )}>
      <CardContent className="p-5 sm:p-6">
        
        {/* CABEÇALHO DA IA */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center transition-colors",
              advice ? "bg-indigo-600 text-white" : "bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400"
            )}>
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                MyFinPocket AI
                <span className="text-[10px] bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-2 py-0.5 rounded-full uppercase font-bold tracking-wider">
                  Beta
                </span>
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {advice ? "Análise concluída." : "Análise inteligente do seu mês."}
              </p>
            </div>
          </div>

          {!advice && (
            <Button 
              onClick={() => handleGenerateAdvice('general')} 
              disabled={isLoading}
              className="w-full sm:w-auto bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white border-0 shadow-md transition-all hover:scale-[1.02]"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Sparkles className="w-4 h-4 mr-2" />}
              Gerar Análise do Mês
            </Button>
          )}
        </div>

        {/* ÁREA DA RESPOSTA E INTERAÇÕES (SÓ APARECE DEPOIS DE GERAR) */}
        {advice && (
          <div className="mt-5 pt-5 border-t border-slate-100 dark:border-slate-800 animate-in fade-in slide-in-from-top-4 duration-500">
            
            {/* TEXTO DA IA */}
            <div className={cn(
              "relative bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 md:p-5 text-slate-700 dark:text-slate-300 text-sm sm:text-base leading-relaxed whitespace-pre-wrap transition-opacity",
              isLoading && "opacity-50"
            )}>
              {isLoading ? (
                <div className="flex items-center justify-center py-6">
                  <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
                </div>
              ) : (
                advice
              )}
            </div>

            {/* BARRA DE FERRAMENTAS INFERIOR */}
            <div className="mt-4 flex flex-col lg:flex-row items-center justify-between gap-4">
              
              {/* BOTÕES DE "PRÓXIMA PERGUNTA" */}
              <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mr-1 w-full sm:w-auto">Aprofundar:</span>
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  disabled={isLoading || activeFocus === 'savings'}
                  onClick={() => handleGenerateAdvice('savings')}
                  className={cn("text-xs h-8 rounded-full border-emerald-200 dark:border-emerald-900/50 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:text-emerald-600", activeFocus === 'savings' && "bg-emerald-50 text-emerald-600")}
                >
                  <PiggyBank className="w-3.5 h-3.5 mr-1.5" /> Dicas de Economia
                </Button>

                <Button 
                  variant="outline" 
                  size="sm" 
                  disabled={isLoading || activeFocus === 'villain'}
                  onClick={() => handleGenerateAdvice('villain')}
                  className={cn("text-xs h-8 rounded-full border-rose-200 dark:border-rose-900/50 hover:bg-rose-50 dark:hover:bg-rose-900/20 hover:text-rose-600", activeFocus === 'villain' && "bg-rose-50 text-rose-600")}
                >
                  <TrendingDown className="w-3.5 h-3.5 mr-1.5" /> Vilão dos Gastos
                </Button>
              </div>

              {/* BOTÕES DE UTILIDADE (COPIAR / FECHAR) */}
              <div className="flex items-center gap-2 w-full lg:w-auto justify-end">
                <Button variant="ghost" size="sm" onClick={handleCopy} className="text-slate-500 hover:text-indigo-600 h-8">
                  {isCopied ? <Check className="w-4 h-4 mr-1.5 text-emerald-500" /> : <Copy className="w-4 h-4 mr-1.5" />}
                  {isCopied ? "Copiado!" : "Copiar"}
                </Button>
                
                <Button variant="ghost" size="sm" onClick={handleClear} className="text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 h-8">
                  <X className="w-4 h-4 mr-1.5" /> Fechar
                </Button>
              </div>

            </div>
          </div>
        )}

      </CardContent>
    </Card>
  );
}