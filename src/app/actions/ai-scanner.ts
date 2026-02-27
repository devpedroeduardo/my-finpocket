"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";

export async function scanReceipt(base64Image: string, mimeType: string) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return { error: "Chave da API do Gemini não configurada." };

    const genAI = new GoogleGenerativeAI(apiKey);
    // O modelo flash também processa imagens com alta velocidade
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // 1. O Prompt Mágico: Dizemos exatamente como queremos a resposta
    const prompt = `
      Você é um assistente financeiro especialista em leitura de dados.
      Analise esta imagem (que é uma nota fiscal, recibo ou comprovante de pagamento) e extraia as seguintes informações no formato JSON ESTRITO:
      
      {
        "description": "Nome do estabelecimento ou resumo curto da compra (ex: Supermercado Extra, Posto Ipiranga)",
        "amount": Valor total pago em formato numérico (ex: 150.99),
        "date": "Data da compra no formato YYYY-MM-DD. Se não achar, não retorne este campo",
        "category": "Escolha uma categoria que melhor se encaixe (ex: Alimentação, Transporte, Casa, Saúde, Lazer, Educação, Serviços, Outros)"
      }

      Responda APENAS com o JSON válido, sem usar formatação markdown como \`\`\`json. Se a imagem não for um recibo, retorne um erro no JSON.
    `;

    // 2. Monta a imagem no formato que o Google exige
    const imageParts = [
      {
        inlineData: {
          data: base64Image,
          mimeType,
        },
      },
    ];

    // 3. Envia para a IA
    const result = await model.generateContent([prompt, ...imageParts]);
    let responseText = result.response.text();

    // 4. Limpa a resposta (às vezes a IA manda crases de markdown em volta do JSON)
    responseText = responseText.replace(/```json/g, "").replace(/```/g, "").trim();

    // 5. Converte o texto para um Objeto JavaScript
    const data = JSON.parse(responseText);

    return { success: true, data };
  } catch (error) {
    console.error("Erro no Scanner da IA:", error);
    return { error: "Não foi possível ler o recibo. Tente uma foto mais nítida." };
  }
}