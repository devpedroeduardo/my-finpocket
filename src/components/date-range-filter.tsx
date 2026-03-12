"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useState } from "react";
import { Search } from "lucide-react";

export function DateRangeFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  // Inicia os estados com os valores que já estão na URL (se existirem)
  const [startDate, setStartDate] = useState(searchParams.get("startDate") || "");
  const [endDate, setEndDate] = useState(searchParams.get("endDate") || "");

  const handleFilter = () => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (startDate) {
      params.set("startDate", startDate);
    } else {
      params.delete("startDate");
    }

    if (endDate) {
      params.set("endDate", endDate);
    } else {
      params.delete("endDate");
    }

    // Atualiza a URL, disparando o recarregamento do Server Component (page.tsx)
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
      <div className="flex items-center gap-2">
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="h-10 px-3 py-2 text-sm border rounded-md border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
        <span className="text-slate-500 text-sm">até</span>
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="h-10 px-3 py-2 text-sm border rounded-md border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>
      <button
        onClick={handleFilter}
        className="h-10 px-4 bg-slate-800 dark:bg-emerald-600 text-white rounded-md text-sm font-medium hover:opacity-90 transition-opacity flex items-center gap-2 w-full sm:w-auto justify-center"
      >
        <Search className="w-4 h-4" />
        Filtrar
      </button>
    </div>
  );
}