"use client";

import { useState } from "react";
import { Sparkles, Loader2, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { generateFinancialAdvice } from "@/app/actions/ai-assistant";
import { toast } from "sonner";

export function AIAdvisor() {
  const [advice, setAdvice] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleGenerateAdvice() {
    setIsLoading(true);
    const result = await generateFinancialAdvice();
    
    if (result.error) {
      toast.error(result.error);
    } else {
      setAdvice(result.text || "");
    }
    setIsLoading(false);
  }

  return (
    <Card className="overflow-hidden border-indigo-100 dark:border-indigo-900/50 bg-gradient-to-br from-indigo-50/50 to-purple-50/50 dark:from-indigo-950/20 dark:to-purple-950/20 shadow-sm">
      <CardContent className="p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                FinPocket AI
                <span className="text-[10px] bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-2 py-0.5 rounded-full uppercase font-bold tracking-wider">
                  Beta
                </span>
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">Análise inteligente do seu mês.</p>
            </div>
          </div>

          <Button 
            onClick={handleGenerateAdvice} 
            disabled={isLoading}
            className="w-full sm:w-auto bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white border-0 shadow-md transition-all hover:scale-[1.02]"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Sparkles className="w-4 h-4 mr-2" />}
            {advice ? "Analisar Novamente" : "Gerar Análise"}
          </Button>

        </div>

        {/* ÁREA DA RESPOSTA DA IA */}
        {advice && (
          <div className="mt-5 pt-5 border-t border-indigo-100/50 dark:border-indigo-900/50 animate-in fade-in slide-in-from-top-4 duration-500">
            <p className="text-slate-700 dark:text-slate-300 text-sm sm:text-base leading-relaxed whitespace-pre-wrap">
              {advice}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}