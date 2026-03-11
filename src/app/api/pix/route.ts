import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

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

    const { error: dbError } = await supabase
      .from('transactions') 
      .update({ status: 'PAID' }) 
      .in('id', transactionIds) 

    if (dbError) {
      console.error('Erro ao atualizar no Supabase:', dbError)
      return NextResponse.json(
        { error: 'Falha ao dar baixa nas contas no banco de dados.' },
        { status: 500 }
      )
    }

    const pixFinal = `00020126580014br.gov.bcb.pix0136pix@myfinpocket.com.br520400005303986540${totalAmount.toFixed(2).replace('.', '')}5802BR5916MyFinPocket LTDA6009SAO PAULO62140510PGTOLOTE016304ABCD`

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