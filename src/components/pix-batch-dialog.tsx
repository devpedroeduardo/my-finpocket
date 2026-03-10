'use client'

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
} from "@/components/ui/dialog"
import { QrCode } from "lucide-react"
import { PixBatchPanel } from "@/components/pix-batch-panel"
// IMPORTA O TIPO OFICIAL AQUI
import { Transaction } from "@/components/transaction-list" 

interface PixBatchDialogProps {
  transactions: Transaction[]
}

export function PixBatchDialog({ transactions }: PixBatchDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2 border-emerald-500 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30">
          <QrCode className="w-4 h-4" />
          <span className="hidden sm:inline">Pagar em Lote</span>
          <span className="sm:hidden">PIX</span>
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-md p-0 bg-transparent border-none shadow-none">
        <DialogTitle className="sr-only">Pagamento PIX em Lote</DialogTitle>
        <PixBatchPanel transactions={transactions} /> 
      </DialogContent>
    </Dialog>
  )
}