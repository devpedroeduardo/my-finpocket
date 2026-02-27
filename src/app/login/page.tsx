"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Wallet, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { toast } from "sonner"; // <--- Importação do Toast
import { login } from "./actions";

export default function LoginPage() {
  const searchParams = useSearchParams();
  const isRegistered = searchParams.get("registered") === "true";
  
  // Estados para controlar o formulário
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Função que controla o envio
  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); // Impede o recarregamento padrão
    setIsLoading(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    
    // Chama a Server Action
    const result = await login(formData);

    // Se houve erro (ex: senha errada), mostramos na tela
    if (result?.error) {
      setError(result.error);
      toast.error(result.error); // <--- Feedback visual rápido
      setIsLoading(false); // Para o loading
    } else {
      // Se não houve erro, a action vai redirecionar, mas damos um feedback
      toast.success("Login realizado com sucesso! Redirecionando...");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
      <div className="w-full max-w-md space-y-6">
        
        {/* Logo */}
        <div className="flex flex-col items-center space-y-2 text-center">
          <div className="p-3 bg-emerald-100 rounded-full">
            <Wallet className="w-8 h-8 text-emerald-600" />
          </div>
          <h1 className="text-2xl font-bold tracking-tighter">MyFinPocket</h1>
          <p className="text-slate-500">Bem-vindo de volta!</p>
        </div>

        {/* ALERTA DE SUCESSO (Cadastro) */}
        {isRegistered && (
          <Alert className="bg-emerald-50 text-emerald-900 border-emerald-200">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            <AlertTitle>Sucesso!</AlertTitle>
            <AlertDescription>
              Sua conta foi criada. Faça login para continuar.
            </AlertDescription>
          </Alert>
        )}

        {/* ALERTA DE ERRO (Login Falhou) */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Erro</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Acessar Conta</CardTitle>
            <CardDescription>
              Insira suas credenciais para entrar.
            </CardDescription>
          </CardHeader>
          
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input id="email" name="email" type="email" placeholder="seu@email.com" required />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input id="password" name="password" type="password" required />
              </div>

              {/* Checkbox "Manter conectado" */}
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="remember"
                  name="remember"
                  className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-600"
                />
                <Label htmlFor="remember" className="text-sm font-normal text-slate-500 cursor-pointer">
                  Manter conectado
                </Label>
              </div>

            </CardContent>
            
            <CardFooter className="flex flex-col space-y-4">
              <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Entrando...
                  </>
                ) : (
                  "Entrar"
                )}
              </Button>
              
              <div className="text-center text-sm">
                <span className="text-slate-500">Não tem uma conta? </span>
                <Link href="/register" className="font-bold text-emerald-600 hover:underline">
                  Cadastre-se aqui
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}