"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  User, LogOut, Wallet, Menu, X, 
  Home, Landmark, Repeat, Tags, Target, FileText 
} from "lucide-react";
import { ModeToggle } from "@/components/mode-toggle";
import { NotificationsDropdown } from "./notifications-dropdown";
import { signOut } from "@/app/actions/auth";

export function Topbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();

  // Links espelhados da sua Sidebar original para o Menu Mobile
  const links = [
    { href: "/", label: "Dashboard", icon: Home },
    { href: "/wallets", label: "Contas", icon: Landmark },
    { href: "/subscriptions", label: "Assinaturas", icon: Repeat },
    { href: "/categories", label: "Categorias", icon: Tags },
    { href: "/reports", label: "Relatórios", icon: Wallet },
    { href: "/goals", label: "Objetivos", icon: Target},
    { href: "/import", label: "Importar", icon: FileText },
  ];

  return (
    <>
      <header className="h-16 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md border-b flex items-center justify-between px-4 md:px-6 sticky top-0 z-30 transition-colors">
        
        {/* LADO ESQUERDO: Botão Hambúrguer + Logo */}
        <div className="flex items-center gap-2 md:gap-0 flex-1 md:flex-none">
          
          {/* BOTÃO HAMBÚRGUER (Apenas Mobile) */}
          <button 
            onClick={() => setIsMenuOpen(true)}
            className="md:hidden p-2 -ml-2 text-slate-500 hover:text-emerald-600 rounded-md transition-colors"
          >
            <Menu className="w-6 h-6" />
          </button>

          {/* LOGO MOBILE */}
          <Link href="/" className="flex md:hidden items-center gap-2 text-emerald-600 font-bold text-lg">
            <Wallet className="w-6 h-6 text-emerald-600" /> 
            MyFinPocket
          </Link>
        </div>

        {/* Espaçador para o Desktop: Só aparece quando o hambúrguer/logo estiver invisível */}
        <div className="hidden md:block flex-1" />
        
        {/* LADO DIREITO: Ícones de Ação */}
        <div className="flex items-center gap-2 sm:gap-3">
          <NotificationsDropdown />

          {/* CORREÇÃO AQUI: Removidas as classes 'hidden sm:block' */}
          <Link 
            href="/profile" 
            className="p-2 text-slate-500 hover:text-emerald-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors block" 
            title="Meu Perfil"
          >
            <User className="w-5 h-5" />
          </Link>
          
          <ModeToggle />
          
          <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-1 hidden sm:block" />
          
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

      {/* OVERLAY DO MENU MOBILE (A Gaveta Deslizante) */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          {/* Fundo escuro com desfoque (clique para fechar) */}
          <div 
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" 
            onClick={() => setIsMenuOpen(false)} 
          />
          
          {/* Painel lateral do Menu */}
          <div className="relative w-64 max-w-[80%] bg-white dark:bg-slate-900 h-full flex flex-col shadow-2xl animate-in slide-in-from-left">
            
            {/* Cabeçalho do Menu Lateral */}
            <div className="h-16 flex items-center justify-between px-6 border-b">
              <span className="text-emerald-600 font-bold text-xl flex items-center gap-2">
                <Wallet className="w-6 h-6" />
                Menu
              </span>
              <button 
                onClick={() => setIsMenuOpen(false)}
                className="p-2 -mr-2 text-slate-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Lista de Links */}
            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
              {links.map((link) => {
                const isActive = pathname === link.href;
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsMenuOpen(false)} // Fecha a gaveta automaticamente ao clicar
                    className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-colors font-medium text-sm ${
                      isActive 
                        ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" 
                        : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {link.label}
                  </Link>
                );
              })}
            </nav>
            
          </div>
        </div>
      )}
    </>
  );
}