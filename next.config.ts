import withPWAInit from "@ducanh2912/next-pwa";
import type { NextConfig } from "next";

const withPWA = withPWAInit({
  dest: "public",
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  disable: process.env.NODE_ENV === "development",
  workboxOptions: {
    disableDevLogs: true,
  },
});

const nextConfig: NextConfig = {
  // Adicione esta linha para resolver o conflito entre o PWA e o Next.js 16
  turbopack: {},

  // ADICIONE ESTE BLOCO DE SEGURANÇA SÊNIOR 👇
  async headers() {
    return [
      {
        // Aplica essas regras para TODAS as rotas do seu site
        source: "/(.*)",
        headers: [
          {
            // Impede que seu app seja aberto dentro de um iFrame em outro site (Clickjacking)
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            // Impede que o navegador tente "adivinhar" tipos de arquivos, bloqueando scripts disfarçados de imagens
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            // Protege de onde as requisições estão vindo
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            // Bloqueia o acesso a câmera, microfone e GPS do usuário (já que um app de finanças não precisa disso)
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
};

export default withPWA(nextConfig);