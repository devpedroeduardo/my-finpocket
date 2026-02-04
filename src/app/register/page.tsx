"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Wallet, ArrowLeft, AlertCircle, Loader2 } from "lucide-react";
import { signup } from "@/app/login/actions"; 

export default function RegisterPage() {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const result = await signup(formData);

    if (result?.error) {
      setError(result.error);
      setIsLoading(false);
    }
    // Se der sucesso, o redirect acontece automaticamente
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
      <div className="w-full max-w-md space-y-6">
        
        {/* Logo */}
        <div className="flex flex-col items-center space-y-2 text-center">
          <div className="p-3 bg-emerald-100 rounded-full">
            <Wallet className="w-8 h-8 text-emerald-600" />
          </div>
          <h1 className="text-2xl font-bold tracking-tighter">FinPocket</h1>
          <p className="text-slate-500">Crie sua conta gratuitamente.</p>
        </div>

        {/* ALERTA DE ERRO */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Atenção</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Cadastro</CardTitle>
            <CardDescription>
              Preencha os dados abaixo para começar.
            </CardDescription>
          </CardHeader>
          
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome Completo</Label>
                <Input id="name" name="name" placeholder="Ex: Pedro Silva" required />
              </div>

              {/* CAMPO NOVO: TELEFONE */}
              <div className="space-y-2">
                <Label htmlFor="phone">Telefone / WhatsApp</Label>
                <Input id="phone" name="phone" placeholder="(11) 99999-9999" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input id="email" name="email" type="email" placeholder="seu@email.com" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Senha Forte</Label>
                <Input 
                  id="password" 
                  name="password" 
                  type="password" 
                  placeholder="Min. 8 chars, letras, números..." 
                  required 
                />
                <p className="text-xs text-slate-400">
                  Deve conter: Maiúscula, minúscula, número e símbolo. Não pode conter seu nome.
                </p>
              </div>
            </CardContent>
            
            <CardFooter className="flex flex-col space-y-4">
              <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Criando conta...
                  </>
                ) : (
                  "Criar Conta"
                )}
              </Button>
              
              <div className="text-center text-sm text-slate-500">
                <Link href="/login" className="flex items-center justify-center gap-2 hover:text-emerald-600 transition-colors">
                  <ArrowLeft className="w-4 h-4" />
                  Já tenho uma conta
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}