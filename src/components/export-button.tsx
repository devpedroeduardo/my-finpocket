"use client";

import { Download, FileText, FileSpreadsheet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Transaction } from "@/components/transaction-list";
import { format } from "date-fns";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function ExportButton({ data }: { data: Transaction[] }) {
  
  const handleExportCSV = () => {
    if (data.length === 0) {
      alert("Não há dados para exportar.");
      return;
    }

    const headers = ["Data", "Descrição", "Categoria", "Tipo", "Valor (R$)"];
    const csvData = data.map((t) => [
      format(new Date(t.created_at), "dd/MM/yyyy"),
      t.description,
      t.category,
      t.type === "income" ? "Receita" : "Despesa",
      t.amount.toFixed(2).replace(".", ","),
    ]);

    const csvContent = [
      headers.join(";"),
      ...csvData.map((row) => row.join(";")),
    ].join("\n");

    const blob = new Blob([`\uFEFF${csvContent}`], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `MyFinPocket_Relatorio_${format(new Date(), "dd_MM_yyyy")}.csv`;
    link.click();
  };

  const handleExportPDF = () => {
    if (data.length === 0) {
      alert("Não há dados para exportar.");
      return;
    }

    const doc = new jsPDF();
    
    doc.setFontSize(18);
    doc.text("Relatório Financeiro - MyFinPocket", 14, 22);
    
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Gerado em: ${format(new Date(), "dd/MM/yyyy 'às' HH:mm")}`, 14, 30);

    const tableColumn = ["Data", "Descrição", "Categoria", "Tipo", "Valor (R$)"];
    const tableRows: string[][] = []; 

    let totalIncome = 0;
    let totalExpense = 0;

    data.forEach((t) => {
      const isIncome = t.type === "income";
      
      if (isIncome) totalIncome += t.amount;
      else totalExpense += t.amount;

      const rowData = [
        format(new Date(t.created_at), "dd/MM/yyyy"),
        t.description,
        t.category,
        isIncome ? "Receita" : "Despesa",
        `R$ ${t.amount.toFixed(2).replace(".", ",")}`
      ];
      tableRows.push(rowData);
    });

    autoTable(doc, {
      startY: 35,
      head: [tableColumn],
      body: tableRows,
      theme: 'striped',
      headStyles: { fillColor: [16, 185, 129] },
      styles: { fontSize: 10 },
      alternateRowStyles: { fillColor: [248, 250, 252] },
    });

    // CORREÇÃO: Usando intersecção de tipos no lugar de 'any' para agradar o ESLint
    type jsPDFWithAutoTable = jsPDF & { lastAutoTable?: { finalY: number } };
    const docWithAutoTable = doc as jsPDFWithAutoTable;
    const finalY = docWithAutoTable.lastAutoTable?.finalY || 35;
    
    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.text(`Total de Receitas: R$ ${totalIncome.toFixed(2).replace(".", ",")}`, 14, finalY + 10);
    doc.text(`Total de Despesas: R$ ${totalExpense.toFixed(2).replace(".", ",")}`, 14, finalY + 18);
    
    const balance = totalIncome - totalExpense;
    doc.setFont("helvetica", "bold");
    doc.text(`Saldo Final: R$ ${balance.toFixed(2).replace(".", ",")}`, 14, finalY + 28);

    doc.save(`MyFinPocket_Relatorio_${format(new Date(), "dd_MM_yyyy")}.pdf`);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-2 h-10 w-full md:w-auto">
          <Download className="w-4 h-4" />
          <span className="hidden sm:inline">Exportar Relatório</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={handleExportPDF} className="cursor-pointer gap-2">
          <FileText className="w-4 h-4 text-red-500" />
          <span>Exportar como PDF</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleExportCSV} className="cursor-pointer gap-2">
          <FileSpreadsheet className="w-4 h-4 text-green-600" />
          <span>Exportar como CSV</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}