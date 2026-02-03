"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useRouter, useSearchParams } from "next/navigation";
import { useDebouncedCallback } from "use-debounce"; // Vamos instalar isso já já

export function SearchInput() {
  const searchParams = useSearchParams();
  const { replace } = useRouter();

  // Função que "segura" a digitação por 300ms para não travar o banco
  const handleSearch = useDebouncedCallback((term: string) => {
    const params = new URLSearchParams(searchParams);
    
    // Se digitou algo, adiciona na URL. Se limpou, remove.
    if (term) {
      params.set("search", term);
    } else {
      params.delete("search");
    }
    
    // Atualiza a URL mantendo o mês selecionado
    replace(`/?${params.toString()}`);
  }, 300);

  return (
    <div className="relative w-full md:w-[300px]">
      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
      <Input
        type="search"
        placeholder="Buscar transações..."
        className="pl-8 bg-white dark:bg-slate-950"
        onChange={(e) => handleSearch(e.target.value)}
        defaultValue={searchParams.get("search")?.toString()}
      />
    </div>
  );
}