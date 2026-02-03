import { createClient } from "@/lib/supabase/server";

function getMonthRange(monthStr?: string) {
  const date = monthStr ? new Date(monthStr + "-02") : new Date();
  const start = new Date(date.getFullYear(), date.getMonth(), 1).toISOString();
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 0).toISOString();
  return { start, end };
}

// FIX: Adicionamos este comentário para o ESLint ignorar o 'any' nesta linha específica
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function applySearch(query: any, search?: string) {
  if (search) {
    // Busca insensível a maiúsculas/minúsculas na descrição OU categoria
    query.or(`description.ilike.%${search}%,category.ilike.%${search}%`);
  }
  return query;
}

export async function getDashboardStats(month?: string, search?: string) {
  const supabase = await createClient();
  const { start, end } = getMonthRange(month);

  let query = supabase
    .from("transactions")
    .select("amount, type")
    .gte("created_at", start)
    .lte("created_at", end);

  // Aplica a busca (Se pesquisar "Uber", soma só Uber)
  query = applySearch(query, search);

  const { data } = await query;

  let income = 0;
  let expense = 0;

  data?.forEach((t) => {
    if (t.type === "income") income += Number(t.amount);
    else expense += Number(t.amount);
  });

  return { balance: income - expense, income, expense };
}

export async function getRecentTransactions(month?: string, search?: string) {
  const supabase = await createClient();
  const { start, end } = getMonthRange(month);

  let query = supabase
    .from("transactions")
    .select("*")
    .gte("created_at", start)
    .lte("created_at", end)
    .order("created_at", { ascending: false });

  // Aplica a busca na lista
  query = applySearch(query, search);

  const { data } = await query;
  return data || [];
}

export async function getExpensesByCategory(month?: string, search?: string) {
  const supabase = await createClient();
  const { start, end } = getMonthRange(month);

  let query = supabase
    .from("transactions")
    .select("category, amount")
    .eq("type", "expense")
    .gte("created_at", start)
    .lte("created_at", end);

  // Aplica a busca no gráfico também!
  query = applySearch(query, search);

  const { data } = await query;

  if (!data) return [];

  const grouped = data.reduce((acc, curr) => {
    const category = curr.category;
    const amount = Number(curr.amount);
    if (!acc[category]) acc[category] = 0;
    acc[category] += amount;
    return acc;
  }, {} as Record<string, number>);

  return Object.entries(grouped).map(([category, amount], index) => {
    const colors = [
      "hsl(var(--chart-1))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", 
      "hsl(var(--chart-4))", "hsl(var(--chart-5))"
    ];
    return { category, amount, fill: colors[index % colors.length] };
  });
}