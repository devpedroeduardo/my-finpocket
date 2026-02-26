"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Repeat, Target, Tags, Wallet, Landmark, FileText } from "lucide-react"; // <--- Landmark adicionado

export function Sidebar() {
  const pathname = usePathname();

  const links = [
    { href: "/", label: "Dashboard", icon: Home },
    { href: "/wallets", label: "Contas", icon: Landmark }, // <--- NOVO LINK AQUI
    { href: "/subscriptions", label: "Assinaturas", icon: Repeat },
    { href: "/categories", label: "Categorias", icon: Tags },
    { href: "/reports", label: "Relatórios", icon: Wallet },
    { href: "/goals", label: "Objetivos", icon: Target}, // <--- NOVO LINK AQUI
    { href: "/import", label: "Importar", icon: FileText },
  ];

  return (
    <aside className="w-64 bg-white dark:bg-slate-900 border-r min-h-screen hidden md:flex flex-col sticky top-0">
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b">
        <Link href="/" className="flex items-center gap-2 text-emerald-600 font-bold text-xl">
          <Wallet className="w-6 h-6" />
          FinPocket
        </Link>
      </div>
      
      {/* Links de Navegação */}
      <nav className="flex-1 p-4 space-y-1">
        {links.map((link) => {
          const isActive = pathname === link.href;
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors font-medium text-sm ${
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
    </aside>
  );
}