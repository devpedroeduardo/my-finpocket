import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

// O corpo só precisa dos IDs: o valor total é calculado no servidor,
// a partir do banco, para não confiar em um número enviado pelo navegador.
const pixSchema = z.object({
  transactionIds: z
    .array(z.string().min(1))
    .min(1, 'Nenhuma conta selecionada.')
    .max(100, 'Selecione no máximo 100 contas por lote.'),
})

export async function POST(request: Request) {
  try {
    // 1. Cliente com a sessão do usuário (cookies): as políticas de RLS valem aqui.
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Faça login para continuar.' }, { status: 401 })
    }

    // 2. Validação da entrada.
    const parsed = pixSchema.safeParse(await request.json().catch(() => null))
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? 'Dados inválidos.' },
        { status: 400 }
      )
    }
    const transactionIds = [...new Set(parsed.data.transactionIds)]

    // 3. Confere se todas as contas existem e pertencem ao usuário logado.
    const { data: contas, error: selectError } = await supabase
      .from('transactions')
      .select('id, amount')
      .eq('user_id', user.id)
      .in('id', transactionIds)

    if (selectError) {
      console.error('Erro ao buscar as contas no Supabase:', selectError)
      return NextResponse.json(
        { error: 'Não foi possível consultar as contas selecionadas.' },
        { status: 500 }
      )
    }

    if (!contas || contas.length !== transactionIds.length) {
      return NextResponse.json(
        { error: 'Uma ou mais contas não foram encontradas.' },
        { status: 404 }
      )
    }

    const totalAmount = contas.reduce((total, conta) => total + Number(conta.amount), 0)

    // 4. Dá baixa apenas nas contas do próprio usuário.
    const { error: dbError } = await supabase
      .from('transactions')
      .update({ status: 'PAID' })
      .eq('user_id', user.id)
      .in('id', transactionIds)

    if (dbError) {
      console.error('Erro ao atualizar no Supabase:', dbError)
      return NextResponse.json(
        { error: 'Falha ao dar baixa nas contas no banco de dados.' },
        { status: 500 }
      )
    }

    // Código PIX de demonstração (não é um pagamento real).
    const pixFinal = `00020126580014br.gov.bcb.pix0136pix@myfinpocket.com.br520400005303986540${totalAmount.toFixed(2).replace('.', '')}5802BR5916MyFinPocket LTDA6009SAO PAULO62140510PGTOLOTE016304ABCD`

    await new Promise((resolve) => setTimeout(resolve, 1500))

    return NextResponse.json({
      success: true,
      pixCopiaECola: pixFinal,
      totalAmount,
      message: `Lote de ${transactionIds.length} contas processado e baixado com sucesso.`,
    })
  } catch (error) {
    console.error('Erro fatal na API do PIX:', error)
    return NextResponse.json(
      { error: 'Erro interno no processamento do pagamento.' },
      { status: 500 }
    )
  }
}
