import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider"; // <--- 1. Importe aqui

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "MyFinPocket",
  description: "Seu controle financeiro pessoal",
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' }, // <--- O MÁGICO AQUI
    ],
    apple: [
      { url: '/icon-192x192.png', sizes: '192x192', type: 'image/png' }, 
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning> 
      {/* ADICIONE suppressHydrationWarning NA TAG HTML ACIMA PARA EVITAR ERROS DE TEMA */}
      
      <body className={inter.className}>
        {/* 2. Envolva o conteúdo com o ThemeProvider */}
        <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
            <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}