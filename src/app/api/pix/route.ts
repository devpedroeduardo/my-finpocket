import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// 1. Inicializa a conexão com o banco usando suas chaves do arquivo .env.local
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { transactionIds, totalAmount } = body

    if (!transactionIds || transactionIds.length === 0 || !totalAmount) {
      return NextResponse.json(
        { error: 'Nenhuma conta selecionada ou valor inválido.' },
        { status: 400 }
      )
    }

    // ====================================================================
    // A MÁGICA: DANDO BAIXA NO BANCO DE DADOS EM LOTE
    // ====================================================================
    const { error: dbError } = await supabase
      .from('transactions') // ⚠️ Atenção: Verifique se sua tabela se chama 'transactions' mesmo
      .update({ status: 'PAID' }) // ⚠️ Atenção: Verifique se sua coluna se chama 'status' e o valor pago é 'PAID' (ou 'pago')
      .in('id', transactionIds) // Atualiza de uma vez só todos os IDs dessa lista!

    if (dbError) {
      console.error('Erro ao atualizar no Supabase:', dbError)
      return NextResponse.json(
        { error: 'Falha ao dar baixa nas contas no banco de dados.' },
        { status: 500 }
      )
    }

    // ====================================================================
    // GERAÇÃO DO CÓDIGO PIX 
    // ====================================================================
    const pixFinal = `00020126580014br.gov.bcb.pix0136pix@myfinpocket.com.br520400005303986540${totalAmount.toFixed(2).replace('.', '')}5802BR5916MyFinPocket LTDA6009SAO PAULO62140510PGTOLOTE016304ABCD`

    // Simulando tempo de resposta do servidor do Banco Central (1.5s)
    await new Promise((resolve) => setTimeout(resolve, 1500))

    return NextResponse.json({
      success: true,
      pixCopiaECola: pixFinal,
      message: `Lote de ${transactionIds.length} contas processado e baixado com sucesso.`
    })

  } catch (error) {
    console.error('Erro fatal na API do PIX:', error)
    return NextResponse.json(
      { error: 'Erro interno no processamento do pagamento.' },
      { status: 500 }
    )
  }
}