"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { PlusCircle, Loader2, CalendarIcon, Landmark, Paperclip, CreditCard } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { createTransaction, uploadReceipt } from "@/app/actions/transactions"; 
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

// CORREÇÃO: Removido o .default(1) do installments para evitar conflito de tipagem
const formSchema = z.object({
  description: z.string().min(2, "Mínimo de 2 letras."),
  amount: z.number().min(0.01, "O valor deve ser positivo."),
  type: z.enum(["income", "expense"]),
  category: z.string().min(1, "Selecione uma categoria."),
  wallet_id: z.string().optional(),
  installments: z.number().min(1, "Mínimo 1 parcela").max(72, "Máximo 72 parcelas"), 
  date: z.date(),
});

type FormValues = z.infer<typeof formSchema>;

export function NewTransactionDialog() {
  const [open, setOpen] = useState(false);
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
      installments: 1, // O valor padrão já está sendo definido corretamente aqui
      date: new Date(),
    },
  });

  useEffect(() => {
    if (open) {
      getCategories().then(data => setDbCategories(data || []));
      getWallets().then(data => setDbWallets(data || []));
    }
  }, [open]);

  async function onSubmit(values: FormValues) {
    try {
      let finalReceiptUrl = undefined;

      if (receiptFile) {
        const formData = new FormData();
        formData.append("file", receiptFile);
        const uploadResult = await uploadReceipt(formData);
        
        if (uploadResult.error) {
          toast.error(uploadResult.error);
          return;
        }
        finalReceiptUrl = uploadResult.publicUrl;
      }

      const finalWalletId = values.wallet_id === "none" ? undefined : values.wallet_id;

      const result = await createTransaction({
        ...values,
        wallet_id: finalWalletId,
        receipt_url: finalReceiptUrl
      });

      if (result?.error) {
        toast.error(result.error);
        return;
      }

      setOpen(false);
      form.reset();
      setReceiptFile(null);
      
      if (values.installments > 1) {
        toast.success(`${values.installments} parcelas criadas com sucesso!`);
      } else {
        toast.success("Transação adicionada com sucesso!");
      }
      
    } catch (error) {
      console.error(error);
      toast.error("Ocorreu um erro inesperado.");
    }
  }

  const isLoading = form.formState.isSubmitting;

  return (
    <Dialog open={open} onOpenChange={(val) => { setOpen(val); if (!val) setReceiptFile(null); }}>
      <DialogTrigger asChild>
        <Button className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2 shadow-sm">
          <PlusCircle className="w-4 h-4" /> Nova Transação
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Nova Transação</DialogTitle>
          <DialogDescription>Insira os detalhes, conta e parcelamento.</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            
            <FormField control={form.control} name="description" render={({ field }) => (
              <FormItem><FormLabel>Descrição</FormLabel><FormControl><Input placeholder="Ex: Geladeira Nova..." {...field} /></FormControl><FormMessage /></FormItem>
            )}/>

            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="amount" render={({ field }) => (
                <FormItem><FormLabel>Valor Total (R$)</FormLabel><FormControl><Input type="number" step="0.01" {...field} onChange={(e) => field.onChange(e.target.value === "" ? 0 : parseFloat(e.target.value))} /></FormControl><FormMessage /></FormItem>
              )}/>

              <FormField control={form.control} name="date" render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel className="mb-1">Data (1ª Parcela)</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl><Button variant={"outline"} className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>{field.value ? format(field.value, "dd/MM/yyyy") : <span>Selecione</span>}<CalendarIcon className="ml-auto h-4 w-4 opacity-50" /></Button></FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start"><Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus /></PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}/>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="type" render={({ field }) => (
                <FormItem><FormLabel>Tipo</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="income">Receita</SelectItem><SelectItem value="expense">Despesa</SelectItem></SelectContent></Select></FormItem>
              )}/>

              <FormField control={form.control} name="category" render={({ field }) => (
                <FormItem><FormLabel>Categoria</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger></FormControl><SelectContent>{dbCategories.map((cat) => <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>
              )}/>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="wallet_id" render={({ field }) => (
                <FormItem><FormLabel className="flex items-center gap-1.5"><Landmark className="w-3.5 h-3.5 text-emerald-600" /> Conta</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Opcional" /></SelectTrigger></FormControl><SelectContent><SelectItem value="none">Nenhuma</SelectItem>{dbWallets.map((w) => <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>
              )}/>

              <FormField control={form.control} name="installments" render={({ field }) => (
                <FormItem><FormLabel className="flex items-center gap-1.5"><CreditCard className="w-3.5 h-3.5 text-blue-500" /> Parcelas</FormLabel><FormControl><Input type="number" min="1" max="72" {...field} onChange={(e) => field.onChange(parseInt(e.target.value) || 1)} /></FormControl><FormMessage /></FormItem>
              )}/>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium leading-none flex items-center gap-2">
                <Paperclip className="w-4 h-4 text-emerald-600" /> Anexo (Nota Fiscal / Recibo)
              </label>
              <Input 
                type="file" 
                accept="image/*,application/pdf" 
                onChange={(e) => setReceiptFile(e.target.files?.[0] || null)}
                className="cursor-pointer file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-medium file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 dark:file:bg-emerald-900/30 dark:file:text-emerald-400"
              />
              <p className="text-[10px] text-slate-500">Formatos aceitos: JPG, PNG, PDF.</p>
            </div>

            <DialogFooter className="pt-2">
              <Button type="submit" disabled={isLoading} className="w-full bg-slate-800 hover:bg-slate-900 dark:bg-emerald-600 dark:hover:bg-emerald-700">
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Salvar Lançamento
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}