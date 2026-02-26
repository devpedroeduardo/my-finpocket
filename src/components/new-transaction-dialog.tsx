"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { PlusCircle, Loader2, CalendarIcon, Landmark, Paperclip, CreditCard, ArrowRightLeft, Clock } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { createTransaction, uploadReceipt, createTransfer } from "@/app/actions/transactions"; 
import { getCategories } from "@/app/actions/categories";
import { getWallets } from "@/app/actions/wallets"; 

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

// --- SCHEMA DA TRANSAÇÃO NORMAL ---
const formSchema = z.object({
  description: z.string().min(2, "Mínimo de 2 letras."),
  amount: z.number().min(0.01, "O valor deve ser positivo."),
  type: z.enum(["income", "expense"]),
  category: z.string().min(1, "Selecione uma categoria."),
  wallet_id: z.string().optional(),
  installments: z.number().min(1, "Mínimo 1 parcela").max(72, "Máximo 72 parcelas"), 
  status: z.enum(["paid", "pending"]), // <--- NOVO CAMPO DE STATUS
  date: z.date(),
});
type FormValues = z.infer<typeof formSchema>;

// --- SCHEMA DA TRANSFERÊNCIA ---
const transferSchema = z.object({
  description: z.string().optional(),
  amount: z.number().min(0.01, "O valor deve ser positivo."),
  from_wallet_id: z.string().min(1, "Selecione a origem."),
  to_wallet_id: z.string().min(1, "Selecione o destino."),
  date: z.date(),
});
type TransferValues = z.infer<typeof transferSchema>;

export function NewTransactionDialog() {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<'transaction' | 'transfer'>('transaction');
  
  const [dbCategories, setDbCategories] = useState<{id: string, name: string}[]>([]);
  const [dbWallets, setDbWallets] = useState<{id: string, name: string}[]>([]);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { 
      description: "", 
      amount: 0, 
      type: "expense", 
      category: "", 
      wallet_id: "none", 
      installments: 1, 
      status: "paid", 
      date: new Date() 
    },
  });

  const formTransfer = useForm<TransferValues>({
    resolver: zodResolver(transferSchema),
    defaultValues: { description: "", amount: 0, from_wallet_id: "", to_wallet_id: "", date: new Date() },
  });

  useEffect(() => {
    if (open) {
      getCategories().then(data => setDbCategories(data || []));
      getWallets().then(data => setDbWallets(data || []));
    }
  }, [open]);

  // SUBMIT TRANSAÇÃO NORMAL
  async function onSubmitTransaction(values: FormValues) {
    try {
      let finalReceiptUrl = undefined;
      if (receiptFile) {
        const formData = new FormData(); 
        formData.append("file", receiptFile);
        const uploadResult = await uploadReceipt(formData);
        if (uploadResult.error) return toast.error(uploadResult.error);
        finalReceiptUrl = uploadResult.publicUrl;
      }

      const finalWalletId = values.wallet_id === "none" ? undefined : values.wallet_id;
      
      // Enviando todos os dados, incluindo o novo "status"
      const result = await createTransaction({ 
        ...values, 
        wallet_id: finalWalletId, 
        receipt_url: finalReceiptUrl 
      });

      if (result?.error) return toast.error(result.error);

      setOpen(false); 
      form.reset(); 
      setReceiptFile(null);
      
      if (values.installments > 1) {
        toast.success(`${values.installments} parcelas criadas!`);
      } else {
        toast.success(values.status === 'pending' ? "Lançamento pendente adicionado!" : "Transação adicionada!");
      }
    } catch (error) { 
      toast.error("Ocorreu um erro inesperado."); 
    }
  }

  // SUBMIT TRANSFERÊNCIA
  async function onSubmitTransfer(values: TransferValues) {
    try {
      const result = await createTransfer(values);
      if (result?.error) return toast.error(result.error);
      
      setOpen(false); 
      formTransfer.reset();
      toast.success("Transferência realizada com sucesso!");
    } catch (error) { 
      toast.error("Ocorreu um erro inesperado."); 
    }
  }

  const isLoading = form.formState.isSubmitting || formTransfer.formState.isSubmitting;

  return (
    <Dialog open={open} onOpenChange={(val) => { setOpen(val); if (!val) { setReceiptFile(null); setMode('transaction'); } }}>
      <DialogTrigger asChild>
        <Button className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2 shadow-sm">
          <PlusCircle className="w-4 h-4" /> Nova Transação
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Novo Lançamento</DialogTitle>
          <DialogDescription>O que você deseja registrar hoje?</DialogDescription>
        </DialogHeader>

        {/* SELETOR DE MODO (Abas) */}
        <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-lg mb-2 border border-slate-200 dark:border-slate-800">
          <button type="button" onClick={() => setMode('transaction')} className={cn("flex-1 flex items-center justify-center gap-2 text-sm py-1.5 rounded-md transition-all", mode === 'transaction' ? "bg-white dark:bg-slate-800 shadow-sm font-semibold text-slate-800 dark:text-white" : "text-slate-500 hover:text-slate-700")}>
            <PlusCircle className="w-4 h-4" /> Transação
          </button>
          <button type="button" onClick={() => setMode('transfer')} className={cn("flex-1 flex items-center justify-center gap-2 text-sm py-1.5 rounded-md transition-all", mode === 'transfer' ? "bg-white dark:bg-slate-800 shadow-sm font-semibold text-blue-600 dark:text-blue-400" : "text-slate-500 hover:text-slate-700")}>
            <ArrowRightLeft className="w-4 h-4" /> Transferência
          </button>
        </div>

        {/* FORMULÁRIO: TRANSAÇÃO NORMAL */}
        {mode === 'transaction' && (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmitTransaction)} className="space-y-4 animate-in fade-in zoom-in-95 duration-200">
              
              <FormField control={form.control} name="description" render={({ field }) => (
                <FormItem><FormLabel>Descrição</FormLabel><FormControl><Input placeholder="Ex: Conta de Luz..." {...field} /></FormControl><FormMessage /></FormItem>
              )}/>
              
              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="amount" render={({ field }) => (
                  <FormItem><FormLabel>Valor Total (R$)</FormLabel><FormControl><Input type="number" step="0.01" {...field} onChange={(e) => field.onChange(e.target.value === "" ? 0 : parseFloat(e.target.value))} /></FormControl><FormMessage /></FormItem>
                )}/>
                <FormField control={form.control} name="date" render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel className="mb-1">Data / Vencimento</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button variant={"outline"} className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                            {field.value ? format(field.value, "dd/MM/yyyy") : <span>Selecione</span>}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}/>
              </div>

              {/* SELETORES DE TIPO E STATUS LADO A LADO */}
              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="type" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value="income">Receita</SelectItem>
                        <SelectItem value="expense">Despesa</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}/>
                
                <FormField control={form.control} name="status" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-amber-500"/> Situação</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value="paid">Pago / Recebido</SelectItem>
                        <SelectItem value="pending">Pendente</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}/>
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <FormField control={form.control} name="category" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categoria</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger></FormControl>
                      <SelectContent>
                        {dbCategories.map((cat) => <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}/>
                <FormField control={form.control} name="wallet_id" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1.5"><Landmark className="w-3.5 h-3.5 text-emerald-600" /> Conta</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Opcional" /></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value="none">Nenhuma</SelectItem>
                        {dbWallets.map((w) => <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}/>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="installments" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1.5"><CreditCard className="w-3.5 h-3.5 text-blue-500" /> Parcelas</FormLabel>
                    <FormControl><Input type="number" min="1" max="72" {...field} onChange={(e) => field.onChange(parseInt(e.target.value) || 1)} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}/>
                <div className="space-y-2">
                  <label className="text-sm font-medium leading-none flex items-center gap-2 mt-1">
                    <Paperclip className="w-4 h-4 text-emerald-600" /> Anexo (Opcional)
                  </label>
                  <Input 
                    type="file" 
                    accept="image/*,application/pdf" 
                    onChange={(e) => setReceiptFile(e.target.files?.[0] || null)} 
                    className="cursor-pointer file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-medium file:bg-emerald-50 file:text-emerald-700 w-full" 
                  />
                </div>
              </div>

              <DialogFooter className="pt-2">
                <Button type="submit" disabled={isLoading} className="w-full bg-slate-800 hover:bg-slate-900 dark:bg-emerald-600 dark:hover:bg-emerald-700">
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Salvar Lançamento
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}

        {/* FORMULÁRIO: TRANSFERÊNCIA */}
        {mode === 'transfer' && (
           <Form {...formTransfer}>
             <form onSubmit={formTransfer.handleSubmit(onSubmitTransfer)} className="space-y-4 animate-in fade-in zoom-in-95 duration-200">
              
              {dbWallets.length < 2 && (
                <div className="bg-amber-50 text-amber-600 p-3 rounded-md text-sm mb-4">
                  Você precisa ter pelo menos 2 contas cadastradas para realizar uma transferência.
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <FormField control={formTransfer.control} name="amount" render={({ field }) => (
                  <FormItem><FormLabel>Valor a transferir</FormLabel><FormControl><Input type="number" step="0.01" {...field} onChange={(e) => field.onChange(e.target.value === "" ? 0 : parseFloat(e.target.value))} /></FormControl><FormMessage /></FormItem>
                )}/>
                <FormField control={formTransfer.control} name="date" render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel className="mb-1">Data</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button variant={"outline"} className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                            {field.value ? format(field.value, "dd/MM/yyyy") : <span>Selecione</span>}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}/>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-100 dark:border-slate-800 space-y-4 relative">
                <div className="absolute left-6 top-1/2 -translate-y-1/2 w-0.5 h-12 bg-slate-200 dark:bg-slate-700 rounded-full" />
                
                <FormField control={formTransfer.control} name="from_wallet_id" render={({ field }) => (
                  <FormItem className="relative z-10 pl-6">
                    <FormLabel className="text-rose-600">Sair da Conta (Origem)</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl><SelectTrigger className="bg-white dark:bg-slate-950"><SelectValue placeholder="Selecione" /></SelectTrigger></FormControl>
                      <SelectContent>{dbWallets.map((w) => <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>)}</SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}/>

                <FormField control={formTransfer.control} name="to_wallet_id" render={({ field }) => (
                  <FormItem className="relative z-10 pl-6">
                    <FormLabel className="text-emerald-600">Entrar na Conta (Destino)</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl><SelectTrigger className="bg-white dark:bg-slate-950"><SelectValue placeholder="Selecione" /></SelectTrigger></FormControl>
                      <SelectContent>{dbWallets.map((w) => <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>)}</SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}/>
              </div>

              <FormField control={formTransfer.control} name="description" render={({ field }) => (
                <FormItem><FormLabel>Anotação (Opcional)</FormLabel><FormControl><Input placeholder="Ex: Transferência para reserva..." {...field} /></FormControl><FormMessage /></FormItem>
              )}/>

              <DialogFooter className="pt-4">
                <Button type="submit" disabled={isLoading || dbWallets.length < 2} className="w-full bg-blue-600 hover:bg-blue-700 text-white gap-2">
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ArrowRightLeft className="w-4 h-4" />} 
                  Realizar Transferência
                </Button>
              </DialogFooter>
            </form>
           </Form>
        )}

      </DialogContent>
    </Dialog>
  );
}