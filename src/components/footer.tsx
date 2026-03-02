import Link from "next/link";
import { Wallet } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  // Variáveis limpas e sem nenhuma repetição de links
  const platformLinks = [
    { href: "/", label: "Dashboard" },
    { href: "/wallets", label: "Contas" },
    { href: "/goals", label: "Objetivos" }
  ];

  const supportLinks = [
    { href: "#ajuda", label: "Centro de Ajuda" },
    { href: "#faq", label: "FAQ" },
    { href: "#contato", label: "Contato" }
  ];

  const legalLinks = [
    { href: "#termos", label: "Termos de Uso" },
    { href: "#privacidade", label: "Política de Privacidade" }
  ];

  return (
    <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 transition-colors mt-8 -mx-4 md:-mx-6 lg:-mx-8 -mb-4 md:-mb-6 lg:-mb-8">
      
      <div className="w-full px-6 md:px-12 py-10 lg:py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Coluna 1: Marca e Identidade */}
          <div className="col-span-1 md:col-span-1 space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <Wallet className="w-7 h-7 text-emerald-600 shrink-0" />
              <span className="text-xl font-bold text-slate-800 dark:text-white">
                MyFinPocket
              </span>
            </Link>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Gerencie suas finanças com facilidade, inteligência e controle total. O assistente que cabe no seu bolso.
            </p>
          </div>

          {/* Coluna 2: Plataforma */}
          <nav className="space-y-4">
            <h4 className="font-semibold text-slate-800 dark:text-white">Plataforma</h4>
            <ul className="space-y-2.5">
              {platformLinks.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-sm text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-500 transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Coluna 3: Ajuda e Suporte */}
          <nav className="space-y-4">
            <h4 className="font-semibold text-slate-800 dark:text-white">Suporte</h4>
            <ul className="space-y-2.5">
              {supportLinks.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-sm text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-500 transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Coluna 4: Legal */}
          <nav className="space-y-4">
            <h4 className="font-semibold text-slate-800 dark:text-white">Legal</h4>
            <ul className="space-y-2.5">
              {legalLinks.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-sm text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-500 transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* Barra de Copyright */}
        <div className="mt-10 pt-8 border-t border-slate-200 dark:border-slate-800 text-center">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            &copy; {currentYear} MyFinPocket Ltda. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}