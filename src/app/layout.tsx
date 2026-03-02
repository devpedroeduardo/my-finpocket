import type { Metadata, Viewport } from "next"; // <--- 1. Importação do Viewport adicionada
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";

const inter = Inter({ subsets: ["latin"] });

// 2. CONFIGURAÇÃO MOBILE-FIRST: Trava o zoom da tela e define a cor da barra do celular
export const viewport: Viewport = {
  themeColor: "#4f46e5",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false, 
};

export const metadata: Metadata = {
  title: "MyFinPocket",
  description: "Seu controle financeiro pessoal",
  manifest: "/manifest.json", // <--- 3. A IDENTIDADE DO APP: Aponta para o seu PWA
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' }, 
    ],
    apple: [
      { url: '/favicon.svg', type: 'image/svg+xml'}, 
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
      <body className={inter.className}>
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