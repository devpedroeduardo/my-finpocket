"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";
// Importamos as suas funções existentes que já calculam os totais!
import { getDashboardStats, getExpensesByCategory } from "@/services/dashboard";

export async function generateFinancialAdvice(monthStr?: string) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return { error: "Chave da API não configurada no .env.local" };

    const genAI = new GoogleGenerativeAI(apiKey);
    // Usamos o modelo flash, que é extremamente rápido para textos
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" }); 

    // 1. Busca os dados reais do usuário do banco de dados
    const stats = await getDashboardStats(monthStr);
    const categories = await getExpensesByCategory(monthStr);

    // 2. Prepara o texto das categorias (Ex: "Alimentação: R$ 500, Lazer: R$ 200")
    const categoryText = categories.map(c => `${c.name}: R$ ${c.value}`).join(", ");

    // 3. Monta o Prompt para a IA
    const prompt = `
      Você é a IA Conselheira Financeira oficial do aplicativo "FinPocket".
      Aja como um mentor amigável, direto, humano e encorajador.
      
      Aqui estão os dados reais do usuário neste mês atual:
      - Total Recebido: R$ ${stats.income}
      - Total Gasto: R$ ${stats.expense}
      - Saldo Atual: R$ ${stats.balance}
      - Principais categorias de gastos: ${categoryText || "Nenhum gasto registrado ainda."}

      Sua tarefa:
      Faça uma análise rápida de no máximo 2 parágrafos curtos.
      Elogie se o saldo for positivo. Se ele gastou muito em uma categoria específica, dê um toque sutil e uma dica prática de economia.
      Use uma linguagem moderna, direta ao ponto e use alguns emojis. Não use formatação markdown complexa como tabelas.
    `;

    // 4. Chama a IA do Google
    const result = await model.generateContent(prompt);
    const response = result.response.text();

    return { text: response };
  } catch (error) {
    console.error("Erro na IA:", error);
    return { error: "Ocorreu um erro ao gerar a análise. Tente novamente mais tarde." };
  }
}