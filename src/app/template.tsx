"use client";

import { motion } from "framer-motion";

export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      // Estado inicial (antes de aparecer na tela): Invisível e 15px para baixo
      initial={{ opacity: 0, y: 15 }}
      
      // Estado final (quando a tela carrega): Totalmente visível e na posição original
      animate={{ opacity: 1, y: 0 }}
      
      // Como a animação acontece: Duração de 0.3s com uma aceleração suave
      transition={{ ease: "easeInOut", duration: 0.5 }}
      
      // Para garantir que a animação ocupe 100% da altura disponível
      className="min-h-full"
    >
      {children}
    </motion.div>
  );
}