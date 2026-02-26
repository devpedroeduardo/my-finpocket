"use client";

import Link from "next/link";
import { User, LogOut } from "lucide-react";
import { ModeToggle } from "@/components/mode-toggle";
import { signOut } from "@/app/actions/auth";

export function Topbar() {
  return (
    <header className="h-16 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md border-b flex items-center justify-between px-6 sticky top-0 z-10">
      <div className="flex-1" /> {/* Espaçador para empurrar os botões pra direita */}
      
      <div className="flex items-center gap-3">
        {/* Botão de Perfil */}
        <Link 
          href="/profile" 
          className="p-2 text-slate-500 hover:text-emerald-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors" 
          title="Meu Perfil"
        >
          <User className="w-5 h-5" />
        </Link>
        
        {/* Dark Mode */}
        <ModeToggle />
        
        {/* Divisor Visual */}
        <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-1" />
        
        {/* Botão de Sair */}
        <form action={signOut}>
          <button 
            type="submit" 
            className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-md transition-colors" 
            title="Sair da conta"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </form>
      </div>
    </header>
  );
}