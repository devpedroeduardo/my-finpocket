'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Copy, CheckCircle2, Loader2, ArrowLeft } from 'lucide-react'
import { Transaction } from '@/components/transaction-list'
import QRCode from 'react-qr-code'
// 1. Importando o hook de navegação do App Router
import { useRouter } from 'next/navigation'

interface PixBatchPanelProps {
  transactions: Transaction[]
}

export function PixBatchPanel({ transactions }: PixBatchPanelProps) {
  // 2. Inicializando o router
  const router = useRouter()
  
  const [selecionadas, setSelecionadas] = useState<string[]>([])
  const [step, setStep] = useState<'selecao' | 'checkout'>('selecao')
  const [isLoading, setIsLoading] = useState(false)
  const [copiado, setCopiado] = useState(false)
  
  const [pixCode, setPixCode] = useState<string>('')

  const contasAPagar = transactions.filter((t) => t.type === 'expense')

  const toggleConta = (id: string) => {
    setSelecionadas((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    )
  }

  const valorTotal = selecionadas.reduce((total, id) => {
    const conta = contasAPagar.find((c) => c.id === id)
    return total + Number(conta?.amount || 0)
  }, 0)

  const gerarPix = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/pix', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transactionIds: selecionadas,
          totalAmount: valorTotal,
          description: `Pagamento em lote - MyFinPocket`
        }),
      })

      const data = await response.json()

      if (data.success) {
        setPixCode(data.pixCopiaECola)
        setStep('checkout') 
        
        // 3. A DICA DE UX: Atualiza os dados da página principal em segundo plano!
        router.refresh()
        
      } else {
        alert(data.error || 'Erro ao comunicar com o banco.')
      }
    } catch (error) {
      console.error(error)
      alert('Falha na conexão com a API.')
    } finally {
      setIsLoading(false)
    }
  }

  const copiarPix = () => {
    navigator.clipboard.writeText(pixCode)
    setCopiado(true)
    setTimeout(() => setCopiado(false), 2000)
  }

  if (step === 'checkout') {
    return (
      <div className="flex flex-col items-center justify-center p-6 text-center space-y-5 bg-white dark:bg-slate-950 rounded-xl">
        
        <div>
          <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">PIX Gerado com Sucesso!</h3>
          <p className="text-sm text-slate-500 mt-1">Escaneie o QR Code ou copie o código abaixo.</p>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex items-center justify-center">
          <QRCode 
            value={pixCode} 
            size={180} 
            level="M" 
            className="rounded-md"
          />
        </div>

        <div className="w-full p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
          <p className="text-sm text-slate-500 mb-1">Valor do Pagamento</p>
          <p className="text-3xl font-bold text-emerald-600">R$ {valorTotal.toFixed(2).replace('.', ',')}</p>
        </div>

        <div className="w-full space-y-2">
          <Button onClick={copiarPix} className={`w-full h-12 text-md transition-all ${copiado ? 'bg-emerald-500 hover:bg-emerald-600 text-white' : 'bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200'}`}>
            {copiado ? <CheckCircle2 className="w-5 h-5 mr-2" /> : <Copy className="w-5 h-5 mr-2" />}
            {copiado ? 'Código Copiado!' : 'Copiar PIX Copia e Cola'}
          </Button>
          
          <Button variant="ghost" onClick={() => setStep('selecao')} className="text-slate-500 w-full">
            <ArrowLeft className="w-4 h-4 mr-2" /> Voltar para as contas
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="relative min-h-[400px] w-full p-4 bg-white dark:bg-slate-950 rounded-xl">
      <h2 className="text-xl font-bold mb-4 text-slate-800 dark:text-slate-100">
        Selecionar Contas
      </h2>

      {contasAPagar.length === 0 ? (
        <div className="text-center py-10 text-slate-500">
          Nenhuma despesa pendente encontrada neste mês.
        </div>
      ) : (
        <div className="space-y-3 pb-24 max-h-[60vh] overflow-y-auto pr-2">
          {contasAPagar.map((conta) => (
            <div
              key={conta.id}
              className={`flex items-center justify-between p-4 rounded-lg border transition-colors cursor-pointer ${
                selecionadas.includes(conta.id)
                  ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/20'
                  : 'border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900'
              }`}
              onClick={() => toggleConta(conta.id)}
            >
              <div className="flex items-center gap-3">
                <Checkbox
                  checked={selecionadas.includes(conta.id)}
                  onCheckedChange={() => toggleConta(conta.id)}
                />
                <div>
                  <p className="font-medium text-slate-700 dark:text-slate-200">{conta.description}</p>
                  <p className="text-xs text-slate-500">
                    Vence em: {new Date(conta.created_at || new Date()).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </div>
              <p className="font-semibold text-slate-800 dark:text-slate-100">
                R$ {Number(conta.amount).toFixed(2).replace('.', ',')}
              </p>
            </div>
          ))}
        </div>
      )}

      {selecionadas.length > 0 && (
        <div className="absolute bottom-4 left-4 right-4 bg-slate-900 dark:bg-slate-50 text-white dark:text-slate-900 p-4 rounded-2xl shadow-xl flex items-center justify-between animate-in slide-in-from-bottom-5">
          <div>
            <p className="text-sm opacity-80">{selecionadas.length} conta(s)</p>
            <p className="text-lg font-bold">R$ {valorTotal.toFixed(2).replace('.', ',')}</p>
          </div>
          <Button onClick={gerarPix} disabled={isLoading} className="bg-emerald-500 hover:bg-emerald-600 text-white border-none rounded-xl px-6">
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Gerar PIX'}
          </Button>
        </div>
      )}
    </div>
  )
}