"use function";
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Landmark, Target, Wallet, Repeat } from "lucide-react";

export function BottomNav() {
  const pathname = usePathname();

  // Selecionamos os 5 links mais importantes para a barra inferior do app
  const links = [
    { href: "/", label: "Início", icon: Home },
    { href: "/wallets", label: "Contas", icon: Landmark },
    { href: "/goals", label: "Objetivos", icon: Target },
    { href: "/subscriptions", label: "Assinaturas", icon: Repeat },
    { href: "/reports", label: "Mais", icon: Wallet },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center px-4 py-2 z-50 pb-safe">
      {links.map((link) => {
        const isActive = pathname === link.href;
        const Icon = link.icon;
        
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`flex flex-col items-center justify-center w-full space-y-1 ${
              isActive 
                ? "text-emerald-600 dark:text-emerald-400" 
                : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-300"
            }`}
          >
            <Icon className={`w-6 h-6 ${isActive ? "fill-emerald-100 dark:fill-emerald-900/30" : ""}`} />
            <span className="text-[10px] font-medium">{link.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}