"use client"; // O Next.js exige que telas de erro sejam Client Components

import { useEffect } from "react";
import Link from "next/link";
import { ServerCrash, RefreshCcw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  
  // Efeito sênior: Registra o erro no console (ou num serviço como Sentry) para você debugar depois
  useEffect(() => {
    console.error("Erro capturado pelo MyFinPocket:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-50 dark:bg-slate-950 text-center z-50">
      
      {/* Ícone de alerta amigável */}
      <div className="w-20 h-20 bg-rose-100 dark:bg-rose-500/20 rounded-full flex items-center justify-center mb-6 animate-pulse">
        <ServerCrash className="w-10 h-10 text-rose-600 dark:text-rose-500" />
      </div>
      
      <h1 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-white mb-3">
        Ops! Tivemos um contratempo.
      </h1>
      
      <p className="text-slate-600 dark:text-slate-400 max-w-md mb-8 leading-relaxed">
        Não foi possível carregar as informações no momento. Isso geralmente acontece por uma oscilação na internet ou no banco de dados.
      </p>
      
      {/* Botões de Ação */}
      <div className="flex flex-col sm:flex-row gap-4 w-full max-w-sm mx-auto sm:max-w-none justify-center">
        
        {/* O botão 'reset' tenta recarregar a rota atual sem que o usuário perca o estado do app */}
        <Button 
          onClick={() => reset()} 
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white w-full sm:w-auto h-11"
        >
          <RefreshCcw className="w-4 h-4" />
          Tentar Novamente
        </Button>
        
        <Link href="/" className="w-full sm:w-auto">
          <Button variant="outline" className="flex items-center gap-2 w-full h-11 border-slate-300 dark:border-slate-700">
            <Home className="w-4 h-4" />
            Voltar ao Início
          </Button>
        </Link>
        
      </div>
    </div>
  );
}