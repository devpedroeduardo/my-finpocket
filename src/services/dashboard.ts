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

export async function getRecentTransactions(
  month?: string, 
  search?: string,
  type?: string,        
  category?: string     
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return [];

  // Começa a montar a query
  let query = supabase
    .from("transactions")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  // --- FILTROS ---
  
  // 1. Filtro de Mês
  if (month) {
    const [year, m] = month.split("-");
    const startDate = new Date(parseInt(year), parseInt(m) - 1, 1).toISOString();
    const endDate = new Date(parseInt(year), parseInt(m), 0, 23, 59, 59).toISOString();
    query = query.gte("created_at", startDate).lte("created_at", endDate);
  }

  // 2. Filtro de Busca por Texto
  if (search) {
    query = query.ilike("description", `%${search}%`);
  }

  // 3. Filtro de Tipo (Receita/Despesa) <--- NOVO
  if (type && type !== "all") {
    query = query.eq("type", type);
  }

  // 4. Filtro de Categoria <--- NOVO
  if (category && category !== "all") {
    query = query.eq("category", category);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Erro ao buscar transações:", error);
    return [];
  }

  return data;
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