"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";
import { getDashboardStats, getExpensesByCategory } from "@/services/dashboard";

export async function generateFinancialAdvice(monthStr?: string, focus: 'general' | 'savings' | 'villain' = 'general') {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return { error: "Chave da API não configurada no .env.local" };

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" }); 

    const stats = await getDashboardStats(monthStr);
    const categories = await getExpensesByCategory(monthStr);

    const categoryText = categories.map(c => `${c.name}: R$ ${c.value}`).join(", ");

    // Define o que a IA deve fazer baseado no botão que o usuário clicou
    let focusInstruction = "Faça uma análise rápida e encorajadora de no máximo 2 parágrafos curtos sobre a saúde financeira geral do mês.";
    
    if (focus === 'savings') {
      focusInstruction = "Seja direto: liste 3 dicas práticas, criativas e acionáveis de como eu posso economizar dinheiro neste mês, baseando-se nas minhas categorias de gastos que mais consumiram saldo.";
    } else if (focus === 'villain') {
      focusInstruction = "Aja como um detetive financeiro. Aponte claramente qual foi o meu 'vilão' de gastos este mês (a categoria que mais pesou de forma negativa ou desnecessária) e sugira uma meta de redução rigorosa para o próximo mês.";
    }

    const prompt = `
      Você é a IA Conselheira Financeira oficial do aplicativo "FinPocket".
      Aja como um mentor amigável, direto, humano e encorajador.
      
      Aqui estão os dados reais do usuário neste mês atual:
      - Total Recebido: R$ ${stats.income}
      - Total Gasto: R$ ${stats.expense}
      - Saldo Atual: R$ ${stats.balance}
      - Gastos por Categoria: ${categoryText || "Nenhum gasto registrado ainda."}

      Sua tarefa:
      ${focusInstruction}

      Use uma linguagem moderna e adicione emojis. Não use markdown complexo, apenas texto formatado para leitura rápida. Não seja genérico, cite os números do usuário.
    `;

    const result = await model.generateContent(prompt);
    const response = result.response.text();

    return { text: response };
  } catch (error) {
    console.error("Erro na IA:", error);
    return { error: "Ocorreu um erro ao gerar a análise. Tente novamente mais tarde." };
  }
}