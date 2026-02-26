"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getCategories } from "@/app/actions/categories";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function TransactionFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [categories, setCategories] = useState<{id: string, name: string}[]>([]);

  // Pega os valores atuais da URL
  const currentType = searchParams.get("type") || "all";
  const currentCategory = searchParams.get("category") || "all";

  // Carrega as categorias dinâmicas do usuário
  useEffect(() => {
    getCategories().then((data) => setCategories(data || []));
  }, []);

  // Atualiza a URL quando o usuário escolhe um filtro
  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (value && value !== "all") {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    
    router.push(`/?${params.toString()}`);
  };

  return (
    <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
      {/* Filtro de Tipo */}
      <Select value={currentType} onValueChange={(val) => updateFilter("type", val)}>
        <SelectTrigger className="w-full sm:w-[140px] h-10">
          <SelectValue placeholder="Tipo" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos os tipos</SelectItem>
          <SelectItem value="income">Receitas</SelectItem>
          <SelectItem value="expense">Despesas</SelectItem>
        </SelectContent>
      </Select>

      {/* Filtro de Categoria */}
      <Select value={currentCategory} onValueChange={(val) => updateFilter("category", val)}>
        <SelectTrigger className="w-full sm:w-[160px] h-10">
          <SelectValue placeholder="Categoria" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas as categorias</SelectItem>
          {categories.map((cat) => (
            <SelectItem key={cat.id} value={cat.name}>
              {cat.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}