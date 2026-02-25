"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Trash2, Plus, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { createCategory, deleteCategory, getCategories } from "@/app/actions/categories";

// Definindo o tipo da categoria
interface Category {
  id: string;
  name: string;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCategory, setNewCategory] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // 1. Definimos a função PRIMEIRO (Correção do erro)
  async function loadCategories() {
    const data = await getCategories();
    setCategories(data || []);
  }

  // 2. Chamamos ela no useEffect DEPOIS
  useEffect(() => {
    loadCategories();
  }, []);

  async function handleAdd() {
    if (!newCategory) return;
    setIsLoading(true);
    
    const result = await createCategory(newCategory);
    
    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success("Categoria criada!");
      setNewCategory("");
      await loadCategories(); // Recarrega a lista
    }
    setIsLoading(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("Tem certeza que deseja excluir esta categoria?")) return;

    const result = await deleteCategory(id);
    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success("Categoria removida.");
      await loadCategories();
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        
        {/* Cabeçalho com Voltar */}
        <div className="flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Minhas Categorias</h1>
        </div>

        {/* Card de Adicionar */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Plus className="w-5 h-5 text-emerald-600" />
              Nova Categoria
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3">
              <Input 
                placeholder="Ex: Assinaturas, Mercado..." 
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAdd()}
              />
              <Button onClick={handleAdd} disabled={isLoading || !newCategory}>
                {isLoading ? "Salvando..." : "Adicionar"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Categorias */}
        <div className="grid gap-3">
          {categories.length === 0 ? (
            <p className="text-center text-slate-500 py-10">
              Nenhuma categoria criada. Adicione a primeira acima!
            </p>
          ) : (
            categories.map((cat) => (
              <div 
                key={cat.id} 
                className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 rounded-lg border shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full">
                    <Tag className="w-4 h-4 text-slate-500" />
                  </div>
                  <span className="font-medium">{cat.name}</span>
                </div>
                
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                  onClick={() => handleDelete(cat.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
}